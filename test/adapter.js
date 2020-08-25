const Promise = require('../index')

exports.resolved = function(value) {
  return Promise.resolve(value)
}

exports.rejected = function(reason) {
  return Promise.rejected(reason)
}

exports.deferred = function() {
  let resolveFn, rejectFn
  const promise = new Promise((resolve, reject) => {
    resolveFn = resolve
    rejectFn = reject
  })
  return {
    promise,
    resolve: resolveFn,
    reject: rejectFn
  }
}
