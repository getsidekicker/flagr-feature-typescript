import { createFlag, featureFlag, randomString, sleep } from './feature.helper';

it('should match', async () => {
  const { flag } = await createFlag();
  await sleep(3000);
  const match = await featureFlag().match(flag.key);
  expect(match).toBe(true);
});

it('should not match', async () => {
  const match = await featureFlag().match(randomString());
  expect(match).toBe(false);
});
