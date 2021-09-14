import {
  createFlag,
  testCreateFeature,
  randomString,
  sleep,
} from './feature.helper';

it('should match', async () => {
  const { flag } = await createFlag();
  await sleep(3000);
  const match = await testCreateFeature().match(flag.key);
  expect(match).toBe(true);
});

it('should retrieve new flags', async () => {
  const { flag } = await createFlag();
  const feature = testCreateFeature();
  await sleep(3000);
  const match = feature.match(flag.key);
  expect(match).toBe(true);

  const { flag: flag2 } = await createFlag();
  await sleep(3000);
  const match2 = feature.match(flag2.key);
  expect(match2).toBe(true);
});

it('should retrieve new tagged flags', async () => {
  const tag = randomString();
  const { flag } = await createFlag([tag]);
  const feature = testCreateFeature({ tags: [tag] });
  await sleep(3000);
  const match = feature.match(flag.key);
  expect(match).toBe(true);

  const { flag: flag2 } = await createFlag([tag]);
  await sleep(3000);
  const match2 = feature.match(flag2.key);
  expect(match2).toBe(true);
});

it('should not match', async () => {
  const match = await testCreateFeature().match(randomString());
  expect(match).toBe(false);
});
