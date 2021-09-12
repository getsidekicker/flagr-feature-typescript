import { createFlag, featureFlag, randomString } from "./feature.helper";

it("should only evaluate matching tags", async () => {
  const { flag: local } = await createFlag(["local"]);
  const { flag: dev } = await createFlag(["dev"]);
  const otherwise = await featureFlag({ tags: ["local"] }).evaluate(
    randomString(),
    {
      otherwise: async () => {
        return true;
      },
    }
  );
  expect(otherwise).toBe(true);
});
