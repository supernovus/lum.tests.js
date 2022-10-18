/**
 * Several test related classes.
 * @module @lumjs/tests
 */
const {has,can} = require('@lumjs/core').buildModule(module);

/**
 * The main Test class
 * 
 * @name module:@lumjs/tests.Test
 * @class
 * @see module:@lumjs/tests/test
 */
has('Test', true);

/**
 * Test Harness class (lazy loaded)
 * 
 * @name module:@lumjs/tests.Harness
 * @class
 * @see module:@lumjs/tests/harness
 */
can('Harness', true);

/**
 * Functional API registration (lazy loaded)
 * 
 * @name module:@lumjs/tests.functional
 * @function
 * @see module:@lumjs/tests/test/functional
 */
can('functional', './test/functional');

/**
 * Create a new Test instance.
 *
 * @param {object} [opts] Options to pass to the `Test` constructor.
 * @returns {Test} A new test instance.
 */
exports.new = function(opts={})
{
  return new exports.Test(opts);
}
