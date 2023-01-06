/**
 * Several test related classes.
 * @module @lumjs/tests
 */
const {def,lazy} = require('@lumjs/core/types');

const E = def.e;

/**
 * The main Test class
 * 
 * @name module:@lumjs/tests.Test
 * @class
 * @see module:@lumjs/tests/test
 */
def(exports, 'Test', require('./test'), E);

/**
 * Test Harness class (lazy loaded)
 * 
 * @name module:@lumjs/tests.Harness
 * @class
 * @see module:@lumjs/tests/harness
 */
lazy(exports, 'Harness', () => require('./harness'), E);

/**
 * Functional API registration (lazy loaded)
 * 
 * @name module:@lumjs/tests.functional
 * @function
 * @see module:@lumjs/tests/test/functional
 */
lazy(exports, 'functional', () => require('./test/functional'), E);

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
