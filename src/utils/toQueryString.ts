import * as Har from 'har-format'

export function toQueryString(url: string): Array<Har.QueryString> {
  const result: Array<Har.QueryString> = []
  const record = new URL(url)

  record.searchParams.forEach((value, name) => {
    result.push({
      name,
      value,
    })
  })

  return result
}
