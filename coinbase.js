const requester = require('./requester');

const coinbase = {
    async fetchBitcoinPriceInDollarsAsync() {
        const response = await requester('https://api.coinbase.com/v2/prices/spot?currency=USD');
        /*
        Coinbase API Response:
        {
          "data": {
            "amount": "1015.00",
            "currency": "USD"
          }
        }
        */
        return parseFloat(response.data.amount);
    }
};

module.exports = coinbase;
