/**
 * Mock implementation of a Stellar Compliance server
 * Primary use is to inspect the compliance protocol request
 * 
 */

var express = require('express');
var bodyParser = require('body-parser');

const COMPLIANCE_SERVER_PORT = 8103;

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', auth);
app.post('/', auth);

function auth(request, response) {
  console.log("==========");
  console.log("Request Body:");
  console.log(request.body);

  var data = JSON.parse(request.body.data);
  console.log("\n'data' block:");
  console.log(data);

  var sig =  request.body.sig;
  console.log("\nRequest 'sig' parameter:");
  console.log(sig);
  
  console.log('\nUnpacked Sender Info:');
  var sender = data.sender;
  console.log("Sender's Stellar address: " + sender);
  var sender_info = data.attachment.transaction.sender_info;
  console.log(sender_info);

  console.log("==========");
  return response.status(200).end();
}

app.listen(COMPLIANCE_SERVER_PORT, function () {
  console.log('Mock Compliance server running on port ' + COMPLIANCE_SERVER_PORT + '!');
});
