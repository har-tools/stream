import * as Har from 'har-format'
import { EntryTimings } from '../EntryTimings'

beforeAll(() => {
  vi.useFakeTimers()
})

afterAll(() => {
  vi.useRealTimers()
})

it('calculates the timings for insecure request', () => {
  const timings = new EntryTimings()

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
    dns: 10,
    connect: 10,
    ssl: -1,
    send: 20,
    wait: 30,
    receive: 70,
  })
})

it('calculates the rimgins for secure (SSL) request', () => {
  const timings = new EntryTimings()

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
    dns: 10,
    connect: 15,
    ssl: 5,
    send: 20,
    wait: 30,
    receive: 70,
  })
})
