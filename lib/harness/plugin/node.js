// Node.js harness plugin
const core = require('@lumjs/core');
const {N,F,S,isObj} = core.types;
const Plugin = require('./index');
const cp = require('node:child_process');
const getCwd = require('node:process').cwd;
const fs = require('node:fs');
const path = require('node:path');
const RE = /[\/\(\[]+/;
const WS = /\s+/g;
const MJS_EXPS = ['default','test'];

/**
 * Node.js Harness plugin
 * 
 * @exports module:@lumjs/tests/harness/plugin/node
 * @extends module:@lumjs/tetss/harness/plugin
 */
class NodePlugin extends Plugin
{
  runInternal(queued)
  {
    let name = path.join(getCwd(), queued.filename);
    let mod = require(name);
    if (!(mod instanceof Stats)) {
      for (let exp of MJS_EXPS) {
        if (mod[exp] instanceof Stats) {
          return mod[exp];
        }
      }
      throw new Error("test files MUST export the Test instance");
    }
    return mod;
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

  addDir(dir, opts, recurse)
  {
    opts = Object.assign({}, this.harness.options, opts);

    if (typeof recurse !== N && typeof opts.recurse === N)
    {
      recurse = opts.recurse;
    }

    const testOpts = opts.test ?? opts;
    const files = fs.readdirSync(dir, {encoding: 'utf8', withFileTypes: true});

    let isTest = opts.matchFiles;
    if (typeof isTest !== F)
    { // No custom test, let's make one.
      let ext = opts.ext ?? '.js';

      if (typeof ext === S)
      {
        ext = ext.trim();
        if (ext.match(RE)) 
        { // A RegExp pattern string of some sort.
          ext = ext.split('/').map(v => v.replaceAll(WS, '')).filter(v => v !== '');
          ext = new RegExp(...ext);
        }
        else
        { // A simple file extension.
          isTest = (file) => file.name.endsWith(ext);
        }
      }

      if (ext instanceof RegExp)
      { // RegExp filename test.
        isTest = (file) => file.name.match(ext);
      }
    }

    for (const file of files)
    {
      if (file.name === '.' || file.name === '..') continue;
      if (typeof recurse === N && recurse > 0 && file.isDirectory())
      { // Recurse to a nested directory.
        this.addDir(path.join(dir, file.name), opts, recurse-1);
      }
      else if (file.isFile() && isTest(file))
      { // It would seem to be a valid test.
        this.harness.addTest(path.join(dir, file.name), testOpts);
      }
    }
  }

} // Node plugin class

module.exports = NodePlugin;

const Stats = require('../../test/stats');