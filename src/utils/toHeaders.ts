import * as Har from 'har-format'

export function toHeaders(headers: Headers): Array<Har.Header> {
  const headersList = Array.from(headers.entries())
  const result: Array<Har.Header> = []

  for (const [name, value] of headersList) {
    result.push({
      name,
      value,
    })
  }

  return result
}
