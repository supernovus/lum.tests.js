const core = require('@lumjs/core');
const {AbstractClass} = core;
const {TestFailure,PlanFailure} = require('./errors');

/**
 * An abstract base class for Harness plugins
 * 
 * @exports module:@lumjs/tests/harness~Plugin
 */
class Plugin extends AbstractClass
{
  /**
   * (Internal class constructor)
   * @param {module:@lumjs/tests/harness} harness - Parent `Harness` instance
   */
  constructor(harness)
  {
    super();
    this.harness = harness;
    this.$needs('run');
  }

  /**
   * (ABSTRACT METHOD) Run a test
   * 
   * This method must be implemented by every plugin.
   * 
   * @name module:@lumjs/tests/harness~Plugin#run
   * @function
   * @param {object} queued - A queued test object
   */

  /**
   * See if a test had failures
   * 
   * @param {object} test - The `Test` or `Stats` object to check
   * @returns {true|Error} 
   * 
   * - Will return `true` if no failures reported.
   * - Will return a `TestFailure` if the test had failures reported.
   * - May return a `PlanFailure` if the test plan was broken.
   *   This only applies if `this.harness.plannedFailure` is `true`.
   * 
   */
  ok(test)
  {
    if (test.failed !== 0) 
    { // The test had failed units.
      return new TestFailure(test.failed);
    }

    const planned = test.planned,
          ran     = test.ran;

    const planOk = (planned === 0 || planned === ran);

    if (this.harness.plannedFailure && !planOk)
    { // The number of tests ran was not the number of tests planned.
      return new PlanFailure(planned, ran);
    }
    else if (this.harness.plannedWarning && !planOk)
    { // Report the plan failure to the console log.
      console.warn(new PlanFailure(planned, ran));
    }

    // If we reached here, everything looks good.
    return true;
  }

  static new(harness)
  {
    return new this(harness);
  }

}

module.exports = Plugin;
