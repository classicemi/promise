// const Promise = require("./index");

const Promise = require(".")

// const Promise = require(".");

const promise = Promise.resolve()

promise.then(() => {
  // console.log(999)
  return promise
}).then((value) => {
  console.log(value)
}, (reason) => {
  // console.log(reason)
})
