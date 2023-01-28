const { SerialPort } = require('serialport')
const { createServer } = require("http");
const { Server } = require("socket.io");
var { AdifFormatter, AdifParser, SimpleAdif } = require("adif-parser-ts")
const fs = require('fs')
var calls = []
fs.readFile('log.adi', (err, data) => {
if (err) throw err;
  var todecode = (data.toString());
  var obj = AdifParser.parseAdi(todecode)
  obj.records.forEach((r)=>{
    calls.push(r.call)
  })
})
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: function (origin, callback){
        console.log(origin)
        callback(null, true) //<== cors hack MVE;)
    },
    methods: ["get", "post"],
    credentials: true
  },
  allowEIO3: true,
  upgradeTimeout: 30000
});


io.on("connection", (socket) => {
  console.log(socket.id)
  socket.emit('calls', calls)
  socket.on('m1',(obj)=>{
    console.table(obj)
    rigport.write(`KM1${obj.message}};\r\n`)
    arduino.write(`${obj.message}\r\n`)
  })
  socket.on('m2',(obj)=>{
    console.table(obj)
    rigport.write(`KM2${obj.message}};\r\n`)
    arduino.write(`${obj.message}\r\n`)
  })
  socket.on('m3',(obj)=>{
    console.table(obj)
    rigport.write(`KM3${obj.message}};\r\n`)
    arduino.write(`${obj.message}\r\n`)
  })
  socket.on('m4',(obj)=>{
    console.log(obj. message, obj.message.length)
    rigport.write(`KM4${obj.message}};\r\n`)
    arduino.write(`${obj.message}\r\n`)
  })
  socket.on('m5',(obj)=>{
    console.log(obj. message, obj.message.length)
    rigport.write(`KM5${obj.message}};\r\n`)
    arduino.write(`${obj.message}\r\n`)
  })
  socket.on('p1',()=>{
    console.log('=================> play 1')
    setTimeout(()=>{rigport.write(`KY6;\r\n`)},500)
  })
  socket.on('p2',()=>{
    console.log('=================> play 2')
    setTimeout(()=>{rigport.write(`KY7;\r\n`)},500)
  })
  socket.on('p3',()=>{
    console.log('=================> play 3')
    setTimeout(()=>{rigport.write(`KY8;\r\n`)},500)
  })
  socket.on('p4',()=>{
    console.log('=================> play 4')
    setTimeout(()=>{rigport.write(`KY9;\r\n`)},500)
  })
  socket.on('p5',()=>{
    console.log('=================> play 5')
    setTimeout(()=>{rigport.write(`KYA;\r\n`)},500)
  })
  socket.on('wpm',(obj)=>{
    console.table(obj)
    let lwpm = ''
    if (obj.wpm < 10) { 
      lwpm = `00${obj.wpm}`
    } else {
      lwpm = `0${obj.wpm}`
    }
    console.log(`KS${lwpm}};\r\n`)
    rigport.write(`KS${lwpm};\r\n`)
  }),
  socket.on('BI', (obj)=>{
    console.table(obj)
    if (obj.val) {
      rigport.write(`BI1;\r\n`)
    } else {
      rigport.write(`BI0;\r\n`)
    }
  })
});

httpServer.listen(8081);

var main = {
    freq: 1234,
    modenr: 0,
    mode: 'AM' 
}

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

rigport.on('open', function() {
    console.log('rig-open')
    rigport.set({"dtr": true})
    rigport.set({"rts": true})
  })    

rigport.on('error', function (err) {
    console.log('Error: ', err.message)
})

const arduino = new SerialPort({
  path: 'COM7',
  baudRate: 9600
}, function (err) {
    if (err) {
      return console.log('Error: ', err.message)
    }
})

arduino.on('open', function() {
    console.log('arduino-open')
    /* rigport.set({"dtr": true})
    rigport.set({"rts": true}) */
  })    

arduino.on('error', function (err) {
    console.log('Error: ', err.message)
})

/* arduino.on('data', function (d) {
  console.log( d.toString())
}) */

//bridge it

rigport.on('data', function (data) {
    data = data.toString()
    let res = data.slice(2, data.length)
    res = res.replace(/\?/g, '')
    res = res.replace(/;/g, '')
    console.log('datafrom rig', data)
    let obj = {
      cmd: data.slice(0,2),
      res: res
    }
    console.table(obj)
    io.emit('TXRTN', obj)
    //omniport.write(data)
})

setInterval(function(){
  setTimeout(()=>{
    rigport.write('FA;\r\n')
  },300)
},200)
setInterval(function(){
  setTimeout(()=>{
    rigport.write('KS;\r\n')
  },300)
},500)
setInterval(function(){
  setTimeout(()=>{
    rigport.write('ZI0;\r\n')
  },300)
},1000)



//console.log(AdifParser.parseAdi(AdifParser.parseAdi('<command:3>Log <parameters:331> <BAND:3>20m <STATION_CALLSIGN:6>PA3MVE <MY_GRIDSQUARE:6>JO21gp <CALL:5>DF5GO <FREQ:9>14.080637 <MODE:4>MFSK <SUBMODE:3>FT4 <QSO_DATE:8>20230115 <TIME_ON:6>115445 <QSO_DATE_OFF:8>20230115 <TIME_OFF:6>115514 <RST_SENT:3>-17 <RST_RCVD:3>-05 <TX_PWR:1>4 <GRIDSQUARE:4>JO62 <COMMENT:43>FT4  Sent: -17  Rcvd: -05  Distance: 584 km <EOR> ').records[0].parameters))

