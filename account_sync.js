const _ = require('lodash');
const plaid = require('plaid');
const Airtable = require('airtable');
const promisify = require('es6-promisify');
const config = require('./config');
const kraken = require('./kraken');
const coinbase = require('./coinbase');
const Currencies = require('./currencies');
const openExchangeRates = require('./open_exchange_rates');

const plaidClient = new plaid.Client(config.plaidCredentials.clientId, config.plaidCredentials.secret, plaid.environments.tartan);
const base = new Airtable({apiKey: config.airtableCredentials.apiKey}).base(config.airtableCredentials.appId);

const accountSync = {
    async updateAirtableAsync(tableName, recordId, fieldName, fieldValue) {
        return promisify(this.updateAirtable.bind(this))(tableName, fieldName, recordId, fieldValue);
    },
    updateAirtable(tableName, recordId, fieldName, fieldValue, done) {
        base(tableName).update(recordId, {
            [fieldName]: fieldValue,
        }, done);
    },
    async updateCurrencyPriceAsync(currencyName, priceInDollars, done) {
        const currencyRecordId = config.currencyToRecordId[currencyName];
        if (!currencyRecordId) {
            throw new Error(`
                Encountered an unknown currency: ${currencyName} in updateCurrencyPriceAsync.
                If you have added a new currency, make sure you also added a corresponding
                currencyToRecordId entry mapping the currency to the Airtable recordId
                where it's exchange value is stored.
            `);
        }
        await this.updateAirtableAsync('Currencies', 'Price', currencyRecordId, priceInDollars);
    },
    async updateHoldingAmountAsync(holdingName, amountInDollars, done) {
        const holdingRecordId = config.holdingToRecordId[holdingName];
        if (!holdingRecordId) {
            throw new Error(`
                Encountered an unknown holdingName: ${holdingName} in updateHoldingAmountAsync.
                If you have added a new holdingName, make sure you also added a corresponding
                holdingToRecordId entry mapping the holdingName to the Airtable recordId
                where it's balance is stored.
            `);
        }
        await this.updateAirtableAsync('Holdings', 'Amount', holdingRecordId, amountInDollars);
    },
    async fetchAndUpdateKrakenCurrencyPriceAsync(currencyName) {
        const priceInDollars = await kraken.fetchCurrencyPriceAsync(currencyName);
        await this.updateCurrencyPriceAsync(currencyName, priceInDollars);
    },
    async fetchAndUpdateFiatExchangeRateAsync(fiatCurrencyName) {
        const priceInDollars = await openExchangeRates.fetchCurrencyExchangeInDollarsAsync(fiatCurrencyName);
        await this.updateCurrencyPriceAsync(fiatCurrencyName, priceInDollars);
    },
    async fetchAndUpdateCoinbaseBitcoinPriceAsync() {
        const lastTradePrice = await coinbase.fetchBitcoinPriceInDollarsAsync();
        await this.updateCurrencyPriceAsync(Currencies.bitcoin, lastTradePrice);
    },
    async fetchAndUpdateChaseBankBalanceAsync() {
        const response = await promisify(plaidClient.getBalance.bind(plaidClient))(config.plaidCredentials.accessToken);
        let currentBalance = 0;
        _.each(response.accounts, account => {
            currentBalance += account.balance.available;
        });
        await this.updateHoldingAmountAsync('Chase Bank', currentBalance);
    },
};

module.exports = accountSync;
