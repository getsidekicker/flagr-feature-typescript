import {
  Config,
  FlagCallbacks,
  Flags,
  FlagVariant,
  JsonObject,
  Tags,
} from './types';
import { createEvaluator, Evaluator } from './evaluator';

export class Feature {
  private id: string | undefined;

  private context: JsonObject = {};

  private results = new Map<string, FlagVariant>();

  private cachedMatch: (flag: string, matchVariant: string) => boolean;

  private cachedEvaluate: <T>(flag: string, callbacks: FlagCallbacks<T>) => T;

  private cachedVariant: (flag: string) => FlagVariant;

  constructor(private evaluator: Evaluator) {}

  setId(id: string) {
    this.id = id;
    this.reset();
  }

  setContext(context: JsonObject) {
    this.context = context;
    this.reset();
  }

  reset() {
    this.results = new Map<string, FlagVariant>();
  }

  async match(flag: string, matchVariant: string = 'on') {
    const { cachedMatch } = await this.performEvaluation(flag);
    return cachedMatch(flag, matchVariant);
  }

  async evaluate<T>(flag: string, callbacks: FlagCallbacks<T | undefined>) {
    const { cachedEvaluate } = await this.performEvaluation(flag);
    return cachedEvaluate(flag, callbacks);
  }

  async variant(flag: string) {
    const { cachedVariant } = await this.performEvaluation(flag);
    return cachedVariant(flag);
  }

  private async performEvaluation(flag: string) {
    if (!this.results.has(flag)) {
      const { tags, tagOperator } = this.evaluator.config;
      Object.assign(
        this,
        await this.evaluator.batchEvaluation({
          id: this.id,
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
      cachedVariant: this.cachedVariant,
    };
  }
}

export const createFeature = (config: Config) =>
  new Feature(createEvaluator(config));
