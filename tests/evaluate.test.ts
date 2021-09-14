import { Feature } from '../src/feature';
import { featureFlag, createFlag, randomString, sleep } from './feature.helper';

it('should be defined', () => {
  const feature = featureFlag();
  expect(feature).toBeDefined();
  expect(feature).toBeInstanceOf(Feature);
});

it('should evaluate to on', async () => {
  const { flag } = await createFlag();
  await sleep(3000);
  const on = await featureFlag().evaluate<boolean>(flag.key, {
    on: () => true,
  });
  expect(on).toBe(true);
});

it('should evaluate to otherwise', async () => {
  const otherwise = await featureFlag().evaluate<boolean>(randomString(), {
    otherwise: () => true,
  });
  expect(otherwise).toBe(true);
});
