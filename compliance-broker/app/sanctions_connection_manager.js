let URI = require("urijs");

module.exports = function(url) {

  this.sanctionsURL = URI(url);

  this.isAllowed = function(sender) {
    console.log(sender);

    var response = new Object();

    return new Promise(function(resolve, reject) {
      let randomWholeNumberBetween0and3 = Math.floor(Math.random() * 4);
      switch (randomWholeNumberBetween0and3) {
        case 0:
          response.message = 'OK';
          resolve(response);
          break;
        case 1:
          response.type = 'UNKNOWN';
          reject(response);
          break;
        case 2:
          response.message = 'SYSTEM ERROR';
          reject(response);
          break;
        default:
          response.type = 'DENIED';
          reject(response);
      }
    });
  }
}