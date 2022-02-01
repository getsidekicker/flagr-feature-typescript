import { NonEmptyArray } from './types';
import {
  createFlag,
  testCreateEvaluator,
  sleep,
  randomString,
} from './test-helper';

it('should maintain id stickiness', async () => {
  const evaluator = testCreateEvaluator();
  const id = randomString();
  const tags: NonEmptyArray<string> = [randomString()];
  // 50% 'on'/ 50% off distribution
  const { flag } = await createFlag(tags, 50);
  await sleep(3000);

  const evaluationSets = (
    await Promise.all(
      [() => id, () => randomString()].map(async (idGenerator) =>
        Promise.all(
          [...Array(10).keys()].map(() =>
            evaluator.batchEvaluation({
              id: idGenerator(),
              context: {},
              input: { tags },
            })
          )
        )
      )
    )
  ).map(
    (set) => new Set(set.map((r) => JSON.stringify(r.results.get(flag.key))))
  );

  // Set with consistent entityId - should either be entirely 'on' or 'off'
  expect(evaluationSets[0].size).toBe(1);
  // Set with random entityId – should evenly distribute between 'on' and 'off'
  expect(evaluationSets[1].size).toBe(2);
});
