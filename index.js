const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";

class Promise {
  constructor(executor) {
    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    let resolve = (value) => {
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
        setTimeout(() => {
          for (
            let i = 0, len = this.onFulfilledCallbacks.length;
            i < len;
            i++
          ) {
            this.onFulfilledCallbacks[i](this.value);
          }
        }, 0);
      }
    };
    let reject = (reason) => {};

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    if (typeof onFulfilled === "function") {
      this.onFulfilledCallbacks.push(onFulfilled);
    }
    if (typeof onRejected === "function") {
      this.onRejectedCallbacks.push(onRejected);
    }
    return this;
  }
}

module.exports = Promise;
