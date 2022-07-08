const def = require('./inc/dies.js');
// Using the 'new()' function.
const test = require('../lib').new({module, plan: def.plan});

for (const dt of def.diesErrors)
{
  test.dies(...dt);
}

for (const dt of def.diesSyntaxErrors)
{
  test.dies(...dt);
}

// We're done, output the log.
test.output();

