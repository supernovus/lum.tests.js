const core = require('@lumjs/core');
const {types,obj} = core;
const {F,S,isObj,isArray,needs,def} = types;
const Stats = require('./stats');
const Log = require('./log');

// A list of Test methods that return Log objects.
const TEST_METHODS =
[
  'ok', 'call', 'callIs', 'fail', 'pass', 'dies', 'diesWith', 'lives', 'cmp',
  'is', 'isnt', 'isa', 'nota', 'isJSON', 'isntJSON', 'matches', 'skip',
  ['async', 'callAsync'],
];

// A list of other methods to export that are not standard tests.
const META_METHODS = 
[
  'plan', 'diag', 'run', 'tap', 'output', 'done', 'wait',
];

// The function that powers `Test.call()` and friends.
function $call (testfunc, args)
{
  const ret = {};
  try
  {
    ret.val = testfunc(...args);
  }
  catch (e)
  {
    ret.err = e;
  }
  return ret;
}

/**
 * A simple testing library with TAP support.
 * 
 * Based on Lum.php's Test library.
 * Which itself was based on Perl 5's Test::More, and
 * Raku's Test libraries.
 *
 * @exports module:@lumjs/tests/test
 * @extends module:@lumjs/tests/test/stats
 * 
 */
class LumTest extends Stats
{
  /**
   * Build a new Test instance.
   * 
   * @param {object} [opts] Named options.
   * @param {string} [opts.id] A unique test id, used by Harness.
   * @param {number} [opts.plan] Passed to `plan()` method.
   * @param {object} [opts.moduleName] Options for `core.modules.name()`.
   * @param {object} [opts.module] The node module to export this test to.
   *
   *   If you use this option, `opts.module.exports` will be assigned
   *   to the test instance, overriding anything that may have been 
   *   assigned to it previously.
   *
   *   Also, if this is passed, and `opts.id` was not specified, and id
   *   will be auto-generated based on the filename of the module.
   *
   * @param {number} [opts.stringify=1] The depth `stringify()` should recurse
   *   objects and Arrays before switching to plain JSON stringification.
   *
   */
  constructor (opts={})
  { // First call the Base constructor.
    super(opts);

    // Now register methods that can be ran via run().
    this.$testMethods = TEST_METHODS.slice();
  }

  /**
   * A static shortcut for creating a new instance.
   * 
   * @param {object} [opts] Options to pass to constructor.
   * @returns {module:@lumjs/tests/test}
   */
  static new(opts={})
  {
    return new this(opts);
  }

  /**
   * A static shortcut for creating a `Functional` API object.
   * 
   * @param {object} [opts] Options to pass to constructor.
   * @returns {module:@lumjs/tests/functional.Functional}
   */
  static functional(opts={})
  {
    //console.debug('functional this', this);
    return require('./functional')(opts, this);
  }

  /**
   * Run a function and pass its return value to `ok()`.
   *
   * @param {function} testfunc - The function to run.
   *   If the function returns, the return value will be passed to `ok()`.
   *   If it throws an Error, the test will be marked as failed, and the
   *   Error will be passed as the `directive` to the `ok()` method.
   *
   * @param {string} [desc] A description for `ok()`.
   * @param {...any} [args] Arguments to pass to the test function.
   * @returns {Log}
   */
  call (testfunc, desc, ...args)
  {
    const ret = $call(testfunc, args);
    return this.ok(ret.val, desc, ret.err);
  }

  /**
   * See if a function throws an Error.
   * 
   * The function will be called in a `try { } catch (err) { }` block.
   * 
   * If an error is caught, the test will be considered to have passed,
   * and the `Error` object will be used as the `directive` in the `ok()`
   * call. If no error is caught the test will be considered to have failed.
   * 
   * @param {function} testfunc 
   * @param {string} [desc] 
   * @param {...any} [args]
   * @returns {Log}
   */
  dies (testfunc, desc, ...args)
  {
    const ret = $call(testfunc, args);
    return this.ok(('err' in ret), desc, ret.err);
  }

