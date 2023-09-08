function getAllRecipes() {
  return ` 
    SELECT *
    FROM Recipe
    `;
}

function getSingleRecipe(RID, ver) {
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
      AND Recipe_Version = ${+ver}
    ORDER BY step
    `;
}

function getRecipeProcedure(RID, ver) {
  return ` 
  SELECT 
    ID,
    Step,
    Message,
    TPIBK_StepType_ID,
    ProcessClassPhase_ID,
    Step AS Step1,
    UserString,
    RecipeEquipmentTransition_Data_ID,
    NextStep,
    Allocation_Type_ID,
    LateBinding,
    Material_ID,
    ProcessClass_ID 
  FROM v_TPIBK_RecipeBatchData 
  WHERE Recipe_RID = '${RID}' 
  AND Recipe_Version = ${+ver}
  ORDER BY Step`;
}

function getRecipeProcedureCondensed(RID, ver) {
  return `  
  SELECT 
    Step,
    Message
  FROM v_TPIBK_RecipeBatchData 
  WHERE Recipe_RID = '${RID}' 
  AND Recipe_Version = ${+ver}
  ORDER BY Step`;
}

function getStepTypes() {
  return `  
  SELECT 
    ID,
    Name 
  FROM TPIBK_StepType 
  ORDER BY ID
`;
}

function getRecipeParameters(BatchID, PClassID) {
  return `  
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
  WHERE (TPIBK_RecipeBatchData_ID IN (0, ${BatchID}))
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
  HAVING (ProcessClassPhase_ID = ${PClassID}) 
  ORDER BY Description`;
}

function getRequiredProcessClasses(RID, ver) {
  return `  
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
  WHERE Recipe_RID = '${RID}' AND Recipe_Version = ${+ver}
`;
}

function getAllTrains() {
  return `
  SELECT ID, Name, Description 
    FROM RecipeTrain 
    ORDER BY Name ASC
    `;
}

function getAllBatchEnabledProcessClasses() {
  return `
  SELECT dbo.ProcessClass.ID as ID, dbo.ProcessClass.Name AS ptClass
    FROM dbo.ProcessClass
    INNER JOIN dbo.Equipment ON dbo.ProcessClass.ID = dbo.Equipment.ProcessClass_ID
    WHERE (dbo.ProcessClass.TypeBatchKernel = 1) OR (dbo.ProcessClass.TypeRecipeHandler = 1)
    GROUP BY dbo.ProcessClass.ID,dbo.ProcessClass.Name
    ORDER BY ptClass
              `;
}

function getAllAvailableEquipmentByID(pClassID, trainID) {
  return `
  SELECT TOP (100) PERCENT dbo.Equipment.ID AS Equipment_ID, dbo.Equipment.Name AS Equipment_Name, dbo.ProcessClass.ID as PID 
    FROM dbo.ProcessClass 
    INNER JOIN dbo.Equipment ON dbo.ProcessClass.ID = dbo.Equipment.ProcessClass_ID 
    WHERE (dbo.ProcessClass.TypeBatchKernel = 1) AND (dbo.ProcessClass.ID = ${pClassID}) AND (NOT (dbo.Equipment.ID IN 
      (SELECT Equipment_ID
          FROM dbo.RecipeTrainEquipment AS RecipeTrainEquipment_1
          WHERE (RecipeTrain_ID = ${trainID})))) 
          OR (dbo.ProcessClass.TypeRecipeHandler = 1) AND (dbo.ProcessClass.ID = ${pClassID}) AND 
          (NOT (dbo.Equipment.ID IN 
              (SELECT Equipment_ID 
                  FROM  dbo.RecipeTrainEquipment AS RecipeTrainEquipment_2
                  WHERE (RecipeTrain_ID = ${trainID})))) 
    ORDER BY Equipment_Name`;
}

function getAllSelectedEquipmentByID(pClassID, trainID) {
  return `
  SELECT TOP (100) PERCENT dbo.Equipment.ID AS Equipment_ID,
                           dbo.Equipment.Name AS Equipment_Name, 
                           dbo.ProcessClass.ID as pclass_id,
                           dbo.RecipeTrainEquipment.RecipeTrain_ID,
                           dbo.RecipeTrainEquipment.ID 
      FROM dbo.ProcessClass INNER JOIN dbo.Equipment ON dbo.ProcessClass.ID = dbo.Equipment.ProcessClass_ID 
                            INNER JOIN dbo.RecipeTrainEquipment ON dbo.Equipment.ID = dbo.RecipeTrainEquipment.Equipment_ID 
      WHERE (dbo.ProcessClass.TypeBatchKernel = 1) AND (dbo.RecipeTrainEquipment.RecipeTrain_ID = ${trainID}) 
            OR (dbo.ProcessClass.TypeRecipeHandler = 1) 
                AND (dbo.ProcessClass.ID = ${pClassID}) 
                AND (dbo.RecipeTrainEquipment.RecipeTrain_ID = ${trainID}) 
      ORDER BY Equipment_Name`;
}

module.exports = {
  getAllRecipes,
  getSingleRecipe,
  getRecipeProcedure,
  getRecipeProcedureCondensed,
  getStepTypes,
  getRecipeParameters,
  getRequiredProcessClasses,
  getAllTrains,
  getAllBatchEnabledProcessClasses,
  getAllAvailableEquipmentByID,
  getAllSelectedEquipmentByID,
};
