const express = require("express");
const sql = require("mssql");
const router = express.Router();
const { batchTimes } = require("../../LocalDatabase/TPMDB");

router.get("/", async (req, res) => {
  const formatBatchTable = batchTimes.map((batch) => {
    return {
      batchID: batch["Batch ID"],
      batchVolume: batch["Batch Volume"],
      batchTime: batch["Batch Time"],
      phase1Time: batch["Phase 1 Time"],
      phase2Time: batch["Phase 2 Time"],
      phase3Time: batch["Phase 3 Time"],
    };
  });
  const calculatedBatches = formatBatchTable.map((batch) => {
    const volPerSec = batch.batchVolume / batch.batchTime;
    const phase1Percent = Math.floor(
      (batch.phase1Time / batch.batchTime) * 100
    );
    const phase2Percent = Math.floor(
      (batch.phase2Time / batch.batchTime) * 100
    );
    const phase3Percent = Math.floor(
      (batch.phase3Time / batch.batchTime) * 100
    );

    return {
      ...batch,
      volPerSec: volPerSec,
      phase1Percent: phase1Percent,
      phase2Percent: phase2Percent,
      phase3Percent: phase3Percent,
    };
  });
  
  res.json(calculatedBatches);
});

module.exports = router;
