const requester = require('./requester');
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
        const response = await requester(`https://openexchangerates.org/api/latest.json?app_id=${config.openExchangeCredentials.apiKey}`);
        const lastTradePrice = parseFloat(response.rates[currencySymbol]);
        const currencyValueInDollars = 1 / lastTradePrice;
        return currencyValueInDollars;
    },
};

module.exports = openExchangeRates;
