import { Feature } from "../src/feature";
import { featureFlag, createFlag, randomString } from "./feature.helper";

it("should be defined", () => {
  const feature = featureFlag();
  expect(feature).toBeDefined();
  expect(feature).toBeInstanceOf(Feature);
});

it("should evaluate to on", async () => {
  const { flag } = await createFlag();
  const on = await featureFlag().evaluate<boolean>(flag.key, {
    on: async () => {
      return true;
    },
  });
  expect(on).toBe(true);
});

it("should evaluate to otherwise", async () => {
  const otherwise = await featureFlag().evaluate<boolean>(randomString(), {
    otherwise: async () => {
      return true;
    },
  });
  expect(otherwise).toBe(true);
});
