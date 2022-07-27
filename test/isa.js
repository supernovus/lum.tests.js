const Test = require('../lib').Test;
const def = require('./inc/isa.js');

const test = new Test();
test.plan(def.plan);

for (const isaTest of def.isaTests)
{
  const label = def.label('isa',isaTest);
  test.isa(isaTest[0], isaTest[1], label);
}

for (const notaTest of def.notaTests)
{
  const label = def.label('nota',notaTest);
  test.nota(notaTest[0], notaTest[1], label);
}

// We're done, output the log.
console.log(test.tap());

// Re-expect the test.
module.exports = test;
