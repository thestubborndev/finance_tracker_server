const _ = require('lodash');
const promisify = require('es6-promisify');
const plaid = require('plaid');
const config = require('./config');
const AirtableJsWrapper = require('./fetchers/airtablejs_wrapper');
const coinMarketCap = require('./fetchers/coin_market_cap');
const Currencies = require('./currencies/currencies');
const openExchangeRates = require('./fetchers/open_exchange_rates');

const airtableJsWrapper = new AirtableJsWrapper();

const accountSync = {
    async fetchAndUpdateCryptoAssetsAsync() {
        if (config.cryptoAssetsToUpdate.length === 0) {
            return; // short-circuit if no crypto asset updates wanted
        }

        const cryptoAssetList = await coinMarketCap.fetchAllCryptoAssetsAsync();
        for (const cryptoAsset of cryptoAssetList) {
            if (_.indexOf(config.cryptoAssetsToUpdate, cryptoAsset.id) !== -1) {
                const priceInDollars = cryptoAsset.price_usd;
                const currencyName = Currencies[cryptoAsset.id];
                if (!currencyName) {
                    throw new Error(`
                        ${cryptoAsset.id} is missing from the 'Currencies' enum. Add
                        it to the enum in order to resolve this error.
                    `);
                }
                await this.updateCurrencyPriceInAirtableAsync(currencyName, priceInDollars);
            }
        }
    },
    async fetchAndUpdateFiatCurrenciesAsync(fiatCurrencyName) {
        if (config.fiatCurrenciesToUpdate.length === 0 || _.isUndefined(config.openExchangeCredentials.apiKey)) {
            return; // short-circuit if no fiat currency updates wanted
        }

        const fiatCurrencyExchangeRates = await openExchangeRates.fetchAllCurrencyExchangesInDollarsAsync(fiatCurrencyName);
        for (var currencyName in fiatCurrencyExchangeRates) {
            if (!fiatCurrencyExchangeRates.hasOwnProperty(currencyName)) {
                continue;
            }
            if (_.indexOf(config.fiatCurrenciesToUpdate, currencyName) !== -1) {
                const priceInDollars = 1 / fiatCurrencyExchangeRates[currencyName];
                await this.updateCurrencyPriceInAirtableAsync(currencyName, priceInDollars);
            }
        }
    },
    async fetchAndUpdateBankBalancesAsync() {
        if (_.isUndefined(config.plaidCredentials.clientId) || _.isUndefined(config.plaidCredentials.secret)) {
            return; // short-circuit if no API credentials added
        }

        const plaidClient = new plaid.Client(config.plaidCredentials.clientId, config.plaidCredentials.secret, plaid.environments.tartan);

        const airtableAssetNameToAccessToken = config.plaidCredentials.airtableAssetNameToAccessToken;
        for (const airtableHoldingName in airtableAssetNameToAccessToken) {
            if (!airtableAssetNameToAccessToken.hasOwnProperty(airtableHoldingName)) {
                continue;
            }
            const accessToken = airtableAssetNameToAccessToken[airtableHoldingName];
            if (_.isUndefined(accessToken)) {
                console.log(`
                    Warning: An undefined Plaid accessToken encountered.
                    Please make sure you have set a valid accessToken along
                    with your Plaid clientId and secret.
                `);
                continue;
            }
            const response = await promisify(plaidClient.getBalance.bind(plaidClient))(accessToken);
            let currentBalance = 0;
            _.each(response.accounts, account => {
                currentBalance += account.balance.available;
            });
            await this.updateHoldingAmountInAirtableAsync(airtableHoldingName, currentBalance);
        }
    },
    async updateCurrencyPriceInAirtableAsync(currencyName, priceInDollars) {
        const currencyRecordId = await this.fetchAirtableRecordIdForCurrencyAsync(currencyName);
        await airtableJsWrapper.updateAsync(config.airtableCurrenciesTable.name, config.airtableCurrenciesTable.priceFieldName, currencyRecordId, priceInDollars);
    },
    async updateHoldingAmountInAirtableAsync(assetName, amountInDollars) {
        const assetRecordId = await this.fetchAirtableRecordIdForHoldingAsync(assetName);
        await airtableJsWrapper.updateAsync(config.airtableAssetsTable.name, config.airtableAssetsTable.amountFieldName, assetRecordId, amountInDollars);
    },
    async fetchAirtableRecordIdForCurrencyAsync(currency) {
        return promisify(airtableJsWrapper.fetchRecordIdForField.bind(airtableJsWrapper))(config.airtableCurrenciesTable.name, config.airtableCurrenciesTable.symbolFieldName, currency);
    },
    async fetchAirtableRecordIdForHoldingAsync(asset) {
        return promisify(airtableJsWrapper.fetchRecordIdForField.bind(airtableJsWrapper))(config.airtableAssetsTable.name, config.airtableAssetsTable.fundsFieldName, asset);
    },
};

module.exports = accountSync;
