const fetch = require('node-fetch');

const coinbase = {
    async fetchBitcoinPriceInDollarsAsync() {
        const response = await fetch('https://api.coinbase.com/v2/prices/spot?currency=USD');
        if (!response.ok) {
            const err = new Error(`Non-200 Response Received: ${response.status}`, response);
            err.response = response;
            throw err;
        } else {
            const bodyObj = await response.json();
            /*
            Coinbase API Response:
            {
              "data": {
                "amount": "1015.00",
                "currency": "USD"
              }
            }
            */
            return parseFloat(bodyObj.data.amount);
        }
    }
};

module.exports = coinbase;
