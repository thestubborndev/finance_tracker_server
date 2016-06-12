const _ = require('lodash');

const utils = {
    airtableIdPrefix(airtableId) {
        return airtableId.slice(0, 3);
    },
    keywords(values) {
        return _.zipObject(values, values);
    },
};

module.exports = utils;
