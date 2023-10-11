import { Transform } from 'node:stream'
import { NetworkEntry } from './NetworkEntry.js'

export class HarStream extends Transform {
  constructor() {
    super({ objectMode: true })
  }

  _write(
    entry: NetworkEntry,
    _: BufferEncoding,
    callback: (error?: Error | null | undefined) => void
  ): void {
    entry.on('end', (entry) => {
      this.push(entry)
      callback()
    })
  }
}
