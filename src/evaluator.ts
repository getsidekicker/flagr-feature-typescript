import {
  createConfiguration,
  EvaluationApi,
  EvaluationBatchRequest,
  EvaluationEntity,
  ServerConfiguration,
} from 'flagr-client';
import { Config, EvaluationContext, FlagCallbacks, FlagVariant } from './types';

export class Evaluator {
  private api: EvaluationApi;

  constructor(public config: Config) {
    this.api = new EvaluationApi(
      createConfiguration({
        baseServer: new ServerConfiguration<{}>(
          `${this.config.flagrUrl}/api/v1`,
          {}
        ),
      })
    );
  }

  private async flagrEvaluation(evaluationContext: EvaluationContext) {
    const results = new Map<string, FlagVariant>();
    const { input, context } = evaluationContext;
    const evaluationBatchRequest = new EvaluationBatchRequest();
    const evaluationEntity = new EvaluationEntity();

    evaluationEntity.entityContext = context;
    evaluationBatchRequest.entities = [evaluationEntity];

    if ('tags' in input) {
      evaluationBatchRequest.flagTags = input.tags;
      evaluationBatchRequest.flagTagsOperator = input.tagOperator || 'ANY';
    } else {
      evaluationBatchRequest.flagKeys = input.flags;
    }

    const evaluationResult = await this.api.postEvaluationBatch(
      evaluationBatchRequest
    );

    evaluationResult.evaluationResults.forEach((value) =>
      results.set(value.flagKey, {
        flag: value.flagKey,
        key: value.variantKey,
        attachment: value.variantAttachment,
      })
    );

    return results;
  }

  async batchEvaluation(evaluationContext: EvaluationContext) {
    const results = await this.flagrEvaluation(evaluationContext);
    const cachedEvaluate = <T>(
      flag: string,
      callbacks: FlagCallbacks<T>
    ): T | undefined => {
      const { key, attachment } = results.get(flag) || {
        flag,
        key: null,
        attachment: null,
      };
      const callback =
        callbacks[key] || callbacks.otherwise || (() => undefined);

      return callback(attachment);
    };

    return {
      results,
      cachedEvaluate,
      cachedMatch: (flag: string, matchVariant: string = 'on') =>
        cachedEvaluate<boolean>(flag, {
          otherwise: () => false,
          [matchVariant]: () => true,
        }),
    };
  }
}

export const createEvaluator = (config: Config) => new Evaluator(config);
