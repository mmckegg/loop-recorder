loop-recorder
===

Buffers all streamed in trigger events and creates range loops on demand.

## Install via [npm](https://npmjs.org/packages/loop-recorder)

```bash
$ npm install loop-recorder
``

## API

```js
var LoopRecorder = require('loop-recorder')
var recorder = LoopRecorder()
```

### LoopRecorder([retainThreshold=64])

Specify how many beats back in time to retain in buffer with `retainThreshold`.

Returns an instance of LoopRecorder - a WritableStream.

### recorder.write(event)

Accepts an input of events in the [ditty v2 output format](https://github.com/mmckegg/ditty). Usually you would pipe in events from something like [soundbank-trigger](https://github.com/mmckegg/soundbank-trigger).

Stores each `id` channel separately.

```js
recorder.write({id: 'C', event: 'start', position: 0})
recorder.write({id: 'C', event: 'stop', position: 0.9})
recorder.write({id: 'F', event: 'start', position: 3})
recorder.write({id: 'F', event: 'stop', position: 3.5})
```

### recorder.getLoop(id, from, length)

Specify the channel using `id`. Choose the in point using `from` and the out with `length`.

Returns an array of `[[position, length], [position, length], ...]` with `position` relative to the chosen `length` (`event.position % length`).