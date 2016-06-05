Investment Tracker is a web server that updates crypto/fiat currency exchanges and bank balances in an Airtable Base used to keep track of your finances. By navigating to the servers endpoint with a browser, all the updates will be made and you will be redirected to the updated Airtable base.

![Investment Tracker Base](https://cloud.githubusercontent.com/assets/2151492/15804151/341e3c32-2ab4-11e6-8c17-15b906048caa.png)

See the [live base template here.](https://airtable.com/shrA09QDhlYHBPMB3)

## Set up

In order to run this app locally, you will need nodejs installed on your computer ([download and install here](https://nodejs.org/en/download/))

After cloning this repository, run `npm install` from the projects directory to install it's dependencies.

### External accounts

Since this app speaks with multiple third-party services in order to update exchange rates, bank balances and the Airtable base, you will need to update a bunch of API credentials and Airtable Id's all conveniently located in the `config.js` file. Open it up in your favorite text editor and lets go through each one step by step.

#### Airtable

You will need to [sign up](https://airtable.com/) for an Airtable account. Once you have an account:

1. [Install the Investment Tracker template](https://airtable.com/shrA09QDhlYHBPMB3) by clicking the `Copy base` button in the top right corner.

2. Visit the [Airtable API page](https://airtable.com/api), select the Investment Tracker base from the list to see it's custom documentation.

3. If you check the "show API key" box in the top right, your API key will be within the code examples (e.g `keyYfG4QKO1heNMNv`). Copy and paste it into the config file to replace `process.env.AIRTABLE_API_KEY` or set it as an environment variable on your computer.

4. Next, copy/paste the appId corresponding to the `Investment Tracker` base from the example request URL (it looks something like this: `appzMI3fKkMjUEOYC`) to the config file.

5. Every piece of information we will want to update on Airtable has an associated `recordId`. Find the recordIds for `Ether`, `Bitcoin`, `CHF` in the `Currencies` table and for `Chase Bank` in the `Holdings` table and update the recordIds in the `currencyToRecordId` and `holdingToRecordId` objects at the top of the config file.

And that's it for Airtable!

#### Open Exchange Rates

If you are interested in updating the USD value of bank accounts denominated in fiat currencies, you can [sign up for an Open Exchange Rates account](https://openexchangerates.org/) and get a free API key to set in the config file. If you don't care for other fiat currencies, you can simply comment-out/remove the following line from the `server.js` file:

```
await accountSync.fetchAndUpdateFiatExchangeRateAsync(Currencies.swissFranks);
```

This will remove the updating of the CHF/USD exchange rate. Alternatively you could pass in a different fiat into this function that you care to track.

#### Plaid Bank Integration

In order to pull a bank balance into your Investment Tracker, you can use [Plaid's Balance Product](https://plaid.com/products/balance/). They offer an intuitive API for connecting to many banks with your online banking credentials and once authenticated, you can request your current bank balance. At the time of writing, this was free for up to 100 connected accounts.

1. [Sign up for Plaid](https://dashboard.plaid.com/signup/) and update the Plaid `clientId`, and `secret` in the `config.js` file.

2. Next, we need to retrieve an `accessToken` associated with your online banking login credentials. To make this as painless a process as possible, I wrote a small script that should help you get this in a matter of seconds. Open the `plaid_access_token_fetcher.js` file thats inside the `setup` folder. Fill in your online banking username and password credentials, choose your banking institition and run this script with the following command:

```
babel . --out-dir ./transpiled --ignore '**node_modules,.git,transpiled' -x '.es6,.js,.es,.jsx'; node transpiled/setup/plaid_access_token_fetcher.js
```

This will print your `accessToken` into the terminal from where you can copy/paste it into the `config.js` file.

And you're done integrating with Plaid!

### Starting the server

By now, you should have hooked up all the external accounts! All thats left is to start the server and give it a go! Since this project uses ES6 syntax, we will need to start a transpiler in one terminal window and the server in another. To start the transpiler, open the project folder in terminal and run:

```
babel . --out-dir ./transpiled --watch --retain-lines --ignore '**node_modules,.git,transpiled' -x '.es6,.js,.es,.jsx'
```

Then, in another terminal window, run:

```
node transpiled/server.js
```

If everything worked, you should see the message:

```
Server Running... If running locally, visit: localhost:3000/appCeLwipDDNrFMm2
```

And just like it says, copy/paste the URL into a browser and that should kick off the crypto/fiat currency and bank balance updates and then redirect you to your Airtable Investment Tracker base!

I hope this was helpful! Happy tracking and investing! :)

PS: If I were deploying this to a server somewhere, I would use an error tracking service like [Rollbar](https://rollbar.com/) to notify me of errors so that I could fix things if anything broke or stopped working!
