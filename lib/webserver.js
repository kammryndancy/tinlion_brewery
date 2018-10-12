let http = require('http').createServer(handler); //require http server, and create server with function handler()
let fs = require('fs'); //require filesystem module
let io = require('socket.io')(http); //require socket.io module and pass the http object (server)
// const { Gpio: GPIO } = require('onoff'); //include onoff to interact with the GPIO
let LED = {
    lightValue: 0
};
let ELEMENT = {
    elementValue: 0
};
let PUMP = {
    isPumpOn: false
}
//let LED = new GPIO(4, 'out'); //use GPIO pin 4 as output
//let pushButton = new GPIO(17, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled

LED.writeSync = function(syncValue) {
    console.log(`LED riteSync reached with value: ${syncValue}`);
    this.lightValue = syncValue;
};

LED.readSync = function() {
    console.log(`LED readSync foudn value: ${this.lightValue}`);
    return this.lightValue;
};

ELEMENT.writeSync = function(syncValue) {
    console.log(`ELEMENT WriteSync reached with value: ${syncValue}`);
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

http.listen(8080); //listen to port 8080

function handler (req, res) { //create server
    // fs.readFile(`${__dirname}/index.html`, (err, data) => { //read file index.html in public folder
    //     if (err) {
    //         res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
    //         return res.end("404 Not Found");
    //     }
    //     res.writeHead(200, {'Content-Type': 'text/html'}); //write HTML
    //     res.write(data); //write data from index.html
    //     return res.end();
    // });
    fs.readFile(`${__dirname}${req.url}`, function(err, data) {
        if (!err) {
            var dotoffset = req.url.lastIndexOf('.');
            var mimetype = dotoffset == -1
                ? 'text/plain'
                : {
                    '.html' : 'text/html',
                    '.ico' : 'image/x-icon',
                    '.jpg' : 'image/jpeg',
                    '.png' : 'image/png',
                    '.gif' : 'image/gif',
                    '.css' : 'text/css',
                    '.js' : 'text/javascript'
                }[ req.url.substr(dotoffset) ];
            res.setHeader('Content-type' , mimetype);
            res.end(data);
            console.log( req.url, mimetype );
        } else {
            console.log ('file not found: ' + req.url);
            res.writeHead(404, "Not Found");
            res.end();
        }
    });
}

io.sockets.on('connection', (socket) => {// WebSocket Connection
    let lightvalue = 0; //static variable for current status
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
    socket.on('light', (data) => { //get light switch status from client
        lightvalue = data;
        if (lightvalue !== LED.readSync()) { //only change LED if status has changed
            LED.writeSync(lightvalue); //turn LED on or off
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

process.on('SIGINT', () => { //on ctrl+c
    LED.writeSync(0); // Turn LED off
    ELEMENT.writeSync(0);
    //    LED.unexport(); // Unexport LED GPIO to free resources
    //    pushButton.unexport(); // Unexport Button GPIO to free resources
    process.exit(); //exit completely
});