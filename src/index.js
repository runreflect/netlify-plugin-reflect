import { ReflectApi } from './utils/api.js'

const {
  REFLECT_API_KEY,
  PULL_REQUEST,
  COMMIT_REF,
  REPOSITORY_URL,
} = process.env

/* eslint-disable no-unused-vars */
export const onSuccess = async function ({
  // Contains the configuration inputs defines in by the caller in their Netlify configuration file.
  inputs,
  utils: {
    // Utility to report errors.
    // See https://github.com/netlify/build#error-reporting
    build,
    // Utility to display information in the deploy summary.
    // See https://github.com/netlify/build#logging
    status,
    // Utility for running commands.
    // See https://github.com/netlify/build/blob/master/packages/run-utils#readme
    run,
  },
}) {
  const suiteId = inputs.suite_id

  if (!REFLECT_API_KEY) {
    console.log('not defined')
    build.failPlugin('REFLECT_API_KEY is not defined.')
  }
  console.log('repository url: ' + REPOSITORY_URL)

  const reflectApi = new ReflectApi(REFLECT_API_KEY)

  const response = await reflectApi.executeSuite({
    suiteId,
    overrides: inputs.overrides,
    variables: inputs.variables,
    gitHub: PULL_REQUEST ? {
      owner: "TODO split from REPOSITORY_URL",
      repo: "TODO split from REPOSITORY_URL",
      sha: COMMIT_REF,
    } : {},
  })

  const executionId = response.executionId

  console.log(`Test suite execution located at: https://app.reflect.run/suites/${suiteId}/executions/${executionId}`)

  if (inputs.wait_for_test_results) {
    console.log(`Started test suite with execution id: ${executionId}. Will wait for test suite to complete before exiting.`)

    let isFinished = false
    let status = ''

    while (!isFinished) {
      const response = await reflectApi.getExecutionStatus({ suiteId, executionId })
      isFinished = response.isFinished
      status = response.status

      if (!isFinished) {
        console.log('Not finished yet. Sleeping for 10 seconds.')
        await sleep(10000)
      }
    }

    if (status !== 'passed') {
      console.log(`Test suite failed with status: ${status}`)
    } else {
      console.log('Test suite completed successfully with 0 failing tests!')
    }
  } else {
    console.log(`Started test suite with execution id: ${executionId}. Exiting without waiting for test suite to complete.`)
  }

  // try {
  //   // Commands are printed in Netlify logs
  //   await run('echo', ['Hello world!\n'])
  // } catch (error) {
  //   // Report a user error
  //   build.failPlugin('Error message', { error })
  // }

  // Display success information
  status.show({ summary: 'Success!' })
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
