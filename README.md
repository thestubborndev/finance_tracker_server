Investment Tracker is a web server that updates crypto/fiat currency exchanges and bank balances in an Airtable Base used to keep track of your finances. By navigating to the servers endpoint with a browser, all the updates will be made and you will be redirected to the updated Airtable base.

![Investment Tracker Base](https://cloud.githubusercontent.com/assets/2151492/15804151/341e3c32-2ab4-11e6-8c17-15b906048caa.png)

See the [live base template here.](https://airtable.com/shrA09QDhlYHBPMB3)

## Set up

In order to run this app locally, you will need to [install nodejs](https://nodejs.org/en/download/).

After cloning this repository, run `npm install` from the projects directory to install it's dependencies.

The remaining setup steps will require you to edit a single file: `config.js`. Open it now in your favorite text editor and follow the remaining instructions.

### Choose currencies to update

By default, the server will update the exchange rates for `Ether`, `Bitcoin` and `CHF`, however, You can easily customize the currencies you want updated. 

#### Crypto Assets

Customize the crypto-assets updated by modifying the `cryptoAssetsToUpdate` list.

```
cryptoAssetsToUpdate: [
    Currencies.ethereum,
    Currencies.bitcoin,
],
```
- See `crypto_assets.js` for full list of supported crypto-assets.
- Source of prices: [CoinMarketCap API](http://coinMarketCap.com/api).

#### Fiat Currencies

Customize the fiat currencies updated by modifying the `fiatCurrenciesToUpdate` list.

```
fiatCurrenciesToUpdate: [
    Currencies.CHF,
],
```
- See `fiat_currencies.js` for full list of supported currencies.
- Source of prices: [OpenExchangeRates.org API](https://openexchangerates.org)


### External accounts

Since this app integrates with multiple third-party services in order to update exchange rates, bank balances and the Airtable base, you will need to update some API credentials conveniently located in the `config.js` file. Lets go through them step-by-step.

#### Airtable

You will need to [sign up](https://airtable.com/) for an Airtable account. Once you have an account:

1. [Install the Investment Tracker template](https://airtable.com/shrA09QDhlYHBPMB3) by clicking the `Copy base` button in the top right corner.

2. Visit the [Airtable API page](https://airtable.com/api), select the Investment Tracker base from the list to see it's custom documentation.

3. If you check the "show API key" box in the top right, your API key will be within the code examples (e.g `keyYfG4QKO1heNMNv`). Copy and paste it into the config file to replace `process.env.AIRTABLE_API_KEY` or set it as an environment variable on your computer.

4. Next, copy/paste the appId corresponding to the `Investment Tracker` base from the example request URL (**hint**: it looks something like this: `appzMI3fKkMjUEOYC`) to the config file.

Config.js File Location:

```
airtableCredentials: {
    apiKey: process.env.AIRTABLE_API_KEY,
    appId: process.env.AIRTABLE_APP_ID,
},
```

And that's it for Airtable!

#### Open Exchange Rates (Optional)

If you are interested in updating the USD value of holdings denominated in fiat currencies, you can [sign up for an Open Exchange Rates account](https://openexchangerates.org/) and get a free API key. Set in the config file or set it as an environment variable.

Config.js File Location:

```
openExchangeCredentials: {
   apiKey: process.env.OPEN_EXCHANGE_API_KEY,
},
```

If you don't care to update other fiat currency exchanges, don't add an API key and fiat currency updates will be skipped.

#### Plaid Bank Integration (Optional)

If you would like to update an entry in the 'Holdings' table with your current bank balance, you can use [Plaid's Balance Product](https://plaid.com/products/balance/). They offer an intuitive API for connecting to many US banks with online banking credentials and once authenticated, you can request your current bank balance easily. At the time of writing, this was free for up to 100 connected accounts.

1. [Sign up for Plaid](https://dashboard.plaid.com/signup/) and update the Plaid `clientId` and `secret` in the `config.js` file.

2. Next, we need to retrieve an `accessToken` associated with the bank account balances you'd like to keep track of. Each `accessToken` is connected to an online banking login credential. To make this as painless a process as possible, I wrote a small script that should help you get `accessTokens` in a matter of seconds. Open the `plaid_access_token_fetcher.js` file thats inside the `setup` folder. Fill in your online banking username and password credentials, choose your banking institition and run this script with the following command:

```
babel . --out-dir ./transpiled --ignore '**node_modules,.git,transpiled' -x '.es6,.js,.es,.jsx'; node transpiled/setup/plaid_access_token_fetcher.js
```

This will print the `accessToken` associated with the bank account details. In order to tell the program which record in the Airtable 'Holdings' table this accessToken is associated with, edit the `airtableHoldingNameToAccessToken` object in the `config.js` file.

Config.js File Location:

```
plaidCredentials: {
    clientId: process.env.PLAID_CLIENT_ID,
    secret: process.env.PLAID_SECRET,
    // Maps the identifying 'Name' field value in the 'Holdings' table in Airtable
    // with the Plaid accessToken associated with the holding bank account
    airtableHoldingNameToAccessToken: {
        'Chase Bank Balance': process.env.PLAID_ACCESS_TOKEN_FOR_CHASE_ACCOUNT,
    },
},
```
So if we just generated the `accessToken` for our Chase Bank account, we would either set the environment variable `PLAID_ACCESS_TOKEN_FOR_CHASE_ACCOUNT` with the access token or hard-code it. We should also make sure that we have a record in the 'Holdings' table in our **Investment Tracker** base on Airtable.com with the name: 'Chase Bank Balance'. This was, the server knows which record to update in Airtable with the account balance.


**Note:** If you don't want to activate balance updates, simply remove all entries from `airtableHoldingNameToAccessToken` and balance updates will be skipped.

```
airtableHoldingNameToAccessToken: {}, // Leave this empty
```

## Starting the server

By now, you should have hooked up all the external accounts you want! All thats left is to start the server and give it a go! Since this project uses ES6 syntax, we will need to transpile the project before starting the server. To transpile the project, run the following from the project directory:

```
babel . --out-dir ./transpiled --ignore '**node_modules,.git,transpiled' -x '.es6,.js,.es,.jsx'
```

Now run:

```
node transpiled/server.js
```

If everything worked, you should see the message:

```
Server Running... If running locally, visit: localhost:3000/appCeLwipDDNrFMm2
```

Visiting the link in a browser should kick off the crypto/fiat currency and bank balance updates and then redirect you to your Airtable Investment Tracker base!

I hope this was helpful! Happy tracking and investing! :)

PS: If I were deploying this to a server somewhere, I would use an error tracking service like [Rollbar](https://rollbar.com/) to notify me of errors so that I could fix things if anything broke or stopped working!

## Developing

If you want to make more extensive changes to the code, feel free to do so! If it does something awesome, submit a pull request!

When developing, it's more convenient to have "transpile on write" set up. To do this, run the following command from a terminal window:

```
babel . --out-dir ./transpiled --watch --retain-lines --ignore '**node_modules,.git,transpiled' -x '.es6,.js,.es,.jsx'
```

And run the server from another terminal window:

```
node transpiled/server.js
```
