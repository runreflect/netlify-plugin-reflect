import test from 'ava'
import { fileURLToPath } from 'url'
import netlifyBuild from '@netlify/build'
import sinon from 'sinon'
import { ReflectApi } from '../src/utils/api.js'

// A local build is performed using the following command: netlify-build --config ../netlify.toml

const NETLIFY_CONFIG = fileURLToPath(
  new URL('../netlify.toml', import.meta.url),
)

let stubbedReflectApi

test('Build should fail if REFLECT_API_KEY is not set', async (t) => {
  const { success, logs } = await netlifyBuild({
    config: NETLIFY_CONFIG,
    buffer: true,
  })

  console.log(stuff)

  // Netlify Build output
  console.log(
    [logs.stdout.join('\n'), logs.stderr.join('\n')]
      .filter(Boolean)
      .join('\n\n'),
  )

  t.false(success)
})

// test('Build should fail if API call returns an error', async (t) => {
//   // process.env.REFLECT_API_KEY = 'MOCK_API_KEY'

//   const { success, logs } = await netlifyBuild({
//     config: NETLIFY_CONFIG,
//     buffer: true,
//   })

//   // Netlify Build output
//   // console.log(
//   //   [logs.stdout.join('\n'), logs.stderr.join('\n')]
//   //     .filter(Boolean)
//   //     .join('\n\n'),
//   // )

//   sinon.stub(ReflectApi.prototype, 'executeSuite').callsFake(function () {
//     const promise = new Promise({
//       resolve: () => {
//         console.log('it is resolved')
//       },
//       reject: () => {
//         console.log('it is failed')
//         throw new Error('Failed call')
//       },
//     })

//     promise.reject()

//     return promise
//   })

//   t.false(success)
// })

// test('Build should succeed if API call succeeds', async (t) => {
//   process.env.REFLECT_API_KEY = 'MOCK_API_KEY'

//   const { success, logs } = await netlifyBuild({
//     config: NETLIFY_CONFIG,
//     buffer: true,
//   })

//   // Netlify Build output
//   // console.log(
//   //   [logs.stdout.join('\n'), logs.stderr.join('\n')]
//   //     .filter(Boolean)
//   //     .join('\n\n'),
//   // )

//   t.true(success)
// })

test.beforeEach(t => {
  sinon.stub(ReflectApi.prototype, 'executeSuite')
})

test.afterEach(t => {
  delete process.env.REFLECT_API_KEY
  sinon.restore()
})
