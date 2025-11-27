import Tests from '../lib/index.js';

const plan = 1;
export const test = Tests.new({module: import.meta, plan});
test.is(test.id, 'esm_export_test', 'export const test');
test.done();
