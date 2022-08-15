import fetch from 'node-fetch'

const BASE_URL = 'https://api.reflect.run'

export class ReflectApi {
  constructor(apiKey) {
    this.apiKey = apiKey
    this.authenticationHeaders = { 'x-api-key': apiKey }
  }

  async executeSuite(options) {
    const response = await fetch(`${BASE_URL}/v1/suites/${options.suiteId}/executions`, {
      method: 'POST',
      headers: this.authenticationHeaders,
    })

    return handleResponse(response)
  }

  async getExecutionStatus(options) {
    const response = await fetch(`${BASE_URL}/v1/suites/${options.suiteId}/executions/${options.executionId}`, {
      method: 'GET',
      headers: this.authenticationHeaders,
    })

    return handleResponse(response)
  }
}

async function handleResponse(response) {
  const json = await response.json()

  if (response.status > 299) {
    console.log('json', json)
    throw new Error(json.message ?? 'Unknown error')
  }

  return json
}
