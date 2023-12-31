import { STATUS_CODES } from 'node:http'
import * as Har from 'har-format'
import { HttpMessage } from '@har-tools/http-message'
import { toHeaders } from './utils/toHeaders.js'
import { toCookies } from './utils/toCookies.js'

/**
 * Transforms a given Fetch API `Response` instance to
 * an HAR entry object.
 */
export async function responseToHar(response: Response): Promise<Har.Response> {
  const statusText = response.statusText || STATUS_CODES[response.status] || ''
  const redirectUrl = response.headers.get('Location') || ''
  const headers = toHeaders(response.headers)
  const cookies = toCookies(response.headers)
  const message = await HttpMessage.fromResponse(response)

  // Compute the response body size taking any compression
  // into account. If no explicit "Content-Length" header was set,
  // inherit the body size from the HTTP message.
  const contentLength = response.headers.get('Content-Length')
  const bodySize = contentLength ? Number(contentLength) : message.bodySize

  return {
    httpVersion: HttpMessage.httpVersion,
    status: response.status,
    statusText,
    headers,
    cookies,
    content: {
      size: message.bodySize,
      encoding: message.encoding,
      mimeType: message.mimeType,
      text: message.body,
    },
    redirectURL: redirectUrl,
    headersSize: message.headersSize,
    bodySize,
  }
}
