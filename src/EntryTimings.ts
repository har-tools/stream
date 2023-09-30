import * as Har from 'har-format'

export class EntryTimings implements Har.Timings {
  /**
   * Time spent in a queue waiting for a network connection.
   */
  blocked?: number
  /**
   * Time spent resolving the DNS record.
   */
  dns?: number
  /**
   * Time spent on SSL/TLS negotiation.
   */
  ssl?: number
  /**
   * Time required to create a TCP connection.
   */
  connect?: number
  /**
   * Time required to send HTTP request to the server.
   */
  send?: number
  /**
   * Time spent waiting for the server response.
   */
  wait: number = 0
  /**
   * Time required to read the entire response from
   * the server (or cache).
   */
  receive: number = 0

  private _requestStart: number = Date.now()
  private _dnsLookupEnd: number = 0
  private _connected: number = 0
  private _connectedSecure: number = 0
  private _requestEnd: number = 0
  private _responseFirstByte: number = 0
  private _responseEnd: number = 0

  /**
   * Total time of the request.
   * Recorded in the `time` property of the HAR entry.
   */
  get totalTime(): number {
    return Math.max(
      0,
      (this.blocked || 0) +
        (this.dns || 0) +
        (this.connect || 0) +
        (this.send || 0) +
        this.wait +
        this.receive
    )
  }

  public dnsLookupEnd() {
    this._dnsLookupEnd = Date.now()
  }

  public connected() {
    this._connected = Date.now()
    this.blocked = Math.max(0.01, this._requestStart - this._connected)
    this.dns = this._connected - this._dnsLookupEnd
    this.connect = this._connected - this._dnsLookupEnd
  }

  public secureConnected() {
    this._connectedSecure = Date.now()
    this.ssl = this._connectedSecure - this._connected
    this.connect = this._connectedSecure - this._dnsLookupEnd
  }

  public requestEnd() {
    this._requestEnd = Date.now()
    this.send = this._requestEnd - (this._connectedSecure || this._connected)
  }

  public responseStart() {
    this._responseFirstByte = Date.now()
    this.wait = this._responseFirstByte - this._requestEnd
  }

  public responseEnd() {
    this._responseEnd = Date.now()
    this.receive = this._responseEnd - this._requestEnd
  }

  public toJSON(): Har.Timings {
    return {
      blocked: this.blocked ?? -1,
      dns: this.dns ?? -1,
      ssl: this.ssl ?? -1,
      connect: this.connect ?? -1,
      send: this.send,
      wait: this.wait,
      receive: this.receive,
    }
  }
}
