let http = require('http');
let fs = require('fs'); //require filesystem module
let socketIO = require('socket.io'); //require socket.io module and pass the http object (server)
var express = require('express');
// const { Gpio: GPIO } = require('onoff'); //include onoff to interact with the GPIO
let port = 8080;
let ELEMENTON = {
    elementOn: false
};
let ELEMENT = {
    elementValue: 0
};
let PUMP = {
    isPumpOn: false
};
//let LED = new GPIO(4, 'out'); //use GPIO pin 4 as output
//let pushButton = new GPIO(17, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled

var app = express();

app.use(express.static(`${__dirname}/public/`));

app.get('/brew', function (req, res) {
    fs.readFile(`${__dirname}/views/brew.html`, (err, data) => {
        if (!err) {
            res.end(data);
            console.log('Received request /brew, returning index.html');
        } else {
            res.writeHead(404, "Not Found");
            console.log(`Error received retrieving index.html: ${err}`);
        }
    });
});

app.get('/', (req, res) => {
    fs.readFile(`${__dirname}/views/welcome.html`, (err, data) => {
        if (!err) {
            res.end(data);
            console.log('Received request /, returning index.html');
        } else {
            res.writeHead(404, "Not Found");
            console.log(`Error received retrieving index.html: ${err}`);
        }
    });
});

const server = http.createServer(app);

const io = socketIO(server);

ELEMENTON.writeSync = function(syncValue) {
    console.log(`ELEMENTON writeSync reached with value: ${syncValue}`);
    this.elementOn = syncValue;
};

ELEMENTON.readSync = function() {
    console.log(`ELEMENTON readSync foudn value: ${this.elementOn}`);
    return this.elementOn;
};

ELEMENT.writeSync = function(syncValue) {
    console.log(`ELEMENT writeSync reached with value: ${syncValue}`);
    this.elementValue = syncValue;
};

ELEMENT.readSync = function() {
    console.log(`ELEMENT readSync found value: ${this.elementValue}`);
    return this.elementValue;
};

PUMP.writeSync = function(syncValue) {
    console.log(`PUMP writeSync found value: ${syncValue}`);
    this.isPumpOn = syncValue;
};

PUMP.readSync = function() {
    console.log(`PUMP readSync found value: ${this.isPumpOn}`);
    return this.isPumpOn;
};

io.on('connection', (socket) => {// WebSocket Connection
    let elementOn = false; //static variable for current status
    let elementValue = 0;
    let isPumpOn = false;
    //    pushButton.watch((err, value) => { //Watch for hardware interrupts on pushButton
    //        if (err) { //if an error
    //            console.error('There was an error', err); //output error message to console
    //            return;
    //        }
    //        lightvalue = value;
    //        socket.emit('light', lightvalue); //send button status to client
    //    });
    socket.on('elementOn', (data) => { //get light switch status from client
        elementOn = data;
        if (elementOn !== ELEMENTON.readSync()) { //only change LED if status has changed
            ELEMENTON.writeSync(elementOn); //turn LED on or off
        }
    });

    socket.on('setTemp', (data) => {
        elementValue = data;
        if (elementValue !== ELEMENT.readSync()) {
            ELEMENT.writeSync(elementValue); //Set element value to new value
        }
    });

    socket.on('pumpOn', (data) => {
        isPumpOn = data;
        if (isPumpOn !== PUMP.readSync()) {
            PUMP.writeSync(isPumpOn);
        }
    });
});

server.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});

process.on('SIGINT', () => { //on ctrl+c
    ELEMENTON.writeSync(false); // Turn LED off
    ELEMENT.writeSync(0);
    PUMP.writeSync(false);
    //    LED.unexport(); // Unexport LED GPIO to free resources
    //    pushButton.unexport(); // Unexport Button GPIO to free resources
    process.exit(); //exit completely
});