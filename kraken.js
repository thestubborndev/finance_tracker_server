const fetch = require('node-fetch');
const Currencies = require('./currencies');

const currencyToKrakenPairName = {
    [Currencies.ether]: 'XETHZUSD',
    [Currencies.bitcoin]: 'XXBTZUSD',
};

const kraken = {
    async fetchCurrencyPriceAsync(currencyName, done) {
        const currencyPair = currencyToKrakenPairName[currencyName];
        const response = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${currencyPair}`);
        if (!response.ok) {
            const err = new Error(`Non-200 Response Received: ${response.status}`, response);
            err.response = response;
            throw err;
        } else {
            const bodyObj = await response.json();
            return parseFloat(bodyObj.result[currencyPair].c[0]);
        }
    },
};

module.exports = kraken;
