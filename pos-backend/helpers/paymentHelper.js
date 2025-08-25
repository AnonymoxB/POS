const Payment = require("../models/paymentModel");

exports.savePaymentFromPurchase = async (purchase, userId, session = null) => {
  const totalAmount =
    purchase.grandTotal ||
    purchase.items?.reduce((sum, i) => sum + (i.total || 0), 0) ||
    0;

  const payment = new Payment({
    paymentId: `PUR-${Date.now()}`, // ✅ pakai prefix PUR biar beda dengan lain
    sourceType: "purchase",
    sourceId: purchase.purchaseId || purchase._id, 
    amount: totalAmount,
    method: "cash",      // default cash
    status: "success",   // default sukses
    direction: "out",    // purchase = keluar uang
    note: "Purchase Payment",
    createdBy: userId,
  });

  if (session) {
    await payment.save({ session });
  } else {
    await payment.save();
  }

  return payment;
};


