// Common stuff for isa() and nota() tests.
const types = require('@lumjs/core').types;
// A quick reference to the type names.
const TYP = types.TYPES;

// I based most of these off of the tests in `@lumjs/core`.
// Some almost verbatim, but others required restructuring.

class TypeClass {}

class SubtypeClass extends TypeClass {}

const typesInstance = new TypeClass();
const subtypeInstance = new SubtypeClass();

class DifferentClass {}

const differentInstance = new DifferentClass();

function getArguments() { return arguments; }

const MT = [TYP.S, TYP.N];
const MC = [SubtypeClass, DifferentClass];
const MM = [TYP.B, TypeClass];

const MCT = ',[SubtypeClass,DifferentClass]';
const MMT = ',["binary",TypeClass]';

const isaTests = 
[
  // Single types.
  [{}, TYP.O],
  [function(){}, TYP.F],
  ['hello', TYP.S],
  [true, TYP.B],
  [false, TYP.B],
  [100, TYP.N],
  [undefined, TYP.U],
  [Symbol('foo'), TYP.SY],
  [BigInt(12345), TYP.BI, 'BigInt(12345),'+TYP.BI],
  [54321n, TYP.BI, '54321n,'+ TYP.BI],
  [getArguments(), TYP.ARGS],
  [[], TYP.ARRAY],
  [null, TYP.NULL],
  [new Int16Array(16), TYP.TYPEDARRAY, 'Int16Array(16),'+TYP.TYPEDARRAY],
  [{value: true}, TYP.DESCRIPTOR],
  [{get: function(){}}, TYP.DESCRIPTOR],
  [{}, TYP.COMPLEX],
  [function(){}, TYP.COMPLEX],
  [true, TYP.SCALAR],
  ['hi', TYP.SCALAR],
  ['woah', TYP.PROP],
  [Symbol('woah'), TYP.PROP],
  // Single class.
  [typesInstance, TypeClass, 'typesInstance,TypeClass'],
  [subtypeInstance, SubtypeClass, 'subtypeInstance,SubtypeClass'],
  [subtypeInstance, TypeClass, 'subtypeInstance,TypeClass'],
  [differentInstance, DifferentClass, 'differentInstance,DifferentClass'],
  // Multiples.
  ['hello', MT],
  [42, MT],
  [subtypeInstance, MC, 'subtypeInstance'+MCT],
  [differentInstance, MC, 'differentInstance'+MCT],
  [true, MM, 'true'+MMT],
  [false, MM, 'false'+MMT],
  [typesInstance, MM, 'typeInstance'+MMT],
  [subtypeInstance, MM, 'subtypeInstance'+MMT],
];

const notaTests =
[
  // Single types.
  ['foo', TYP.O],
  [null, TYP.O],
  [{}, TYP.F],
  [0, TYP.B],
  [1, TYP.B],
  ['0', TYP.N],
  [null, TYP.U],
  ['foo', TYP.SY],
  [12345, TYP.BI],
  [{}, TYP.ARGS],
  [{}, TYP.ARRAY],
  [false, TYP.NULL],
  [[], TYP.TYPEDARRAY],
  [{value: true, get: function(){}}, TYP.DESCRIPTOR],
  [{}, TYP.DESCRIPTOR],
  ['a string', TYP.COMPLEX],
  [{}, TYP.SCALAR],
  [null, TYP.PROP],
  // Single class.
  [typesInstance, SubtypeClass, 'typesInstance,SubtypeClass'],
  [differentInstance, TypeClass, 'differentInstance,TypeClass'],
  [typesInstance, DifferentClass, 'typesInstance,DifferentClass'],
  // Multiples.
  [{}, MT],
  [typesInstance, MC, 'typesInstance'+MCT],
  [null, MM, 'null'+MMT],
];

const plan = isaTests.length + notaTests.length;

function label (f,t)
{
  return f+'('+((t.length === 3)
    ? t[2]
    : types.stringify(t[0])+','+types.stringify(t[1]))+')';
}

module.exports = {types, label, plan, isaTests, notaTests};
