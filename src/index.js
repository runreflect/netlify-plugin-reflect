import { ReflectApi } from "./utils/api.js";
import { parseHostname } from "./utils/url.js";
import { parseRepositoryURL } from "./utils/repo.js";

export const onSuccess = async function ({
  utils: {
    build, // Utility to report errors.
    status, // Utility to display information in the deploy summary.
  },
}) {
  const {
    REFLECT_API_KEY,
    REFLECT_SUITE_ID,
    REFLECT_WAIT_FOR_TEST_RESULTS,
    REFLECT_DEFAULT_HOSTNAME,
    PULL_REQUEST,
    COMMIT_REF,
    REPOSITORY_URL,
    DEPLOY_PRIME_URL,
  } = process.env;

  if (!REFLECT_API_KEY) {
    return build.failPlugin("REFLECT_API_KEY is not defined.");
  }

  if (!REFLECT_SUITE_ID) {
    return build.failPlugin("REFLECT_SUITE_ID is not defined.");
  }

  const reflectApi = new ReflectApi(REFLECT_API_KEY);
  let executionId;

  try {
    const { organization, repository } = parseRepositoryURL(REPOSITORY_URL);
    const isPullRequest = PULL_REQUEST === true || PULL_REQUEST === "true";

    const response = await reflectApi.executeSuite({
      suiteId: REFLECT_SUITE_ID,
      overrides:
        isPullRequest && REFLECT_DEFAULT_HOSTNAME
          ? {
              hostnames: [
                {
                  original: REFLECT_DEFAULT_HOSTNAME,
                  replacement: parseHostname(DEPLOY_PRIME_URL),
                },
              ],
            }
          : {},
      gitHub: isPullRequest
        ? {
            owner: organization,
            repo: repository,
            sha: COMMIT_REF,
          }
        : {},
    });
    executionId = response.executionId;
  } catch (error) {
    return build.failPlugin(
      `Encountered error when attempting to execute Reflect test suite: ${
        error.message ?? "Unknown error"
      }`,
      { error }
    );
  }

  console.log(
    `Test suite execution located at: ${suiteExecutionUrl(
      REFLECT_SUITE_ID,
      executionId
    )}`
  );

  if (
    REFLECT_WAIT_FOR_TEST_RESULTS === false ||
    REFLECT_WAIT_FOR_TEST_RESULTS === "false"
  ) {
    return status.show({
      title: `Reflect Test Suite: ${REFLECT_SUITE_ID}`,
      summary: `Started test suite with execution id: ${executionId}.`,
      text: `Exited without waiting for test suite to complete. See ${suiteExecutionUrl(
        REFLECT_SUITE_ID,
        executionId
      )} for details.`,
    });
  } else {
    console.log(
      `Started test suite with execution id: ${executionId}. Will wait for test suite to complete before exiting.`
    );

    let isFinished = false;
    let executionStatus = "";

    while (!isFinished) {
      try {
        const response = await reflectApi.getExecutionStatus({
          suiteId: REFLECT_SUITE_ID,
          executionId,
        });
        isFinished = response.isFinished;
        executionStatus = response.status;

        if (!isFinished) {
          console.log("Not finished yet. Sleeping for 10 seconds.");
          await sleep(10000);
        }
      } catch (error) {
        return build.failPlugin(
          "Error occurred when checking status of test suite",
          { error }
        );
      }
    }

    if (executionStatus !== "passed") {
      console.log(`Test suite failed with status: ${executionStatus}`);
      return build.failPlugin(
        `Test suite failed with status: ${executionStatus}. See ${suiteExecutionUrl(
          REFLECT_SUITE_ID,
          executionId
        )} for details.`
      );
    } else {
      return status.show({
        title: `Reflect Test Suite: ${REFLECT_SUITE_ID}`,
        summary: "All tests passed successfully",
        text: `See ${suiteExecutionUrl(
          REFLECT_SUITE_ID,
          executionId
        )} for details.`,
      });
    }
  }
};

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function suiteExecutionUrl(suiteId, executionId) {
  return `https://app.reflect.run/suites/${suiteId}/executions/${executionId}`;
}
