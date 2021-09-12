import {
  EvaluationApi,
  EvaluationBatchRequest,
  EvaluationBatchRequestFlagTagsOperatorEnum,
  EvaluationEntity,
  createConfiguration,
  ServerConfiguration,
} from "flagr-client";

export interface FlagCallbacks {
  [key: string]: (...args: any) => Promise<any>;
}

export interface Variant {
  key: string | null;
  attachment: any | null;
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
  private _context: Object = {};
  private _evaluationResults: Map<string, Variant> = new Map();
  private _api: EvaluationApi;

  constructor(private _config: Config) {
    this._api = new EvaluationApi(
      createConfiguration({
        baseServer: new ServerConfiguration<{}>(
          `${this._config.flagrUrl}/api/v1`,
          {}
        ),
      })
    );
  }

  setContext(context: Object) {
    this._context = context;
    this._evaluationResults = new Map();
  }

  addContext(context: Object) {
    this.setContext({ ...this._context, context });
  }

  async match(flag: string, matchVariant: string = "on") {
    const callbacks = { otherwise: async () => false };
    callbacks[matchVariant] = async () => true;
    return await this.evaluate(flag, callbacks);
  }

  async evaluate(flag: string, callbacks: FlagCallbacks) {
    const { key, attachment } = await this.performEvaluation(flag);
    const callback =
      callbacks[key] ||
      callbacks["otherwise"] ||
      async function () {
        return undefined;
      };

    return await callback(attachment);
  }

  async performEvaluation(flag: string) {
    if (!this._evaluationResults.has(flag)) {
      const evaluationBatchRequest = new EvaluationBatchRequest();
      const evaluationEntity = new EvaluationEntity();

      evaluationEntity.entityContext = this._context;
      evaluationBatchRequest.entities = [evaluationEntity];

      if (this._config.tags?.length) {
        evaluationBatchRequest.flagTags = this._config.tags;
        evaluationBatchRequest.flagTagsOperator =
          this._config.tagOperator || "ANY";
      } else {
        evaluationBatchRequest.flagKeys = [flag];
      }

      const evaluationResult = await this._api.postEvaluationBatch(
        evaluationBatchRequest
      );

      evaluationResult.evaluationResults.forEach((value) =>
        this._evaluationResults.set(value.flagKey, {
          key: value.variantKey,
          attachment: value.variantAttachment,
        })
      );
    }

    this._evaluationResults.set(
      flag,
      this._evaluationResults.get(flag) || nullVariant
    );

    return this._evaluationResults.get(flag);
  }
}
