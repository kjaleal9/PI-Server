const XLSX = require("xlsx");
const path = require('path')
const filePath = path.join(__dirname,'TPMDB.xlsx')
const workbook = XLSX.readFile(filePath);

const Equipment = XLSX.utils.sheet_to_json(workbook.Sheets["Equipment"]);
const EquipmentMode = XLSX.utils.sheet_to_json(
  workbook.Sheets["EquipmentMode"]
);
const EquipmentParameter = XLSX.utils.sheet_to_json(
  workbook.Sheets["EquipmentParameter"]
);
const EquipmentProperty = XLSX.utils.sheet_to_json(
  workbook.Sheets["EquipmentProperty"]
);
const Material = XLSX.utils.sheet_to_json(workbook.Sheets["Material"]);
const MaterialClass = XLSX.utils.sheet_to_json(
  workbook.Sheets["MaterialClass"]
);
const Phase = XLSX.utils.sheet_to_json(workbook.Sheets["Phase"]);
const PhaseMode = XLSX.utils.sheet_to_json(workbook.Sheets["PhaseMode"]);
const PhaseParameter = XLSX.utils.sheet_to_json(
  workbook.Sheets["PhaseParameter"]
);
const PhaseType = XLSX.utils.sheet_to_json(workbook.Sheets["PhaseType"]);
const ProcessClass = XLSX.utils.sheet_to_json(workbook.Sheets["ProcessClass"]);
const ProcessClassPhase = XLSX.utils.sheet_to_json(
  workbook.Sheets["ProcessClassPhase"]
);
const Recipe = XLSX.utils.sheet_to_json(workbook.Sheets["Recipe"]);
const RecipeAllocation = XLSX.utils.sheet_to_json(
  workbook.Sheets["RecipeAllocation"]
);
const RecipeBatchData = XLSX.utils.sheet_to_json(
  workbook.Sheets["RecipeBatchData"]
);
const RecipeEquipmentRequirement = XLSX.utils.sheet_to_json(
  workbook.Sheets["RecipeEquipmentRequirement"]
);
const RecipeEquipmentTransition = XLSX.utils.sheet_to_json(
  workbook.Sheets["RecipeEquipmentTransition"]
);
const RecipePhaseParameter = XLSX.utils.sheet_to_json(
  workbook.Sheets["RecipePhaseParameter"]
);
const RecipeTrain = XLSX.utils.sheet_to_json(workbook.Sheets["RecipeTrain"]);
const RecipeTrainEquipment = XLSX.utils.sheet_to_json(
  workbook.Sheets["RecipeTrainEquipment"]
);
const TPIBK_RecipeBatchData = XLSX.utils.sheet_to_json(
  workbook.Sheets["TPIBK_RecipeBatchData"]
);
const TPIBK_RecipeParameterData = XLSX.utils.sheet_to_json(
  workbook.Sheets["TPIBK_RecipeParamterData"]
);
const TPIBK_RecipeParameters = XLSX.utils.sheet_to_json(
  workbook.Sheets["TPIBK_RecipeParamters"]
);
const TPIBK_RecipeStepData = XLSX.utils.sheet_to_json(
  workbook.Sheets["TPIBK_RecipeStepData"]
);
const TPIBK_StepType = XLSX.utils.sheet_to_json(
  workbook.Sheets["TPIBK_StepType"]
);

module.exports = {
  Equipment,
  EquipmentMode,
  EquipmentParameter,
  EquipmentProperty,
  Material,
  MaterialClass,
  Phase,
  PhaseMode,
  PhaseParameter,
  PhaseType,
  ProcessClass,
  ProcessClassPhase,
  Recipe,
  RecipeAllocation,
  RecipeBatchData,
  RecipeEquipmentRequirement,
  RecipeEquipmentTransition,
  RecipePhaseParameter,
  RecipeTrain,
  RecipeTrainEquipment,
  TPIBK_RecipeBatchData,
  TPIBK_RecipeParameterData,
  TPIBK_RecipeParameters,
  TPIBK_RecipeStepData,
  TPIBK_StepType,
};
