const Payment = require("../models/paymentModel");

exports.savePaymentFromPurchase = async (purchase, userId, session = null) => {
  const totalAmount =
    purchase.grandTotal ||
    purchase.items?.reduce((sum, i) => sum + (i.total || 0), 0) ||
    0;

  const payment = new Payment({
    paymentId: `PAY-${Date.now()}`, 
    sourceType: "Purchase",       
    sourceId: purchase._id,   
    amount: totalAmount,
    method: "Cash",                
    status: "Success",                
    direction: "Out",              
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
