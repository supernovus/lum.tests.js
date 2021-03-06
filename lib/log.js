
const types = require('@lumjs/core').types;
const {S,O,isArray,stringify,def} = types;

/**
 * A log representing the results of a test.
 * 
 * @property {boolean} ok - Did the test pass.
 * @property {boolean} skipped - Was the test skipped?
 * @property {string} skippedReason - If the test was skipped, why?
 * @property {?string} desc - A short description of the test.
 * @property {*} directive - Special directives describing the test.
 * @property {object} details - Extra information about the test.
 * 
 * @property {*} [details.got] The value that was received in an `is` test.
 * @property {*} [details.wanted] The value that was expectged in an `is` test.
 * @property {*} [details.stringify] If `true` then output the details as JSON.
 * 
 */
class Log 
{
  constructor (test)
  {
    this.ok = false;
    this.skipped = false;
    this.skippedReason = '';
    this.desc = null;
    this.directive = null;
    this.details = {};
    this.stringifyDepth = test.stringifyDepth;
    def(this, '$test$', test);
  }

  /**
   * Output this Log object in the TAP format.
   * 
   * Generally this is never needed to be used by outside code.
   * The `Test.tap()` method uses it when generating a full log.
   * 
   * @param {*} num - The test number.
   * @returns {string} The TAP log.
   */
  tap (num)
  {
    const SD = this.stringifyDepth;

    var out;
    if (this.ok)
      out = 'ok ';
    else
      out = 'not ok ';

    out += num;

    if (typeof this.desc === S)
      out += ' - ' + this.desc;

    if (typeof this.directive === S)
      out += ' # ' + this.directive;
    else if (typeof this.directive == O && this.directive instanceof Error)
      out += ` # ${this.directive.name}: ${this.directive.message}`;
    else if (this.skipped)
      out += ' # SKIP ' + this.skippedReason;

    out += "\n";

    if ('got' in this.details && 'wanted' in this.details)
    {
      var got = this.details.got;
      var want = this.details.wanted;
      if (this.details.stringify)
      {
        got = stringify(got, SD);
        want = stringify(want, SD);
      }
      out += `#       got: ${got}\n`;
      out += `#  expected: ${want}\n`;
      if (typeof this.details.comparitor === S)
      {
        out += `#        op: ${this.details.comparitor}\n`;
      }
    }

    if ('info' in this.details)
    { // Extended information. Usually an array, but can be whatever.
      const info 
        = isArray(this.details.info) 
        ? this.details.info
        : [this.details.info];

      for (const i in info)
      {
        const line = (typeof info[i] === S) ? info[i] : stringify(info[i], SD);
        out += `## ${line}\n`;
      }
    }

    return out;
  } // Log.tap()

} // class Log

// Export the class itself.
module.exports = Log;
