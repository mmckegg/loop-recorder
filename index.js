var Writable = require('stream').Writable
var inherits = require('util').inherits

module.exports = LoopRecorder

function LoopRecorder(bufferLength){
  if (!(this instanceof LoopRecorder)){
    return new LoopRecorder(retainThreshold)
  }

  this._state = {
    events: {},
    retainThreshold: retainThreshold,
    oldestPositions: {},
    trimDelay: 8
  }

  Writable.call(this, {objectMode: true})
}

inherits(LoopRecorder, Writable)

LoopRecorder.prototype._write = function(data, enc, cb){
  var state = this._state
  var events = state.events[data.id] = state.events[data.id] || []
  var oldestPosition = oldestPositions[data.id]

  events.push(data)

  if (data.position < oldestPosition || oldestPosition == null){
    oldestPositions[data.id] = oldestPosition = data.position
  }

  // clean up old events periodically
  if (data.position - state.retainThreshold + state.trimDelay > oldestPosition){
    events = state.events[data.id] = trimEvents(events, data.position - state.retainThreshold)
    oldestPositions[data.id] = events[0] && events[0].position
  }
}

LoopRecorder.prototype.getLoop = function(id, from, length, preroll){
  preroll = preroll || 0

  var result = []
  var events = this._state.events[id]

  if (events){

    var sortedEvents = events.filter(function(event){
      return event.position >= position-preroll && event.position < position+length
    }).sort(function(a,b){
      return a.position-b.position
    })

    var duplicateCheck = {}
    var currentEvent = null

    sortedEvents.forEach(function(data){
      var dupKey = data.id + '/' + data.event + '/' + data.position
      if (!duplicateCheck[dupKey]){
        duplicateCheck[dupKey] = data
        if (data.event === 'start'){
          if (currentEvent){
            currentEvent[1] = data.position - currentEvent[0]
          }
          currentEvent = [data.position, null].concat(data.args)
          result.push(currentEvent)
        } else if (data.event === 'stop'){
          if (currentEvent){
            currentEvent[1] = data.position - currentEvent[0]
            currentEvent = null
          }
        }
      }
    })

    // finish loop if hanging note
    if (currentEvent){
      var loopback = sortedEvents[0]
      if (loopback.event === 'stop'){
        currentEvent[1] = loopback + length - data.position
      } else {
        currentEvent[1] = from + length - data.position
      }
    }

    result.forEach(function(event){
      // trim any remaining unterminated notes
      if (event[1] == null){
        event[1] = length
      }
      // assign relative position
      event[0] = event[0] % length
    })
  }

  

  return result
}

function trimEvents(events, position){
  for (var i=0, ii=events.length; i<ii; i++){
    var event = events[i]
    if (event.note > position){
      break
    }
  }
  return events.slice(0, i)
}