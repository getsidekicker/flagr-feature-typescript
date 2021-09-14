import { NonEmptyArray } from '../src/types';
import {
  createFlag,
  testCreateEvaluator,
  sleep,
  randomString,
} from './feature.helper';

it('should match', async () => {
  const evaluator = testCreateEvaluator();
  const tags: NonEmptyArray<string> = [randomString()];
  const { flag } = await createFlag(tags);
  await sleep(3000);
  const { cachedMatch } = await evaluator.batchEvaluation({
    context: {},
    input: { tags },
  });

  expect(cachedMatch(flag.key)).toBe(true);
});

it('should evaluate', async () => {
  const evaluator = testCreateEvaluator();
  const tags: NonEmptyArray<string> = [randomString()];
  const { flag } = await createFlag(tags);
  await sleep(3000);
  const { cachedEvaluate } = await evaluator.batchEvaluation({
    context: {},
    input: { tags },
  });

  expect(cachedEvaluate(flag.key, { on: () => true })).toBe(true);
});

it('should be cached', async () => {
  const evaluator = testCreateEvaluator();
  const tags: NonEmptyArray<string> = [randomString()];
  const { flag } = await createFlag(tags);
  await sleep(3000);
  const { flag: flag2 } = await createFlag(tags);
  await sleep(3000);
  const { cachedMatch } = await evaluator.batchEvaluation({
    context: {},
    input: { tags },
  });

  expect(cachedMatch(flag.key)).toBe(true);
  expect(cachedMatch(flag2.key)).toBe(false);

  const { cachedMatch: refreshCachedMatch } = await evaluator.batchEvaluation({
    context: {},
    input: { tags },
  });

  expect(cachedMatch(flag.key)).toBe(true);
  expect(cachedMatch(flag2.key)).toBe(false);
  expect(refreshCachedMatch(flag.key)).toBe(true);
  expect(refreshCachedMatch(flag2.key)).toBe(true);
});
