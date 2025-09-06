const mongoose = require("mongoose");
const Unit = require("./unitModel");

// 🔁 Fungsi rekursif untuk dapatkan base unit & qty
async function getBaseUnitAndQty(unitId, qty) {
  if (!unitId) return { unitBase: null, qtyBase: qty };

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

// 🪝 Pre Save → Hitung qtyBase & unitBase
dishBOMSchema.pre("save", async function (next) {
  try {
    if (this.qty && this.unit) {
      const { qtyBase, unitBase } = await getBaseUnitAndQty(this.unit, this.qty);
      this.qtyBase = qtyBase ?? 0;
      this.unitBase = unitBase ?? null;
    }
    next();
  } catch (err) {
    next(err);
  }
});

// 🪝 Pre Update → Hitung qtyBase & unitBase
dishBOMSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const rawUpdate = this.getUpdate();
    if (!rawUpdate) return next();

    const update = rawUpdate.$set || rawUpdate;

    // Ambil data lama untuk fallback
    const docToUpdate = await this.model.findOne(this.getQuery());
    if (!docToUpdate) return next();

    const qty = update.qty ?? docToUpdate.qty;
    const unit = update.unit ?? docToUpdate.unit;

    if (qty && unit) {
      const { qtyBase, unitBase } = await getBaseUnitAndQty(unit, qty);
      update.qtyBase = qtyBase ?? 0;
      update.unitBase = unitBase ?? null;

      if (rawUpdate.$set) {
        rawUpdate.$set = update;
        this.setUpdate(rawUpdate);
      } else {
        this.setUpdate(update);
      }
    }

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("DishBOM", dishBOMSchema);
  