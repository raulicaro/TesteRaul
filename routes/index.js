var express = require('express');
var router = express.Router();
var csv = require('csv');
// loads the csv module referenced above.
var obj = csv();
// gets the csv module to access the required functionality

function MyCSV(Fone, Ftwo, Fthree) {
  this.FieldOne = Fone;
  this.FieldTwo = Ftwo;
  this.FieldThree = Fthree;
};
var MyData = [];
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
module.exports = router;

{​

// MyData array will contain the data from the CSV file and it will be sent to the clients request over HTTP.
​
obj.from.path('../THEPATHINYOURPROJECT/TOTHE/csv_FILE_YOU_WANT_TO_LOAD.csv').to.array(function (data) {
  for (var index = 0; index < data.length; index++) {
    MyData.push(new MyCSV(data[index][0], data[index][1], data[index][2]));
  }
  console.log(MyData);
});
//Reads the CSV file from the path you specify, and the data is stored in the array we specified using callback function.  This function iterates through an array and each line from the CSV file will be pushed as a record to another array called MyData , and logs the data into the console to ensure it worked.
​
var http = require('http');
//Load the http module.
​
var server = http.createServer(function (req, resp) {
  resp.writeHead(200, { 'content-type': 'application/json' });
  resp.end(JSON.stringify(MyData));
});
// Create a webserver with a request listener callback.  This will write the response header with the content type as json, and end the response by sending the MyData array in JSON format.
​
server.listen(8080);
// Tells the webserver to listen on port 8080(obviously this may be whatever port you want.)
}
