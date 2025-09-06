const Unit = require("../models/unitModel");

async function convertQty(qty, fromUnitId, toUnitId, product = null) {
  if (fromUnitId.toString() === toUnitId.toString()) return qty;

  const fromUnit = await Unit.findById(fromUnitId);
  const toUnit = await Unit.findById(toUnitId);

  if (!fromUnit || !toUnit) throw new Error("Unit tidak ditemukan");

  // Konversi ke base unit teratas
  let baseQty = qty;
  let current = fromUnit;
  while (current.baseUnit) {
    baseQty = baseQty * current.conversion;
    current = await Unit.findById(current.baseUnit);
  }
  const fromRoot = current;

  // Base root tujuan
  current = toUnit;
  const stack = [];
  while (current.baseUnit) {
    stack.push(current);
    current = await Unit.findById(current.baseUnit);
  }
  const toRoot = current;

  // Jika root sama, konversi normal
  if (fromRoot._id.toString() === toRoot._id.toString()) {
    let resultQty = baseQty;
    while (stack.length) {
      const u = stack.pop();
      resultQty = resultQty / u.conversion;
    }
    return resultQty;
  }

  // Jika beda root, pakai density jika tersedia
  if (product?.density) {
    // qty dalam BOM unit → gram (atau base product unit)
    return qty * product.density;
  }

  throw new Error("Unit tidak kompatibel (beda root)");
}

module.exports = { convertQty };
