let http = require('http').createServer(handler); //require http server, and create server with function handler()
let fs = require('fs'); //require filesystem module
let io = require('socket.io')(http); //require socket.io module and pass the http object (server)
const { Gpio: GPIO } = require('onoff'); //include onoff to interact with the GPIO
let LED = {
    lightValue: 0
};
//let LED = new GPIO(4, 'out'); //use GPIO pin 4 as output
//let pushButton = new GPIO(17, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled

LED.writeSync = function(syncValue) {
    console.log(`WriteSync reached with value: ${syncValue}`);
    this.lightValue = syncValue;
};

http.listen(8080); //listen to port 8080

function handler (req, res) { //create server
    fs.readFile(`${__dirname}/public/index.html`, (err, data) => { //read file index.html in public folder
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
            return res.end("404 Not Found");
        }
        res.writeHead(200, {'Content-Type': 'text/html'}); //write HTML
        res.write(data); //write data from index.html
        return res.end();
    });
}

io.sockets.on('connection', (socket) => {// WebSocket Connection
    let lightvalue = 0; //static variable for current status
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
});

process.on('SIGINT', () => { //on ctrl+c
    LED.writeSync(0); // Turn LED off
//    LED.unexport(); // Unexport LED GPIO to free resources
//    pushButton.unexport(); // Unexport Button GPIO to free resources
    process.exit(); //exit completely
});