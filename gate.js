var firebase = require('firebase'),
    Gpio     = require('chip-gpio').Gpio,
    exec     = require('child_process').exec;

var gate = new Gpio(0, 'high');
var garage = new Gpio(1, 'high');

firebase.initializeApp({
  databaseURL: "https://mietowa-2e108.firebaseio.com",
  serviceAccount: "/home/chip/gate/sa.json"
});

var isodate = new Date().toISOString();
console.log("active: " + isodate);

var db = firebase.database();

exec("/home/chip/gate/off");

db.ref("gate").orderByChild('timestamp').startAt(isodate).on("child_added", function(snapshot) {
  var newCall = snapshot.val();
  console.log("number: " + newCall.number);
  console.log("time: " + newCall.timestamp);
  db.ref("numbers").orderByChild("number").equalTo(newCall.number).on("value", function(snapshot) {
    if (snapshot.numChildren() > 0)
      openGate();
    else
      console.log("unauthorized!!!");
  });
});

function openGate() {
  console.log("--open--");   
  on();
  setTimeout(function() {
    off();
  }, 1000);
};

function on() {
  gate.write(0);
  garage.write(0);
//  exec("/home/chip/gate/off", function (error, stdout, stderr) {});
};

function off() {
  gate.write(1);
  garage.write(1);
//  exec("/home/chip/gate/on", function (error, stdout, stderr) {});
};

function exit() {
  gate.unexport();
  garage.unexport();
  process.exit();
}
 
process.on('SIGINT', exit);
