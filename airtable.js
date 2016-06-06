const Airtable = require('airtable');
const promisify = require('es6-promisify');
const config = require('./config');
const base = new Airtable({apiKey: config.airtableCredentials.apiKey}).base(config.airtableCredentials.appId);

const airtable = {
    async updateAsync(tableName, recordId, fieldName, fieldValue) {
        return promisify(this.update.bind(this))(tableName, fieldName, recordId, fieldValue);
    },
    update(tableName, recordId, fieldName, fieldValue, done) {
        base(tableName).update(recordId, {
            [fieldName]: fieldValue,
        }, done);
    },
    async fetchRecordIdForCurrencyAsync(currency) {
        return promisify(this.fetchRecordIdForField.bind(this))('Currencies', 'Symbol', currency);
    },
    async fetchRecordIdForHoldingAsync(asset) {
        return promisify(this.fetchRecordIdForField.bind(this))('Assets', 'Funds', asset);
    },
    fetchRecordIdForField(tableName, fieldName, fieldValue, done) {
        base(tableName).select({
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
    },
};

module.exports = airtable;
