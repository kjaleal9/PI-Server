async function getCIPselect() {
  const CIPSelect = {};
  const request = new sql.Request(req.db);
  const allCIPLines = await request
    .execute("Report_General_getCIPLine")
    .then((data) => data.recordsets[0]);
  const allCIPCircuits = await Promise.all(
    allCIPLines.map(async (line) => {
      const circuits = await getCIPCircuits(line.key);
      return {
        name: line.key,
        circuits,
      };
    })
  );

  CIPSelect.allCIPLines = allCIPLines;
  CIPSelect.allCIPCircuits = allCIPCircuits;
  return CIPSelect;
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

module.exports = {
  getCIPselect,
  getCIPCircuits,
  getCIPUnits
};
