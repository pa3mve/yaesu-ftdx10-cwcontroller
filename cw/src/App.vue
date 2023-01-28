<template>
  <div id="top">
  <div id="topleft">
    <h3>PA3MVE</h3>
    <h3>YAESU FTDX10 CW CONTROLLER</h3>
  </div>
  <h3 class="digital">{{ freqHR }} KHz</h3>
  <div id="topright">
    <input type="number" v-model="wpm"/>WPM
  <button v-if="!BI"  class="btn btn-info" @click="setBI(true)">BREAK IN ON</button>
  <button v-else  class="btn btn-info" @click="setBI(false)">BREAK IN OFF</button>
  <button v-if="!BI" class="btn btn-success"> OFF AIR </button>
  <button v-if="BI" class="btn btn-danger"> ON AIR</button>
  </div>
  
  </div>
  <div id="cw">
  
  
  <br><br>
  <!-- <h1>FAST #5</h1>
  <input class="FF" v-model="fastmessage" :maxlength="50"/><br> -->
  <h3>CALL</h3><input v-model="call" /><br>
  <h3>REPORT to SEND</h3><input type="number" v-model="reportSEND" /><br>
  <h3>REPORT recieved</h3><input type="number" v-model="reportRCVD" /><br>
  <h3>NAME</h3><input v-model="name" /><br><br>
  <button class="btn btn-warning" @click="addQSO()">LOG-QSO</button>
  <table>
    <tr>
      <th>INPUT</th>
      <th>FINALMESSAGE</th>
      <th>LENGTH</th>
    </tr>
    <tr v-for="i in 5" v-bind:key="i">
        <td><input v-model="messages[i-1]"/><button @click="playToMem(messages[i-1],i)">{{i}}</button></td>
        <td>{{ messagesD[i-1] }}</td>
        <td v-if="messagesD[i-1].length < 50">{{ messagesD[i-1].length }}</td>
        <td style="background-color : red" v-else>{{ messagesD[i-1].length }}</td>
    </tr>
  </table>
 <br>
 <br>
 <br>
 <h1>PRACTICE {{ calls.length }} CALLS</h1>
 <button class="btn btn" @click=(randomCall())>RANDOM CALL</button>
 <button class="btn btn" @click=(randomCallSpaced())>RANDOM CALL SPACED</button><BR></BR>
 <button class="btn" @click=(randomCallReplay())>REPLAY</button>
 <button class="btn" @click=(randomCallSpacedReplay())>REPLAY SPACED</button>
 
 <br>
 <input v-model="pcallin" /><br>
 <template v-for="e,i in pcall.length" v-bind:key="e">
  <button class="btn btn-success" @click="playChar(i)" v-if="pcall[i] === pcallin[i]">{{ pcall[i] }}</button>
  <button class="btn btn-danger" @click="playChar(i)" v-else></button>
 </template>
</div>
<div id="log">
  <h1>LOG</h1>
  <a ref="downloadLink" @click="downloadFile()">Download Adif</a>
  <table>
    <tr v-if="this.log.length > 0">
      <th>#</th>
      <th v-for="e in Object.keys(this.log[0].object)" v-bind:key="e">{{e}}</th>
    </tr>
    <tr v-for="e,i in log" v-bind:key="e">
      <td>{{ i }}</td>
      <td v-for="e in this.log[i].object" v-bind:key="e">{{e}}</td>
      <td><button class="btn btn-danger" @click="removeQSO(i)">DEL</button></td>
    </tr>
  </table>
  
</div>
</template>

<script>

//import AdifFormatter from 'adif-parser-ts' 
var { AdifFormatter } = require("adif-parser-ts")

