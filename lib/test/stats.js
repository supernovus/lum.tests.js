const core = require('@lumjs/core');
const mods = require('@lumjs/core/modules');
const {types} = core;
const {S,N,F,isObj,def} = types;
const Log = require('./log');
const HARNESS_GLOBAL = '__lum_tests_harness__';

const DEFAULT_ASYNC_OPTS =
{
  timeout:  30000,
  interval: 5,
}

/**
 * Minimalistic base class for the `Test` library.
 * 
 * This provides the properties and methods related to the test statistics.
 * It's extremely minimal and does not provide the core testing methods.
 * See the [Test]{@link module:@lumjs/tests/test} class for that.
 *
 * @alias module:@lumjs/tests/test/stats
 * 
 * @property {number}  planned - Number of tests planned, `0` if unplanned.
 * @property {number}  failed  - Number of tests that failed.
 * @property {number}  skipped - Number of tests that were skipped.
 * @property {number}  ran     - Number of tests ran (*calculated*). 
 * @property {string}  id      - Unique test id used by `Harness` libary.
 * @property {boolean} isTop   - Test module was loaded from the command line.
 * @property {?object} harness - The top-level `Harness` if one was found.
 */
class LumTestStats
{
  /**
   * Build a new instance.
   * 
   * @param {object} [opts] Named options.
   * @param {string} [opts.id] A unique test id, used by Harness.
   * @param {number} [opts.plan] Passed to `plan()` method.
   * @param {object} [opts.moduleName] Options for `core/modules.name()`.
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
   * @param {object} [opts.async] Options for async tests
   * @param {number} [opts.async.timeout=30000] Max time to wait (in ms)
   * @param {number} [opts.async.interval=5] Status check every (in ms)
   * 
   */
  constructor (opts={})
  {
    if (typeof opts === N)
    {
      opts = {plan: opts};
    }
    else if (typeof opts === S)
    {
      opts = {id: opts};
    }

    const hasModule = isObj(opts.module);

    if (typeof opts.id === S)
    { // A specific id was specified.
      this.id = opts.id;
    }
    else if (hasModule)
    { // We're going to generate a simple name.
      this.id = mods.name(opts.module, opts.moduleName);
    }
    else 
    { // An anonymous test.
      this.id = null;
    }

    this.stringifyDepth = opts.stringify ?? 1;

    this.failed  = 0;
    this.skipped = 0;
    this.planned = 0;
    this.waiting = 0;

    this.asyncOpts = Object.assign({}, DEFAULT_ASYNC_OPTS, opts.async);

    // The test logs for each unit.
    this.log = [];

    // These will be updated below if possible.
    this.isTop   = false;
    this.harness = null;

    if (typeof opts.plan === N)
    {
      this.plan(opts.plan);
    }

    //console.debug('checking for module');
    if (hasModule)
    { // If a module was passed, its going to export this test.
      opts.module.exports = this;
      //console.debug('module found');
      // We'll also use the module to determine if we're Harnessed or not.
      if (require.main === opts.module)
      { // Was called directly.
        this.isTop = true;
      }
    }

    if (!this.isTop)
    { // Try to find a possible Harness instance using some obscure logic...
      if (isObj(require.main) && isObj(require.main.exports) 
        && require.main.exports.constructor.name === 'LumTestsHarness')
      { // We found the Harness instance.
        this.harness = require.main.exports;
      }
      else if (isObj(globalThis[HARNESS_GLOBAL]))
      {
        this.harness = globalThis[HARNESS_GLOBAL];
      }
    }
    
  }

  // Internal method.
  $log()
  {
    return new Log(this);
  }

  // A wrapper around types.stringify()
  stringify(what)
  {
    return types.stringify(what, this.stringifyDepth);
  }

  /**
   * Indicate how many tests are planned to be run in this set.
   * 
   * @param {number} num - The number of tests that should run. 
   */
  plan (num)
  {
    if (typeof num === N)
    {
      this.planned = num;
    }
    else if (num === false)
    {
      this.planned = 0;
    }
    else
    {
      throw new Error("Invalid value passed to plan()");
    }
  }

  /**
   * Check if a value is truthy, and add a log indicating the result.
   * 
   * This is the absolute most basic method that every other testing method
   * uses to log the results.
   * 
   * I won't document the `desc` and `directive` parameters on any of the
   * other methods as they are exactly the same as here.
   * 
   * @param {*} test - Any value, usually the output of a test function.
   *   If the value evaluates as `true` (aka a truthy value), the test passes.
   *   If it evaluates as `false` (a falsey value), the test fails.
   * 
   * @param {string} [desc] A short description of the test.
   * @param {(string|Error)} [directive] Further information for the log.
   * @param {object} [details] Extra details to add to the log.
   * @returns {Log} The test log with the results.
   */
  ok (test, desc, directive, details)
  {
    const log = this.$log();

    if (test)
    {
      log.ok = true;
    }
    else
    {
      this.failed++;
    }

    if (typeof desc === S)
    {
      log.desc = desc;
    }

    if (directive)
    {
      log.directive = directive;
    }

    if (isObj(details))
    {
      log.details = details;
    }

    this.log.push(log);

    return log;
  }

  /**
   * Mark a test as failed.
   * 
   * @param {string} desc 
   * @param {*} [directive] 
   * @returns {Log}
   */
  fail (desc, directive)
  {
    return this.ok(false, desc, directive);
  }
  
  /**
   * Mark a test as passed.
   * 
   * @param {string} desc 
   * @param {*} [directive] 
   * @returns {Log}
   */
  pass (desc, directive)
  {
    return this.ok(true, desc, directive);
  }

