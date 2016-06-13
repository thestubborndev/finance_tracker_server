const requester = require('../requester');
const config = require('../config');

const LATEST_EXCHANGE_RATES_ENDPOINT = 'https://openexchangerates.org/api/latest.json';

const openExchangeRates = {
    async fetchAllCurrencyExchangesInDollarsAsync() {
        const response = await requester.getRequestAsync(`${LATEST_EXCHANGE_RATES_ENDPOINT}?app_id=${config.openExchangeCredentials.apiKey}`);
        return response.rates;
    },
};

module.exports = openExchangeRates;