  /**
   * See if a function throws an Error, and if the Error passes a second test.
   * 
   * All the notes that apply to `dies()` apply here as well.
   *
   * @param {function} testfunc - Same as `dies()` and `call()`
   *   We don't care about the return value of this function.
   *   We only care that it *should* throw an Error.
   *
   * @param {(function|string)} testerr - A test to validate the Error.
   *
   * If this is a `function` it will be passed the thrown `Error` as the first
   * parameter, and an `Array` of `args` as the second parameter. The return
   * value from this will be passed to `ok()`.
   *
   * If this is a `string` then the test will pass only if the either the
   * `Error.name` or `Error.message` is exactly equal to this value.
   *
   * @param {string} [desc] 
   * @param {...any} [args]
   * @returns {Log}
   */
  diesWith (testfunc, testerr, desc, ...args)
  {
    let ok = false, details = {}, err = null;

    const r1 = $call(testfunc, args);

    if ('err' in r1)
    {
      err = r1.err;

      if (typeof testerr === F)
      { // A secondary function to test the error with.
        const r2 = $call(testerr, [err, args]);
        if ('err' in r2)
        { // Second function threw an error, add it as diagnostic info.
          details.info = r2.err;
        }
        else
        { // No error, use the function output as the test value.
          ok = r2.val;
        }
      }
      else if (typeof testerr === S)
      { // A simple name/message test.
        if (err.name === testerr || err.message === testerr)
        { // Either the name or the message matched the string.
          ok = true;
        }
      }
      
    } // if r1.err

    return this.ok(ok, desc, err, details);
  }

  /**
   * See if a function runs without throwing an Error.
   * 
   * The function will be called in a `try { } catch (err) { }` block.
   * 
   * If an error is caught, the test will be considered to have failed,
   * and the `Error` object will be used as the `directive` in the `ok()`
   * call. If no error is caught the test will be considered to have passed.
   * 
   * @param {function} testfunc 
   * @param {string} [desc] 
   * @param {...any} [args]
   * @returns {Log}
   */
  lives (testfunc, desc, ...args)
  {
    const ret = $call(testfunc, args);
    return this.ok(!('err' in ret), desc, ret.err);
  }

  /**
   * See if a value is what we expect it to be.
   * 
   * @param {*} got - The result value from the test function.
   * @param {*} want - The value we expected from the test function.
   * @param {string} comp - A comparitor to test with.
   * 
   * - `===`, `is`          (See also: `is()`)
   * - `!==`, `isnt`, `not` (See also: `isnt()`)
   * - `==`,  `eq`
   * - `!=`,  `ne`
   * - `>`,   `gt`
   * - `<`,   `lt`
   * - `>=`,  `ge`, `gte`
   * - `<=`,  `le`, `lte`
   *
   * A few special comparitors for *binary flag* testing:
   *
   * - `=&` → `((got & want) === want)`
   * - `!&` → `((got & want) !== want)`
   * - `+&` → `((got & want) !== 0)`
   * - `-&` → `((got & want) === 0)`
   * 
   * @param {string} [desc] 
   * @param {boolean} [stringify=true] Stringify values in TAP output?
   * @returns {Log}
   */
  cmp (got, want, comp, desc, stringify=true)
  {
    let test;
    switch(comp)
    {
      case 'is':
      case '===':
        test = (got === want);
        break;
      case 'isnt':
      case '!==':
      case 'not':
        test = (got !== want);
        break;
      case 'eq':
      case '==':
        test = (got == want);
        break;
      case 'ne':
      case '!=':
        test = (got != want);
        break;
      case 'lt':
      case '<':
        test = (got < want);
        break;
      case '>':
      case 'gt':
        test = (got > want);
        break;
      case 'le':
      case 'lte':
      case '<=':
        test = (got <= want);
        break;
      case 'ge':
      case 'gte':
      case '>=':
        test = (got >= want);
        break;
      case '=&':
        test = ((got&want)===want);
        break;
      case '!&':
        test = ((got&want)!==want)
      case '+&':
        test = ((got&want)!==0);
        break;
      case '-&':
        test = ((got&want)===0);
      default:
        test = false; 
    }

    let details = null;
    if (!test)
    { // The test failed, add the deets.
      details = 
      {
        got, 
        wanted: want,
        stringify,
        comparitor: comp,
      };
    }

    return this.ok(test, desc, null, details);
  }

  /**
   * See if a string matches a value.
   * 
   * @param {string} got
   * @param {RegExp} want
   * @param {string} [desc] 
   * @param {boolean} [stringify=true]
   * @returns {Log}
   */
  matches(got, want, desc, stringify=true)
  {
    const no = {error: "matches 'got' value must be a string"};
    needs(got, no, S);
    no.error = "matches 'want' value must be a RegExp";
    needs(want, no, RegExp);

    const test = want.test(got);

    let details = null;
    if (!test)
    { // The test failed, add the deets.
      details = 
      {
        got, 
        wanted: want,
        stringify,
        comparitor: 'matches',
      };
    }

    return this.ok(test, desc, null, details);
  }

