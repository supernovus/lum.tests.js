#!/usr/bin/env node
const process = require('node:process');
const Harness = require('../lib/harness');
const NodePlugin = require('../lib/harness/plugin/node');
const core = require('@lumjs/core');
const {S} = core.types;

const args = process.argv.slice(2);

const hOpts =
{
  plannedFailure: true,
  plannedWarning: true,
}

let rPlan = true;
let aDir = './test';

const aOpts = 
{
  ext: '.js',
}

const flags =
{
  '-d': v => aDir = v,
  '-e': v => aOpts.ext = v,
  '-r': v => aOpts.recurse = parseInt(v), 
}

const toggles = 
{
  '-f': () => hOpts.plannedFailure = false,
  '-q': () => hOpts.plannedWarning = false,
  '-R': () => aOpts.recurse = 99, // Never will go this far down
  '-P': () => rPlan = false,
}

let mode = null;

for (const arg of args)
{
  if (flags[arg])
  { // A mode switch
    mode = arg;
  }
  else if (typeof mode === S)
  { // A flag that has a single argument
    const flag = flags[mode];
    flag(arg);
    mode = null;
  }
  else if (toggles[arg])
  { // A toggle that takes no arguments
    toggles[arg]();
  }
  else 
  {
    console.warn("unsupported argument", arg);
  }
}

// Create our Harness instance.
const harness = new Harness(NodePlugin, hOpts); 
module.exports = harness;     // Export it as the 'main' module.
harness.addDir(aDir, aOpts);  // Add all the files in the test dir.
harness.run(rPlan);           // Run all the tests.
