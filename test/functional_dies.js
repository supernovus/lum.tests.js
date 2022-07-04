const def = require('./inc/dies.js');

const {dies,output} = require('../index').functional({module, plan: def.plan});

for (const dt of def.diesErrors)
{
  dies(...dt);
}

for (const dt of def.diesSyntaxErrors)
{
  dies(...dt);
}

// We're done, output the log.
output();

