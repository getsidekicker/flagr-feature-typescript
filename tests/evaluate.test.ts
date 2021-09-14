import { Feature } from '../src/feature';
import {
  testCreateFeature,
  createFlag,
  randomString,
  sleep,
} from './feature.helper';

it('should be defined', () => {
  const feature = testCreateFeature();
  expect(feature).toBeDefined();
  expect(feature).toBeInstanceOf(Feature);
});

it('should evaluate to on', async () => {
  const { flag } = await createFlag();
  await sleep(3000);
  const on = await testCreateFeature().evaluate<boolean>(flag.key, {
    on: () => true,
  });
  expect(on).toBe(true);
});

it('should evaluate to otherwise', async () => {
  const otherwise = await testCreateFeature().evaluate<boolean>(
    randomString(),
    {
      otherwise: () => true,
    }
  );
  expect(otherwise).toBe(true);
});
