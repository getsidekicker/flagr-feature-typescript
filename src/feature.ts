import { createEvaluator, Evaluator } from './evaluator';
import {
  Config,
  FlagCallbacks,
  Flags,
  FlagVariant,
  JsonObject,
  Tags,
} from './types';

export class Feature {
  private context: JsonObject = {};

  private results = new Map<string, FlagVariant>();

  private cachedMatch: (flag: string, matchVariant: string) => boolean;

  private cachedEvaluate: <T>(flag: string, callbacks: FlagCallbacks<T>) => T;

  constructor(private evaluator: Evaluator) {}

  setContext(context: JsonObject) {
    this.context = context;
    this.results = new Map<string, FlagVariant>();
  }

  async match(flag: string, matchVariant: string = 'on') {
    const { cachedMatch } = await this.performEvaluation(flag);
    return cachedMatch(flag, matchVariant);
  }

  async evaluate<T>(flag: string, callbacks: FlagCallbacks<T>) {
    const { cachedEvaluate } = await this.performEvaluation(flag);
    return cachedEvaluate(flag, callbacks);
  }

  private async performEvaluation(flag: string) {
    if (!this.results.has(flag)) {
      const { tags, tagOperator } = this.evaluator.config;
      Object.assign(
        this,
        await this.evaluator.batchEvaluation({
          context: this.context,
          input: tags?.length
            ? <Tags>{ tags, tagOperator: tagOperator || 'ANY' }
            : <Flags>{ flags: [flag] },
        })
      );
    }
    return {
      cachedMatch: this.cachedMatch,
      cachedEvaluate: this.cachedEvaluate,
    };
  }
}

export const createFeature = (config: Config) =>
  new Feature(createEvaluator(config));
