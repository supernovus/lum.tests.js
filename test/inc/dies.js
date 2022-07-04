// Common include for testing the .dies() method.

// A custom error class.
class Exception extends Error 
{
  constructor(msg)
  {
    super(msg);
    this.name = "Exception";
  }
}

exports.Exception = Exception;

// A simplistic class for testing.
class TestObject
{
  static throwError()
  {
    throw new Error("error thrown statically");
  }
  static throwSyntaxError()
  {
    return this.noSuchMethod();
  }

  throwError()
  {
    throw new Error("error thrown");
  }
  throwSyntaxError()
  {
    return this.noSuchMethod();
  }
}

exports.TestObject = TestObject;

function makeException()
{
  throw new Exception("exception made");
}

exports.makeException = makeException;

function syntaxError()
{
  noSuchFunction();
}

exports.syntaxError = syntaxError;

const testObject = new TestObject();

const diesErrors =
[
  [function() { throw new Error("001"); }, 'dies(thrown_from_inline_function)'],
  [() => { throw new Error("002") }, 'dies(thrown_from_arrow_function)'],
  [() => { throw new Exception("003")}, 'dies(threw_custom_error)'],
  [makeException, 'dies(thrown_from_named_function)'],
  [() => TestObject.throwError(), 'dies(thrown_from_static_method'],
  [() => testObject.throwError(), 'dies(thrown_from_instance_method'],
];

exports.diesErrors = diesErrors;

const diesSyntaxErrors = 
[
  [function() { wrong(); }, 'dies(synax_error_from_inline_function)'],
  [() => wrong(), 'dies(syntax_error_from_arrow_function)'],
  [syntaxError, 'dies(syntax_error_from_named_function'],
  [() => TestObject.throwSyntaxError(), 'dies(syntax_error_from_static_method)'],
  [() => testObject.throwSyntaxError(), 'dies(syntax_error_from_instance_method)'],
];

exports.diesSyntaxErrors = diesSyntaxErrors;

exports.plan = diesErrors.length + diesSyntaxErrors.length;
