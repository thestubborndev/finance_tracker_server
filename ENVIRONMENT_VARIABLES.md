### Note on setting environment variables

It is considered best practices to keep credentials (API keys, secrets, etc...) in environment variables rather then hard-coding them in your app. In order to set an environment variable on a linux/unix machine, you simply type the following into terminal:

```
export ENV_NAME=env_value
```
with `ENV_NAME` replaced with the name you want the variable to have and  `env_value` replaced with the actual value.

Example:

```
export AIRTABLE_API_KEY=keyyWGAadfYRSf6Xk
```

If you want to persist environment variables between terminal sessions, you need to add this line to your terminals config file (e.g one of: `~/.bashrc`, `~/.bash_profile`, `~/.zsh`, etc...).

Whenever I mention setting an environment variable below, I'm referring to running the above command in terminal or adding it to your terminal config file.
