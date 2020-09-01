let promisesAplusTests = require("promises-aplus-tests");
let adapter = require('./adapter')

promisesAplusTests(adapter, function (err) {
  // All done; output is in the console. Or check `err` for number of failures.
});