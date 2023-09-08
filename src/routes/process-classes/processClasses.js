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
