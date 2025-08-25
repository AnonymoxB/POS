const Payment = require("../models/paymentModel");

exports.savePaymentFromPurchase = async (purchase, userId, session = null) => {
  const totalAmount =
    purchase.grandTotal ||
    purchase.items?.reduce((sum, i) => sum + (i.total || 0), 0) ||
    0;

  const payment = new Payment({
    paymentId: `PAY-${Date.now()}`,
    sourceType: "purchase",         // konsisten dengan createPayment
    sourceId: purchase.purchaseId || purchase._id, // simpan ID / kode PUR
    amount: totalAmount,
    method: "cash",                 // default cash
    status: "success",              // default sukses
    direction: "out",               // purchase = keluar uang
    note: `Payment for Purchase ${purchase.purchaseId || purchase._id}`,
    createdBy: userId,
  });

  if (session) {
    await payment.save({ session });
  } else {
    await payment.save();
  }

  return payment;
};

