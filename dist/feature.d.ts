import { EvaluationBatchRequestFlagTagsOperatorEnum } from "flagr-client";
export interface FlagCallbacks {
    [key: string]: Function;
}
export interface Variant {
    key: string | null;
    attachment: any | null;
}
export interface Config {
    flagrUrl: string;
    tags?: string[];
    tagOperator?: EvaluationBatchRequestFlagTagsOperatorEnum | null;
}
export declare function createFeature(config: Config): Feature;
export declare class Feature {
    private _config;
    private _context;
    private _evaluationResults;
    private _api;
    constructor(_config: Config);
    setContext(context: Object): void;
    addContext(context: Object): void;
    match(flag: string, matchVariant?: string): Promise<any>;
    evaluate(flag: string, callbacks: FlagCallbacks): Promise<any>;
    performEvaluation(flag: string): Promise<Variant>;
}
