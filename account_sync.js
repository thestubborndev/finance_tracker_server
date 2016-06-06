const _ = require('lodash');
const plaid = require('plaid');
const promisify = require('es6-promisify');
const config = require('./config');
const coinMarketCap = require('./coin_market_cap');
const Currencies = require('./currencies');
const Holdings = require('./holdings');
const openExchangeRates = require('./open_exchange_rates');

const plaidClient = new plaid.Client(config.plaidCredentials.clientId, config.plaidCredentials.secret, plaid.environments.tartan);

const accountSync = {
    async fetchAndUpdateCryptoAssetsAsync() {
        const cryptoAssetList = await coinMarketCap.fetchCryptoAssetsAsync();
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
                await this.updateCurrencyPriceAsync(currencyName, priceInDollars);
            }
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
    async fetchAndUpdateFiatExchangeRateAsync(fiatCurrencyName) {
        const priceInDollars = await openExchangeRates.fetchCurrencyExchangeInDollarsAsync(fiatCurrencyName);
        await this.updateCurrencyPriceAsync(fiatCurrencyName, priceInDollars);
    },
    },
    async fetchAndUpdateBankBalanceAsync() {
        const response = await promisify(plaidClient.getBalance.bind(plaidClient))(config.plaidCredentials.accessToken);
        let currentBalance = 0;
        _.each(response.accounts, account => {
            currentBalance += account.balance.available;
        });
        await this.updateHoldingAmountAsync(Holdings.chaseBank, currentBalance);
    },
};

module.exports = accountSync;
