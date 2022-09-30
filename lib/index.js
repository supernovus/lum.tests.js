/**
 * Several test related classes.
 * @module @lumjs/tests
 */
const {lazy} = require('@lumjs/core/types');

/**
 * The main Test class
 * 
 * @see module:@lumjs/tests/test
 */
exports.Test = require('./test');

const lz = {enumerable: true};

/**
 * Test Harness class (lazy loaded)
 * 
 * @name module:@lumjs/tests.Harness
 * @class
 * @see module:@lumjs/tests/harness
 */
lazy(exports, 'Harness', () => require('./harness'), lz);

/**
 * Functional API registration (lazy loaded)
 * 
 * @name module:@lumjs/tests.functional
 * @function
 * @see module:@lumjs/tests/test/functional
 */
lazy(exports, 'functional', () => require('./test/functional'), lz);

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
