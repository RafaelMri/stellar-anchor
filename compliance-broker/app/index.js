/**
 * A basic implementation to handle various callbacks from the Compliance server as
 * specified in https://github.com/stellar/bridge-server/blob/master/readme_compliance.md
 */

var express = require('express');
var bodyParser = require('body-parser');
var AccountConnectionManager = require('./account_connection_manager');
var SanctionsConnectionManager = require('./sanctions_connection_manager');

const COMPLIANCE_SERVER_CALLBACK_PORT = 8006;

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/sanctions', sanctions);
app.post('/sanctions', sanctions);
app.get('/ask_user', ask_user);
app.post('/ask_user', ask_user);
app.get('/fetch_info', fetch_info);
app.post('/fetch_info', fetch_info);

/**
 * Invoked to retrieve compliance information of your customer
 *  
 * Request payload:
 *   address:  federation address, e.g. captain_america*bankA.com
 */
function fetch_info(request, response) {
  //var addressParts = response.body.address.split('*');
  console.log(request.body);
  var addressParts = request.body.address.split('*');
  var friendlyId = addressParts[0];

  var accountDatabase = new AccountConnectionManager("https://accountdb.duc.com");

  accountDatabase.findByFriendlyId(friendlyId)
    .then(function(account) {
      // This can be any data you determine is useful and is not limited to
      // these three fields.
      response.json({
        name: account.fullName,
        address: account.address,
        date_of_birth: account.dateOfBirth
      });
      response.end();
    })
    .catch(function(error) {
      console.error('Fetch Info Error:', error);
      response.status(500).end(error.message);
    });
}


/**
 * Invoked whenever sanctions checks need to be performed.
 * 
 * Request payload:
 *   sender:  sender info JSON
 * 
 * sender info JSON must, at minimum, include the following:
 *   {
 *      "name": "Tony Start",
 *      "address": "10880 Malibu Point, Malibu, CA, USA",
 *      "stellar": "ironman*ImaginaryBank.com",
 *      "date_of_birth": "1970-05-29"
 *   }
 */
function sanctions(request, response) {
  var sender = JSON.parse(request.body.sender);

  var sanctionsDatabase = new SanctionsConnectionManager("https://sanctionsdb.duc.com");

  console.log('[== SANCTIONS CHECK ====>');
  sanctionsDatabase.isAllowed(sender)
    .then(function() {
       console.log("OK");
       response.status(200).end();
    })
    .catch(function(error) {
    // In this example, we're assuming `isAllowed` returns an error with a
    // `type` property that indicates the kind of error. Your systems may
    // work differently; just return the same HTTP status codes.
    if (error.type === 'DENIED') {
      console.log("DENIED");
      response.status(403).end();
    }
    else if (error.type === 'UNKNOWN') {
      // If you need to wait and perform manual checks, you'll have to
      // create a way to do that as well
      notifyHumanForManualSanctionsCheck(sender);
      // The value for `pending` is a time to check back again in seconds
      response.status(202).json({pending: 3600}).end();
    }
    else {
      console.log("INTERNAL SERVER ERROR");
      response.status(500).end(error.message);
    }
  });
  console.log('=== CHECK COMPLETED ====]');

}

/**
 * Invoked when the sending institution needs your customer KYC info prior to 
 * sending payment.
 * 
 * Request payload:
 *   amount      : payment amount
 *   asset_code  : payment asset code
 *   asset_issuer: payment asset asset_issuer
 *   sender      : sender info JSON
 *   note        : note attached to the payment
 * 
 */
function ask_user(request, response) {
  console.log("[===== ASK_USER =====");
  var sender = JSON.parse(request.body.sender);

  var sanctionsDatabase = new SanctionsConnectionManager("https://sanctionsdb.duc.com");

  // You can do any checks that make sense here. For example, you may not
  // want to share information with someone who has sanctions as above:
  sanctionsDatabase.isAllowed(sender)
    .then(function() {
      console.log("OK");
      response.status(200).end();
    })
    .catch(function(error) {
      if (error.type === 'UNKNOWN') {
        notifyHumanForManualInformationSharing(sender);
        // The value for `pending` is a time to check back again in seconds
        response.status(202).json({pending: 3600}).end();
      }
      else {
        console.log("DENIED");
        response.status(403).end();
      }
    });

  console.log("===== ASK_USER =====]");
}

app.listen(COMPLIANCE_SERVER_CALLBACK_PORT, function () {
  console.log('Compliance server callbacks running on port ' + COMPLIANCE_SERVER_CALLBACK_PORT + '!');
});

function notifyHumanForManualInformationSharing(sender) {
  console.log(arguments.callee);
}

function notifyHumanForManualSanctionsCheck(sender) {
  console.log(arguments.callee);
}