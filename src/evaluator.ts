import {
  createConfiguration,
  EvaluationApi,
  EvaluationBatchRequest,
  EvaluationEntity,
  ServerConfiguration,
} from 'flagr-client';
import {
  Config,
  EvaluationContext,
  FlagCallbacks,
  Flags,
  FlagVariant,
  Tags,
} from './types';

export default class Evaluator {
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

  async batchEvaluation(evaluationContext: EvaluationContext) {
    const results = new Map<string, FlagVariant>();
    const { input, context } = evaluationContext;
    const evaluationBatchRequest = new EvaluationBatchRequest();
    const evaluationEntity = new EvaluationEntity();

    evaluationEntity.entityContext = context;
    evaluationBatchRequest.entities = [evaluationEntity];

    if ((input as Tags).tags) {
      evaluationBatchRequest.flagTags = (input as Tags).tags;
      evaluationBatchRequest.flagTagsOperator =
        (input as Tags).tagOperator || 'ANY';
    } else {
      evaluationBatchRequest.flagKeys = (input as Flags).flags;
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

  async wrappedBatchEvaluation(evaluationContext: EvaluationContext) {
    const results = await this.batchEvaluation(evaluationContext);
    const cachedEvaluate = <T>(flag: string, callbacks: FlagCallbacks<T>) => {
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
      cachedMatch: (flag: string, matchVariant: string = 'on') => {
        const callbacks = { otherwise: () => false };
        callbacks[matchVariant] = () => true;
        return cachedEvaluate<boolean>(flag, callbacks);
      },
    };
  }
}
