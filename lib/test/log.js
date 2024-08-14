
const types = require('@lumjs/core').types;
const {S,O,isArray,stringify,def} = types;

/**
 * A log representing the results of a test.
 * 
 * @alias module:@lumjs/tests/test~Log
 * 
 * @property {boolean} ok - Did the test pass.
 * @property {boolean} skipped - Was the test skipped?
 * @property {boolean} todo - Was the test marked TODO?
 * @property {string} reason - If the test was skipped or TODO, why?
 * @property {?string} desc - A short description of the test.
 * @property {*} directive - Special directives describing the test.
 * @property {object} details - Extra information about the test.
 * 
 * @property {*} [details.got] The value that was received in a test.
 * @property {*} [details.wanted] The value that was expectged in a test.
 * @property {string} [details.comparitor] The comparitor used in a test.
 * @property {boolean} [details.stringify] If `true` then output the details as JSON.
 * @property {object} [details.info] An optional array of extra information.
 * 
 */
class LumTestLog 
{
  /**
   * (Internal Constructor) 
   * @param {object} test - The parent `Test` or `Stats` instance.
   */
  constructor (test)
  {
    this.ok = false;
    this.skipped = false;
    this.todo = false;
    this.reason = '';
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
      out += ' # SKIP ' + this.reason;
    else if (this.todo)
      out += ' # TODO ' + this.reason;

    out += "\n";

    if ('got' in this.details)
    {
      const stringy = this.details.stringify;
      
      let got = this.details.got;
      if (stringy) got = stringify(got, SD);
      out += `#       got: ${got}\n`;

      if ('wanted' in this.details)
      {
        let want = this.details.wanted;
        if (stringy) want = stringify(want, SD);
        out += `#  expected: ${want}\n`;
      }

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
        out += `# - ${line}\n`;
      }
    }

    return out;
  } // Log.tap()

} // class Log

// Export the class itself.
module.exports = LumTestLog;
