const {test,plan,tap,isa,nota} = require('../lib').functional();
const def = require('./inc/isa.js');
const getLabel = def.label;

plan(def.plan);

for (const isaTest of def.isaTests)
{
  const label = getLabel('isa',isaTest);
  isa(isaTest[0], isaTest[1], label);
}

for (const notaTest of def.notaTests)
{
  const label = getLabel('nota',notaTest);
  nota(notaTest[0], notaTest[1], label);
}

// We're done, output the log.
console.log(tap());

// And re-export the test.
module.exports = test;
