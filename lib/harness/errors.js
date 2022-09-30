
/**
 * An error for when a test set had failures
 * 
 * @prop {number} failed - The number of tests that failed
 * 
 * @exports module:@lumjs/tests/harness~TestFailure
 * @extends Error
 */
class TestFailure extends Error 
{
  constructor(failed)
  {
    super(`${failed} tests failed`);
    this.name = 'TestFailure';
    this.failed = failed;
  }
}

/**
 * An error for when the test plan was broken
 * 
 * @prop {number} planned - The number of tests planned
 * @prop {number} ran - The number of tests actually ran
 * 
 * @exports module:@lumjs/tests/harness~PlanFailure
 * @extends Error
 */
class PlanFailure extends Error
{
  constructor(planned, ran)
  {
    super(`${planned} tests planned; ${ran} tests ran`);
    this.name = 'PlanFailure';
    this.planned = planned;
    this.ran = ran;
  }
}

// Export all of our custom errors.
module.exports =
{
  TestFailure, PlanFailure,
}
