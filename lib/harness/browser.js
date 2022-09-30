// Browser harness plugin
const Plugin = require('./plugin');

/**
 * Browser Harness plugin
 * 
 * @exports module:@lumjs/tests/harness~BrowserPlugin
 * @extends module:@lumjs/tetss/harness~Plugin
 */
class BrowserPlugin extends Plugin
{
  run(queued)
  {
    throw new Error("Browser tests not supported yet");
  }
} // Node plugin class

module.exports = BrowserPlugin;
