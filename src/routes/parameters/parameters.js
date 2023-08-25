const express = require("express");
const sql = require("mssql");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

// GET all versions of every created recipe
router.get("/", async (req, res) => {
  console.time("Get all parameters");

    try {
      const request = new sql.Request(req.db);

      const result = await request.query(` 
        SELECT *
        FROM v_TPIBK_RecipeParameters
       `);

      res.status(200);
      res.json(result.recordsets[0]);
    } catch (err) {
      res.status(500);
      res.send(err.message);
    }

  console.timeEnd("Get all parameters");
});

router.get("/:RBDID/:PCPID", async (req, res) => {
  console.time("Get parameters based on selected step");

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
        WHERE (TPIBK_RecipeBatchData_ID IN (0, '${+req.params.RBDID}' )) 
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
        HAVING (ProcessClassPhase_ID = '${+req.params.PCPID}') 
        ORDER BY Description
       `);

      res.status(200);
      res.json(result.recordsets[0]);
    } catch (err) {
      res.status(500);
      console.log(err.message);
      res.send(err.message);
    }

  console.timeEnd("Get parameters based on selected step");
});

module.exports = router;
