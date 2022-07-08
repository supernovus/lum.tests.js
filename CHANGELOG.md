# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/supernovus/lum.tests.js/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/supernovus/lum.tests.js/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/supernovus/lum.tests.js/releases/tag/v1.0.0

