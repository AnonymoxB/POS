// helpers/paymentHelper.js
const Payment = require("../models/paymentModel");

exports.savePaymentFromPurchase = async (purchase, userId, session = null) => {
  const payment = new Payment({
    source: "PURCHASE",
    sourceId: purchase._id,
    amount: purchase.grandTotal,
    method: "CASH",
    date: new Date(),
    createdBy: userId,
  });

  if (session) {
    await payment.save({ session });
  } else {
    await payment.save();
  }

  return payment;
};
