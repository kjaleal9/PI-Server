const sql = require("mssql");
const { v4: uuidv4 } = require("uuid");
const express = require("express");
const dayjs = require("dayjs");
const router = express.Router();

const {
  getAllRecipes,
  getAllTrains,
  getAllBatchEnabledProcessClasses,
  getAllAvailableEquipmentByID,
  getAllSelectedEquipmentByID,
  getSingleRecipe,
  getRecipeProcedure,
  getRecipeProcedureCondensed,
  getStepTypes,
  getRecipeParameters,
  getRequiredProcessClasses,
  insertNewRecipe,
  deleteRecipe,
} = require("../../queries/recipes.js");

const { getAllMaterials } = require("../../queries/materials.js");

// GET all versions of every created recipe
router.get("/", async (req, res) => {
  console.time("Get all recipes");
  try {
    const request = new sql.Request(req.db);
    const materials = await request
      .query(getAllMaterials())
      .then((data) => data.recordsets[0]);
    const recipes = await request
      .query(getAllRecipes())
      .then((data) => data.recordsets[0]);
    const versionToNum = recipes.map((recipe) => {
      return {
        ...recipe,
        Version: +recipe.Version,
        key: uuidv4(),
        VersionDate: dayjs(recipe.VersionDate).format("DD/MM/YYYY"),
      };
    });
    const recipesWithMaterial = versionToNum.map((recipe) => {
      var matchingMaterial = materials.find((material) => {
        return material.SiteMaterialAlias === recipe.ProductID.toString();
      });
      return Object.assign({}, recipe, matchingMaterial);
    });
    res.status(200).json(recipesWithMaterial);
  } catch (err) {
    res.status(500).send(err.message);
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
router.get("/search/:RID/:ver", async (req, res) => {
  console.time("Get single recipe");
  const { RID, ver } = req.params;
  try {
    const request = new sql.Request(req.db);
    const recipe = await request
      .query(getSingleRecipe(RID, +ver))
      .then((data) => data.recordsets[0]);
    res.status(200).json(recipe);
  } catch (err) {
    res.status(500).send(err.message);
  }
  console.timeEnd("Get single recipe");
});

// GET procedure of a recipe with RID and version as params
// Return is object that includes procedure, required process classes,
// and process class phases for the recipe
router.get("/procedure/:RID/:ver", async (req, res) => {
  console.time("Get recipe procedure by RID and Version");
  const { RID, ver } = req.params;
  try {
    const request = new sql.Request(req.db);
    const procedure = await request
      .query(getRecipeProcedure(RID, +ver))
      .then((data) => data.recordsets[0]);
    res.status(200).json(procedure);
  } catch (err) {
    res.status(500).send(err.message);
  }
  console.timeEnd("Get recipe procedure by RID and Version");
});

// GET route returns Step numbers and messages of a recipe in the ProcedureModal component
router.get("/procedure/:RID/:ver/condense", async (req, res) => {
  console.time("Get condensed recipe procedure by RID and Version");
  const { RID, ver } = req.params;
  try {
    const request = new sql.Request(req.db);
    const procedure = await request
      .query(getRecipeProcedureCondensed(RID, ver))
      .then((data) => data.recordsets[0]);
    res.status(200).json(procedure);
  } catch (err) {
    res.status(500).send(err.message);
  }
  console.timeEnd("Get condensed recipe procedure by RID and Version");
});

router.get("/step-types", async (req, res) => {
  console.time("Get recipe step types");
  try {
    const request = new sql.Request(req.db);
    const stepTypes = await request
      .query(getStepTypes())
      .then((data) => data.recordsets[0]);
    res.status(200).json(stepTypes);
  } catch (err) {
    res.status(500).send(err.message);
  }
  console.timeEnd("Get recipe step types");
});

router.get("/parameters/:batchID/:pClassID", async (req, res) => {
  console.time("Get parameters by batch ID and process class phase ID");
  const { batchID, pClassID } = req.params;
  try {
    const request = new sql.Request(req.db);
    const parameters = await request
      .query(getRecipeParameters(batchID, pClassID))
      .then((data) => data.recordsets[0]);

    res.status(200).json(parameters);
  } catch (err) {
    res.status(500).send(err.message);
  }
  console.timeEnd("Get parameters by batch ID and process class phase ID");
});

// GET full database of process class requirements
router.get("/process-classes/required", async (req, res) => {
  console.time("Get all process class requirements");
  try {
    const request = new sql.Request(req.db);
    const requiredProcessClasses = await request
      .query("SELECT * FROM RecipeEquipmentRequirement")
      .then((data) => data.recordsets[0]);
    res.status(200).json(requiredProcessClasses);
  } catch (err) {
    res.status(500).send(err.message);
  }
  console.timeEnd("Get all process class requirements");
});

// GET the required process classes for one recipe.
// Must provide RID and version
router.get("/process-classes/required/:RID/:ver", async (req, res) => {
  console.time("Get required process classes by RID and Version");
  const { RID, ver } = req.params;
  try {
    const request = new sql.Request(req.db);
    const requiredProcessClasses = await request
      .query(getRequiredProcessClasses(RID, ver))
      .then((data) => data.recordsets[0]);

    res.status(200).json(requiredProcessClasses);
  } catch (err) {
    res.status(500).send(err.message);
  }

  console.timeEnd("Get required process classes by RID and Version");
});

router.get("/trains", async (req, res) => {
  console.time("Get recipe trains");

  try {
    const request = new sql.Request(req.db);

    const sqlTrains = await request.query(getAllTrains());

    const trains = sqlTrains.recordsets[0].map((train) => {
      return { ...train, key: uuidv4() };
    });

    res.json(trains);
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }

  console.timeEnd("Get recipe trains");
});
router.get("/trains/pClasses", async (req, res) => {
  console.time("Get batch enabled process classes");

  try {
    const request = new sql.Request(req.db);

    const sqlClasses = await request.query(getAllBatchEnabledProcessClasses());

    res.json(sqlClasses.recordsets[0]);
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }

  console.timeEnd("Get batch enabled process classes");
});

router.get(
  "/trains/equipment/available/:pClassID/:trainID",
  async (req, res) => {
    console.time("Get all available equipment by ID");

    try {
      const request = new sql.Request(req.db);

      const availableEquipment = await request.query(
        getAllAvailableEquipmentByID(req.params.pClassID, req.params.trainID)
      );

      res.json(availableEquipment.recordsets[0]);
    } catch (err) {
      res.status(500);
      res.send(err.message);
    }

    console.timeEnd("Get all available equipment by ID");
  }
);

router.get(
  "/trains/equipment/selected/:pClassID/:trainID",
  async (req, res) => {
    console.time("Get all selected equipment by ID");

    try {
      const request = new sql.Request(req.db);

      const selectedEquipment = await request.query(
        getAllSelectedEquipmentByID(req.params.pClassID, req.params.trainID)
      );

      res.json(selectedEquipment.recordsets[0]);
    } catch (err) {
      res.status(500);
      res.send(err.message);
    }

    console.timeEnd("Get all selected equipment by ID");
  }
);

// POST add a new recipe
router.post("/", async (req, res) => {
  console.log(req.body);
  const {
    RID,
    Version,
    VersionDate,
    Description,
    ProductID,
    BSNom,
    BSMin,
    BSMax,
  } = req.body;

  try {
    const request = new sql.Request(req.db);

    const selectedEquipment = await request.query(
      insertNewRecipe(
        RID,
        Version,
        VersionDate,
        Description,
        ProductID,
        BSNom,
        BSMin,
        BSMax
      )
    );

    res.status(200).json({ message: "Recipe Added" });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

// DELETE a recipe with RID and version in the request body
router.delete("/", async (req, res) => {
  console.time("Delete recipe");
  const { RID, Version } = req.body;
  try {
    const request = new sql.Request(req.db);
    const recipe = await request
      .query(deleteRecipe(RID, Version))
      .then((data) => console.log(data));
    res.status(200).json({ message: "Recipe Deleted" });
  } catch (err) {
    res.status(500).err(err);
  }

  console.timeEnd("Delete recipe");
});

module.exports = router;
