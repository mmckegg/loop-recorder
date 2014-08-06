var test = require('tape')
var Recorder = require('../')

test(function(t){

  var recorder = Recorder()
  recorder.write({id: 'C', event: 'start', position: 0})
  recorder.write({id: 'C', event: 'stop', position: 0.9})
  recorder.write({id: 'C', event: 'start', position: 1})
  recorder.write({id: 'C', event: 'stop', position: 1.9})
  recorder.write({id: 'F', event: 'start', position: 2})
  recorder.write({id: 'F', event: 'stop', position: 2.9})
  recorder.write({id: 'F', event: 'start', position: 3})
  recorder.write({id: 'F', event: 'stop', position: 3.9})
  recorder.write({id: 'G', event: 'start', position: 4})
  recorder.write({id: 'G', event: 'stop', position: 4.9})
  recorder.write({id: 'G', event: 'start', position: 5})
  recorder.write({id: 'G', event: 'stop', position: 5.4})
  recorder.write({id: 'F', event: 'start', position: 5.5})
  recorder.write({id: 'F', event: 'stop', position: 6.4})
  recorder.write({id: 'F', event: 'start', position: 6.5})
  recorder.write({id: 'F', event: 'stop', position: 6.9})
  recorder.write({id: 'F', event: 'start', position: 7.0})
  recorder.write({id: 'F', event: 'stop', position: 7.4})
  recorder.write({id: 'F', event: 'start', position: 7.5})
  recorder.write({id: 'F', event: 'stop', position: 7.9})
  recorder.write({id: 'C', event: 'start', position: 8})
  recorder.write({id: 'C', event: 'stop', position: 8.9})
  recorder.write({id: 'C', event: 'start', position: 9})
  recorder.write({id: 'C', event: 'stop', position: 9.9})
  recorder.write({id: 'F', event: 'start', position: 10})

  t.same(recorder.getLoop('C', 1.4, 8), [ 
    [ 0, 0.9 ], 
    [ 1, 0.9 ] 
  ])

  t.same(recorder.getLoop('F', 1.4, 8), [
    [ 2, 0.9 ],
    [ 3, 0.9 ],
    [ 5.5, 0.9 ],
    [ 6.5, 0.4 ],
    [ 7, 0.4 ],
    [ 7.5, 0.4 ]
  ])

  t.same(recorder.getLoop('G', 1.4, 8),[
    [ 4, 0.9 ], 
    [ 5, 0.4 ]
  ])

  t.same(recorder.getLoop('C', 5, 3.5), [
    [ 1, 0.5 ]
  ])

  t.same(recorder.getLoop('F', 5, 3.5), [
    [ 2, 0.9 ], 
    [ 3, 0.4 ], 
    [ 0, 0.4 ], 
    [ 0.5, 0.4 ] 
  ])

  t.same(recorder.getLoop('G', 5, 3.5), [
    [ 1.5, 0.4 ]
  ])  

  t.end()

})
