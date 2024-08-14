const core = require('@lumjs/core');
const {AbstractError} = core;
const {TestFailure,PlanFailure} = require('../errors');

/**
 * An abstract base class for Harness plugins
 * 
 * @prop {module:@lumjs/tests/harness} harness 
 * The harness instance will assign itself to this property.
 * 
 * @exports module:@lumjs/tests/harness/plugin
 */
class Plugin
{
  /**
   * (ABSTRACT METHOD) Run a test
   * 
   * This method must be implemented by every plugin.
   * 
   * @param {object} queued - A queued test object
   */
  run(queued)
  {
    throw new AbstractError("run() method not implemented");
  }

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

}

module.exports = Plugin;
