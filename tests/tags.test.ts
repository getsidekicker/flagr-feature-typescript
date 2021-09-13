import { createFlag, featureFlag, randomString } from "./feature.helper";

it("should only evaluate matching tags", async () => {
  const { flag: local } = await createFlag(["local"]);
  const { flag: dev } = await createFlag(["dev"]);
  const feature = featureFlag({ tags: ["local"] });

  expect(await feature.match(local.key)).toBe(true);
  expect(await feature.match(dev.key)).toBe(false);
});
