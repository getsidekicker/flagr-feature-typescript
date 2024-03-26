import { NonEmptyArray } from './types';
import {
  createFlag,
  testCreateEvaluator,
  sleep,
  randomString,
} from './test-helper';

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

describe('should not match', () => {
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
    const { cachedMatch } = await evaluator.batchEvaluation({
      context: {},
      input: { tags },
    });
    const { flag: flag2 } = await createFlag(tags);
    await sleep(3000);

    expect(cachedMatch(flag.key)).toBe(true);
    expect(cachedMatch(flag2.key)).toBe(false);

    const { cachedMatch: refreshCachedMatch } = await evaluator.batchEvaluation(
      {
        context: {},
        input: { tags },
      }
    );

    expect(cachedMatch(flag.key)).toBe(true);
    expect(cachedMatch(flag2.key)).toBe(false);
    expect(refreshCachedMatch(flag.key)).toBe(true);
    expect(refreshCachedMatch(flag2.key)).toBe(true);
  });

  it('should have undefined key and attachment when variant does not exist', async () => {
    const evaluator = testCreateEvaluator();
    const tags: NonEmptyArray<string> = [randomString()];
    await createFlag(tags);
    await sleep(3000);
    const { cachedVariant } = await evaluator.batchEvaluation({
      context: {},
      input: { tags },
    });

    const nonExistentString = randomString();
    expect(cachedVariant(nonExistentString).flag).toBe(nonExistentString);
    expect(cachedVariant(nonExistentString).key).toBe(undefined);
    expect(cachedVariant(nonExistentString).attachment).toBe(undefined);
  });

  it('should have undefined key and attachment when no variant available', async () => {
    const evaluator = testCreateEvaluator();
    const tags: NonEmptyArray<string> = [randomString()];
    await createFlag(tags, 0);
    await sleep(3000);
    const { results } = await evaluator.batchEvaluation({
      context: {},
      input: { tags },
    });

    const variant = results.get(tags[0]);
    expect(variant?.key).toBe(undefined);
    expect(variant?.attachment).toBe(undefined);
  });
});
