const express = require("express");
const sql = require("mssql");
const router = express.Router();

router.get("/", async (req, res) => {
  console.time("Get all errors");
  try {
    const request = new sql.Request(req.db);

    const result = await request.query(` 
    SELECT top 100 ErrorLog.ErrorMessage,ErrorLog.ErrorTime,ErrorLog.ObjectName, ErrorLog.UserName, DataLog_History.*
    FROM ErrorLog join DataLog_History on ErrorLog.LogId = DataLog_History.ErrorLog_LogID
    Order by ErrorLog.ErrorTime desc
    `);

    res.status(200).json(result.recordsets[0]);
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
  console.timeEnd("Get all errors");
});

module.exports = router;
