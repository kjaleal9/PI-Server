const express = require("express");
const sql = require("mssql");
const router = express.Router();
const { Equipment } = require("../../LocalDatabase/TPMDB");

router.get("/", async (req, res) => {
  console.time("Get all equipment");
  try {
    const request = new sql.Request(req.db);

    const result = await request.query(` 
        SELECT *
        FROM Equipment`);

    res.status(200).json(result.recordsets[0]);
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
  console.timeEnd("Get all equipment");
});

module.exports = router;
