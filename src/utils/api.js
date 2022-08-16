import fetch from "node-fetch";

const BASE_URL = "https://api.reflect.run";

export class ReflectApi {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.headers = {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    };
  }

  async executeSuite(options) {
    const body = JSON.stringify({
      overrides: options.overrides,
      gitHub: options.gitHub,
    });

    const response = await fetch(
      `${BASE_URL}/v1/suites/${options.suiteId}/executions`,
      {
        method: "POST",
        headers: this.headers,
        body,
      }
    );

    return handleResponse(response);
  }

  async getExecutionStatus(options) {
    const response = await fetch(
      `${BASE_URL}/v1/suites/${options.suiteId}/executions/${options.executionId}`,
      {
        method: "GET",
        headers: this.headers,
      }
    );

    return handleResponse(response);
  }
}

async function handleResponse(response) {
  const json = await response.json();

  if (response.status > 299) {
    throw new Error(json.message ?? "Unknown error");
  }

  return json;
}
