const fetch = require('node-fetch');
const config = require('./config');
const Currencies = require('./currencies');

const currencyNameToSymbol = {
    [Currencies.swissFranks]: 'CHF',
};

const openExchangeRates = {
    async fetchCurrencyExchangeInDollarsAsync(fiatCurrencyName) {
        const currencySymbol = currencyNameToSymbol[fiatCurrencyName];
        if (!currencySymbol) {
            throw new Error(`
                Unrecognized Fiat Currency Encountered: ${fiatCurrencyName}.
                If you are adding a new fiat currency, make sure to add it to
                the currencies.js enum and to the currencyNameToSymbol map at
                the top of open_exchange_rates.js
            `);
        }
        const response = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${config.openExchangeCredentials.apiKey}`);
        if (!response.ok) {
            const err = new Error(`Non-200 Response Received: ${response.status}`, response);
            err.response = response;
            throw err;
        } else {
            const bodyObj = await response.json();
            const lastTradePrice = parseFloat(bodyObj.rates[currencySymbol]);
            const currencyValueInDollars = 1 / lastTradePrice;
            return currencyValueInDollars;
        }
    },
};

module.exports = openExchangeRates;
