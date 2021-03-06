# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.4.0] - 2022-07-29
## Added
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

## Changed
- Enhanced a lot of docblocks.
- Updated anything using `types.stringify()` to support the depth setting.
- Updated `run()` so it can use either `call()` or `callIs()` as the underlying test method when using a custom `function` test.

### Added
- Configuration for JSDoc.
- A few module-level *docblocks*.
### Changed
- Updated `@lumjs/core` dependency to `^1.0.0` (no more *beta* tags!)
- Updated various *docblocks* for documentation.

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

[Unreleased]: https://github.com/supernovus/lum.tests.js/compare/v1.4.0...HEAD
[1.4.0]: https://github.com/supernovus/lum.tests.js/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/supernovus/lum.tests.js/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/supernovus/lum.tests.js/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/supernovus/lum.tests.js/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/supernovus/lum.tests.js/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/supernovus/lum.tests.js/releases/tag/v1.0.0

