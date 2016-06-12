const requester = require('../requester');

const coinMarketCap = {
    async fetchAllCryptoAssetsAsync() {
        return await requester.getRequestAsync('https://api.coinmarketcap.com/v1/ticker/');
    },
};

module.exports = coinMarketCap;
