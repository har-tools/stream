# `@har-tools/stream`

Create a stream of HAR entries from the Fetch API Request/Response instances.

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
