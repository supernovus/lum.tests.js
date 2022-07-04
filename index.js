/**
 * Several test related classes.
 */

const Test = require('./src/test');

module.exports.Test = Test;
module.exports.Harness = require('./src/harness');

// This one is not a class, but a special function.
module.exports.functional = require('./src/functional');

// This one is a quick shortcut function.
module.exports.new = function({plan,module}={})
{
  const test = new Test(plan);
  if (module)
  {
    module.exports = test;
  }
  return test;
}

