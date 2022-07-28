/**
 * Several test related classes.
 * @module @lumjs/tests
 */

/**
 * Test class.
 * @alias module:@lumjs/tests.Test
 * @see module:@lumjs/tests/test
 */
const Test = require('./test');
module.exports.Test = Test;

/**
 * Test Harness class.
 * @alias module:@lumjs/tests.Harness
 * @see module:@lumjs/tests/harness
 */
module.exports.Harness = require('./harness');

/**
 * Functional API registration.
 * @alias module:@lumjs/tests.functional
 * @see module:@lumjs/tests/functional
 */
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