  /**
   * See if two values are equal.
   * 
   * The same as using `cmp()` with the `===` comparitor.
   * 
   * @param {*} got 
   * @param {*} want 
   * @param {string} [desc] 
   * @param {boolean} [stringify=true]
   * @returns {Log}
   */
  is (got, want, desc, stringify=true)
  {
    return this.cmp(got, want, '===', desc, stringify);
  }

  /**
   * See if two values are NOT equal.
   * 
   * The same as using `cmp()` with the `!==` comparitor.
   * 
   * @param {*} got - The result value from the test function.
   * @param {*} want - The value we expected from the test function.
   * @param {string} [desc] 
   * @param {boolean} [stringify=true]
   * @returns {Log}
   */
  isnt (got, want, desc, stringify=true)
  {
    return this.cmp(got, want, '!==', desc, stringify);
  }

  /**
   * See if a value is of a certain type.
   * 
   * @param {*} got 
   * @param {Array} wants - Type names or constructor functions.
   * 
   * Uses `@lumjs/core/types.isa()` to perform the test.
   *  
   * @param {string} [desc]
   * @param {boolean} [stringify=true]
   * @returns {Log}
   */
  isa (got, wants, desc, stringify=true, not=false)
  {
    if (!isArray(wants))
    {
      wants = [wants];
    }
    let res = types.isa(got, ...wants);
    if (not)
    { // Inverse the result.
      res = !res;
    }

    let details = null;
    if (!res)
    { // The test failed, add the deets.
      details = 
      {
        got, 
        wanted: wants,
        stringify,
        comparitor: not ? 'nota()' : 'isa()',
      };
    }

    return this.ok(res, desc, null, details);
  }

  /**
   * See if a value is NOT of a certain type.
   *
   * Just inverses the results of `isa()`.
   *
   * @param {*} got
   * @param {Array} wants - Type names of constructor functions.
   * @param {string} [desc]
   * @param {boolean} [stringify=true]
   * @returns {Log}
   */
  nota (got, wants, desc, stringify=true)
  {
    return this.isa(got, wants, desc, stringify, true);
  }

  /**
   * An `is()` test, but encode both values as JSON first.
   * 
   * Actually uses `core.types.stringify()` so it supports more
   * data types than standard JSON, and can stringify functions,
   * symbols, and several extended object types.
   * 
   * @param {*} got 
   * @param {*} want 
   * @param {string} [desc] 
   * @returns {Log}
   */
  isJSON (got, want, desc)
  {
    got = this.stringify(got);
    want = this.stringify(want);
    return this.is(got, want, desc, false);
  }

  /**
   * An `isnt()` test, but encode both values as JSON first.
   * 
   * Like `isJSON()` this uses `core.types.stringify()`.
   * 
   * @param {*} got 
   * @param {*} want 
   * @param {string} [desc] 
   * @returns {Log}
   */
  isntJSON (got, want, desc)
  {
    got = this.stringify(got);
    want = this.stringify(want);
    return this.isnt(got, want, desc, false);
  }

  /**
   * Run a function and see if it's return value is what we wanted.
   *
   * @param {function} testfunc - The function to run.
   *   The return value will be passed to `cmp()` or another appropriate
   *   testing method as determined by the options.
   *   How this handles error handling is determined by options as well.
   *
   * @param {*} want - The value we want.
   * @param {(object|string)} [opts] Named options for further behaviour.
   *   If it is a string it's considered the `opts.desc` option.
   * @param {string} [opts.desc] A description for `ok()`.
   * @param {boolean} [opts.stringify=true]
   * @param {Array} [opts.args] Arguments to pass to the test function.
   * @param {string} [opts.comp="is"] - The comparitor to test with.
   *   In addition to all of the comparitors from `cmp()`, there are a few
   *   extra comparitors that will pass through to other methods:
   *   - `isa` → Use `isa()` to test return value.
   *   - `nota` → Use `nota()` to test return value.
   *   - `=json`, `isJSON` → Use `isJSON()` to test return value.
   *   - `!json`, `isntJSON` → Use `isntJSON()` to test return value.
   *   - `matches` → Use `matches()` to test return value.
   *
   * @param {boolean} [opts.thrown=false] How to handle thrown errors.
   *   
   *   If this is `true`, then anything thrown will be passed as if it was
   *   the return value from the function.
   *
   *   If this is `false`, then any errors thrown will result in an immediate
   *   failure of the test without any further processing, and the error will
   *   be passed as the `directive` to the `ok()` method.
   *
   * @returns {Log}
   */
  callIs (testfunc, want, opts={})
  {
    const args = opts.args ?? [];
    const ret = $call(testfunc, args);
    const desc = opts.desc;

    let got;

    if (ret.err)
    { // How to handle errors.
      if (opts.thrown)
      { // We're going to test the error.
        got = ret.err;
      }
      else
      { // This is an automatic failure.
        return this.ok(false, desc, ret.err);
      }
    }
    else
    { // No errors, good, testing against the return value.
      got = ret.val;
    }

    const CFUN = 
    {
      'matches':  'matches',
      'isa':      'isa',
      'nota':     'nota',
      'isJSON':   'isJSON',
      '=json':    'isJSON',
      'isntJSON': 'isntJSON',
      '!json':    'isntJSON',
     };

    const comp = opts.comp ?? 'is';
    const stringify = opts.stringify ?? true;

    if (typeof CFUN[comp] === S)
    { // A function with a custom return value.
      const meth = CFUN[comp];
      return this[meth](got, want, desc, stringify);
    }
    else
    { // We're going to use the cmp() method.
      return this.cmp(got, want, comp, desc, stringify);
    }
  }

