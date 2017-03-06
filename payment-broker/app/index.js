/**
 * A basic implementation to handle callbacks.receive from the bridge server.
 * Methods to do account lookup, currency conversion, and updating your internal
 * bank systems are provided for illustrative purposes.  These methods currently
 * just print examples of their action to the console.
 */

var express = require('express');
var bodyParser = require('body-parser');

const BRIDGE_SERVER_CALLBACK_PORT = 8005;

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/receive', receive);
app.post('/receive', receive);

function receive(request, response) {
  var payment = request.body;

  console.log('[== Processing Payment ====>');
  console.log(payment);

  // `receive` may be called multiple times for the same payment, so check that
  // you haven't already seen this payment ID.
  if (getPaymentByIdFromDb(payment.id)) {
    return response.status(200).end();
  }

  // Because we have one Stellar account representing many customers, the
  // customer the payment is intended for should be in the transaction memo.
  var customer = getAccountFromDb(payment.memo);

  // You need to check the asset code and issuer to make sure it's an asset
  // that you can accept payment to this account for.
  var usdAmount = convertToUSD(
    payment.amount, payment.asset_code, payment.asset_issuer);
  addToBankAccountBalance(customer, usdAmount);
  response.status(200).end();
  console.log('=== Processing Completed ===]');
}

app.listen(BRIDGE_SERVER_CALLBACK_PORT, function () {
  console.log('Bridge server callbacks running on port ' + BRIDGE_SERVER_CALLBACK_PORT + '!');
});

function getAccountFromDb(paymentMemo) {
  var res = paymentMemo.split('*');
  console.log('Account: ' + res[0]);
  return res[0];
}

function getPaymentByIdFromDb(paymentId) {
  console.log('Payment ID: ' + paymentId);
}

function convertToUSD(pmtAmount, pmtAssetCode, pmtAssetIssuer) {
  console.log('convertToUSD()');
  return pmtAmount / 2;
}

function addToBankAccountBalance(customer, amount) {
  console.log('Transferring ' + amount + ' US dollars to ' + customer);
}
