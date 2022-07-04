const Test = require('../index').Test;
const def = require('./inc/basics.js');

const test = new Test();
test.plan(def.plan);

test.ok(def.okay, 'ok()');
test.pass('pass()');

for (const is of def.isTests)
{
  const t = JSON.stringify(is);
  test.is(is, is, 'is('+t+','+t+')');
}

for (const [a,b] of def.isntTests)
{
  const msg = `isnt(${JSON.stringify(a)},${JSON.stringify(b)})`;
  test.isnt(a, b, msg);
}

for (const args of def.cmpTests)
{
  const msg = 'cmp('+JSON.stringify(args)+')';
  test.cmp(...args, msg);
}

// We're done, output the log.
console.log(test.tap());

// Re-expect the test.
module.exports = test;
