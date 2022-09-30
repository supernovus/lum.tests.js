// Node.js harness plugin
const core = require('@lumjs/core');
const {N} = core.types;
const Plugin = require('./plugin');
const cp = require('node:child_process');
const getCwd = require('node:process').cwd;
const fs = require('node:fs');
const path = require('node:path');

/**
 * Node.js Harness plugin
 * 
 * @exports module:@lumjs/tests/harness~NodePlugin
 * @extends module:@lumjs/tetss/harness~Plugin
 */
class NodePlugin extends Plugin
{
  runInternal(queued)
  {
    let name = path.join(getCwd(), queued.filename);
    return require(name);
  }

  runExternal(queued)
  {
    const name = queued.filename;
    const args = queued.options.args ?? [];
    const proc = cp.spawnSync(name, args, {encoding: 'utf8'});
    return this.harness.parser.parse(proc.stdout);
  }

  run(queued)
  {
    if (queued.options.external)
    {
      return this.runExternal(queued);
    }
    else 
    {
      return this.runInternal(queued);
    }
  }

  addDir(dir, opts={}, recurse)
  {
    if (typeof recurse !== N && typeof opts.recurse === N)
    {
      recurse = opts.recurse;
    }

    const ext = opts.ext ?? '.js';
    const testOpts = opts.test ?? opts;
    const files = fs.readdirSync(dir, {encoding: 'utf8', withFileTypes: true});

    for (const file of files)
    {
      if (file.name === '.' || file.name === '..') continue;
      if (typeof recurse === N && recurse > 0 && file.isDirectory())
      { // Recurse to a nested directory.
        this.addDir(path.join(dir, file.name), opts, recurse-1);
      }
      else if (file.isFile() && file.name.endsWith(ext))
      { // It would seem to be a valid test.
        this.harness.addTest(path.join(dir, file.name), testOpts);
      }
    }
  }

} // Node plugin class

module.exports = NodePlugin;
