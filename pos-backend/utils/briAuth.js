// const axios = require('axios');
// require('dotenv').config();

// async function getAccessToken() {
//   const basicAuth = Buffer.from(`${process.env.BRI_CLIENT_ID}:${process.env.BRI_CLIENT_SECRET}`).toString('base64');

//   const response = await axios.post(
//     'https://sandbox.partner.api.bri.co.id/oauth/client_credential',
//     'grant_type=client_credentials',
//     {
//       headers: {
//         Authorization: `Basic ${basicAuth}`,
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//     }
//   );

//   return response.data.access_token;
// }

// module.exports = { getAccessToken };
