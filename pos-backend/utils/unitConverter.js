const Unit = require("../models/unitModel");

async function convertQty(qty, fromUnitId, toUnitId, product = null) {
  if (fromUnitId.toString() === toUnitId.toString()) return qty;

  const fromUnit = await Unit.findById(fromUnitId);
  const toUnit = await Unit.findById(toUnitId);

  if (!fromUnit || !toUnit) throw new Error("Unit tidak ditemukan");

  // Ubah ke base unit teratas
  let baseQty = qty;
  let current = fromUnit;
  while (current.baseUnit) {
    baseQty = baseQty * current.conversion;
    current = await Unit.findById(current.baseUnit);
  }
  const fromRoot = current;

  // Ubah dari base root ke unit tujuan
  let resultQty = baseQty;
  current = toUnit;
  const stack = [];
  while (current.baseUnit) {
    stack.push(current);
    current = await Unit.findById(current.baseUnit);
  }
  const toRoot = current;

  if (fromRoot._id.toString() === toRoot._id.toString()) {
    // Unit compatible → konversi normal (tanpa density)
    while (stack.length) {
      const u = stack.pop();
      resultQty = resultQty / u.conversion;
    }
    return resultQty;
  }

  // Unit beda root → gunakan density jika tersedia
  if (product?.density) {
    return qty * product.density;
  }

  throw new Error("Unit tidak kompatibel (beda root)");
}

module.exports = { convertQty };
