const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    customerDetails: {
        name:{type: String, required: true},
        phone:{type: String, required: false},
        guests:{type: String, required: true},
        type: {type: String, required: true},
        tableNo: Number
    }, 
    orderStatus: {
        type: String,
        required: true
    },
    orderDate: {
        type: Date,
        default: () => Date.now()
    },
    orderId: {
    type: String,
    required: true,
    unique: true,
    },

    bills: {
        total: { type: Number, required: true},
        totalWithTax: { type: Number, required: true}

    },
    items: [
  {
    dishId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dish",
      required: true
    },
    name: { type: String, required: true },
    variant: { type: String },
    unitPrice: { type: Number, required: true },
    qty: { type: Number, required: true },
    totalPrice: { type: Number, required: true }
  }
],



    paymentMethod: { type: String }, // "Cash" / "Online"

    // ✅ Tambahkan ini juga jika pakai Razorpay
    paymentData: {
        razorpay_order_id: { type: String },
        razorpay_payment_id: { type: String },
    },

    table: {type: mongoose.Schema.Types.ObjectId, ref:"Table"}
}, {timestamps: true});

module.exports = mongoose.model("Order", orderSchema);