const Unit = require("../models/unitModel");

/**
 * Cari root/base unit dari sebuah unit
 */
async function findRootUnit(unitId, session = null) {
  const unitDoc = await Unit.findById(unitId).session(session);
  if (!unitDoc) return null;

  if (!unitDoc.baseUnit) return unitDoc._id;

  return await findRootUnit(unitDoc.baseUnit, session);
}

/**
 * Validasi apakah unit yang dipilih kompatibel dengan unit produk
 */
async function validateUnitForProduct(productUnitId, chosenUnitId, session = null) {
  const productRoot = await findRootUnit(productUnitId, session);
  const chosenRoot = await findRootUnit(chosenUnitId, session);

  return String(productRoot) === String(chosenRoot);
}

module.exports = { validateUnitForProduct };
