// Testing the basic functions of the functional testing API.

const 
{
  plan,ok,pass,is,isnt,cmp,done,isJSON,isntJSON,lives,
} = require('../lib').functional({module});
const def = require('./inc/basics.js');
const stringify = def.types.stringify;

plan(def.plan);

ok(def.okay, 'ok()');
pass('pass()');

for (const it of def.isTests)
{
  const t = stringify(it);
  is(it, it, 'is('+t+','+t+')');
}

for (const [a,b] of def.isntTests)
{
  const msg = `isnt(${stringify(a)},${stringify(b)})`;
  isnt(a, b, msg);
}

for (const args of def.cmpTests)
{
  const msg = 'cmp('+stringify(args)+')';
  cmp(...args, msg);
}

for (const func of def.livesTests)
{
  lives(func, `lives(${stringify(func)})`);
}

for (const [a,b] of def.isJsonTests)
{
  const msg = `isJSON(${stringify(a)},${stringify(b)})`;
  isJSON(a, b, msg);
}

for (const [a,b] of def.isntJsonTests)
{
  const msg = `isntJSON(${stringify(a)},${stringify(b)})`;
  isntJSON(a, b, msg);
}

done();

