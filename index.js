const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";

function resolvePromise(promise, x, resolve, reject) {
  // 返回值为Promise实例时，有一些特殊行为
  if (x instanceof Promise) {
    // 返回当前同一实例时，抛出TypeError
    if (x === promise) {
      throw new TypeError();
    }
    if (x.status !== PENDING) {
      this.status = x.status;
      x.status === FULFILLED
        ? resolve(x.value)
        : reject(x.reason);
    }
    // 如果返回的promise在后面发生状态改变，则改变当前promise的状态
    x.then(
      (value) => {
        this.status = x.status;
        resolve(value);
      },
      (reason) => {
        this.status = x.status;
        reject(reason);
      }
    );
  } else {
    if ((typeof x === 'object' || 'function') && !!x.then) {
      promise.then = function(...args) {
        x.then.apply(promise, args)
      }
    }
    resolve(x);
  }
}

function rejectPromise(promise, r, resolve, reject) {
  if (r instanceof Promise) {
    if (r === promise) {
      throw new TypeError();
    }
    if (r.status !== PENDING) {
      this.status = r.status;
      r.status === FULFILLED
        ? resolve(r.value)
        : reject(r.reason);
    }
    // 如果返回的promise在后面发生状态改变，则改变当前promise的状态
    r.then(
      (value) => {
        this.status = r.status;
        resolve(value);
      },
      (reason) => {
        this.status = r.status;
        reject(reason);
      }
    );
  } else {
    if ((typeof r === 'object' || 'function') && !!r.then) {
      promise.then = function(...args) {
        r.then.apply(promise, args)
      }
    }
    resolve(r);
  }
}

class Promise {
  constructor(executor) {
    // 记录实例状态
    this.status = PENDING;
    // 实例被resolve时，存放value
    this.value = undefined;
    // 实例被reject时，存放reason
    this.reason = undefined;
    // 实例pending时，存放fulfilled回调队列
    this.onFulfilledCallbacks = [];
    // 实例pending时，存放rejected回调队列
    this.onRejectedCallbacks = [];

    let resolve = (value) => {
      // 只有pending状态会执行
      if (this.status === PENDING) {
        // 修改状态为fulfilled
        this.status = FULFILLED;
        // 保存value
        this.value = value;
        // 在下一个事件循环中依次执行回调
        setTimeout(() => {
          for (
            let i = 0, len = this.onFulfilledCallbacks.length;
            i < len;
            i++
          ) {
            try {
              this.onFulfilledCallbacks[i].call(null, this.value);
            } catch (err) {}
          }
          // 循环完毕后清空队列
          this.onFulfilledCallbacks = [];
        }, 0);
      }
    };
    let reject = (reason) => {
      // 只有pending状态会执行
      if (this.status === PENDING) {
        // 修改状态为rejected
        this.status = REJECTED;
        // 保存reason
        this.reason = reason;
        // 在下一个事件循环中依次执行回调
        setTimeout(() => {
          for (let i = 0, len = this.onRejectedCallbacks.length; i < len; i++) {
            try {
              this.onRejectedCallbacks[i].call(null, this.reason);
            } catch (err) {}
          }
          // 循环完毕后清空队列
          this.onRejectedCallbacks = [];
        }, 0);
      }
    };

    try {
      // 执行传入构造函数的函数
      executor(resolve, reject);
    } catch (err) {
      // 如果抛出异常，将实例状态置为rejected
      reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    let promise = new Promise((resolve, reject) => {
      if (typeof onFulfilled !== 'function') {
        // onFulfilled非函数时将value透传到下一个promise
        onFulfilled = (value) => resolve(value);
      }
      if (typeof onRejected !== 'function') {
        // onRejected非函数时将reason透传到下一个promise
        onRejected = (reason) => reject(reason);
      }
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            let ret = onFulfilled(this.value);
            resolvePromise(promise, ret, resolve, reject)
          } catch (err) {
            reject(err);
          }
        }, 0)
      }
      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let ret = onRejected(this.reason);
            rejectPromise(promise, ret, resolve, reject)
          } catch (err) {
            reject(err);
          }
        }, 0);
      }
      if (this.status === PENDING) {
        this.onFulfilledCallbacks.push((value) => {
          // 包装一层，根据回调执行状态修改返回的新实例的状态
          try {
            let ret = onFulfilled(value);
            if (ret instanceof Promise) {
              if (ret.status !== PENDING) {
                this.status = ret.status;
                resolve(ret.value);
              }
            } else {
              resolve(ret);
            }
          } catch (err) {
            reject(err);
          }
        });
        this.onRejectedCallbacks.push((reason) => {
          try {
            resolve(onRejected(reason));
          } catch (err) {
            reject(err);
          }
        });
      }
    });
    return promise
  }
}

Promise.resolve = function (value) {
  return new Promise((resolve) => {
    resolve(value);
  });
};

Promise.rejected = function (reason) {
  return new Promise((resolve, reject) => {
    reject(reason);
  });
};

module.exports = Promise;
