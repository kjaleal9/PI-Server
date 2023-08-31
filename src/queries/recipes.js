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
  getAllTrains,
  getAllBatchEnabledProcessClasses,
  getAllAvailableEquipmentByID,
  getAllSelectedEquipmentByID,
};
