const Unit = require("../models/unitModel");

async function convertQty(qty, fromUnitId, toUnitId, product = null) {
  if (fromUnitId.toString() === toUnitId.toString()) return qty;

  const fromUnit = await Unit.findById(fromUnitId);
  const toUnit = await Unit.findById(toUnitId);

  if (!fromUnit || !toUnit) throw new Error("Unit tidak ditemukan");

  // 1️⃣ Naik ke base root dari unit asal
  let baseQty = qty;
  let current = fromUnit;
  while (current.baseUnit) {
    baseQty = baseQty * current.conversion;
    current = await Unit.findById(current.baseUnit);
  }
  const fromRoot = current;

  // 2️⃣ Naik ke base root unit tujuan
  current = toUnit;
  const stack = [];
  while (current.baseUnit) {
    stack.push(current);
    current = await Unit.findById(current.baseUnit);
  }
  const toRoot = current;

  // 3️⃣ Unit compatible → konversi normal
  if (fromRoot._id.toString() === toRoot._id.toString()) {
    while (stack.length) {
      const u = stack.pop();
      baseQty = baseQty / u.conversion;
    }
    return baseQty;
  }

  // 4️⃣ Unit beda root → pakai density kalau ada
  if (product?.density) {
    // contoh ML → Gram: qty * density
    let resultQty = baseQty * product.density;

    // Kalau unit tujuan ada konversi, lakukan konversi ke unit tujuan
    while (stack.length) {
      const u = stack.pop();
      resultQty = resultQty / u.conversion;
    }

    return resultQty;
  }

  throw new Error("Unit tidak kompatibel (beda root dan density tidak tersedia)");
}

module.exports = { convertQty };
