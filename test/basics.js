const Test = require('../lib').Test;
const def = require('./inc/basics.js');
const stringify = def.types.stringify;

const test = new Test({module});
test.plan(def.plan);

test.ok(def.okay, 'ok()');
test.pass('pass()');

for (const is of def.isTests)
{
  const t = stringify(is);
  test.is(is, is, 'is('+t+','+t+')');
}

for (const [a,b] of def.isntTests)
{
  const msg = `isnt(${stringify(a)},${stringify(b)})`;
  test.isnt(a, b, msg);
}

for (const args of def.cmpTests)
{
  const msg = 'cmp('+stringify(args)+')';
  test.cmp(...args, msg);
}

for (const func of def.livesTests)
{
  test.lives(func, `lives(${stringify(func)})`);
}

for (const [a,b] of def.isJsonTests)
{
  const msg = `isJSON(${stringify(a)},${stringify(b)})`;
  test.isJSON(a, b, msg);
}

for (const [a,b] of def.isntJsonTests)
{
  const msg = `isntJSON(${stringify(a)},${stringify(b)})`;
  test.isntJSON(a, b, msg);
}

test.done();
