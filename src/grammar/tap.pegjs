// Simplistic TAP Grammar

TAP = 
  plan:plan ? 
  items:tapline + 
  {
    return {plan, items};
  }

text "text" = [^\n\r]       // Any character other than a linebreak
anytext "text" = $ text *   // Optional text (as a string)
hastext "text" = $ text +   // Mandatory text (as a string)
ws "x-space" = [ \t]        // A horizontal whitespace character
_ "x-space" = ws *          // Optional horizontal whitespace
nl "linebreak" = [\n\r]+    // A line break

// An integer value (as a number)
int "integer" = 
  [0-9]+
  { 
    return parseInt(text(), 10); 
  }

// An optional test plan.
plan = "1.." num:int nl { return num; }

// Every other line of the TAP log
tapline = testline / comment / other

// An actual line representing the result of a test
testline = 
  not:("not" ws+)?               // 'not' prefix means test failed
  "ok" _ num:int                 // 'ok x' where x is the test number
  desc:desc ?                    // Optional description
  cmt:testcomment ?              // Optional comment
  nl ?                           // A line break (unless its the last line)
  {
    let comment = null;
    let isSkip = false;
    let isTodo = false;
    
    if (cmt !== null)
    {
      comment = cmt.text;
      skip = (cmt.cmd === 'SKIP');
      todo = (cmt.cmd === 'TODO');
    }
    
    return(
    {
      is: 'test',
      id: num,
      ok: (not === null),
      desc,
      comment,
      skip,
      todo,
    });
  }

// A test Description field
desc = 
  _ "-"                     // Always starts with a dash
  _ text:($[^#\n\r]*)       // Any text until a `#` or a line break
  { 
    return text.trim(); 
  }

// A test log comment field
testcomment = 
  _ "#"                         // Always starts with a `#` character
  _ cmd: ("SKIP" / "TODO") ?    // May have meta-commands associated
  _ text:anytext                // The rest can be anything until a line break
  {
    return {cmd, text};
  }

// A standalone comment field
comment = 
  _ "#"                   // Always starts with a `#` character
  _ stmt: [~\-] ?         // Optional statements that can change the type
  _ cmd: cinfo ?          // Optional info about the previous test log
  _ cmt:anytext ?         // Any other comment text
  nl ?                    // A line break (unless its the last line)
  { 
    const data = {};

    if (stmt === '~')
    { // A meta information log
      data.type = 'meta';
    }
   	else if (stmt === '-')
    { // An array log item
      data.type = 'item';
    }
    else if (cmd !== null)
    { // Extended log information
      data.type = 'info';
      data.info = cmd;
    }
    else
    { // Just a regular old comment
      data.type = 'comment';
    }

    data.text = cmt.trim();
    return data;
  }

// The meta-info fields we support in comments
cinfo = 
  cmd: ("got" / "expected" / "op")   // The field names
  ":"                                // Always ends in a `:` character
  { return cmd; }

// Lines that don't match the above added here.
other = 
  text:hastext 
  nl ?
  {
    return({type: 'other', text: text.trim()});
  }
