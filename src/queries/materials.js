function getAllMaterials() {
  return `
    SELECT * FROM Material
    `;
}

module.exports = {
  getAllMaterials,
};
