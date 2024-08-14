// A functional interface to the test library.
const Test = require('./index');

/**
 * A new test instance and a set of functions wrapping it.
 * 
 * @typedef {object} module:@lumjs/tests/test/functional.Functional
 * @property {Test} test - The new test instance.
 * 
 * All of the rest of the properties are functions that
 * can be imported into a JS scope using destructuring, and
 * which wrap the corresponding test instance method.
 * 
 * Basically anything that is a method of the `Test` instance
 * will become a wrapped `function` available in this structure.
 */

/**
 * Create a function that will export a bunch of wrapper
 * functions that can be imported via object destructuring.
 * 
 * Usage is like:
 * 
 * ```js
 * const {plan,ok,isa,done} = require('@lumjs/tests').functional({module});
 * 
 * plan(2);
 * ok(true, 'ok() works');
 * isa(isa, 'function', 'isa is a function');
 * done();
 * 
 * ```
 * 
 * Because each time this function is run it creates a new test instance,
 * and a new set of wrapper functions for the test instance, you could
 * create multiple sets of functional tests in their own private scopes.
 * Not sure why you'd want to do that, but in case you do, there ya go.
 *
 * @param {object} [opts] Options to pass to the `Test` constructor.
 * 
 * @param {function} [testClass=Test] The class we're creating an instance of.
 * 
 *   This defaults to `Test`, but can be changed to be a sub-class such as
 *   `DOMTest` (defined in the `@lumjs/tests-dom` library.) This feature is
 *   likely not useful for most end users, as knowledge of the internals is
 *   required to make the functional API work.
 * 
 * @returns {module:@lumjs/tests/test/functional.Functional}
 * 
 * @exports module:@lumjs/tests/test/functional
 */
function functional(opts={}, testClass=Test)
{
  //console.debug("functional()", testClass, testClass.$METHODS);
  // A list of methods we can proxy directly.
  const proxyMethods = testClass.$METHODS.all;
  const test = new testClass(opts);
  const functions = { test };
  for (const mdef of proxyMethods)
  {
    let sname, tname;
    if (Array.isArray(mdef))
    { // separate source and target names
      sname = mdef[0];
      tname = mdef[1];
    }
    else
    { // same names for both
      sname = tname = mdef;
    }

    functions[tname] = function ()
    {
      return test[sname](...arguments);
    }
  }
  return functions;
}

// Export the function itself.
module.exports = functional;
