// Common stuff for both regular and functional tests.
const types = require('@lumjs/core').types;

const okay = (1==1);

const isTests = [1, 1.1, 'a', true, false, [1,2,3], null];
const isntTests =
[ // Tests to compare strict non-equality.
  [1,     '1'],
  [1.1,   '1.1'],
  [true,  1],
  [false, 0],
  [false, null],
  ['',    null],
  [[1,2], [2,1]],
];

const cmpTests =
[ // Tests to use custom comparisons and aliases.
  [1, 1,     '==='],
  [1, 1,     'is'],
  [0, 1,     '!=='],
  [0, 1,     'isnt'],
  [1, '1',   'eq'],
  [0, false, 'eq'],
  [1, true,  '=='],
  [1, false, 'ne'],
  [0, true,  '!='],
  [1, 0,     '>'],
  [1, 0,     'gt'],
  [1, 0,     '>='],
  [1, 0,     'ge'],
  [1, 0,     'gte'],
  // TODO: finish this set of tests.
];

const livesTests = 
[ // Tests for the lives() function.
  () => true,
  () => JSON.stringify({answer:42}),
  () => JSON.parse('{"hello":"world"}'),
];

const isJsonTests = 
[
  [[1,2,3], [1,2,3]],
  [['hello','world'], ['hello','world']],
  [{hello: 'world'}, {hello:'world'}],
];

const isntJsonTests = 
[
  [[1,2,3], [3,2,1]],
  [['hello','world'], ['goodbye','universe']],
  [{hello: 'world'}, {hello:'darkness my old friend'}],
];

const plan 
  = 2
  + isTests.length
  + isntTests.length
  + cmpTests.length
  + livesTests.length
  + isJsonTests.length
  + isntJsonTests.length
  ;

module.exports = 
{
  isTests, isntTests, cmpTests, livesTests, isJsonTests, isntJsonTests,
  okay, plan, types,
};
