const express = require("express");
const router = express.Router();
const sql = require("mssql");

// const { getCIPselect, getCIPCircuits } = require("../../queries/reportCIP.js");

router.get("/", async (req, res) => {
  console.time("Load CIP Report Search");

  try {
    async function getCIPselect() {
      const request = new sql.Request(req.db);
      const CIPLines = await request
        .execute("Report_General_getCIPLine")
        .then((data) => data.recordsets[0]);

      return await Promise.all(
        CIPLines.map(async (line) => {
          const circuits = await getCIPCircuits(line.CIPLine_Name);

          const CIPCircuits = await Promise.all(
            circuits.map(async (circuit) => {
              console.log(circuit);
              const units = await getCIPUnits(circuit.CIPCircuit_Name);

              return {
                circuit: circuit.CIPCircuit_Name,
                units: units.map((unit) => unit.Equipment_Name).sort(),
              };
            })
          );

          return {
            line: line.CIPLine_Name,
            circuits: CIPCircuits,
          };
        })
      );
    }

    async function getCIPCircuits(input) {
      const request = new sql.Request(req.db);
      return request
        .input("CIPLine_Name", sql.NVarChar, input)
        .execute("Report_General_getCIPCircuit")
        .then((data) => data.recordsets[0]);
    }

    async function getCIPUnits(input) {
      const request = new sql.Request(req.db);
      return request
        .input("CIPCircuit", sql.NVarChar, input)
        .execute("Report_CIPSummary_getEquipment")
        .then((data) => data.recordsets[0]);
    }

    function getAllData() {
      return Promise.all([getCIPselect()]);
    }

    getAllData().then(([CIPSelect]) => {
      res.status(200).json(CIPSelect);
    });
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }

  console.timeEnd("Load CIP Report Search");
  // res.status(200).json(chartData);
});

router.get("/step-group-info", (req, res) => {
  const stepGroupIDs = Array.from(
    new Set(
      stepGroupInfo.map((r) => {
        return r.ID;
      })
    )
  );

  const stepGroups = stepGroupIDs.map((ID) => {
    return stepGroupInfo.filter((r) => ID === r.ID);
  });

  // console.log(
  //   stepGroups.map((group) => {
  //     return group.reduce((prev, curr, index) => {
  //       return {
  //         ID: curr.ID,
  //         stepGroupName: curr.StepGrou_Name,
  //         startTime: curr.StartDateTime,
  //         startStep: curr.StartStep_StepNumber,
  //         endStep: curr.EndStep_StepNumber,

  //         [curr.ReportParameter_Description]: {
  //           startValue: curr.StartValue,
  //           endValue: curr.EndValue,
  //           duration: curr.StepGroupDurationSeconds,
  //           difference: curr.StartEndDiffValue,
  //           min: curr.MinValue,
  //           max: curr.MaxValue,
  //           average: curr.AverageValue,
  //           units: curr.ProcessParamter_EU,
  //         },
  //       };
  //     }, {});
  //   })
  // );

  console.log(new Set());

  let formattedData = {};

  formattedData = stepGroupInfo.map((d) => {
    return {
      ID: d.ID,
      stepGroupName: d.StepGrou_Name,
      startStep: d.StartStep_StepNumber,
      endStep: d.EndStep_StepNumber,
      stepGroupDuration: d.StepGroupDurationSeconds,
      startTime: convertExcelDate(d.StartDateTime),
    };
  });

  res.status(200).json(formattedData);
});

router.get("/units/:circuits", (req, res) => {
  const request = new sql.Request(req.db);
  console.log(req.params.circuits);
  request.input(
    "CIPCircuit",
    sql.NVarChar,
    req.params.circuits.replace(/,/g, ";;")
  );

  request.execute("Report_CIPSummary_getEquipment", (err, result) => {
    // ... error checks
    if (err) {
      console.log(err);
    }
    // ...
    const units = result.recordsets[0].map((unit) => unit.Equipment_Name);
    res.status(200).json(units);
  });
});

router.get("/CIP-data", (req, res) => {
  const request = new sql.Request(req.db);
  request.input("StartDateTime", "2023-07-02 12:08:09");
  request.input("EndDateTime", "2023-07-30 12:08:09");
  request.input("Equipment", undefined);
  request.input("CIPCircuit", undefined);

  request.execute("Report_CIPSummary_getCIP", (err, result) => {
    // ... error checks
    if (err) {
      console.log(err);
    }
    // ...
    res.status(200).json(result.recordsets[0]);
  });
});

router.get(
  "/CIP-data/:startDateTime/:endDateTime/:equipment/:circuits",
  (req, res) => {
    console.time("get data");
    console.log(req.params.circuits.replace(/,/g, ";;"));
    const request = new sql.Request(req.db);
    request.input("StartDateTime", req.params.startDateTime);
    request.input("EndDateTime", req.params.endDateTime);
    request.input("Equipment", req.params.equipment.replace(/,/g, ";;"));
    request.input("CIPCircuit", req.params.circuits.replace(/,/g, ";;"));

    request.execute("Report_CIPSummary_getCIP", (err, result) => {
      // ... error checks
      if (err) {
        console.log(err);
      }
      // ...
      // console.log(result);
      res.status(200).json(result.recordsets[0]);
    });
    console.timeEnd("get data");
  }
);

module.exports = router;
