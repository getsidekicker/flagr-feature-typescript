import { Feature } from './feature';
import {
  testCreateFeature,
  createFlag,
  randomString,
  sleep,
} from './test-helper';

describe('feature.evaluate', () => {
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
});

describe('feature.match', () => {
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
    const match = await feature.match(flag.key);
    expect(match).toBe(true);

    const { flag: flag2 } = await createFlag();
    await sleep(3000);
    const match2 = await feature.match(flag2.key);
    expect(match2).toBe(true);
  });

  it('should retrieve new tagged flags', async () => {
    const tag = randomString();
    const { flag } = await createFlag([tag]);
    const feature = testCreateFeature({ tags: [tag] });
    await sleep(3000);
    const match = await feature.match(flag.key);
    expect(match).toBe(true);

    const { flag: flag2 } = await createFlag([tag]);
    await sleep(3000);
    const match2 = await feature.match(flag2.key);
    expect(match2).toBe(true);
  });

  it('should not match', async () => {
    const match = await testCreateFeature().match(randomString());
    expect(match).toBe(false);
  });
});

describe('feature.tags', () => {
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
    const feature = testCreateFeature({
      tags: ['a', 'a.1'],
      tagOperator: 'ALL',
    });

    expect(await feature.match(a1.key)).toBe(true);
    expect(await feature.match(a2.key)).toBe(false);
  });
});
