const _ = require('lodash');
const assert = require('assert');
const AirtableLib = require('airtable');
const promisify = require('es6-promisify');
const config = require('./config');
const utils = require('./utils');

class Airtable {
    constructor() {
        assert(!_.isUndefined(config.airtableCredentials.apiKey) &&
            utils.airtableIdPrefix(config.airtableCredentials.apiKey) === 'key' &&
            config.airtableCredentials.apiKey.length === 17, `
            Invalid Airtable API key found set to AIRTABLE_API_KEY environment
            variable. Currently set to: ${config.airtableCredentials.apiKey}
            Valid value must starts with 'key' and have a total of 17 characters.
            e.g: key6D1UIKHur4OBY0
            Set it by running 'export AIRTABLE_API_KEY=key6D1UIKHur4OBY0' in terminal.
        `);
        assert(!_.isUndefined(config.airtableCredentials.appId) &&
            utils.airtableIdPrefix(config.airtableCredentials.appId) === 'app' &&
            config.airtableCredentials.appId.length === 17, `
            Invalid Airtable App Id found set to AIRTABLE_APP_ID environment
            variable. Currently set to: ${config.airtableCredentials.appId}
            Valid value must starts with 'app' and have a total of 17 characters.
            e.g: app6D1UIKHur4OBY0
            Set it by running 'export AIRTABLE_APP_ID=app6D1UIKHur4OBY0' in terminal.
        `);
        this._base = new AirtableLib({apiKey: config.airtableCredentials.apiKey}).base(config.airtableCredentials.appId);
    }
    async updateCurrencyPriceAsync(currencyName, priceInDollars) {
        const currencyRecordId = await this.fetchRecordIdForCurrencyAsync(currencyName);
        await this.updateAsync('Currencies', 'Price', currencyRecordId, priceInDollars);
    }
    async updateHoldingAmountAsync(assetName, amountInDollars) {
        const assetRecordId = await this.fetchRecordIdForHoldingAsync(assetName);
        await this.updateAsync('Assets', 'Amount', assetRecordId, amountInDollars);
    }
    async updateAsync(tableName, recordId, fieldName, fieldValue) {
        return promisify(this.update.bind(this))(tableName, fieldName, recordId, fieldValue);
    }
    update(tableName, recordId, fieldName, fieldValue, done) {
        this._base(tableName).update(recordId, {
            [fieldName]: fieldValue,
        }, done);
    }
    async fetchRecordIdForCurrencyAsync(currency) {
        return promisify(this.fetchRecordIdForField.bind(this))('Currencies', 'Symbol', currency);
    }
    async fetchRecordIdForHoldingAsync(asset) {
        return promisify(this.fetchRecordIdForField.bind(this))('Assets', 'Funds', asset);
    }
    fetchRecordIdForField(tableName, fieldName, fieldValue, done) {
        this._base(tableName).select({
            filterByFormula: `{${fieldName}} = '${fieldValue}'`,
        }).firstPage(function(err, records) {
            if (err) { done(err); return; }
            if (records.length === 0) {
                throw new Error(`
                    ${fieldValue}' was not found in the '${fieldName}' column of the
                    ${tableName} Airtable table. Add it there in order to get this to
                    work.
                `);
            }
            if (records.length > 1) {
                done(new Error(`
                    ${fieldValue} has more then one entry in the '${tableName}'
                    Airtable table. You should remove one of the entries to avoid
                    causing unexpected behavior.
                `));
                return;
            }
            const record = records[0];
            done(null, record.id);
        });
    }
}

module.exports = Airtable;
