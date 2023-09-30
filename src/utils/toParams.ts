import * as Har from 'har-format'

export function toParamsBySearchParams(
  searchParamsString: string
): Array<Har.Param> {
  const result: Array<Har.Param> = []
  const params = new URLSearchParams(searchParamsString)

  params.forEach((value, name) => {
    result.push({
      name,
      value,
    })
  })

  return result
}

export async function toParamsByFormData(
  body: string,
  mimeType: string
): Promise<Array<Har.Param>> {
  const result: Array<Har.Param> = []

  // Construct a dummy request in order to convert the
  // FormData text to a FormData instance.
  const request = new Request('http://localhost', {
    method: 'POST',
    headers: {
      'Content-Type': mimeType,
    },
    body,
  })

  const formData = await request.formData()
  const entries = Array.from(formData.entries())

  await Promise.allSettled(
    entries.map(async ([name, value]) => {
      if (typeof value === 'string') {
        result.push({
          name,
          value,
        })
        return
      }

      result.push({
        name,
        value: await value.text(),
        fileName: value.name,
        contentType: value.type,
      })
    })
  )

  return result
}
