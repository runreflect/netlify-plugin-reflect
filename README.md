# netlify-plugin-reflect

Netlify Build Plugin for [Reflect](https://reflect.run). Run end-to-end tests on Reflect's no-code testing platform.

## Install

Please install this plugin from the Netlify app.

## Configuration

The following Environment Variables must be set in order to use this Plugin:

- `REFLECT_API_KEY`: The API key associated with your Reflect account. See
  [https://app.reflect.run/settings/account](https://app.reflect.run/settings/account) for more information.
- `REFLECT_SUITE_ID`: The "Suite ID" to invoke when a deployment occurs. See
  [https://reflect.run/docs/managing-tests/suites/#executing-a-suite](https://reflect.run/docs/managing-tests/suites/#executing-a-suite)
  for more information.

The following Environment Variables can be optionally defined:

- `REFLECT_WAIT_FOR_TEST_RESULTS`: Boolean that determines if the Netlify plugin will wait for the tests to complete
  before exiting. Default value is "true".
- `REFLECT_DEFAULT_HOSTNAME`: In order for PR tests to run against the Deploy Preview environment, you must define the
  environment that the tests were originally recorded against using this Environment Variable. Example:
  `app.example.com`
