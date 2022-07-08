// Testing the basic functions of the functional testing API.

const {test,plan,ok,pass,is,isnt,cmp,tap} = require('../lib').functional();
const def = require('./inc/basics.js');

plan(def.plan);

ok(def.okay, 'ok()');
pass('pass()');

for (const it of def.isTests)
{
  const t = JSON.stringify(it);
  is(it, it, 'is('+t+','+t+')');
}

for (const [a,b] of def.isntTests)
{
  const msg = `isnt(${JSON.stringify(a)},${JSON.stringify(b)})`;
  isnt(a, b, msg);
}

for (const args of def.cmpTests)
{
  const msg = 'cmp('+JSON.stringify(args)+')';
  cmp(...args, msg);
}

// We're done, output the log.
console.log(tap());

// And re-export the test.
module.exports = test;
