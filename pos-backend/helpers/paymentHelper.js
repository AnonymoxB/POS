const Payment = require("../models/paymentModel");
const { getNextSequence } = require("./sequenceHelper");

exports.savePaymentFromPurchase = async (sourceType, sourceId, amount, method = "Cash", direction = "In", userId = null, session = null) => {
  const seq = await getNextSequence(sourceType);
  const paddedSeq = String(seq).padStart(4, "0");

  let prefix = "PAY";
  if (sourceType === "Purchase") prefix = "PUR";
  if (sourceType === "Order") prefix = "ORD";
  if (sourceType === "Expense") prefix = "EXP";

  const payment = new Payment({
    paymentId: `${prefix}-${paddedSeq}`,
    sourceType,
    sourceId,
    amount,
    method,
    status: "Success",
    direction,
    note: `${sourceType} Payment`,
    createdBy: userId,
  });

  if (session) {
    await payment.save({ session });
  } else {
    await payment.save();
  }

  return payment;
};
