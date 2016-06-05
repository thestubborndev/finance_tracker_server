const requester = require('./requester');
const Currencies = require('./currencies');

const currencyToKrakenPairName = {
    [Currencies.ether]: 'XETHZUSD',
    [Currencies.bitcoin]: 'XXBTZUSD',
};

const kraken = {
    async fetchCurrencyPriceAsync(currencyName, done) {
        const currencyPair = currencyToKrakenPairName[currencyName];
        const response = await requester(`https://api.kraken.com/0/public/Ticker?pair=${currencyPair}`);
        return parseFloat(response.result[currencyPair].c[0]);
    },
};

module.exports = kraken;
