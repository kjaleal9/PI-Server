const express = require("express");
const sql = require("mssql");
const router = express.Router();
const {
  ProcessClass,
  ProcessClassPhase,
  RecipeEquipmentRequirement: RER,
} = require("../../LocalDatabase/TPMDB");

// GET full database of process classes
router.get("/", (req, res) => {
  console.time("Get all process classes");

  res.json(ProcessClass);

  console.timeEnd("Get all process classes");
});

// GET full database of process class requirements
router.get("/required", (req, res) => {
  console.time("Get all process class requirements");

  res.json(RER);

  console.timeEnd("Get all process class requirements");
});

// GET the required process classes for one recipe.
// Must provide RID and version
router.get("/required/:RID/:ver", async (req, res) => {
  console.time("Get required process classes by RID and Version");

  try {
    const request = new sql.Request(req.db);

    const result = await request.query(`  
        SELECT 
        RER.ID, 
        RER.ProcessClass_Name, 
        IsMainBatchUnit,
        CASE WHEN ROW_NUMBER() 
            OVER(PARTITION BY RER.ProcessClass_Name ORDER BY RER.ProcessClass_Name) <2 
            THEN RER.ProcessClass_Name 
            ELSE RER.ProcessClass_Name+' #'+LTRIM(
                ROW_NUMBER() 
                OVER(PARTITION BY RER.ProcessClass_Name ORDER BY RER.ProcessClass_Name)) 
                END AS Message,PC.ID as PClass_ID,
        CASE COALESCE(Equipment_Name,PC.Description) When '' 
            THEN PC.Description 
            ELSE Equipment_Name 
            END AS Equipment_Name
        FROM RecipeEquipmentRequirement RER INNER JOIN ProcessClass PC ON RER.ProcessClass_Name = PC.Name
        WHERE Recipe_RID = '${req.params.RID}' AND Recipe_Version = ${+req
      .params.ver}
      `);

    res.json(result.recordsets[0]);
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }

  console.timeEnd("Get required process classes by RID and Version");
});

// GET full database of process class phases
router.get("/phases", async (req, res) => {
  console.time("Get all process class phases");

  try {
    const request = new sql.Request(req.db);

    const result = await request.query(`  
        SELECT *
        FROM ProcessClassPhase
      `);

    res.json(result.recordsets[0]);
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }

  console.timeEnd("Get all process class phases");
});

// GET process class phase by ID.
// ID is provided by ProcessClassPhase_ID in TPIBK_RecipeBatchData
router.get("/phases/:ID", (req, res) => {
  console.time("Get single process class phase by ID");

  const selectedProcessClassPhase = ProcessClassPhase.filter((row) => {
    return +row.ID === +req.params.ID;
  });

  res.json(selectedProcessClassPhase);

  console.timeEnd("Get single process class phase by ID");
});

module.exports = router;
