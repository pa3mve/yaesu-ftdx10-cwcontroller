const { SerialPort } = require('serialport')

var main = {
    freq: 1234,
    modenr: 0,
    mode: 'AM' 
}

const omniport = new SerialPort({
  path: 'COM12',
  baudRate: 38400,
  parity: 'none',
  dataBits: 8,
  stopBits: 2
}, function (err) {
    if (err) {
      return console.log('Error: ', err.message)
    }
})

const rigport = new SerialPort({
  path: 'COM3',
  baudRate: 38400,
  parity: 'none',
  dataBits: 8,
  stopBits: 2
}, function (err) {
    if (err) {
      return console.log('Error: ', err.message)
    }
})

omniport.on('open', function() {
    console.log('Omni-open')
    omniport.set({"dtr": true})
    omniport.set({"rts": true})
  })    

omniport.on('error', function (err) {
    console.log('Error: ', err.message)
})

rigport.on('open', function() {
    console.log('rig-open')
    rigport.set({"dtr": true})
    rigport.set({"rts": true})
  })    

rigport.on('error', function (err) {
    console.log('Error: ', err.message)
})

//bridge it

omniport.on('data', function (data) {
    //console.log('datafrom omnirig', data.toString())
    rigport.write(data)
})

rigport.on('data', function (data) {
    //console.log('datafrom rig', data.toString())
    if(data.toString().includes('IF')){
        let arr = data.toString().replace('IF',"").split('+')
        main.freq = Number(arr[0].slice(3))
        main.modenr = (arr[1].slice(6,7))
        let modes = {
            '1': 'LSB',
            '2': 'USB',
            '3': 'CW-U',
            '4': 'FM',
            '5': 'AM',
            '6': 'RTTY-L',
            '7': 'CW-L',
            '8': 'DATA-L',
            '9': 'RTTY-U',
            'A': 'DATA-FAM',
            'B': 'FM-N',
            'C': 'DATA-U',
            'D': 'AM-N',
            'E': 'PSK',
            'F': 'DATA-FM-N',
        }
        main.mode = modes[main.modenr]
        console.table(main)
    }
    omniport.write(data)
})

