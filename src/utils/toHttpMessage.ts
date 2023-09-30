import { STATUS_CODES } from 'http'

export class HttpMessage {
  static httpVersion = 'HTTP/1.0'

  static async from(instance: Request | Response): Promise<HttpMessage> {
    const startLine =
      instance instanceof Request
        ? `${instance.method} ${instance.url} ${HttpMessage.httpVersion}`
        : `${HttpMessage.httpVersion} ${instance.status} ${
            instance.statusText || STATUS_CODES[instance.status]
          }`
    const body = await getBodyOrUndefined(instance)

    return new HttpMessage(startLine, instance.headers, body)
  }

  public encoding?: BufferEncoding
  public mimeType: string
  public headers: string
  /**
   * Total number of bytes from the start of the HTTP message
   * until, and including, the double CRLF before the body.
   */
  public headersSize: number
  /**
   * Size of the request body in bytes.
   */
  public bodySize: number

  constructor(
    protected startLine: string,
    headers: Headers,
    public body: string | undefined
  ) {
    this.encoding = headers.get('Content-Encoding') as BufferEncoding

    this.mimeType = headers.get('Content-Type') || ''
    this.bodySize =
      body == null ? 0 : Buffer.from(body, this.encoding).byteLength

    const headersFields = toRawHeaders(headers)
    if (headersFields.length === 0) {
      this.headers = ''
    } else {
      this.headers = `${headersFields.join('\r\n')}\r\n`

      if (this.bodySize > 0) {
        this.headers += '\r\n'
      }
    }

    this.headersSize = Buffer.from(
      this.startLine + '\r\n' + this.headers
    ).byteLength
  }

  /**
   * Total HTTP message sizes in bytes.
   */
  public get totalSize(): number {
    return this.headersSize + this.bodySize
  }

  public toString(): string {
    let message = `${this.startLine}\r\n`
    const rawHeaders = this.headers
    const hasBody = this.body != null

    message += rawHeaders

    if (hasBody) {
      message += this.body
    } else if (rawHeaders.length > 0) {
      message += '\r\n'
    }

    return message
  }
}

// function createHttpMessage(
//   startLine: string,
//   headers: string,
//   body: string | null
// ): string {
//   let message = `${startLine}\r\n`
//   const hasHeaders = headers.length > 0
//   const hasBody = body != null

//   if (hasHeaders) {
//     message += `${headers}\r\n`

//     if (hasBody) {
//       message += '\r\n'
//     }
//   }

//   if (hasBody) {
//     message += body
//   } else if (hasHeaders) {
//     message += '\r\n'
//   }

//   return message
// }

// /**
//  * Returns a raw HTTP message string from the given
//  * Fetch API `Request` instance.
//  */
// async function fromRequest(request: Request): Promise<string> {
//   const httpVersion = 'HTTP/1.0'
//   const startLine = `${request.method} ${request.url} ${httpVersion}`
//   const headers = toRawHeaders(request.headers)
//   const body = await getBodyOrUndefined(request)

//   return createHttpMessage(startLine, headers.join('\r\n'), body)
// }

// /**
//  * Returns a raw HTTP message string from the given
//  * Fetch API `Response` instance.
//  */
// async function fromResponse(response: Response): Promise<string> {
//   const httpVersion = 'HTTP/1.0'
//   const statusText = response.statusText || STATUS_CODES[response.status]
//   const startLine = `${httpVersion} ${response.status} ${statusText}`
//   const headers = toRawHeaders(response.headers)
//   const body = await getBodyOrUndefined(response)

//   return createHttpMessage(startLine, headers.join('\r\n'), body)
// }

function toRawHeaders(headers: Headers): Array<string> {
  const raw: Array<string> = []

  headers.forEach((value, name) => {
    raw.push(`${name}: ${value}`)
  })

  return raw
}

async function getBodyOrUndefined(
  instance: Request | Response
): Promise<string | undefined> {
  if (!instance.body) {
    return undefined
  }

  return instance.clone().text()
}
