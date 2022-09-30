/**
 * A class representing a queued test.
 * @exports module:@lumjs/tests/harness~QueuedTest
 */
class QueuedTest 
{
  constructor(harness, filename, opts)
  {
    this.harness  = harness;
    this.filename = filename;
    this.options  = opts;
  }
}
module.exports = QueuedTest;