  /**
   * Run an assortment of tests using a map.
   *
   * The *current* test method defaults to `ok`.
   *
   * @param {...any} tests - The tests we're running.
   *
   * If this is a `string`, and is the name of one of the standard testing
   * methods in this class, it will be set as the *current* test method.
   *
   * If this is a `function`, it will be set as the *current* test method.
   * By default function test methods are passed to `call()` with the test 
   * parameters. However, if the *previous* test method was `callIs` then
   * the `callIs()` method will be used as long as the custom function is
   * the *current* test method. Likewise to switch back to `call()` simply
   * set the *current* test method to `call` before setting it to a new custom
   * test `function`.
   *
   * If this is an `Array` then it's the parameters for the *current* test
   * method. If a custom `function` is in use, remember that it's the
   * `call()` or `callIs()` methods that will be being called, with their
   * first parameter always being the custom function.
   *
   * Any value other than one of those will throw a `TypeError`.
   *
   * @returns {Log[]} A `Log` item for each test that was ran.
   */
  run (...tests)
  {
    const CF = 'call';
    const CI = 'callIs';

    const logs = [];
    let funcall = CF;
    let current = 'ok';
    
    for (const test of tests)
    {
      const tt = typeof test;
      if (tt === S && this.$testMethods.includes(test))
      { // Set the current test to a built-in.
        current = test;
      }
      else if (tt === F)
      { // A custom test function for further tests.
        if (current === CI)
        { // Last test was `callIs` using that for the custom function.
          funcall = CI;
        }
        else if (current === CF)
        { // Last test was `call`, using that for the custom function.
          funcall = CF;
        }
      }
      else if (isArray(test))
      { // A set of test parameters.
        let log;
        if (typeof current === F)
        { // A custom test function is in use.
          log = this[funcall](current, ...test);
        }
        else
        { // A standard test is in use.
          log = this[current](...test);
        }
        logs.push(log);
      }
    }

    return logs;
  }

} // class Test

// May want this for sub-classes.
def(LumTest, 'Stats', Stats);

// Should never need this, but...
def(LumTest, 'Log', Log);

// Probably don't need this either, but...
def(LumTest, '$call', $call);

// Methods we're exporting for the 'functional' API.
def(LumTest, '$METHODS',
{
  test: TEST_METHODS,
  meta: META_METHODS,
  $meta: 
  [ // A list of properties to skip in `all`.
    '$meta', 'all', 'extend',
  ],
  get all()
  {
    const list = [];
    const skip = this.$meta;
    for (const name in this)
    {
      if (skip.includes(name)) continue;
      const prop = this[name];
      if (isArray(prop))
      {
        list.push(...prop);
      }
    }
    return list;
  },
  extend(newClass, opts={})
  {
    const mode  = obj.CLONE.DEEP;
    const clone = obj.clone(this, {mode});

    //console.debug("extend:clone<pre>", clone);

    if (isObj(opts.add))
    { // Add in the extra properties.
      //console.debug("opts.add", opts.add);
      obj.copyProps(opts.add, clone, opts.addOpts);
    }

    if (isArray(opts.meta))
    { // Added properties to skip in 'all'.
      for (const val of opts.meta)
      {
        if (!clone.$meta.includes(val))
        {
          clone.$meta.push(val);
        }
      }
    }

    //console.debug("extend:clone<post>", clone);

    // Add a new cloned and extended `$METHODS` property. 
    def(newClass, '$METHODS', {value: clone});
  }, // extend()
}); // Test.$METHODS

// Export the class
module.exports = LumTest;
