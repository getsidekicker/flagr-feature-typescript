import {
  EvaluationApi,
  EvaluationBatchRequest,
  EvaluationBatchRequestFlagTagsOperatorEnum,
  EvaluationEntity,
  createConfiguration,
  ServerConfiguration,
} from "flagr-client";

export interface FlagCallbacks<T> {
  [key: string]: (attachment?: JsonObject) => T | Promise<T>;
}

type Json = string | number | boolean | null | JsonArray | JsonObject;

type JsonArray = Array<Json>;

type JsonObject = {
  [key: string]: Json;
};

export interface Variant {
  key: string | null;
  attachment: JsonObject | null;
}

const nullVariant: Variant = {
  key: null,
  attachment: null,
};

export interface Config {
  flagrUrl: string;
  tags?: string[];
  tagOperator?: EvaluationBatchRequestFlagTagsOperatorEnum;
}

export function createFeature(config: Config) {
  return new Feature(config);
}

export class Feature {
  private context: JsonObject = {};
  private evaluationResults: Map<string, Variant> = new Map();
  private api: EvaluationApi;

  constructor(private config: Config) {
    this.api = new EvaluationApi(
      createConfiguration({
        baseServer: new ServerConfiguration<{}>(
          `${this.config.flagrUrl}/api/v1`,
          {}
        ),
      })
    );
  }

  setContext(context: JsonObject) {
    this.context = context;
    this.evaluationResults = new Map();
  }

  addContext(context: JsonObject) {
    this.setContext({ ...this.context, ...context });
  }

  async match(flag: string, matchVariant: string = "on") {
    const callbacks = { otherwise: async () => false };
    callbacks[matchVariant] = async () => true;
    return this.evaluate<boolean>(flag, callbacks);
  }

  async evaluate<T>(flag: string, callbacks: FlagCallbacks<T>) {
    const { key, attachment } = await this.performEvaluation(flag);
    const callback =
      callbacks[key] || callbacks["otherwise"] || (() => undefined);

    return callback(attachment);
  }

  async performEvaluation(flag: string) {
    if (!this.evaluationResults.has(flag)) {
      const evaluationBatchRequest = new EvaluationBatchRequest();
      const evaluationEntity = new EvaluationEntity();

      evaluationEntity.entityContext = this.context;
      evaluationBatchRequest.entities = [evaluationEntity];

      if (this.config.tags?.length) {
        evaluationBatchRequest.flagTags = this.config.tags;
        evaluationBatchRequest.flagTagsOperator =
          this.config.tagOperator || "ANY";
      } else {
        evaluationBatchRequest.flagKeys = [flag];
      }

      const evaluationResult = await this.api.postEvaluationBatch(
        evaluationBatchRequest
      );

      evaluationResult.evaluationResults.forEach((value) =>
        this.evaluationResults.set(value.flagKey, {
          key: value.variantKey,
          attachment: value.variantAttachment,
        })
      );
    }

    this.evaluationResults.set(
      flag,
      this.evaluationResults.get(flag) || nullVariant
    );

    return this.evaluationResults.get(flag);
  }
}
