// const express = require('express');
// const axios = require('axios');
// const router = express.Router();
// const { getAccessToken } = require('../utils/briAuth');

// router.post('/create', async (req, res) => {
//   const { amount } = req.body;
//   const invoiceId = `INV-${Date.now()}`;

//   const token = await getAccessToken();

//   const payload = {
//     amount: String(amount),
//     invoice_id: invoiceId,
//     additional_info: "Order via Restoran App",
//     merchant_pan: process.env.BRI_MERCHANT_PAN,
//   };

//   const result = await axios.post('https://sandbox.partner.api.bri.co.id/qr/v1.0/generate', payload, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//       'Content-Type': 'application/json',
//     },
//   });

//   return res.json({
//     invoiceId,
//     qrUrl: result.data.qr_image_url,
//     // qrContent: result.data.qr_content, // opsional
//   });
// });

// router.get('/status/:invoiceId', async (req, res) => {
//   const token = await getAccessToken();
//   const invoiceId = req.params.invoiceId;

//   const result = await axios.get(
//     `https://sandbox.partner.api.bri.co.id/qr/v1.0/inquiry-status?invoice_id=${invoiceId}`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

//   return res.json({
//     paid: result.data?.payment_status === "PAID",
//     raw: result.data,
//   });
// });

// module.exports = router;
