**Disclaimer**: This was built as a weekend project, use at your own discretion.

Finance Tracker Server is a simple web server that updates crypto/fiat currency exchanges and bank balances in an Airtable Base used to keep track of your finances. By navigating to the servers endpoint with a browser, you will be redirected to your updated Finance Tracker Airtable base.

See the <a href="http://fabioberger.com/post/2016-06-05-finance-tracker-using-airtable/" target="_blank">related blog post here.</a>

![Finance Tracker Base](https://cloud.githubusercontent.com/assets/2151492/15804151/341e3c32-2ab4-11e6-8c17-15b906048caa.png)

See the <a href="https://airtable.com/shr7hsDfj0vyFhO63" target="_blank">live example template here.</a>


## Setup

In order to run this app locally, you will need to <a href="https://nodejs.org/en/download/" target="_blank">install nodejs</a>.


After cloning this repository, run `npm install` from the projects directory to install its dependencies.

### External accounts

Since this app integrates with multiple third-party services in order to update exchange rates, bank balances and your Airtable base, you will need to set some API credentials as environment variables and edit some options in `config.js`. Open up this file in your favorite text editor and lets go through them step-by-step. (For more help setting environment variables, see [ENVIRONMENT_VARIABLES.md](https://github.com/fabioberger/finance_tracker_server/blob/master/ENVIRONMENT_VARIABLES.md))

#### Airtable

You will need to <a href="https://airtable.com/" target="_blank">sign up</a>
 for an Airtable account. Once you have an account:

1. <a href="https://airtable.com/shr7hsDfj0vyFhO63" target="_blank">Install the Finance Tracker template</a>
 by clicking the `Copy base` button.

2. Visit your <a href="https://airtable.com/account" target="_blank">user account page</a>
 in order to click the "Generate API key" link. Set this key to the `AIRTABLE_API_KEY` environment variable.

4. Next, go to the <a href="https://airtable.com/api" target="_blank">Airtable API page</a>
, select the Finance Tracker base from the list to see it's custom documentation. On this page, you need to find the base's `appId`. It is part of the example request URLs (and looks something like this: `appzMI3fKkMjUEOYC`).

```
export AIRTABLE_APP_ID=[your-finance-tracker-app-id]
```

And that's it for Airtable!

#### Open Exchange Rates (Optional)

If you are interested in updating the USD value of assets denominated in fiat currencies, you can <a href="https://openexchangerates.org/" target="_blank">sign up for an Open Exchange Rates account</a>
 and get a free API key. Set it with:

``` bash
export OPEN_EXCHANGE_API_KEY=[your-oex-api-key]
```

In order to customize which fiat currencies you want updated, modify the `fiatCurrenciesToUpdate` list in `config.js`. The default is for it to simply update the Swiss Franc to USD exchange.

```
fiatCurrenciesToUpdate: [
    Currencies['CHF'],
],
```
- See `fiat_currencies.js` for full list of supported currencies.

If you don't care to update other fiat currency exchanges, don't add an API key and fiat currency updates will be skipped.

#### CoinMarketCap API (Optional)

The CoinMarketCap API is public and free to use. All you need to do, is choose which crypto-assets you'd like to keep updated.

Customize the crypto-assets updated by modifying the `cryptoAssetsToUpdate` list in `config.js`. By default it is only updating `ether`, `dao tokens` and `bitcoin`.

```
cryptoAssetsToUpdate: [
    Currencies['ethereum'],
    Currencies['bitcoin'],
    Currencies['the-dao'],
],
```
- See `crypto_assets.js` for a full list of supported crypto-assets.

#### Plaid Bank Integration (Optional)

If you would like to update an entry in the 'Assets' table with your current bank balance, you can use <a href="https://plaid.com/products/balance/" target="_blank">Plaid's Balance Product</a>
. They offer an intuitive API for connecting to many US banks with online banking credentials and once authenticated, you can request your current bank balance easily. At the time of writing, this was free for up to 100 connected accounts.

1. <a href="https://dashboard.plaid.com/signup/" target="_blank">Sign up for Plaid</a>
 and set the Plaid `clientId` and `secret` as environment variables `PLAID_CLIENT_ID` and `PLAID_SECRET`.

2. Next, we need to retrieve an `accessToken` associated with each of the bank account balances you'd like to keep track of. Each `accessToken` is linked to an online banking login credential. To make this as painless as possible, I wrote a small command-line tool that will help you get `accessTokens` in a matter of seconds. Run the following command and follow the prompt instructions:

```
node ./node_modules/babel-cli/bin/babel . --out-dir ./transpiled --retain-lines --ignore '**node_modules,.git,transpiled' -x '.es6,.js,.es,.jsx'; node transpiled/setup/plaid_access_token_fetcher.js
```

When finished, it will print the `accessToken` associated with the online banking credentials. In order to tell the server which record in the Airtable 'Assets' table this accessToken is associated with, edit the `airtableAssetNameToAccessToken` object in the `config.js` file.

Config.js File Location:

```
plaidCredentials: {
	...
    // Maps the identifying 'Name' field value in the 'Assets' table in Airtable
    // with the Plaid accessToken associated with the asset bank account
    airtableAssetNameToAccessToken: {
        'Chase Bank Balance': process.env.PLAID_ACCESS_TOKEN_FOR_CHASE_ACCOUNT,
    },
},
```
So if we just generated the `accessToken` for our Chase Bank account, we would set the environment variable `PLAID_ACCESS_TOKEN_FOR_CHASE_ACCOUNT`. We should also make sure that we have a record in the 'Assets' table in our **Finance Tracker** base on Airtable with the name: 'Chase Bank Balance'. This way, the server knows which record to update in Airtable with the account balance. You can add multiple `accessToken` to Airtable record name pairs to `airtableAssetNameToAccessToken`, allowing you to update multiple account balances.


**Note:** If you don't want to activate balance updates, simply do not add a Plaid clientId or secret.

## Run

By now, you should have configured the server to perform the updates you want. All thats left is to start the server and give it a go! Since this project uses ES6 syntax, we will need to transpile the project before starting the server. To transpile the project, run the following from the project directory:

```
node ./node_modules/babel-cli/bin/babel . --out-dir ./transpiled --retain-lines --ignore '**node_modules,.git,transpiled' -x '.es6,.js,.es,.jsx';
```

Now run:

```
node transpiled/server.js
```

If everything worked, you should see the message:

```
Server Running... If running locally, visit: localhost:3000/appCeLwipDDNrFMm2
```

Visiting the link in a browser should kick off the crypto/fiat currency and bank balance updates and then redirect you to your Airtable Finance Tracker base!