export default {
  name: 'App',
  components: {
    
  },
  data: function(){
    return {
      log:[],
      mycall: 'pa3mve',
      freq: 10,
      freqHR: 10,
      BI: true,
      call: 'ab1cde',
      name: 'kees',
      pcall: '',
      pcallin: '',
      reportSEND: 599,
      reportRCVD: 599,
      messages: ['cq cq #m #m pse k','#m de #c #c #c ar kn','r ur rst #R','#m de #c #r #r','#c#r#n'],
      fastmessage: '',
      wpm: 18,
      calls:[]
    }
  },
  methods: {
    playToMem: function(mes, mem) {
      mes = mes.toUpperCase()
      mes = mes.replace(/#C/g, this.call)
      mes = mes.replace(/#N/g, this.name)
      mes = mes.replace(/#R/g, this.reportSEND)
      mes = mes.replace(/#M/g, this.mycall)
      
      this.$socket.emit(`m${mem}`,{  
        message: `${mes}`
        })
      this.$socket.emit(`p${mem}`,{})
    },
    randomCall: function () {
      this.pcall = this.calls[Math.floor(Math.random()*this.calls.length)]
      this.$socket.emit('m5',{
        message: `CQ CQ ${this.pcall} ${this.pcall} PSE K`
      })
      this.$socket.emit('p5',{})
    },
    randomCallSpaced: function () {
      this.pcall = this.calls[Math.floor(Math.random()*this.calls.length)]
      let mes = 'CQ CQ '
      for(let i = 0; i < this.pcall.length; i++) {
        mes = mes + this.pcall[i] + ' '
      }
      mes = mes + '   '
      for(let i = 0; i < this.pcall.length; i++) {
        mes = mes + this.pcall[i] + ' '
      }
      mes = mes + '   '
      for(let i = 0; i < this.pcall.length; i++) {
        mes = mes + this.pcall[i] + '  PSE K'
      }
      setTimeout(()=>{
        this.$socket.emit('m5',{
          message: `${mes}`
        })
        this.$socket.emit('p5',{})
      },1000)  
    },
    randomCallSpacedReplay: function () {
      let mes = ''
      for(let i = 0; i < this.pcall.length; i++) {
        mes = mes + this.pcall[i] + ' '
      }
      mes = mes + '   '
      for(let i = 0; i < this.pcall.length; i++) {
        mes = mes + this.pcall[i] + ' '
      }
      mes = mes + '   '
      for(let i = 0; i < this.pcall.length; i++) {
        mes = mes + this.pcall[i] + ' '
      }
      setTimeout(()=>{
        this.$socket.emit('m5',{
          message: `${mes}`
        })
        this.$socket.emit('p5',{})
      },1000)
    },
    randomCallReplay: function () {
      setTimeout(()=>{
        this.$socket.emit('m5',{
          message: `${this.pcall}`
        })
        this.$socket.emit('p5',{})
      },1000)
    },
    playChar:(function(c){
      this.$socket.emit('m5',{
          message: `${this.pcall[c]}`
        })
        this.$socket.emit('p5',{})
    }),
    setBI: function(bool) {
      this.BI = bool
      this.$socket.emit('BI', {val:bool})
    },
    generateADIFdate: function(){
      let date = new Date()
      let Y = date.getFullYear()
      let M = (date.getMonth()+1).toString().padStart(2, "0")
      let D = date.getDate().toString().padStart(2, "0")
      return `${Y}${M}${D}`
    },
    generateUTCtime: function() {
      let date = new Date()
      let H = date.getUTCHours().toString().padStart(2, "0")
      let M = date.getUTCMinutes().toString().padStart(2, "0")
      let S = date.getUTCSeconds().toString().padStart(2, "0")
      return `${H}${M}${S}`
    },
    addQSO: function(){
      this.log.push(this.qso)
    },
    removeQSO: function(index){
      console.log(index)
      this.log.splice(index,1)
    },
    downloadFile() {
      const data = new Blob([this.fullAdif], { type: 'text/plain' });
      const downloadUrl = URL.createObjectURL(data);
      this.$refs.downloadLink.href = downloadUrl;
      this.$refs.downloadLink.download = 'log.adi';
    }
  },
  computed: {
    fullAdif: function(){
      let adif = 'PA3MVE CW-LOGGER Export<eoh>\r\n'
      this.log.forEach((el)=>{
        adif = adif + el.adif + '\r\n'
      })
      return adif
    },
    qso: function() {
      let object ={
          CALL: this.call.toUpperCase(),
          MODE: "CW",
          QSO_DATE: this.generateADIFdate(),
          TIME_ON: this.generateUTCtime(),
          TIME_OFF: this.generateUTCtime(),
          FREQ: (this.freq/1000000),
          NAME: this.name,
          RST_SENT: this.reportSEND,
          RST_RCVD: this.reportRCVD,
          STATION_CALLSIGN: this.mycall.toUpperCase()
      }
      let obj = {
        object: object,
        adif: AdifFormatter.formatAdi({records:[object]})
      }
      return obj
    },    
    messagesD: function() {
      let arr = []
      this.messages.forEach((mes)=>{
        mes =  mes.toUpperCase()
        mes = mes.replace(/#C/g, this.call)
        mes = mes.replace(/#N/g, this.name)
        mes = mes.replace(/#R/g, this.reportSEND)
        mes = mes.replace(/#M/g, this.mycall)
        mes = mes.replace(/599/g, '5NN')
        arr.push(mes.toUpperCase())
      })
      return arr
    }
  },
  watch: {
    wpm: function(){
      this.$socket.emit('wpm',{
        wpm: this.wpm
      })
    },
    call: function(){
    },
    fastmessage: function(){
      this.$socket.emit('m5',{
        message: `${this.fastmessage}`
      })
      /* this.$socket.emit('p5') */
    }
  },
  sockets: {
    calls: function(arr){
      this.calls = arr
      console.log(this.calls)
    },
    TXRTN: function(obj){
      switch(obj.cmd) {
        case 'FA':
          this.freq = obj.res
          this.freqHR = (obj.res/1000)
          break
        case 'KS':
          this.wpm = Number(obj.res)
          break
      }
    }
  }
}
</script>

<style>
@import './bootstrap.min.css';
@font-face {
  font-family: "digital";
  src: url('@/assets/fonts/DigitalDream.ttf');
}
.FF {
  font-size: 25px;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 60px;
}
table{
  text-align: left;
  margin: 0 auto;
}
td{
  border: 2px solid white;
  padding: 10px;
}
th{
  margin: 20px;
  background-color: black;
  border: 1px solid white
}
#cw{
  position: fixed;
  left:0px;
  top:15%;
  width: 50%
}
#log{
  position: fixed;
  right:0px;
  width: 50%;
  height:85%;
  top:15%;
  overflow: scroll;
}
#top{
  position: fixed;
  right:0px;
  width: 100%;
  height:15%;
  top:0%;
  background-color: rgb(83, 83, 83);
}
#topleft{
  position: absolute;
  left:10px;
  top:10px;
}
#topright{
  position: absolute;
  right:10px;
  top:10px;
}
.digital{
  position: relative;
  top:15%;
  left: 25%;
  width:50%;
  padding:10px;
  font-size: 96px;
  font-family: "digital";
  color:red;
  background-color: black;
  border:solid 8px yellow;
  border-radius: 20px;;
}
</style>
