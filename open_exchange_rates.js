const requester = require('./requester');
const config = require('./config');

const LATEST_EXCHANGE_RATES_ENDPOINT = 'https://openexchangerates.org/api/latest.json';

const openExchangeRates = {
    async fetchAllCurrencyExchangesInDollarsAsync() {
        const response = await requester.getRequestAsync(`${LATEST_EXCHANGE_RATES_ENDPOINT}?app_id=${config.openExchangeCredentials.apiKey}`);
        return response.rates;
    },
    async fetchCurrencyExchangeInDollarsAsync(currency) {
        const response = await requester.getRequestAsync(`${LATEST_EXCHANGE_RATES_ENDPOINT}?app_id=${config.openExchangeCredentials.apiKey}`);
        const lastTradePrice = parseFloat(response.rates[currency]);
        const currencyValueInDollars = 1 / lastTradePrice;
        return currencyValueInDollars;
    },
};

module.exports = openExchangeRates;
