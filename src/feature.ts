import {
  EvaluationApi,
  EvalContext,
  EvaluationBatchRequest,
  EvaluationBatchRequestFlagTagsOperatorEnum,
  EvaluationEntity,
} from "flagr-typescript";

export interface FlagCallbacks {
  [key: string]: Function;
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
  tags: string[];
  tagOperator: EvaluationBatchRequestFlagTagsOperatorEnum;
}

export class Feature {
  private _context: Array<any> = [];
  private _evaluationResults: Map<string, Variant> = new Map();
  constructor(private _api: EvaluationApi, private _config: Config) {}

  setContext(context: EvalContext[]) {
    this._context = context;
    this._evaluationResults = new Map();
  }

  addContext(context: EvalContext) {
    this.setContext([...this._context, context]);
  }

  async match(flag: string) {
    let match = false;
    await this.evaluate(flag, { flag: () => (match = true) });
    return match;
  }

  async evaluate(flag: string, callbacks: FlagCallbacks) {
    const { key, attachment } = await this.performEvaluation(flag);
    const callback =
      callbacks[flag] ||
      callbacks["otherwise"] ||
      function (attachment: any) {
        return false;
      };

    callback(attachment);
  }

  async performEvaluation(flag: string) {
    if (!this._evaluationResults.has(flag)) {
      const evaluationBatchRequest = new EvaluationBatchRequest();
      const evaluationEntity = new EvaluationEntity();
      evaluationEntity.entityContext = this._context;
      evaluationBatchRequest.entities = [evaluationEntity];
      if (this._config.tags.length) {
        evaluationBatchRequest.flagTags = this._config.tags;
        evaluationBatchRequest.flagTagsOperator = this._config.tagOperator;
      } else {
        evaluationBatchRequest.flagKeys = [flag];
      }

      const evaluationResult = await this._api.postEvaluationBatch(
        evaluationBatchRequest
      );

      evaluationResult.evaluationResults.forEach((value) =>
        this._evaluationResults.set(value.variantKey, {
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
