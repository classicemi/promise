const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";

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
              this.onFulfilledCallbacks[i](this.value);
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
              this.onRejectedCallbacks[i](this.reason);
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
    let resolveFn, rejectFn;
    let promise = new Promise((resolve, reject) => {
      resolveFn = resolve;
      rejectFn = reject;
    });
    // 检验回调是否为函数
    if (typeof onFulfilled === "function") {
      // 当状态为fulfilled时，直接执行回调并返回一个新实例
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            let ret = onFulfilled(this.value)
            if (ret !== promise) {
              resolveFn(ret);
            }
            throw new TypeError()
          } catch (err) {
            rejectFn(err);
          }
        }, 0)
      }
      // 状态为pending时，将回调保存至队列中
      if (this.status === PENDING) {
        this.onFulfilledCallbacks.push((value) => {
          // 包装一层，根据回调执行状态修改返回的新实例的状态
          try {
            resolveFn(onFulfilled(value));
          } catch (err) {
            rejectFn(err);
          }
        });
      }
    } else {
      // onFulfilled非函数时将value透传到下一个promise
      onFulfilled = (value) => resolveFn(value)
      this.onFulfilledCallbacks.push(onFulfilled)
    }
    if (typeof onRejected === "function") {
      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let ret = onRejected(this.reason)
            if (ret !== promise) {
              resolveFn(ret);
            }
            throw new TypeError()
          } catch (err) {
            rejectFn(err);
          }
        }, 0)
      }
      if (this.status === PENDING) {
        this.onRejectedCallbacks.push((reason) => {
          try {
            resolveFn(onRejected(reason));
          } catch (err) {
            rejectFn(err);
          }
        });
      }
    } else {
      // onRejected非函数时将reason透传到下一个promise
      onRejected = (reason) => rejectFn(reason)
      this.onRejectedCallbacks.push(onRejected)
    }
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
