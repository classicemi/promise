const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";

function resolvePromise(promise, x, resolve, reject) {
  // 返回当前同一实例时，抛出TypeError
  if (x === promise) {
    throw new TypeError('The promise and its value shouldn\'t refer to the same object');
  }
  // 返回值为Promise实例时，有一些特殊行为
  if (x instanceof Promise) {
    if (x.status === PENDING) {
      x.then((value) => {
        this.status = x.status
        resolvePromise(promise, value, resolve, reject)
      }, (reason) => {
        this.status = x.status
        reject(reason)
      })
    } else {
      this.status = x.status;
      x.status === FULFILLED
        ? resolve(x.value)
        : reject(x.reason);
    }
  } else if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    let thenFunction = x.then
    let hasBeenCalled = false
    try {
      if (typeof thenFunction === 'function') {
        thenFunction.call(x, (y) => {
          if (!hasBeenCalled) {
            resolvePromise(promise, y, resolve, reject)
            hasBeenCalled = true
          }
        }, (r) => {
          if (!hasBeenCalled) {
            reject(r)
            hasBeenCalled = true
          }
        })
      } else {
        resolve(x)
        hasBeenCalled = true
      }
    } catch (err) {
      if (!hasBeenCalled) {
        reject(err)
        hasBeenCalled = true
      }
    }
  } else {
    // 传入x为普通值时，直接修改promise的value，也作为递归调用的终点
    resolve(x)
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
            resolvePromise(promise, ret, resolve, reject)
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
