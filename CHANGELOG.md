# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

In this document, an identifier of `@tests` is not a real package name, but a 
shorthand form for the real package name of `@lumjs/tests`.
So a reference to an exported sub-module will be in `@tests/submodule` format,
and a reference to a property of a module will be in `@tests.propName` format.

## [Unreleased]

## [1.8.0] - 2023-01-06
### Changed
- Bumped `@lumjs/core` to `1.8.0`.
- Moved away from `ModuleBuilder` which I've discontinued.
- Changed how `@lumjs/core/modules` is loaded due to upstream changes.

## [1.7.1] - 2022-10-18
### Changed
- Bumped `@lumjs/core` to `1.7.1`.
- Moved from custom lazy-loading to `ModuleBuilder`.

## [1.7.0] - 2022-09-29
#### The *harness* update
### Added
- Implemented `tests.Harness` library.
- Added a `Tap` grammar using the `peggy` library.
- Added `.npmignore` file, separate from `.gitignore`.
  - The grammar source is ignored by `npm`, but kept in `git`.
  - The compiled grammar is ignored by `git`, but kept in `npm`. 
- Added `bin/build-grammar.sh` developer-only helper.
- Added `bin/lumtest.js` package CLI script.
- Using `lumtest.js` instead of `prove` for `npm test` now.
### Changed
- Split `Test` class into `Stats` (test stats) and `Test` (actual testing methods.)
- A bunch of restructuring of the internal files:
  - `test.js` → `test/index.js`, `test/stats.js`
  - `log.js` → `test/log.js`
  - `functional.js` → `test/functional.js` 
  - `harness.js` → `harness/index.js`
- Made the default module use *lazy-loading* for anything other than `tests.Test`.

## [1.6.0] - 2022-09-12
#### The *sub-classes* update
### Added
- `Test.new()` works like the `@lumjs/tests.new()`, but uses `this` so it's sub-classable.
- `Test.static()`, calls `@lumjs/tests.functional()`, and passes `this` as the `testClass`.
- `Test#TAP`, read-only accessor alias to `Test#tap()`.
- `Test.$METHODS.$meta`, a list of properties to skip in `$METHODS.all` output.
- `Test.$METHODS.extend()`, allow `Test` *sub-classes* to build upon the `$METHODS`
  without changing the list in the original `Test` class.
### Changed
- Reworked a bunch of the DocBlocks to make the docs better.
- Modified the `functional()` method to accept a `testClass` parameter.
  This allows *sub-classes* to make their own functional APIs.
- Changed `Log.tap()` to make the `details` structure more flexible.
  The `wanted` property is now optional.
- The `Test` class saves the test method list for `call()` into `this.$testMethods`
  instead of using the `.$METHODS.test` directly.
### Fixed
- Added some missing functions to the registered list of test methods.

## [1.5.0] - 2022-08-30
### Added
- Sample `data` used in some of the old tests.
### Fixed
- Mistakes in the changelog. 

## [1.4.0] - 2022-07-29
### Added
- Configuration for JSDoc.
- A few module-level *docblocks*.
- Explicit `exports` section in `package.json` file.
- Added `test.done()` method to be used instead of `test.output()`.
- Added ability to configure the stringify depth.
- Added ability to detect if the script was ran directly.
- Added ability to check for a top-level `Harness` instance.
- Added four new *binary flag* comparitor tests to `cmp()` method.
- Added `not` alias for `!==` comparitor.
- Added `matches` method for using a regular expression to match a string.
- Added `callIs()` method that is like `call()` but takes a desired value and passes the function return value to `cmp()`, `isa()`, or other test methods.
- A new `test.ran` computed property.
### Changed
- Updated `@lumjs/core` dependency to `^1.0.0` (no more *beta* tags!)
- Updated various *docblocks* for documentation.
- Enhanced a lot of docblocks.
- Updated anything using `types.stringify()` to support the depth setting.
- Updated `run()` so it can use either `call()` or `callIs()` as the underlying test method when using a custom `function` test.

## [1.3.0] - 2022-07-27
### Added
- `$call()` function; powers `call()`, `lives()`, `dies()`, and `diesWith()`. 
- `call()` method; test the result of a function call.
- `diesWith()` method; like `dies()` but also tests the thrown `Error`.
- `run()` method; for running a bunch of similar tests with a compact syntax.
### Changed
- How `functional` gets its list of test methods to proxy.
- Cleaned up a bunch of stuff in the `Log` class.
- Added a `details.info` structure to the `Log` class.
- Refactored `lives()` and `dies()` to use the new `$call()` function.
- Updated `ok()` to support passing `details` to it directly.
- Some further cleanups in the `Test` class.

## [1.2.0] - 2022-07-26
### Added
- `lives()` method; the inverse of `dies()`.
- `nota()` method; the inverse of `isa()`.
- `isntJSON()` method; the inverse of `isJSON()`.
- Tests for `isa()`, `isJSON()`, and all the new methods.
### Changed
- `isa()` uses `core.types.isa()` method now.
- `isa()` supports multiple `wants` values, just use an Array.
- Anything that used `JSON.stringify()` now uses `core.types.stringify()`.

## [1.1.1] - 2022-07-15
### Fixed
- Dependency issue in `package.json` with pre-release parent.
### Added
- A temporary `npm test` script using the `prove` utility from Perl 5.

## [1.1.0] - 2022-07-08
### Fixed
- Changelog had wrong URLs.
### Changed
- Renamed `src` to `lib` like `@lumjs/core` did.
- Moved `index.js` into `lib` and updated `package.json` to reflect that.
- Updated all the tests to use the new paths.
- Changed `Test` constructor to support a bunch of options.
  - `id` option will be used in the future.
  - `plan` option replaces the old `plan` pararameter.
  - `module` option will assign the test instance to `opts.module.exports`.
  - `module` can also auto-generate an `id` if one was not passed.
  - `moduleName` is used for the automatic `id` generation.
- Updated `functional()` and `new()` to pass their options to the constructor.

## [1.0.0] - 2022-06-22
### Added
- Ported from Lum.js v4 library set.
- Added a few more features from the PHP version.

[Unreleased]: https://github.com/supernovus/lum.tests.js/compare/v1.8.0...HEAD
[1.8.0]: https://github.com/supernovus/lum.tests.js/compare/v1.7.1...v1.8.0
[1.7.1]: https://github.com/supernovus/lum.tests.js/compare/v1.7.0...v1.7.1
[1.7.0]: https://github.com/supernovus/lum.tests.js/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/supernovus/lum.tests.js/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/supernovus/lum.tests.js/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/supernovus/lum.tests.js/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/supernovus/lum.tests.js/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/supernovus/lum.tests.js/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/supernovus/lum.tests.js/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/supernovus/lum.tests.js/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/supernovus/lum.tests.js/releases/tag/v1.0.0

