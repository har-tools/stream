import * as Har from 'har-format'
import { parse } from 'set-cookie-parser'

export function toCookies(headers: Headers): Array<Har.Cookie> {
  const result: Array<Har.Cookie> = []

  // Handle response cookies.
  const cookiesString = headers.get('Set-Cookie') || headers.get('Cookie')
  if (!cookiesString) {
    return []
  }

  const parsedCookies = parse(cookiesString)

  for (const cookie of parsedCookies) {
    result.push({
      ...cookie,
      expires: cookie.expires?.toISOString(),
    })
  }

  return result
}
