
const {F,S,N,isType,isInstance,def} = require('@lumjs/core').types;

// We use a separate class to represent test logs.
const Log = require('./log');

/**
 * A simple testing library with TAP support.
 * 
 * Based on Lum.php's Test library.
 * Which itself was based on Perl 5's Test::More, and
 * Raku's Test libraries.
 */
class Test
{
  /**
   * Build a new Test instance.
   * 
   * @param {number} [plan] If used, passed to `plan()` method.
   *  
   */
  constructor (plan)
  {
    this.failed = 0;
    this.skipped = 0;
    this.planned = 0;
    this.log = [];
    if (plan)
    {
      this.plan(plan);
    }
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
   * @param {string} desc - A short description of the test.
   * 
   * @param {(string|Error)} [directive] Further information for the log.
   *    
   * @returns {Log} The test log with the results.
   */
  ok (test, desc, directive)
  {
    const log = new Log();

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
   * See if a function throws an Error.
   * 
   * The function will be called in a `try { } catch (err) { }` block.
   * 
   * If an error is caught, the test will be considered to have passed,
   * and the `Error` object will be used as the `directive` in the `ok()`
   * call. If no error is caught the test will be considered to have failed.
   * 
   * @param {function} testfunc 
   * @param {string} desc 
   * @returns {Log}
   */
  dies (testfunc, desc)
  {
    let ok = false;
    let err;
    try { testfunc(); } 
    catch (e)
    {
      ok = true;
      err = e;
    }
    return this.ok(ok, desc, err);
  }

  /**
   * See if a value is what we expect it to be.
   * 
   * @param {*} got - The result value from the test function.
   * @param {*} want - The value we expected from the test function.
   * @param {string} comp - A comparitor to test with.
   * 
   * - `===`, `is`          (See also: `is()`)
   * - `!==`, `isnt`        (See also: `isnt()`)
   * - `==`,  `eq`
   * - `!=`,  `ne`
   * - `>`,   `gt`
   * - `<`,   `lt`
   * - `>=`,  `ge`, `gte`
   * - `<=`,  `le`, `lte`
   * 
   * @param {string} desc 
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
      default:
        test = false; 
    }

    const log = this.ok(test, desc);
    if (!test)
    {
      log.details.got = got;
      log.details.wanted = want;
      log.details.stringify = stringify;
      log.details.comparitor = comp;
    }
    return log;
  }

  /**
   * See if two values are equal.
   * 
   * The same as using `cmp()` with the `===` comparitor.
   * 
   * @param {*} got 
   * @param {*} want 
   * @param {string} desc 
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
   * @param {string} desc 
   * @param {boolean} [stringify=true] Use JSON details in TAP output?
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
   * @param {(string|function)} want - A type name, or a constructor function.
   * 
   * This uses two type checking functions from `@lumsj/core`.
   * If this is a string, we use the `isType()` function.
   * If this is a constructor function, we use the `isInstance()` function.
   *  
   * @param {string} desc 
   * @param {boolean} [stringify=true]
   * @returns {Log}
   */
  isa (got, want, desc, stringify=true)
  {
    let test;
    if (typeof want === S)
    { // A string, we're going to use the isType function.
      test = isType(want, got);
    }
    else if (typeof want === F)
    { // Assuming it's a constructor.
      test = isInstance(got, want);
    }
    else 
    { // That's not supported.
      throw new TypeError("'want' must be a string or a constructor");
    }

    const log = this.ok(test, desc);
    if (!test)
    {
      log.details.got = got;
      log.details.wanted = want;
      log.details.stringify = stringify;
    }
    return log;
  }

  /**
   * An `is()` test, but encode both values as JSON first.
   * 
   * @param {*} got 
   * @param {*} want 
   * @param {string} desc 
   * @returns 
   */
  isJSON (got, want, desc)
  {
    got = JSON.stringify(got);
    want = JSON.stringify(want);
    return this.is(got, want, desc, false);
  }

  /**
   * Skip a test.
   * 
   * @param {?string} reason - Why the test was skipped.
   * @param {string} desc 
   * @returns {Log}
   */
  skip (reason, desc)
  {
    var log = this.ok(true, desc);
    log.skipped = true;
    if (typeof reason === S)
      log.skippedReason = reason;
    this.skipped++;
    return log;
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
   * Return TAP formatted output for all the tests.
   * 
   * @returns {string} The test logs, in TAP format.
   */
  tap ()
  {
    var out = '';
    if (this.planned > 0)
    {
      out += '1..'+this.planned+"\n";
    }
    var t = 1;
    for (var i = 0; i < this.log.length; i++)
    {
      var log = this.log[i];
      if (log instanceof Log)
      {
        out += log.tap(t++);
      }
      else
      { // A comment.
        out += '# ' + (typeof log === S ? log : JSON.stringify(log)) + "\n";
      }
    }
    if (this.skipped)
    {
      out += '# Skipped '+this.skipped+" tests\n";
    }
    if (this.failed)
    {
      out += '# Failed '+this.failed+(this.failed>1?' tests':' test');
      if (this.planned)
        out += ' out of '+this.planned;
      out += "\n";
    }
    var ran = t-1;
    if (this.planned > 0 && this.planned != ran)
    {
      out += '# Looks like you planned '+this.planned+' but ran '+ran+" tests\n";
    }
    return out;
  }

  /**
   * Send the TAP output to the `console`.
   */
  output ()
  {
    console.log(this.tap());
    return this;
  }

} // class Test

// Should never need this, but...
def(Test, 'Log', Log);

// Export the class
module.exports = Test;
