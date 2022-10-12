import test from 'ava'
import { parseHostname } from '../../src/utils/url.js'

test('successfully extract deploy prime URL', t => {
  const hostname = parseHostname('https://deploy-preview-1--singular-nasturtium-446e4c.netlify.app')
  
  t.deepEqual(hostname, 'deploy-preview-1--singular-nasturtium-446e4c.netlify.app')
})

test('successfully extract deploy URL', t => {
  const hostname = parseHostname('https://62faed7659fbb800083ddb5c--singular-nasturtium-446e4c.netlify.app')
  
  t.deepEqual(hostname, '62faed7659fbb800083ddb5c--singular-nasturtium-446e4c.netlify.app')
})
