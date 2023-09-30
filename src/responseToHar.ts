import * as Har from 'har-format'
import { toHeaders } from './utils/toHeaders'
import { toContent } from './utils/toContent'

/**
 * Transforms a given Fetch API `Response` instance to
 * an HAR entry object.
 */
export async function responseToHar(response: Response): Promise<Har.Response> {
  const { status, statusText } = response
  const redirectUrl = response.headers.get('Location') || ''
  const headers = toHeaders(response.headers)
  const content = await toContent(response)

  return {
    status,
    statusText,
    headers,
    content,
    redirectURL: redirectUrl,
  }
}
