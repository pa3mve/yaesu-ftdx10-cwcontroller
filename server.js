var express = require('express')
var app = express()
app.use(express.static('public'))
app.listen(3000)

const Microphone = require('node-microphone');
const fft = require('fft-js-node').fft;

const mic = new Microphone();

const buffer = new Float32Array(1024);
const fft_data = new Float32Array(1024);

let micstream = mic.startRecording();
micstream.on('data', (data) => {
    let float_data = new Float32Array(data.buffer);
    buffer.set(float_data.slice(0, buffer.length));
    fft_data = fft(buffer);
    // do something with fft data
});






