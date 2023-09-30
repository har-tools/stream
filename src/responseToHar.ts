import * as Har from 'har-format'
import { toHeaders } from './utils/toHeaders'
import { HttpMessage } from './utils/toHttpMessage'

/**
 * Transforms a given Fetch API `Response` instance to
 * an HAR entry object.
 */
export async function responseToHar(response: Response): Promise<Har.Response> {
  const { status, statusText } = response
  const redirectUrl = response.headers.get('Location') || ''
  const headers = toHeaders(response.headers)
  const message = await HttpMessage.from(response)

  // Compute the response body size taking any compression
  // into account. If no explicit "Content-Length" header was set,
  // inherit the body size from the HTTP message.
  const contentLength = response.headers.get('Content-Length')
  const bodySize = contentLength ? Number(contentLength) : message.bodySize

  return {
    httpVersion: HttpMessage.httpVersion,
    status,
    statusText,
    headers,
    /**
     * @todo Cookies
     */
    cookies: [],
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
