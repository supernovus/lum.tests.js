// A functional interface to the test library.
const Test = require('./test');

// A list of methods we can proxy directly.
const PROXY_METHODS = 
[
  'plan', 'ok', 'fail', 'pass', 'dies', 'cmp', 'isa', 'is', 'isnt', 
  'isJSON', 'skip', 'diag', 'tap', 'output',
];

/**
 * A new test instance and a set of functions wrapping it.
 * @typedef {object} Functional
 * @property {Test} test - The new test instance.
 * 
 * All of the rest of the properties are functions that
 * can be imported into a JS scope using destructuring, and
 * which wrap the corresponding test instance method.
 * 
 * @property {function} plan 
 * @property {function} ok
 * @property {function} fail 
 * @property {function} pass 
 * @property {function} dies 
 * @property {function} cmp 
 * @property {function} isa 
 * @property {function} is 
 * @property {function} isnt 
 * @property {function} isJSON 
 * @property {function} skip 
 * @property {function} diag 
 * @property {function} tap  
 */

/**
 * Create a function that will export a bunch of wrapper
 * functions that can be imported via object destructuring.
 * 
 * Usage is like:
 * 
 * ```js
 * const {plan,ok,isa} = require('@lumjs/tests').functional({module});
 * 
 * plan(2);
 * ok(true, 'ok() works');
 * isa(isa, 'function', 'isa is a function');
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
 * @returns {Functional}
 * 
 */
function functional(opts={})
{
  const test = new Test(opts);
  const functions = { test };
  for (const meth of PROXY_METHODS)
  {
    functions[meth] = function ()
    {
      return test[meth](...arguments);
    }
  }
  return functions;
}

// Export the function itself.
module.exports = functional;
