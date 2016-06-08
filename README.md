Finance Tracker Server is a simple web server that updates crypto/fiat currency exchanges and bank balances in an Airtable Base used to keep track of your finances. By navigating to the servers endpoint with a browser, you will be redirected to your updated Finance Tracker Airtable base.

See the [related blog post here.](http://fabioberger.com/post/2016-06-05-finance-tracker-using-airtable/)

![Finance Tracker Base](https://cloud.githubusercontent.com/assets/2151492/15804151/341e3c32-2ab4-11e6-8c17-15b906048caa.png)

See the [live example template here.](https://airtable.com/shrA09QDhlYHBPMB3)

## Set up

In order to run this app locally, you will need to [install nodejs](https://nodejs.org/en/download/).

After cloning this repository, run `npm install` from the projects directory to install it's dependencies.

The remaining setup steps will require you to edit a single file: `config.js`. Open it now in your favorite text editor and follow the remaining instructions.

### External accounts

Since this app integrates with multiple third-party services in order to update exchange rates, bank balances and your Airtable base, you will need to update some API credentials conveniently located in the `config.js` file. Lets go through them step-by-step.

#### Airtable

You will need to [sign up](https://airtable.com/) for an Airtable account. Once you have an account:

1. [Install the Finance Tracker template](https://airtable.com/shrA09QDhlYHBPMB3) by clicking the `Copy base` button.

2. Visit your [user account page](https://airtable.com/account) in order to click the "Generate API key" link. Copy and paste your key into the config file to replace `process.env.AIRTABLE_API_KEY` or set it as an environment variable on your computer.

4. Next, go to the [Airtable API page](https://airtable.com/api), select the Finance Tracker base from the list to see it's custom documentation. Copy/paste the appId corresponding to the `Finance Tracker` base from the example request URL (**hint**: it looks something like this: `appzMI3fKkMjUEOYC`) to the config file.

Config.js File Location:

```
airtableCredentials: {
    apiKey: process.env.AIRTABLE_API_KEY,
    appId: process.env.AIRTABLE_APP_ID,
},
```

And that's it for Airtable!

#### Open Exchange Rates (Optional)

If you are interested in updating the USD value of assets denominated in fiat currencies, you can [sign up for an Open Exchange Rates account](https://openexchangerates.org/) and get a free API key. Replace `process.env.OPEN_EXCHANGE_API_KEY` with it or set it as an environment variable.

Config.js File Location:

```
openExchangeCredentials: {
   apiKey: process.env.OPEN_EXCHANGE_API_KEY,
},
```

In order to customize which fiat currencies you want updated, modify the `fiatCurrenciesToUpdate` list. The default is for it to simply update the Swiss Franc to USD exchange.

```
fiatCurrenciesToUpdate: [
    Currencies['CHF'],
],
```
- See `fiat_currencies.js` for full list of supported currencies.

If you don't care to update other fiat currency exchanges, don't add an API key and fiat currency updates will be skipped.

#### CoinMarketCap API (Optional)

The CoinMarketCap API is public and free to use. All you need to do, is choose which crypto-assets you'd like to keep updated.

Customize the crypto-assets updated by modifying the `cryptoAssetsToUpdate` list. By default it is only updating `ether`, `dao tokens` and `bitcoin`.

```
cryptoAssetsToUpdate: [
    Currencies['ethereum'],
    Currencies['bitcoin'],
    Currencies['the-dao'],
],
```
- See `crypto_assets.js` for full list of supported crypto-assets.

#### Plaid Bank Integration (Optional)

If you would like to update an entry in the 'Assets' table with your current bank balance, you can use [Plaid's Balance Product](https://plaid.com/products/balance/). They offer an intuitive API for connecting to many US banks with online banking credentials and once authenticated, you can request your current bank balance easily. At the time of writing, this was free for up to 100 connected accounts.

1. [Sign up for Plaid](https://dashboard.plaid.com/signup/) and update the Plaid `clientId` and `secret` in the `config.js` file.

2. Next, we need to retrieve an `accessToken` associated each of the bank account balances you'd like to keep track of. Each `accessToken` is connected to an online banking login credential. To make this as painless as possible, I wrote a small script that should help you get `accessTokens` in a matter of seconds. Open the `plaid_access_token_fetcher.js` file thats inside the `setup` folder. Fill in your online banking username and password credentials, choose your banking institition and run this script with the following command:

```
node ./node_modules/babel-cli/bin/babel . --out-dir ./transpiled --retain-lines --ignore '**node_modules,.git,transpiled' -x '.es6,.js,.es,.jsx'; node transpiled/setup/plaid_access_token_fetcher.js
```

This will print the `accessToken` associated with the bank account details. In order to tell the program which record in the Airtable 'Assets' table this accessToken is associated with, edit the `airtableAssetNameToAccessToken` object in the `config.js` file.

Config.js File Location:

```
plaidCredentials: {
    clientId: process.env.PLAID_CLIENT_ID,
    secret: process.env.PLAID_SECRET,
    // Maps the identifying 'Name' field value in the 'Assets' table in Airtable
    // with the Plaid accessToken associated with the asset bank account
    airtableAssetNameToAccessToken: {
        'Chase Bank Balance': process.env.PLAID_ACCESS_TOKEN_FOR_CHASE_ACCOUNT,
    },
},
```
So if we just generated the `accessToken` for our Chase Bank account, we would either set the environment variable `PLAID_ACCESS_TOKEN_FOR_CHASE_ACCOUNT` with the access token or hard-code it above. We should also make sure that we have a record in the 'Assets' table in our **Finance Tracker** base on Airtable with the name: 'Chase Bank Balance'. This way, the server knows which record to update in Airtable with the account balance. You can add multiple `accessToken` to Airtable record name pairs to `airtableAssetNameToAccessToken`, allowing you to update multiple account balances.


**Note:** If you don't want to activate balance updates, simply remove all entries from `airtableAssetNameToAccessToken` and balance updates will be skipped.

```
airtableAssetNameToAccessToken: {}, // Leave this empty
```

## Starting the server

By now, you should have hooked up all the external accounts you want! All thats left is to start the server and give it a go! Since this project uses ES6 syntax, we will need to transpile the project before starting the server. To transpile the project, run the following from the project directory:

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

**Pro Tip:** Hitting Cmd-click on the terminal link will open it in a browser window

I hope this was helpful! Happy tracking and investing! :)

## Developing

If you want to make more extensive changes to the code, feel free to do so! If it does something awesome, submit a pull request!

When developing, it's more convenient to have "transpile on save" set up. To do this, run the following command from a terminal window:

```
node ./node_modules/babel-cli/bin/babel . --out-dir ./transpiled --watch --retain-lines --ignore '**node_modules,.git,transpiled' -x '.es6,.js,.es,.jsx';
```

And run the server from another terminal window:

```
node transpiled/server.js
```
