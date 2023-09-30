import { httpMessage } from '../toHttpMessage'

describe(httpMessage.fromRequest, () => {
  it('returns http message for a GET request', async () => {
    expect(
      await httpMessage.fromRequest(new Request('https://example.com'))
    ).toBe(`GET https://example.com/ HTTP/1.0\r\n`)
  })

  it('returns http message for a POST request', async () => {
    expect(
      await httpMessage.fromRequest(
        new Request('https://example.com', {
          method: 'POST',
          body: 'Hello world',
        })
      )
    ).toBe(
      `POST https://example.com/ HTTP/1.0\r\ncontent-type: text/plain;charset=UTF-8\r\n\r\nHello world`
    )
  })

  it('returns http message for a POST request with headers', async () => {
    expect(
      await httpMessage.fromRequest(
        new Request('https://example.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Custom-Header': 'Value',
          },
          body: JSON.stringify({ id: 1, name: 'John' }),
        })
      )
    ).toBe(
      `POST https://example.com/ HTTP/1.0\r\ncontent-type: application/json\r\nx-custom-header: Value\r\n\r\n{"id":1,"name":"John"}`
    )
  })
})

describe(httpMessage.fromResponse, () => {
  it('returns http message for an empty 200 OK response', async () => {
    expect(await httpMessage.fromResponse(new Response())).toBe(
      `HTTP/1.0 200 OK\r\n`
    )
  })

  it('returns http message for response with headers', async () => {
    const headers = new Headers([
      ['Content-Type', 'application/json'],
      ['X-Custom-Header', 'Value'],
    ])
    expect(
      await httpMessage.fromResponse(
        new Response(null, { status: 201, headers })
      )
    ).toBe(
      `HTTP/1.0 201 Created\r\ncontent-type: application/json\r\nx-custom-header: Value\r\n\r\n`
    )
  })

  it('returns http message for response with text body', async () => {
    expect(
      await httpMessage.fromResponse(
        new Response('Hello world', {
          headers: {
            'Content-Type': 'text/plain;charset=UTF-8',
          },
        })
      )
    ).toBe(
      `HTTP/1.0 200 OK\r\ncontent-type: text/plain;charset=UTF-8\r\n\r\nHello world`
    )
  })

  it('returns http message for response with multi-line body', async () => {
    expect(
      await httpMessage.fromResponse(
        new Response('Hello\r\nfrom\r\n\r\nserver!')
      )
    ).toBe(
      `HTTP/1.0 200 OK\r\ncontent-type: text/plain;charset=UTF-8\r\n\r\nHello\r\nfrom\r\n\r\nserver!`
    )
  })
})
