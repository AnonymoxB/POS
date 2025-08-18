export async function getAccessToken() {
  const clientId = import.meta.env.VITE_BRI_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_BRI_CLIENT_SECRET;

  const response = await fetch('https://sandbox.partner.api.bri.co.id/oauth/client_credential/accesstoken', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}
