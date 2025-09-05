const Unit = require("../models/unitModel");

/**
 * Dapatkan base unit dan qty (rekursif)
 */
async function getBaseUnitAndQty(unitId, qty, session = null) {
  const unitDoc = await Unit.findById(unitId).session(session);
  if (!unitDoc) return { unitBase: unitId, qtyBase: qty };

  if (!unitDoc.baseUnit) {
    return {
      unitBase: unitDoc._id,
      qtyBase: qty * (unitDoc.conversion || 1),
    };
  }

  return await getBaseUnitAndQty(
    unitDoc.baseUnit,
    qty * (unitDoc.conversion || 1),
    session
  );
}

/**
 * Dapatkan HPP per base unit (rekursif)
 */
async function getBaseUnitAndHPP(unitId, hpp, session = null) {
  const unitDoc = await Unit.findById(unitId).session(session);
  if (!unitDoc) return { unitBase: unitId, hppBase: hpp };

  if (!unitDoc.baseUnit) {
    return {
      unitBase: unitDoc._id,
      hppBase: hpp / (unitDoc.conversion || 1),
    };
  }

  return await getBaseUnitAndHPP(
    unitDoc.baseUnit,
    hpp / (unitDoc.conversion || 1),
    session
  );
}

module.exports = { getBaseUnitAndQty, getBaseUnitAndHPP };
