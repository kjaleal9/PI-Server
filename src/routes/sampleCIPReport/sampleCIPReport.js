const XLSX = require("xlsx");
const path = require("path");
const express = require("express");
const router = express.Router();
const { utcToZonedTime, format } = require("date-fns-tz");
const targetTimezone = "America/Los_Angeles";

function compareTime(a, b) {
  const timeA = new Date(a.x);
  const timeB = new Date(b.x);
  return timeA - timeB;
}

const filePath = path.join(
  __dirname,
  "data",
  "L1121 Process Parameter Data.xlsx"
);
const workbook = XLSX.readFile(filePath);

const ppdataFT = XLSX.utils.sheet_to_json(workbook.Sheets["FT81160"]);
const ppdataCT = XLSX.utils.sheet_to_json(workbook.Sheets["CT81182"]);
const ppdataTT = XLSX.utils.sheet_to_json(workbook.Sheets["TT81182"]);
const stepGroupChart = XLSX.utils.sheet_to_json(
  workbook.Sheets["StepGroupChart"]
);
const stepGroupInfo = XLSX.utils.sheet_to_json(
  workbook.Sheets["StepGroupInfo"]
);

let chartData = {};

function convertExcelDate(dateTime) {
  return new Date((dateTime - 25569) * 86400 * 1000);
}

chartData["FT81160"] = ppdataFT
  .map((d) => {
    return {
      x: convertExcelDate(d["Time"]),
      y: Math.floor(d["Value"]),
    };
  })
  .sort(compareTime);

chartData["CT81182"] = ppdataCT
  .map((d) => {
    return {
      x: convertExcelDate(d["Time"]),
      y: Math.floor(d["Value"]),
    };
  })
  .sort(compareTime);

chartData["TT81182"] = ppdataTT
  .map((d) => {
    return {
      x: convertExcelDate(d["Time"]),
      y: Math.floor(d["Value"]),
    };
  })
  .sort(compareTime);

chartData["StepGroup"] = stepGroupChart.map((stepGroup) => {
  return {
    StartDateTime: convertExcelDate(stepGroup["StartDateTime"]),
    EndDateTime: convertExcelDate(stepGroup["EndDateTime"]),
    StepGroupName: stepGroup["stepGroupName"],
  };
});

router.get("/", async (req, res) => {
  res.status(200).json(chartData);
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

  console.log(new Set)

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

module.exports = router;
