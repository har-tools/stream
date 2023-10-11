import * as Har from 'har-format'
import EventEmitter from 'node:events'
import { EntryTimings } from './EntryTimings.js'
import { requestToHar } from './requestToHar.js'
import { responseToHar } from './responseToHar.js'

export class NetworkEntry extends EventEmitter {
  public timings: EntryTimings

  private startedDateTime: string
  private requestHarPromise: Promise<Har.Request>

  constructor(request: Request) {
    super()
    this.startedDateTime = new Date().toISOString()
    this.timings = new EntryTimings()
    this.requestHarPromise = requestToHar(request)
  }

  public end(response: Response): void {
    this.requestHarPromise.then(async (requestHar) => {
      const responseHar = await responseToHar(response)

      const entry: Har.Entry = {
        startedDateTime: this.startedDateTime,
        request: requestHar,
        response: responseHar,
        time: this.timings.totalTime,
        timings: this.timings.toJSON(),
        cache: {},
      }

      this.emit('end', entry)
    })
  }
}
