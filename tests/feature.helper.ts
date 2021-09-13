import { EvaluationBatchRequestFlagTagsOperatorEnum } from "flagr-client";
import {
  createConfiguration,
  CreateFlagRequest,
  FlagApi,
  TagApi,
  VariantApi,
  ServerConfiguration,
  CreateTagRequest,
  CreateVariantRequest,
  SegmentApi,
  CreateSegmentRequest,
  DistributionApi,
  PutDistributionsRequest,
  SetFlagEnabledRequest,
} from "flagr-client";
import { createFeature } from "../src/feature";

const baseServer = new ServerConfiguration<{}>(
  "http://localhost:18000/api/v1",
  {}
);
const configuration = createConfiguration({ baseServer });

interface Config {
  tags?: string[];
  tagOperator?: EvaluationBatchRequestFlagTagsOperatorEnum;
}

export const featureFlag = (config?: Config) =>
  createFeature({ ...(config || {}), flagrUrl: "http://localhost:18000" });

export const randomString = () =>
  Math.random()
    .toString(36)
    .replace(/[^a-z0-9]+/g, "");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const createFlag = async (tags: string[] = []) => {
  const flagApi = new FlagApi(configuration);
  const tagApi = new TagApi(configuration);
  const variantApi = new VariantApi(configuration);
  const segmentApi = new SegmentApi(configuration);
  const distributionApi = new DistributionApi(configuration);

  const idSuffix = randomString();
  const request = new CreateFlagRequest();

  request.description = `flag_${idSuffix}`;
  request.key = `flag_${idSuffix}`;
  const flag = await flagApi.createFlag(request);
  const enableFlag = new SetFlagEnabledRequest();
  enableFlag.enabled = true;
  await flagApi.setFlagEnabled(flag.id, enableFlag);
  const variantRequest = new CreateVariantRequest();
  variantRequest.key = "on";
  const variant = await variantApi.createVariant(flag.id, variantRequest);

  const segmentRequest = new CreateSegmentRequest();
  segmentRequest.description = "on";
  segmentRequest.rolloutPercent = 100;
  const segment = await segmentApi.createSegment(flag.id, segmentRequest);

  const distributionRequest = new PutDistributionsRequest();
  distributionRequest.distributions = [
    { percent: 100, variantID: variant.id, variantKey: variant.key },
  ];
  const distribution = await distributionApi.putDistributions(
    flag.id,
    segment.id,
    distributionRequest
  );

  //Need to wait for flags to become available
  await sleep(2000);

  return {
    flag,
    variant,
    segment,
    distribution,
    tags: await Promise.all(
      tags.map((tag) => {
        const tagRequest = new CreateTagRequest();
        tagRequest.value = tag;
        return tagApi.createTag(flag.id, tagRequest);
      })
    ),
  };
};
