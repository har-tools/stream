import * as Har from 'har-format'
// import { File } from 'undici'
import { requestToHar } from '../requestToHar'

it('does not include fragments in the url', async () => {
  const har = await requestToHar(
    new Request('https://example.com/path?foo=bar#fragment')
  )

  expect(har.url).toBe('https://example.com/path?foo=bar')
})

it('creates entry for request without body', async () => {
  const har = await requestToHar(new Request('https://example.com'))

  expect(har).toEqual<Har.Request>({
    httpVersion: 'HTTP/1.0',
    method: 'GET',
    url: 'https://example.com/',
    queryString: [],
    headers: [],
    headersSize: 35,
    cookies: [],
    bodySize: 0,
  })
})

it('creates entry for request with a single query parameters', async () => {
  const har = await requestToHar(new Request('https://example.com?foo=bar'))

  expect(har).toEqual<Har.Request>({
    httpVersion: 'HTTP/1.0',
    method: 'GET',
    url: 'https://example.com/?foo=bar',
    queryString: [
      {
        name: 'foo',
        value: 'bar',
      },
    ],
    headers: [],
    headersSize: 43,
    cookies: [],
    bodySize: 0,
  })
})

it('creates entry for request with custom headers', async () => {
  const har = await requestToHar(
    new Request('https://example.com', {
      headers: {
        Accept: 'application/json',
        'X-Custom-Header': 'Value',
      },
    })
  )

  expect(har).toEqual<Har.Request>({
    httpVersion: 'HTTP/1.0',
    method: 'GET',
    url: 'https://example.com/',
    queryString: [],
    headers: [
      {
        name: 'accept',
        value: 'application/json',
      },
      {
        name: 'x-custom-header',
        value: 'Value',
      },
    ],
    headersSize: 85,
    cookies: [],
    bodySize: 0,
  })
})

it('creates entry for request with cookies', async () => {
  const har = await requestToHar(
    new Request('https://example.com', {
      headers: {
        Cookie: 'id=abc-123; Expires=Thu, 31 Oct 2021 07:28:00 GMT;',
      },
    })
  )

  expect(har).toEqual<Har.Request>({
    httpVersion: 'HTTP/1.0',
    method: 'GET',
    url: 'https://example.com/',
    queryString: [],
    headers: [
      {
        name: 'cookie',
        value: 'id=abc-123; Expires=Thu, 31 Oct 2021 07:28:00 GMT;',
      },
    ],
    headersSize: 95,
    cookies: [
      {
        name: 'id',
        value: 'abc-123',
        expires: new Date('Thu, 31 Oct 2021 07:28:00 GMT').toISOString(),
      },
    ],
    bodySize: 0,
  })
})

it('creates entry for request with text body', async () => {
  const har = await requestToHar(
    new Request('https://example.com/resource', {
      method: 'POST',
      body: 'Hello world',
    })
  )

  expect(har).toEqual<Har.Request>({
    httpVersion: 'HTTP/1.0',
    method: 'POST',
    url: 'https://example.com/resource',
    queryString: [],
    headers: [
      {
        name: 'content-type',
        value: 'text/plain;charset=UTF-8',
      },
    ],
    headersSize: 86,
    cookies: [],
    postData: {
      mimeType: 'text/plain;charset=UTF-8',
      text: 'Hello world',
    },
    bodySize: 11,
  })
})

it('creates entry for request with JSON body', async () => {
  const har = await requestToHar(
    new Request('https://example.com/resource', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: 1, name: 'John' }),
    })
  )

  expect(har).toEqual<Har.Request>({
    httpVersion: 'HTTP/1.0',
    method: 'PATCH',
    url: 'https://example.com/resource',
    queryString: [],
    headers: [
      {
        name: 'content-type',
        value: 'application/json',
      },
    ],
    headersSize: 79,
    cookies: [],
    postData: {
      mimeType: 'application/json',
      text: `{"id":1,"name":"John"}`,
    },
    bodySize: 22,
  })
})

it('creates entry for request with URLSearchParams body', async () => {
  const har = await requestToHar(
    new Request('https://example.com/resource', {
      method: 'POST',
      body: new URLSearchParams([['foo', 'bar']]),
    })
  )

  expect(har).toEqual<Har.Request>({
    httpVersion: 'HTTP/1.0',
    method: 'POST',
    url: 'https://example.com/resource',
    queryString: [],
    headers: [
      {
        name: 'content-type',
        value: 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    ],
    headersSize: 109,
    cookies: [],
    postData: {
      mimeType: 'application/x-www-form-urlencoded;charset=UTF-8',
      params: [
        {
          name: 'foo',
          value: 'bar',
        },
      ],
    },
    bodySize: 7,
  })
})

it('creates entry for request with FormData body', async () => {
  const formData = new FormData()
  formData.set('foo', 'bar')
  formData.set(
    'document',
    new Blob(['Hello world'], { type: 'text/plain' }),
    'filename.txt'
  )

  const request = new Request('https://example.com/submit', {
    method: 'POST',
    body: formData,
  })
  const har = await requestToHar(request)

  expect(har).toEqual<Har.Request>({
    httpVersion: 'HTTP/1.0',
    method: 'POST',
    url: 'https://example.com/submit',
    queryString: [],
    headers: [
      {
        name: 'content-type',
        value: request.headers.get('Content-Type')!,
      },
    ],
    cookies: [],
    headersSize: 122,
    postData: {
      mimeType: request.headers.get('Content-Type')!,
      params: [
        {
          name: 'foo',
          value: 'bar',
        },
        {
          name: 'document',
          contentType: 'text/plain',
          fileName: 'filename.txt',
          value: 'Hello world',
        },
      ],
    },
    bodySize: 274,
  })
})
