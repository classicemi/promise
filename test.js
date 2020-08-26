const Promise = require("./index");

const promise = Promise.resolve()

promise.then(() => {
  return new Promise(() => {})
}).then((value) => {
  console.log('value', value)
}, (reason) => {
  console.log('reason', reason)
})
