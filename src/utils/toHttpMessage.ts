import { STATUS_CODES } from 'http'

export const httpMessage = {
  fromRequest,
  fromResponse,
}

function createHttpMessage(
  startLine: string,
  headers: string,
  body: string | null
): string {
  let message = `${startLine}\r\n`
  const hasHeaders = headers.length > 0
  const hasBody = body != null

  if (hasHeaders) {
    message += `${headers}\r\n`

    if (hasBody) {
      message += '\r\n'
    }
  }

  if (hasBody) {
    message += body
  } else if (hasHeaders) {
    message += '\r\n'
  }

  return message
}

/**
 * Returns a raw HTTP message string from the given
 * Fetch API `Request` instance.
 */
async function fromRequest(request: Request): Promise<string> {
  const httpVersion = 'HTTP/1.0'
  const startLine = `${request.method} ${request.url} ${httpVersion}`
  const headers = toRawHeaders(request.headers)
  const body = await getBodyOrNull(request)

  return createHttpMessage(startLine, headers.join('\r\n'), body)
}

/**
 * Returns a raw HTTP message string from the given
 * Fetch API `Response` instance.
 */
async function fromResponse(response: Response): Promise<string> {
  const httpVersion = 'HTTP/1.0'
  const statusText = response.statusText || STATUS_CODES[response.status]
  const startLine = `${httpVersion} ${response.status} ${statusText}`
  const headers = toRawHeaders(response.headers)
  const body = await getBodyOrNull(response)

  return createHttpMessage(startLine, headers.join('\r\n'), body)
}

function toRawHeaders(headers: Headers): Array<string> {
  const raw: Array<string> = []

  headers.forEach((value, name) => {
    raw.push(`${name}: ${value}`)
  })

  return raw
}

async function getBodyOrNull(
  instance: Request | Response
): Promise<string | null> {
  if (!instance.body) {
    return null
  }

  return instance.clone().text()
}
