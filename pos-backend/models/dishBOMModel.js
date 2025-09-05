const mongoose = require("mongoose");
const Unit = require("./unitModel");

// 🔁 fungsi rekursif untuk dapatkan base unit dan qty
async function getBaseUnitAndQty(unitId, qty) {
  const unitDoc = await Unit.findById(unitId);
  if (!unitDoc) return { unitBase: unitId, qtyBase: qty };

  if (!unitDoc.baseUnit) {
    return {
      unitBase: unitDoc._id,
      qtyBase: qty * (unitDoc.conversion || 1),
    };
  }

  return await getBaseUnitAndQty(
    unitDoc.baseUnit,
    qty * (unitDoc.conversion || 1)
  );
}

const dishBOMSchema = new mongoose.Schema(
  {
    dish: { type: mongoose.Schema.Types.ObjectId, ref: "Dish", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    qty: { type: Number, required: true },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
    variant: { type: String, enum: ["hot", "ice"], required: true },

    // 🔑 auto diisi dari middleware
    qtyBase: { type: Number, default: 0 },
    unitBase: { type: mongoose.Schema.Types.ObjectId, ref: "Unit" },
  },
  { timestamps: true }
);

// 🪝 Middleware: sebelum save → hitung qtyBase & unitBase
dishBOMSchema.pre("save", async function (next) {
  try {
    if (this.qty && this.unit) {
      const { qtyBase, unitBase } = await getBaseUnitAndQty(this.unit, this.qty);
      this.qtyBase = qtyBase;
      this.unitBase = unitBase;
    }
    next();
  } catch (err) {
    next(err);
  }
});

// 🪝 Middleware: sebelum update → hitung qtyBase & unitBase
dishBOMSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate();
    if (update.qty && update.unit) {
      const { qtyBase, unitBase } = await getBaseUnitAndQty(update.unit, update.qty);
      update.qtyBase = qtyBase;
      update.unitBase = unitBase;
      this.setUpdate(update);
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("DishBOM", dishBOMSchema);
