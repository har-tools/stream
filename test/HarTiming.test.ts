import * as Har from 'har-format'
import { EntryTimings } from '../src/EntryTimings.js'

beforeAll(() => {
  vi.useFakeTimers()
})

afterAll(() => {
  vi.useRealTimers()
})

it('calculates the timings for insecure request', () => {
  const timings = new EntryTimings()

  timings.socketOpened()
  vi.advanceTimersByTime(5)
  timings.dnsLookupEnd()
  vi.advanceTimersByTime(10)
  timings.connected()

  vi.advanceTimersByTime(20)
  timings.requestEnd()

  vi.advanceTimersByTime(30)
  timings.responseStart()

  vi.advanceTimersByTime(40)
  timings.responseEnd()

  expect(timings.toJSON()).toEqual<Har.Timings>({
    blocked: 0.01,
    dns: 5,
    connect: 10,
    ssl: -1,
    send: 20,
    wait: 30,
    receive: 40,
  })
})

it('calculates the rimgins for secure (SSL) request', () => {
  const timings = new EntryTimings()

  timings.socketOpened()
  vi.advanceTimersByTime(5)
  timings.dnsLookupEnd()
  vi.advanceTimersByTime(10)
  timings.connected()

  vi.advanceTimersByTime(5)
  timings.secureConnected()

  vi.advanceTimersByTime(20)
  timings.requestEnd()

  vi.advanceTimersByTime(30)
  timings.responseStart()

  vi.advanceTimersByTime(40)
  timings.responseEnd()

  expect(timings.toJSON()).toEqual<Har.Timings>({
    blocked: 0.01,
    dns: 5,
    connect: 10,
    ssl: 5,
    send: 20,
    wait: 30,
    receive: 40,
  })
})
