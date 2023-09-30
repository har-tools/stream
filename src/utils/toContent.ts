import * as Har from 'har-format'

export async function toContent(
  instance: Request | Response
): Promise<Har.Content> {
  const mimeType = instance.headers.get('Content-Type') || 'text/plain'

  if (!instance.body) {
    return {
      mimeType,
      size: 0,
    }
  }

  const text = await instance.text()

  return {
    mimeType,
    text,
  }
}
