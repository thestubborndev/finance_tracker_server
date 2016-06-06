const _ = require('lodash');
const FiatCurrencies = require('./fiat_currencies');
const CrytoAssets = require('./crypto_assets');

const Currencies = _.extend({}, CrytoAssets, FiatCurrencies);

module.exports = Currencies;