  /**
   * Skip a test.
   * 
   * In some circumstances, there may be a situation where a
   * test is not applicable (maybe it's an optional feature
   * that only applies to a certain platform), and shouldn't be run. 
   * In order to maintain the correct number of tests ran, we can 
   * mark those tests as *skipped* using this method.
   * 
   * @param {string} [reason] - Why the test was skipped.
   * @param {string} [desc] - A description of the test.
   * @returns {Log}
   */
  skip (reason, desc, _todo=false)
  {
    const log = this.ok(true, desc);
    if (_todo)
      log.todo = true;
    else
      log.skipped = true;
    if (typeof reason === S)
      log.reason = reason;
    this.skipped++;
    return log;
  }
 
  /**
   * Mark a test as not yet implemented.
   * 
   * This is quite different from the version in PHP.
   * In that one `TODO` items are considered a *failure*.
   * In this implementation, TODO items are considered
   * to be *skipped*. They simply have a different marker
   * in the TAP output than tests marked with `skip()`.
   * 
   * @param {string} [reason] - What needs to be done to implement this test.
   * @param {string} [desc] - A description of the test.
   * @returns {Log}
   */
  todo(reason, desc)
  {
    return this.skip(reason, desc, true);
  }

  /**
   * Add diagnostics info directly to our test logs.
   * 
   * @param {*} msg - The info to add. 
   *   If this is a `string` it will be displayed as a comment as is.
   *   If it is anything else, it will be encoded as JSON first.
   * 
   */
  diag (msg)
  {
    this.log.push(msg);
  }

  /**
   * Run async test code
   * 
   * If a test needs to wait for the results of an async operation,
   * then this is the way to do it. This method does not actually
   * call any testing methods, that needs to be done inside the `call`.
   * 
   * This increments `this.waiting`, which will be decremented when
   * the `Promise` returned by the `call` is resolved or rejected.
   * 
   * @param {(function|Promise)} call - Async code to wait for
   * 
   * The `function` must be `async` or return a `Promise`.
   * The function will have this Stats instance applied as `this`.
   * 
   * @param  {...any} args - Arguments for `call` function.
   * 
   * @returns {Promise}
   */
  async async(call, ...args)
  {    
    let testPromise;
    this.waiting++;

    if (typeof call === F)
    { // It MUST be an async function, OR return a Promise.
      testPromise = call.apply(this, args);
    }
    else
    { // Assume the promise was passed directly.
      testPromise = call;
    }

    if (testPromise instanceof Promise)
    {
      testPromise.finally(() => this.waiting--);
    }
    else
    {
      throw new TypeError("async() call must return a Promise");
    }

    return testPromise;
  }

  /**
   * Called if `this.waiting` is greater than `0`
   * 
   * @returns {Promise<object>}
   * 
   * Will resolve to `this` when `this.waiting` becomes `0`.
   * Will be rejected if the maximum wait timeout is reached.
   */
  wait()
  {
    const ao = this.asyncOpts;
    return new Promise((resolve, reject) =>
    {
      const timeout = setTimeout(() =>
      {
        clearInterval(test);
        clearTimeout(timeout);
        reject(new Error("Timed out waiting for async encoding"));
      }, ao.timeout);

      const test = setInterval(() =>
      {
        if (this.waiting === 0)
        {
          clearInterval(test);
          clearTimeout(timeout);
          resolve(this);
        }
      }, ao.interval);
    });
  }

  /**
   * Return TAP formatted output for all the tests.
   * 
   * @returns {string} The test logs, in TAP format.
   */
  tap ()
  {
    let out = '';
    if (this.planned > 0)
    {
      out += '1..'+this.planned+"\n";
    }
    let t = 1;
    for (const log of this.log)
    {
      if (log instanceof Log)
      {
        out += log.tap(t++);
      }
      else
      { // A comment.
        out += '# ' + (typeof log === S ? log : this.stringify(log)) + "\n";
      }
    }
    if (this.skipped)
    {
      out += '# ~ Skipped '+this.skipped+" tests\n";
    }
    if (this.failed)
    {
      out += '# ~ Failed '+this.failed+(this.failed>1?' tests':' test');
      if (this.planned)
        out += ' out of '+this.planned;
      out += "\n";
    }
    const ran = t-1;
    if (this.planned > 0 && this.planned != ran)
    {
      out += '# ~ Looks like you planned '+this.planned+' but ran '+ran+" tests\n";
    }
    return out;
  }

  /**
   * A read-only *accessor* property alias for `tap()`.
   * @returns {string}
   * @see {@link module:@lumjs/tests/test#tap}
   */
  get TAP()
  {
    return this.tap();
  }

  /**
   * A calculated property of the number of tests that were ran.
   * @type {int}
   */
  get ran ()
  {
    let ran = 0;
    for (const log of this.log)
    {
      if (log instanceof Log)
      {
        ran++;
      }
    }
    return ran;
  }

  /**
   * Send the TAP output to the `console`.
   *
   * This is a low-level method and is no longer recommended for use.
   * Instead call the `done()` method, which will *do the right thing*.
   */
  output ()
  {
    console.log(this.tap());
    return this;
  }

  /**
   * Run this when you're done testing.
   *
   * It doesn't do much at all if a `Harness` is in use.
   * 
   * If no `Harness` is in use, this will call `this.output()`.
   * If there are any async calls we're waiting on this will wait
   * until they are complete before calling `this.output()`.
   */
  done ()
  {
    if (this.harness)
    { // The harness will handle the rest.
      return this;
    }
    else if (this.waiting)
    {
      this.wait().finally(() => this.done());
    }
    else
    {
      this.output();
    }
  }

} // class Stats

def(LumTestStats, 'HARNESS_GLOBAL', HARNESS_GLOBAL);

// Export the class
module.exports = LumTestStats;
