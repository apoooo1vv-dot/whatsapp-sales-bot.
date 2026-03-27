import axios from 'axios';

const WASENDER_API_KEY = process.env.WASENDER_API_KEY;
const WASENDER_ACCOUNT_ID = process.env.WASENDER_ACCOUNT_ID;
const WASENDER_BASE_URL = 'https://wasenderapi.com/api';

if (!WASENDER_API_KEY || !WASENDER_ACCOUNT_ID) {
  console.error('❌ Wasender credentials missing in environment variables');
  process.exit(1);
}

export async function sendWhatsAppMessage(to, message) {
  try {
    // Clean phone number
    const cleanNumber = to.replace(/[^\d]/g, '');
    
    const response = await axios.post(
      `${WASENDER_BASE_URL}/send`,
      {
        account_id: WASENDER_ACCOUNT_ID,
        to: cleanNumber,
        message: message,
        type: 'text'
      },
      {
        headers: {
          'Authorization': `Bearer ${WASENDER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );
    
    console.log(`📤 Message sent to ${cleanNumber}`);
    return { success: true, data: response.data };
    
  } catch (error) {
    console.error('❌ Wasender API error:', 
      error.response?.data?.message || error.message
    );
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
}
