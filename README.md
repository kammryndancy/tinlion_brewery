# TinLion Brewing Control

TinLion Brewing System

## Usage

Application designed to control, automate, and monitor an eBIAB system. Elements within the system include a 12v circulation pump, 120v 1500W heating
element, temperature system. The Application will be able to work in tandem with physical controls, including on/off buttons. The base of the system
is a Raspberry Pi Zero W using Raspbian Lite.

### Running the application

From the application directory

```node ./index.js```

Using npm scripts

```npm run start```

### Resources
* [onoff](https://www.npmjs.com/package/onoff)
* [socket.io](https://www.npmjs.com/package/socket.io)