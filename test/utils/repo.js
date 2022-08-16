import test from 'ava'
import { parseRepositoryURL } from '../../src/utils/repo.js'

test('parse Github SSH repo URL', t => {
  const { organization, repository } = parseRepositoryURL('git@github.com:reflectpublic/next-netlify-starter')
  
  t.deepEqual(organization, 'reflectpublic')
  t.deepEqual(repository, 'next-netlify-starter')
})

test('parse Github HTTPS repo URL', t => {
  const { organization, repository } = parseRepositoryURL('https://github.com/reflectpublic/next-netlify-starter.git')
  
  t.deepEqual(organization, 'reflectpublic')
  t.deepEqual(repository, 'next-netlify-starter')
})
