# `@har-tools/stream`

Create a stream of HAR entries from the Fetch API Request/Response instances.

## Installation

```sh
npm install @har-tools/stream
```

## Usage

```js
import { HarStream, NetworkEntry } from '@har-tools/stream'

// Create an HAR stream.
const stream = new HarStream()

// Create a new network entry.
const entry = new NetworkEntry(new Request('https://example.com'))

// Write the network entry early.
// As soon as you ".end()" the entry with a Response,
// the stream will emit the complete HAR entry.
stream.write(entry)

// Call the ".end()" method once you receive the response.
entry.end(new Response('Hello world'))
```

Listening to HAR entries:

```js
stream.on('data', (entry) => {
  // Observe generated HAR entries as they come in.
  console.log(entry.request, entry.response)
})
```

Stop the stream:

```js
stream.destroy()
```

## Timings

You can control the network entry timings using the `entry.timings` API. It provides you with the methods you have to call _sequentially_ to indicate various staged of the request.

**The order of the timing metrics:**

1. `socketOpened`, socket opened but not connected yet.
1. `dnsLookupEnd`, socket has resolved the DNS name.
1. `connected`, socket has connected.
1. `connectedSecure` (_Optional_)
1. `requestEnd`, request is finished (request headers and body sent).
1. `responseStart`, first byte of the response received.
1. `responseEnd`, last byte of the response received.

Entry timings are _dependent_, so if the previous timing is missing, the next one will not be calculated. For example, if `entry.timings.dnsLookupEnd()` was never called, the network entry will have both `dns` and `connected` timings as `-1`.
