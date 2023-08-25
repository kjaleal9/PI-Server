const sql = require("mssql");
const { v4: uuidv4 } = require("uuid");
const express = require("express");
const router = express.Router();

const {
  Recipe,
  Material,
  RecipeEquipmentRequirement: RER,
  TPIBK_RecipeBatchData: recipeBatchData,
  ProcessClassPhase,
} = require("../../LocalDatabase/TPMDB.js");

const { getAllRecipes } = require("../../queries/recipes.js");

// const recipes = Recipe.map((recipe) => {
//   var matchingMaterial = Material.find((material) => {
//     return material.SiteMaterialAlias === recipe.ProductID;
//   });
//   return Object.assign({}, recipe, matchingMaterial);
// });

// GET all versions of every created recipe
router.get("/", async (req, res) => {
  console.time("Get all recipes");

  try {
    const request = new sql.Request(req.db);

    const result = await request.query(getAllRecipes());

    const versionToNum = result.recordsets[0].map((recipe) => {
      return { ...recipe, Version: +recipe.Version };
    });

    const recipesWithMaterial = versionToNum.map((recipe) => {
      var matchingMaterial = Material.find((material) => {
        return (
          material.SiteMaterialAlias.toString() === recipe.ProductID.toString()
        );
      });
      return Object.assign({}, recipe, matchingMaterial);
    });

    res.status(200).json(recipesWithMaterial);
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }

  console.timeEnd("Get all recipes");
});

// GET the highest version recipes
router.get("/latest", (req, res) => {
  console.time("Get latest recipes");

  const groupRecipes = (rows) => {
    function groupBy(objectArray, property) {
      return objectArray.reduce((acc, obj) => {
        const key = obj[property];
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
      }, {});
    }

    const groupedRecipes = groupBy(rows, "RID");

    return Object.keys(groupedRecipes).map((key) =>
      groupedRecipes[key].reduce((max, recipe) =>
        max["Version"] > recipe["Version"] ? max : recipe
      )
    );
  };

  console.timeEnd("Get latest recipes");
});

// GET a single recipe based on RID and version
router.get("/:RID/:ver", async (req, res) => {
  console.time("Get single recipe");

  try {
    const request = new sql.Request(req.db);

    const result = await request.query(
      `
         SELECT 
           ID,
           Recipe_RID,
           Recipe_Version, 
           TPIBK_Steptype_ID,
           ProcessClassPhase_ID,
           Step,
           RecipeEquipmentTransition_Data_ID,
           NextStep,
           Allocation_Type_ID,
           LateBinding,
           Material_ID,
           ProcessClass_ID
         FROM TPIBK_RecipeBatchData
         WHERE Recipe_RID = '${req.params.RID}' 
           AND Recipe_Version = ${+req.params.ver}
         ORDER BY step`
    );
    console.log(req.db.available, req.db.borrowed, req.db.pending, req.db.size);

    res.json(result.recordsets[0]);
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
  console.timeEnd("Get single recipe");
});

// GET procedure of a recipe with RID and version as params
// Return is object that includes procedure, required process classes,
// and process class phases for the recipe
router.get("/procedure/:RID/:ver", async (req, res) => {
  console.time("Get recipe procedure based on RID and Version");

  try {
    const request = new sql.Request(req.db);

    const result = await request.query(` 
        SELECT 
          ID,
          Step,
          Message,
          TPIBK_StepType_ID,
          ProcessClassPhase_ID,
          Step AS Step1,
          UserString,
          RecipeEquipmentTransition_Data_ID,
          NextStep,
          Allocation_Type_ID,
          LateBinding,
          Material_ID,
          ProcessClass_ID 
        FROM v_TPIBK_RecipeBatchData 
        WHERE Recipe_RID = '${req.params.RID}' 
        AND Recipe_Version = ${+req.params.ver}
        ORDER BY Step`);

    res.json(result.recordsets[0]);
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }

  console.timeEnd("Get recipe procedure based on RID and Version");
});

// GET route returns Step numbers and messages of a recipe in the ProcedureModal component
router.get("/procedure/:RID/:ver/condense", async (req, res) => {
  console.time("Get condensed recipe procedure based on RID and Version");

  try {
    const request = new sql.Request(req.db);

    const result = await request.query(`  
        SELECT 
          Step,
          Message
        FROM v_TPIBK_RecipeBatchData 
        WHERE Recipe_RID = '${req.params.RID}' 
        AND Recipe_Version = ${+req.params.ver}
        ORDER BY Step`);

    res.json(result.recordsets[0]);
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }

  console.timeEnd("Get condensed recipe procedure based on RID and Version");
});

router.get("/step-types", async (req, res) => {
  console.time("Get recipe step types");

  try {
    const request = new sql.Request(req.db);

    const result = await request.query(`  
        SELECT 
          ID,
          Name 
        FROM TPIBK_StepType 
        ORDER BY ID
      `);

    res.json(result.recordsets[0]);
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }

  console.timeEnd("Get recipe step types");
});

router.get("/parameters/:BatchID/:PClassID", async (req, res) => {
  console.time("Get parameters based on recipe ID and process class phase ID");

  try {
    const request = new sql.Request(req.db);

    const result = await request.query(`  
        SELECT 
          ID, 
          Name, 
          Description, 
          TPIBK_RecipeParameters_ID, 
          ProcessClassPhase_ID, 
          ValueType, 
          Scaled, 
          MinValue, 
          MaxValue, 
          DefValue,
          IsMaterial, 
          MAX(TPIBK_RecipeParameterData_ID) AS TPIBK_RecipeParameterData_ID, 
          SUM(Value) AS Value, 
          MAX(TPIBK_RecipeStepData_ID) AS TPIBK_RecipeStepData_ID, 
          DefEU, 
          Max(EU) As EU
        FROM v_TPIBK_RecipeParameters
        WHERE (TPIBK_RecipeBatchData_ID IN (0, ${req.params.BatchID}))
        GROUP BY 
          ID, 
          Name, 
          Description, 
          TPIBK_RecipeParameters_ID, 
          ProcessClassPhase_ID, 
          ValueType, 
          MinValue, 
          MaxValue, 
          DefValue, 
          Scaled,
          IsMaterial, 
          DefEU
        HAVING (ProcessClassPhase_ID = ${req.params.PClassID}) 
        ORDER BY Description`);

    res.json(result.recordsets[0]);
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }

  console.timeEnd(
    "Get parameters based on recipe ID and process class phase ID"
  );
});

// POST add a new recipe
router.post("/", (req, res) => {
  if (enviornment === "Local") {
    recipes.push(req.body);
    res.json(req.body);
  }
});

// DELETE a recipe with RID and version in the request body
router.delete("/", (req, res) => {
  console.time("Delete recipe");

  if (enviornment === "Local") {
    const deleteIndex = recipes.recipes.findIndex(
      (recipe) =>
        recipe.RID === req.body.RID && recipe.Version === req.body.Version
    );

    recipes.splice(deleteIndex, 1);
    res.json(recipes);
  }

  console.timeEnd("Delete recipe");
});

module.exports = router;
