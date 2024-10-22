const axios = require('axios');

exports.handler = async function(event, context) {
  const ip = event.queryStringParameters?.ip;

  if (!ip) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "IP address is required" }),
    };
  }

  try {
    const apiKey = process.env.FOCSEC_API_KEY;
    const url = `https://api.focsec.com/v1/ip/${ip}?api_key=${apiKey}`;
    
    const response = await axios.get(url);
    const data = response.data;

   

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to check IP reputation" }),
    };
  }
};