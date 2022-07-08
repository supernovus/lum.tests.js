/**
 * Several test related classes.
 */

const Test = require('./test');

module.exports.Test = Test;
module.exports.Harness = require('./harness');

// This one is not a class, but a special function.
module.exports.functional = require('./functional');

/**
 * Create a new Test instance.
 *
 * @param {object} [opts] Options to pass to the `Test` constructor.
 * @returns {Test} A new test instance.
 */
module.exports.new = function(opts={})
{
  return new Test(opts);
}

