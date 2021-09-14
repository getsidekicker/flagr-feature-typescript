import { EvaluationBatchRequestFlagTagsOperatorEnum } from 'flagr-client';

export type Json = string | number | boolean | null | JsonArray | JsonObject;

export type JsonObject = {
  [key: string]: Json;
};

export interface FlagCallbacks<T> {
  // eslint-disable-next-line no-unused-vars
  [key: string]: (attachment?: JsonObject) => T | Promise<T>;
}

export type JsonArray = Array<Json>;

export interface FlagVariant {
  flag: string;
  key: string | null;
  attachment: JsonObject | null;
}

export type NonEmptyArray<T> = [T, ...T[]];

export interface Tags {
  tags: NonEmptyArray<string>;
  tagOperator?: EvaluationBatchRequestFlagTagsOperatorEnum;
}

export interface Flags {
  flags: NonEmptyArray<string>;
}

export interface EvaluationContext {
  context: JsonObject;
  input: Flags | Tags;
}

export interface Config {
  flagrUrl: string;
  tags?: string[];
  tagOperator?: EvaluationBatchRequestFlagTagsOperatorEnum;
}
