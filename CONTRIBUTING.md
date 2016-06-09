## Contributing

If you want to make more extensive changes to the code, feel free to do so! If it does something awesome, submit a pull request!

When developing, it's more convenient to have "transpile on save" set up. To do this, run the following command from a terminal window:

```
node ./node_modules/babel-cli/bin/babel . --out-dir ./transpiled --watch --retain-lines --ignore '**node_modules,.git,transpiled' -x '.es6,.js,.es,.jsx';
```

And run the server from another terminal window:

```
node transpiled/server.js
```
