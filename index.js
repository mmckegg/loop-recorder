var Stream = require('stream')//.Writable
var inherits = require('util').inherits

module.exports = LoopRecorder

function LoopRecorder(retainThreshold){
  if (!(this instanceof LoopRecorder)){
    return new LoopRecorder(retainThreshold)
  }

  this._state = {
    events: {},
    retainThreshold: retainThreshold || 64,
    oldestPositions: {},
    trimDelay: 8
  }

  Stream.call(this)
  this.writable = true
  this.readable = false
}

inherits(LoopRecorder, Stream)

LoopRecorder.prototype.write = function(data){
  var state = this._state
  var events = state.events[data.id] = state.events[data.id] || []
  var oldestPosition = state.oldestPositions[data.id]

  events.push(data)

  if (data.position < oldestPosition || oldestPosition == null){
    state.oldestPositions[data.id] = oldestPosition = data.position
  }

  // clean up old events periodically
  if (data.position - state.retainThreshold + state.trimDelay > oldestPosition){
    events = state.events[data.id] = trimEvents(events, data.position - state.retainThreshold)
    state.oldestPositions[data.id] = events[0] && events[0].position
  }

  return true
  //cb()
}

LoopRecorder.prototype.getLoop = function(id, from, length, preroll){
  preroll = preroll || 0

  var result = []
  var events = this._state.events[id]

  if (events){

    var sortedEvents = events.filter(function(event){
      return event.position >= from-preroll && event.position < from+length
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
            currentEvent[1] = roundLength(data.position - currentEvent[0])
          }
          currentEvent = [data.position, null].concat(data.args || [])
          result.push(currentEvent)
        } else if (data.event === 'stop'){
          if (currentEvent){
            currentEvent[1] = roundLength(data.position - currentEvent[0])
            currentEvent = null
          }
        }
      }
    })

    // finish loop if hanging note
    if (currentEvent){
      var loopback = sortedEvents[0]
      if (loopback.event === 'stop'){
        currentEvent[1] = roundLength(loopback.position + length - currentEvent[0])
      } else {
        currentEvent[1] = roundLength(from + length - currentEvent[0])
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

function roundLength(length){
  // hack around floating point arithmetic inaccuracy
  return Math.round(length * 100000000) / 100000000
}