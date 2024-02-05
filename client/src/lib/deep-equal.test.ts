import {expect, test} from 'vitest';
import {deepEqual} from './deep-equal';

[
  [{}, {}, true],
  [undefined, {}, false],
  [{name: 'bob'}, {name: 'alice'}, false],
  [{name: 'bob'}, {name: 'bob'}, true],
  [{name: 'bob'}, {}, false],
  [{}, {name: 'bob'}, false],
  [{time: 123}, {time: 123}, true],
  [{stats: {time: 123}}, {stats: {time: 123}}, true],
  [{bar: 'foo'}, {bar: 123}, false],
  [{list: [1, 2, 3]}, {list: [2, 3, 4]}, false],
  [{list: [1, 2, 3]}, {list: [1, 2, 3]}, true],
  [{list: [{a: 'b'}, {c: 'd'}]}, {list: [{a: 'b'}, {c: 'd'}]}, true],
].forEach(([a, b, expected]) => {
  test('deepEqual', async () => {
    expect(
      deepEqual(a as Record<string, unknown>, b as Record<string, unknown>)
    ).toBe(expected);
  });
});
