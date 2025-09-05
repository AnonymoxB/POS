const Unit = require("../models/unitModel");

/**
 * Konversi qty antar unit dengan density
 */
async function convertQtyWithDensity(qty, fromUnit, toUnit, product) {
  const density = product?.density || 1; // g/ml

  // sama tipe (mass→mass atau volume→volume)
  if (fromUnit.type === toUnit.type) {
    return qty * (fromUnit.conversion || 1);
  }

  // mass → volume
  if (fromUnit.type === "mass" && toUnit.type === "volume") {
    let grams = fromUnit.short === "kg" ? qty * 1000 : qty * (fromUnit.conversion || 1);
    return grams / density;
  }

  // volume → mass
  if (fromUnit.type === "volume" && toUnit.type === "mass") {
    let grams = qty * density;
    if (toUnit.short === "kg") return grams / 1000;
    return grams;
  }

  return qty;
}

/**
 * Dapatkan base unit & qty (rekursif, support density)
 */
async function getBaseUnitAndQty(unitId, qty, product, session = null) {
  const unitDoc = await Unit.findById(unitId).session(session);
  if (!unitDoc) return { unitBase: unitId, qtyBase: qty };

  if (!unitDoc.baseUnit) {
    return {
      unitBase: unitDoc._id,
      qtyBase: qty * (unitDoc.conversion || 1),
    };
  }

  const baseDoc = await Unit.findById(unitDoc.baseUnit).session(session);

  if (unitDoc.type !== baseDoc.type) {
    const convertedQty = await convertQtyWithDensity(qty, unitDoc, baseDoc, product);
    return getBaseUnitAndQty(baseDoc._id, convertedQty, product, session);
  }

  return getBaseUnitAndQty(
    baseDoc._id,
    qty * (unitDoc.conversion || 1),
    product,
    session
  );
}

module.exports = { getBaseUnitAndQty };
