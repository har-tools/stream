import * as Har from 'har-format'
import { responseToHar } from '../responseToHar'

it('creates entry from the empty 200 OK response', async () => {
  const har = await responseToHar(new Response())
  expect(har).toEqual<Har.Response>({
    httpVersion: 'HTTP/1.0',
    status: 200,
    statusText: 'OK',
    headers: [],
    cookies: [],
    headersSize: 17,
    bodySize: 0,
    content: {
      size: 0,
      mimeType: '',
      text: undefined,
    },
    redirectURL: '',
  })
})

it('creates entry from response from headers', async () => {
  const har = await responseToHar(
    new Response(null, {
      status: 201,
      headers: {
        Connection: 'keep-alive',
        'X-Custom-Header': 'Value',
      },
    })
  )

  expect(har).toEqual<Har.Response>({
    httpVersion: 'HTTP/1.0',
    status: 201,
    statusText: 'Created',
    headers: [
      {
        name: 'connection',
        value: 'keep-alive',
      },
      {
        name: 'x-custom-header',
        value: 'Value',
      },
    ],
    headersSize: 70,
    cookies: [],
    content: {
      size: 0,
      mimeType: '',
      text: undefined,
    },
    bodySize: 0,
    redirectURL: '',
  })
})

it('creates entry from response with text body', async () => {
  const har = await responseToHar(new Response('Hello world'))

  expect(har).toEqual<Har.Response>({
    httpVersion: 'HTTP/1.0',
    status: 200,
    statusText: 'OK',
    headers: [
      {
        name: 'content-type',
        value: 'text/plain;charset=UTF-8',
      },
    ],
    headersSize: 59,
    cookies: [],
    content: {
      size: 11,
      mimeType: 'text/plain;charset=UTF-8',
      text: 'Hello world',
    },
    bodySize: 11,
    redirectURL: '',
  })
})

it('creates entry from response with JSON body', async () => {
  const har = await responseToHar(
    new Response(
      JSON.stringify({
        id: 1,
        name: 'John',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  )

  expect(har).toEqual<Har.Response>({
    httpVersion: 'HTTP/1.0',
    status: 200,
    statusText: 'OK',
    headers: [
      {
        name: 'content-type',
        value: 'application/json',
      },
    ],
    headersSize: 51,
    cookies: [],
    content: {
      size: 22,
      mimeType: 'application/json',
      text: `{"id":1,"name":"John"}`,
    },
    bodySize: 22,
    redirectURL: '',
  })
})
