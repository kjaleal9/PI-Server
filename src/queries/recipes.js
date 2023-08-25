const sql = require("mssql");

function getAllRecipes() {
  return ` 
    SELECT *
    FROM Recipe
    `;
}

function getSingleRecipe(version, RID) {
  return `
    SELECT 
      ID,
      Recipe_RID,
      Recipe_Version, 
      TPIBK_Steptype_ID,
      ProcessClassPhase_ID,
      Step,
      RecipeEquipmentTransition_Data_ID,
      NextStep,
      Allocation_Type_ID,
      LateBinding,
      Material_ID,
      ProcessClass_ID
    FROM TPIBK_RecipeBatchData
    WHERE Recipe_RID = '${RID}' 
      AND Recipe_Version = ${+version}
    ORDER BY step
    `;
}

module.exports = {
  getAllRecipes,
  getSingleRecipe
};
