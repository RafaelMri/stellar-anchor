let URI = require("urijs");

module.exports = function(url) {

  this.accountSORURL = URI(url);

  this.findByFriendlyId = function (id) {
    console.log(id);

    return new Promise(function(resolve, reject) {
      let randomWholeNumberBetween0and2 = Math.floor(Math.random() * 2);
      console.log("Randomizer: " + randomWholeNumberBetween0and2);
      switch (randomWholeNumberBetween0and2) {
        case 0:  // success
          var account = new Object();
          account.fullName = "Tony Stark";
          account.address = "10880 Malibu Point, Malibu, CA, USA";
          account.dateOfBirth = "1970-05-29";
          resolve(account);
          break;
        default:
          var error = new Object();
          error.message = "ID not found or something else failed.";
          reject(error);
      }
    });
  }
}