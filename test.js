const Promise = require("./index");

// new Promise((resolve, reject) => {
//   resolve("resolved value");
// }).then((value) => {
//   console.log("resolved with:", value);
// });

// console.log("end");

const promise = new Promise((resolve, reject) => {
  console.log(1);
  resolve();
}).then(() => {
  console.log(3);
  return "a";
});

console.log(2);

promise.then((value) => {
  console.log(value);
});
