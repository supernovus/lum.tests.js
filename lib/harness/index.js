const core = require('@lumjs/core');
const {def,lazy,context:ctx} = core;
const {B,F} = core.types;
const QueuedTest = require('./queuedtest');
const Plugin = require('./plugin');

/**
 * A class that acts as a *test harness* for running other tests.
 * 
 * Loosely based off of my PHP `Lum\Test\Harness` class,
 * but with a much more modular design.
 * 
 * @prop {object} opts - Options passed to constructor
 * 
 * @prop {object} testSuite - A `Stats` (or `Test`) instance
 * 
 * This meta-test will keep track of the success or failure of
 * all the other tests. So its `plan` will be equal to the number of
 * tests we're running, and so forth.
 * 
 * @prop {object} plugin - A platform-specific `Plugin`
 * 
 * This may be provided as a parameter to the constructor,
 * or auto-selected based on our Javascript environment.
 * 
 * @prop {Array} queue - An array of `QueuedTest` instances
 * representing tests that we want to run.
 * 
 * @prop {Array} stats - An array of `Stats` or `Error` instances
 * representing tests that have been ran.
 * 
 * @prop {object} parser - A lazy-loaded `Parser` instance
 * 
 * @exports module:@lumjs/tests/harness
 */
class LumTestsHarness
{
  /**
   * Build a new Harness
   * 
   * @param {object} [opts] Options
   * @param {object} [opts.testSuite] A `Test` or `Stats` instance
   * 
   * This is probably not needed. We'll generate a new `Stats` instance.
   * 
   * @param {object} [opts.plugin] A `Plugin` instance.
   * 
   * This is probably not needed. We'll automatically determine a default
   * plugin to use based on the JS environment.
   * 
   * @param {boolean} [opts.plannedFailure=true] Is a broken plan a failure?
   * 
   * If this is `true` and a test set has a non-zero plan, then the
   * number of tests ran must match the plan or it will be a failure.
   * 
   * If this is `false`, then see `opts.plannedWarning` for how we'll
   * report broken plans.
   * 
   * @param {boolean} [opts.plannedWarning=true] Show a broken plan warning?
   * 
   * If this is `true` and `opts.plannedFailure` is `false` then when
   * a test set has a broken plan we'll send a warning to the JS console.
   * 
   * If this is `false` then no warning will be shown.
   * 
   */
  constructor(opts={})
  {
    // Save a reference to the options.
    this.opts = opts;

    if (opts.testSuite instanceof Stats)
    { // Set the test suite instance.
      this.testSuite = opts.testSuite;
    }
    else 
    { // Build a new test suite instance.
      this.testSuite = new Stats(opts.testSuite);
    }

    if (opts.plugin instanceof Plugin)
    {
      this.plugin = opts.plugin;
    }
    else if (ctx.isBrowser)
    {
      this.plugin = require('./browser').new(this);
    }
    else if (ctx.isNode)
    {
      this.plugin = require('./node').new(this);
    }
    else
    {
      throw new Error('Could not determine plugin');
    }

    //console.debug("# ~ plugin", this.plugin, this);

    this.queue = []; // Tests to be ran.
    this.stats = []; // Results from tests that have been ran

    lazy(this, 'parser', () => require('./parser').new(this));

    this.plannedFailure = opts.plannedFailure ?? true;
    this.plannedWarning = opts.plannedWarning ?? true;

  } // constructor()

  /**
   * Add `Test` or `Stats` instances that have been run
   * to our list of test stats. 
   * 
   * @protected
   * 
   * @param {object} info - The `QueuedTest` instance
   * @param {?object} result - The returned result
   * 
   * Will usually be a `Test` or `Stats` instance, but may
   * be an `Error` if an exception was thrown trying to run the test.
   * 
   * @returns {object} `this`
   */
  addStats(info, stats)
  {
    if (info instanceof QueuedTest 
      && (stats instanceof Stats 
      || stats instanceof Error))
    {
      this.stats[info.name] = {info, stats};
    }
    else
    {
      throw new TypeError("Invalid object type");
    }
    return this;
  }
  
  /**
   * Add a test to our testing queue.
   * 
   * @param {string} filename - A filename for the test.
   * @param {object} [opts] Options for the `QueuedTest` instance.
   * @returns {object} `this`
   */
  addTest(filename, opts={})
  {
    const queued = new QueuedTest(this, filename, opts);
    this.queue.push(queued);
    return this;
  }

  /**
   * Add an entire folder of tests.
   * 
   * This method may not be implemented by all
   * Harness Plugins. Your mileage may vary.
   * 
   * @param {string} dir - The directory name/path
   * @param {object} [opts] Options 
   * @returns {object} `this`
   */
  addDir(dir, opts={})
  {
    if (typeof this.plugin.addDir === F)
    {
      this.plugin.addDir(dir, opts);
    }
    else 
    {
      console.warn("The plugin does not support addDir()");
    }
    return this;
  }

  /**
   * Run all the queued tests
   * 
   * @param {boolean} [plan=true] Set a test plan for the entire suite 
   * @returns {object} `this`
   */
  run(plan=true)
  {
    if (plan)
    {
      this.testSuite.plan(this.queue.length);
    }

    for (const queued of this.queue)
    {
      this.runTest(queued);
    }

    this.testSuite.done();

    return this;
  }

  runTest(queued)
  {
    const name = queued.filename;
    let test;

    try 
    { 
      test = this.plugin.run(queued);
    }
    catch (err)
    {
      test = err;
    }

    this.addStats(queued, test);

    if (typeof test === Error)
    { // Something went wrong.
      this.testSuite.fail(name, test);
    }
    else
    { // Evaluate if the test is successful or not.
      const ok = this.plugin.ok(test);
      if (typeof ok === B)
      { // A simple boolean response
        this.testSuite.ok(ok, name);
      }
      else if (ok instanceof Error)
      { // An error was returned
        this.testSuite.fail(name, ok);
      }
      else 
      { // This should never happen...
        throw new Error("Invalid result from plugin.ok() !!");
      }
    }

    return this;
  }

  tap()
  {
    return this.testSuite.tap();
  }

  get TAP()
  {
    return this.tap();
  }

} // Harness class

def(LumTestsHarness, 'Plugin', Plugin);
def(LumTestsHarness, 'QueuedTest', QueuedTest);
def(LumTestsHarness, 'Errors', require('./errors'));

// Export it.
module.exports = LumTestsHarness;

// Some classes required at end for recursive sanity reasons.

const Stats = require('../test/stats');
