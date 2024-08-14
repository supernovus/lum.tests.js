const {S,N,needType,isArray} = require('@lumjs/core/types');
const Stats = require('../test/stats');
const Tap = require('../grammar/tap');

const T = 'test',
      I = 'info',
      M = 'meta',
      A = 'item',
      C = 'comment',
      O = 'other';

/**
 * A simplistic TAP parser.
 * 
 * Currently only handles *very basic* TAP v12 output.
 * This is loosely based on the TAP parser in my PHP
 * `Lum\Test\Harness` library, but is split off into
 * its own class, and how it handles the parsed data
 * is quite different. I think I may eventually update
 * the PHP version to be more like this one.
 * 
 * @exports module:@lumjs/tests/harness/parser
 */
class LumTestParser
{
  /**
   * Build a TAP Parser.
   * @param {object} harness - The parent Harness
   */
  constructor(harness)
  {
    this.harness = harness;
  }

  /**
   * Parse a multiline TAP string
   * 
   * @param {string} tapSource - The full TAP string to parse.
   * 
   * @returns {object} A simple `Test`-like object with the parsed results.
   */
  parse(tapSource)
  {
    needType(S, tapSource);

    // Our base Test for populating values into.
    const test = new Stats();

    // An AST that we'll use to populate the stats.
    const tap = Tap.parse(tapSource);
    
    // Test the first line for a plan.
    if (typeof tap.plan === N)
    {
      test.plan(tap.plan);
    }

    if (tap.items.length === 0) return test; // No lines, cannot continue.

    // A structure to store our parsing state.
    const cur = 
    {
      log: null,
      pos: -1,
      cmd: null,
    }

    const unhandled = line => console.log("unhandled log line", {line, cur});

    for (const line of tap.lines)
    {
      if (line.type === T)
      { // A regular test line; will increment the counter
        if (line.skip)
        {
          cur.log = test.skip(line.comment, line.desc);
        }
        else if (line.todo)
        {
          cur.log = test.todo(line.comment, line.desc);
        }
        else 
        {
          cur.log = test.ok(line.ok, line.desc, line.comment);
        }
        cur.pos++;
      }
      else if (line.type === I && cur.log)
      { // Log detail fields
        cur.cmd = line.info;
        cur.log.details[line.info] = line.comment;
      }
      else if (line.type === M)
      { // We skip meta info.
        cur.cmd = null;
        cur.log = null;
        continue;
      }
      else if (line.type === A && cur.log)
      { // An array item
        cur.cmd = null;
        if (cur.log.details.info === undefined)
        {
          cur.log.details.info = [];
        }
        cur.log.details.info.push(line.text);
      }
      else if (line.type === C)
      { // A regular comment
        test.diag(line.text);
        cur.cmd = null;
        cur.log = null;
        cur.pos++;
      }
      else if (line.type === O)
      { // A line that doesn't match anything else.
        if (cur.log && cur.cmd)
        { // There's a comment command statement in use.
          const ld = cur.log.details;
          ld[cur.cmd] += "\n" + line.text;
        }
        else if (cur.log && isArray(cur.log.details.info))
        { // The current log has info, let's add to it.
          const ldi = cur.log.details.info;
          const last = ldi.length - 1;
          ldi[last] += "\n" + line.text;
        }
        else if (cur.pos > -1 && typeof test.log[cur.pos] === S)
        { // The current entry is a string, let's add to it.
          test.log[cur.pos] += "\n" + line.text;
        }
        else 
        { // Don't know what to do with this.
          unhandled(line);
        }
      }
      else 
      { // Can't do anything, so warn about it and move on.
        unhandled(line);
      }
    }
    
    return test;
  }

  static new(opts)
  {
    return new LumTestParser(opts);
  }
}

// Export the class as the parser.
module.exports = LumTestParser;
