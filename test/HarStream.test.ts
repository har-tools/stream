import * as Har from 'har-format'
import { DeferredPromise } from '@open-draft/deferred-promise'
import { HarStream } from '../src/HarStream.js'
import { NetworkEntry } from '../src/NetworkEntry.js'

it('streams the written entries to the consumer', async () => {
  const stream = new HarStream()
  const entryPromise = new DeferredPromise<Har.Entry>()

  // Add a new network entry.
  const entry = new NetworkEntry(new Request('https://example.com'))
  entry.end(new Response('Hello world'))

  stream.write(entry)

  stream.on('data', (entry) => {
    entryPromise.resolve(entry)
  })
  stream.on('error', (error) => entryPromise.reject(error))

  const harEntry = await entryPromise
  expect(harEntry.request).toEqual<Har.Request>({
    httpVersion: 'HTTP/1.0',
    method: 'GET',
    url: 'https://example.com/',
    queryString: [],
    headers: [],
    cookies: [],
    headersSize: 35,
    bodySize: 0,
  })
  expect(harEntry.response).toEqual<Har.Response>({
    httpVersion: 'HTTP/1.0',
    status: 200,
    statusText: 'OK',
    redirectURL: '',
    headers: [
      {
        name: 'content-type',
        value: 'text/plain;charset=UTF-8',
      },
    ],
    cookies: [],
    headersSize: 59,
    content: {
      size: 11,
      mimeType: 'text/plain;charset=UTF-8',
      text: 'Hello world',
    },
    bodySize: 11,
  })
})
