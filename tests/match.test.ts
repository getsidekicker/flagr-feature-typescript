import { createFlag, featureFlag, randomString } from "./feature.helper";

it("should match", async () => {
  const { flag } = await createFlag();
  const match = await featureFlag().match(flag.key);
  expect(match).toBe(true);
});

it("should not match", async () => {
  const match = await featureFlag().match(randomString());
  expect(match).toBe(false);
});
