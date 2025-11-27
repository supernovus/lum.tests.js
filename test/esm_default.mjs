import Tests from '../lib/index.js';

const plan = 1;
const test = Tests.new({module: import.meta, plan});
test.is(test.id, 'esm_default', 'export default test');
test.done();

export default test;
