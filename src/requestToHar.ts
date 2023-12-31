import * as Har from 'har-format'
import { HttpMessage } from '@har-tools/http-message'
import { toQueryString } from './utils/toQueryString.js'
import { toHeaders } from './utils/toHeaders.js'
import { toCookies } from './utils/toCookies.js'
import { toParamsByFormData, toParamsBySearchParams } from './utils/toParams.js'

export async function requestToHar(request: Request): Promise<Har.Request> {
  const urlWithoutFragment = request.url.replace(/(#.+)$/g, '')
  const queryString = toQueryString(request.url)
  const headers = toHeaders(request.headers)
  const cookies = toCookies(request.headers)
  const message = await HttpMessage.fromRequest(request)

  const harRequest: Har.Request = {
    httpVersion: HttpMessage.httpVersion,
    method: request.method || 'GET',
    url: urlWithoutFragment,
    queryString,
    headers,
    cookies,
    headersSize: message.headersSize,
    bodySize: message.bodySize,
  }

  if (typeof message.body !== 'undefined') {
    if (message.mimeType.includes('x-www-form-urlencoded')) {
      harRequest.postData = {
        mimeType: message.mimeType,
        params: toParamsBySearchParams(message.body),
      }
    } else if (message.mimeType.includes('multipart/form-data')) {
      harRequest.postData = {
        mimeType: message.mimeType,
        params: await toParamsByFormData(message.body, message.mimeType),
      }
    } else {
      harRequest.postData = {
        mimeType: message.mimeType,
        text: message.body,
      }
    }
  }

  return harRequest
}
