const utils = {
    airtableIdPrefix(airtableId) {
        return airtableId.slice(0, 3);
    }
};

module.exports = utils;
