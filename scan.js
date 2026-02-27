const crypto = require('crypto');
const axios = require('axios');

// Mandatory claims
const mobicard_version = "2.0";
const mobicard_mode = "LIVE"; // production
const mobicard_merchant_id = "4";
const mobicard_api_key = "YmJkOGY0OTZhMTU2ZjVjYTIyYzFhZGQyOWRiMmZjMmE2ZWU3NGIxZWM3ZTBiZSJ9";
const mobicard_secret_key = "NjIwYzEyMDRjNjNjMTdkZTZkMjZhOWNiYjIxNzI2NDQwYzVmNWNiMzRhMzBjYSJ9";

const mobicard_token_id = Math.floor(Math.random() * (1000000000 - 1000000 + 1)) + 1000000;
const mobicard_txn_reference = Math.floor(Math.random() * (1000000000 - 1000000 + 1)) + 1000000;
const mobicard_service_id = "20000"; // Scan Card service ID
const mobicard_service_type = "1"; // Use '1' for CARD SCAN METHOD 1
const mobicard_extra_data = "your_custom_data_here_will_be_returned_as_is";

// Create JWT Header
const jwtHeader = {
    "typ": "JWT",
    "alg": "HS256"
};
const encodedHeader = Buffer.from(JSON.stringify(jwtHeader)).toString('base64url');

// Create JWT Payload
const jwtPayload = {
    "mobicard_version": mobicard_version,
    "mobicard_mode": mobicard_mode,
    "mobicard_merchant_id": mobicard_merchant_id,
    "mobicard_api_key": mobicard_api_key,
    "mobicard_service_id": mobicard_service_id,
    "mobicard_service_type": mobicard_service_type,
    "mobicard_token_id": mobicard_token_id.toString(),
    "mobicard_txn_reference": mobicard_txn_reference.toString(),
    "mobicard_extra_data": mobicard_extra_data
};

const encodedPayload = Buffer.from(JSON.stringify(jwtPayload)).toString('base64url');

// Generate Signature
const headerPayload = `${encodedHeader}.${encodedPayload}`;
const signature = crypto.createHmac('sha256', mobicard_secret_key)
    .update(headerPayload)
    .digest('base64url');

// Create Final JWT
const mobicard_auth_jwt = `${encodedHeader}.${encodedPayload}.${signature}`;

// Request Access Token
async function requestAccessToken() {
    const url = "https://mobicardsystems.com/api/v1/card_scan";
    const payload = { mobicard_auth_jwt };
    
    try {
        const response = await axios.post(url, payload, {
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
        });
        
        const responseData = response.data;
        
        if (responseData.status_code === "200") {
            const mobicard_transaction_access_token = responseData.mobicard_transaction_access_token;
            const mobicard_token_id = responseData.mobicard_token_id;
            const mobicard_scan_card_url = responseData.mobicard_scan_card_url;
            
            console.log("Access Token Generated Successfully!");
            console.log(`Transaction Access Token: ${mobicard_transaction_access_token}`);
            console.log(`Token ID: ${mobicard_token_id}`);
            console.log(`Scan Card URL: ${mobicard_scan_card_url}`);
            
            return {
                mobicard_transaction_access_token,
                mobicard_token_id,
                mobicard_scan_card_url
            };
        } else {
            console.error("Error:", responseData);
            throw new Error(responseData.status_message);
        }
    } catch (error) {
        console.error("Request failed:", error.message);
        throw error;
    }
}

// Execute the request
requestAccessToken();
