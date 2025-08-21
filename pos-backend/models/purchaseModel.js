import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    supplier: {
      type: String,
      required: true,
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        unit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
        price: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],
    grandTotal: {
      type: Number,
      required: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Purchase = mongoose.model("Purchase", purchaseSchema);
export default Purchase;
