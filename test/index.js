import test from 'ava'
import { onSuccess } from '../src/index.js'
import sinon from 'sinon'
import { ReflectApi } from '../src/utils/api.js'

const DEFAULT_OPTIONS = {
  inputs: {},
  utils: {
    build: {
      failPlugin: sinon.fake(),
    },
    status: {
      show: sinon.fake(),
    },
  }
}

test.afterEach(t => {
  sinon.restore() // Reset all fakes and stubs so we don't leak state across tests
})

test('Plugin should fail if REFLECT_API_KEY is not set', async (t) => {
  delete process.env.REFLECT_API_KEY
  await onSuccess(DEFAULT_OPTIONS)

  // console.log('response', DEFAULT_OPTIONS.utils.build.failPlugin.getCalls())
  t.true(DEFAULT_OPTIONS.utils.build.failPlugin.calledWith('REFLECT_API_KEY is not defined.'))
})

test('Plugin should fail if REFLECT_SUITE_ID is not set', async (t) => {
  process.env.REFLECT_API_KEY = 'FAKEAPIKEY'
  await onSuccess(DEFAULT_OPTIONS)

  t.true(DEFAULT_OPTIONS.utils.build.failPlugin.calledWith('REFLECT_SUITE_ID is not defined.'))
})

test('Plugin should fail if API call returns an error', async (t) => {
  sinon.stub(ReflectApi.prototype, 'executeSuite').rejects({ message: 'Fake error message' })

  process.env.REFLECT_API_KEY = 'FAKEAPIKEY'
  process.env.REFLECT_SUITE_ID = 'fake'
  await onSuccess(DEFAULT_OPTIONS)

  t.true(DEFAULT_OPTIONS.utils.build.failPlugin.calledWith('Encountered error when attempting to execute Reflect test suite: Fake error message'))
})

test('Plugin should succeed if set to NOT wait and API call returns with executionId', async (t) => {
  sinon.stub(ReflectApi.prototype, 'executeSuite').resolves({ executionId: 'FAKEEXECUTIONID' })

  process.env.REFLECT_API_KEY = 'FAKEAPIKEY'
  process.env.REFLECT_SUITE_ID = 'fake'
  process.env.REFLECT_WAIT_FOR_TEST_RESULTS = 'false'
  await onSuccess(DEFAULT_OPTIONS)

  t.true(DEFAULT_OPTIONS.utils.status.show.calledWith({
    title: `Reflect Test Suite: fake`,
    summary: 'Started test suite with execution id: FAKEEXECUTIONID.',
    text: `Exited without waiting for test suite to complete. See https://app.reflect.run/suites/fake/executions/FAKEEXECUTIONID for details.`,
  }))
})

test('Plugin should fail if set to wait for test results and API returns error when checking test status', async (t) => {
  sinon.stub(ReflectApi.prototype, 'executeSuite').resolves({ executionId: 'FAKEEXECUTIONID' })
  sinon.stub(ReflectApi.prototype, 'getExecutionStatus').rejects({ message: 'Fake error' })

  process.env.REFLECT_API_KEY = 'FAKEAPIKEY'
  process.env.REFLECT_SUITE_ID = 'fake'
  process.env.REFLECT_WAIT_FOR_TEST_RESULTS = 'true'
  await onSuccess(DEFAULT_OPTIONS)

  t.true(DEFAULT_OPTIONS.utils.build.failPlugin.calledWith('Error occurred when checking status of test suite'))
})

test('Plugin should succeed if set to wait for test results and API call returns with pass/fail status', async (t) => {
  sinon.stub(ReflectApi.prototype, 'executeSuite').resolves({ executionId: 'FAKEEXECUTIONID' })
  sinon.stub(ReflectApi.prototype, 'getExecutionStatus').resolves({ isFinished: true, status: 'passed' })

  process.env.REFLECT_API_KEY = 'FAKEAPIKEY'
  process.env.REFLECT_SUITE_ID = 'fake'
  process.env.REFLECT_WAIT_FOR_TEST_RESULTS = 'true'
  await onSuccess(DEFAULT_OPTIONS)

  t.true(DEFAULT_OPTIONS.utils.status.show.calledWith({
    title: `Reflect Test Suite: fake`,
    summary: 'All tests passed successfully',
    text: `See https://app.reflect.run/suites/fake/executions/FAKEEXECUTIONID for details.`,
  }))
})
