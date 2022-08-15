import { ReflectApi } from './utils/api.js'

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
  const { REFLECT_API_KEY, PULL_REQUEST, COMMIT_REF, REPOSITORY_URL } =
    process.env

  if (!REFLECT_API_KEY) {
    return build.failPlugin('REFLECT_API_KEY is not defined.')
  }
  console.log('repository url: ' + REPOSITORY_URL)

  const suiteId = inputs.suite_id
  if (!suiteId) {
    return build.failPlugin('suite_id must be defined in Plugin configuration.')
  }

  const reflectApi = new ReflectApi(REFLECT_API_KEY)
  let executionId

  try {
    const response = await reflectApi.executeSuite({
      suiteId,
      overrides: inputs.overrides,
      variables: inputs.variables,
      gitHub: PULL_REQUEST
        ? {
            owner: 'TODO split from REPOSITORY_URL',
            repo: 'TODO split from REPOSITORY_URL',
            sha: COMMIT_REF,
          }
        : {},
    })
    executionId = response.executionId
  } catch (error) {
    return build.failPlugin(
      `Encountered error when attempting to execute Reflect test suite: ${
        error.message ?? 'Unknown error'
      }`,
      { error },
    )
  }

  console.log(
    `Test suite execution located at: ${suiteExecutionUrl(
      suiteId,
      executionId,
    )}`,
  )

  if (inputs.wait_for_test_results) {
    console.log(
      `Started test suite with execution id: ${executionId}. Will wait for test suite to complete before exiting.`,
    )

    let isFinished = false
    let executionStatus = ''

    while (!isFinished) {
      try {
        const response = await reflectApi.getExecutionStatus({
          suiteId,
          executionId,
        })
        isFinished = response.isFinished
        executionStatus = response.status

        if (!isFinished) {
          console.log('Not finished yet. Sleeping for 10 seconds.')
          await sleep(10000)
        }
      } catch (error) {
        return build.failPlugin(
          'Error occurred when checking status of test suite',
          { error },
        )
      }
    }

    if (executionStatus !== 'passed') {
      console.log(`Test suite failed with status: ${executionStatus}`)
      return build.failPlugin(
        `Test suite failed with status: ${executionStatus}. See ${suiteExecutionUrl(
          suiteId,
          executionId,
        )} for details.`,
      )
    } else {
      return status.show({
        title: `Reflect Test Suite: ${suiteId}`,
        summary: 'All tests passed successfully',
        text: `See ${suiteExecutionUrl(suiteId, executionId)} for details.`,
      })
    }
  } else {
    return status.show({
      title: `Reflect Test Suite: ${suiteId}`,
      summary: `Started test suite with execution id: ${executionId}.`,
      text: `Exited without waiting for test suite to complete. See ${suiteExecutionUrl(
        suiteId,
        executionId,
      )} for details.`,
    })
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function suiteExecutionUrl(suiteId, executionId) {
  return `https://app.reflect.run/suites/${suiteId}/executions/${executionId}`
}
