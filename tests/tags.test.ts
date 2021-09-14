import { createFlag, testCreateFeature, sleep } from './feature.helper';

it('should only evaluate matching tags', async () => {
  const { flag: local } = await createFlag(['local']);
  const { flag: dev } = await createFlag(['dev']);
  await sleep(3000);
  const feature = testCreateFeature({ tags: ['local'] });

  expect(await feature.match(local.key)).toBe(true);
  expect(await feature.match(dev.key)).toBe(false);
});

it('should be any by default', async () => {
  const { flag: a1 } = await createFlag(['a', 'a.1']);
  const { flag: a2 } = await createFlag(['a', 'a.2']);
  await sleep(3000);
  const feature = testCreateFeature({ tags: ['a', 'a.1'] });

  expect(await feature.match(a1.key)).toBe(true);
  expect(await feature.match(a2.key)).toBe(true);
});

it('should be any by default', async () => {
  const { flag: a1 } = await createFlag(['a', 'a.1']);
  const { flag: a2 } = await createFlag(['a', 'a.2']);
  await sleep(3000);
  const feature = testCreateFeature({ tags: ['a', 'a.1'], tagOperator: 'ALL' });

  expect(await feature.match(a1.key)).toBe(true);
  expect(await feature.match(a2.key)).toBe(false);
});
