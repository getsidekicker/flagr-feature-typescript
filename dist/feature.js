"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Feature = exports.createFeature = void 0;
const flagr_client_1 = require("flagr-client");
const nullVariant = {
    key: null,
    attachment: null,
};
function createFeature(config) {
    return new Feature(config);
}
exports.createFeature = createFeature;
class Feature {
    constructor(_config) {
        this._config = _config;
        this._context = {};
        this._evaluationResults = new Map();
        this._api = new flagr_client_1.EvaluationApi((0, flagr_client_1.createConfiguration)({
            baseServer: new flagr_client_1.ServerConfiguration(`${this._config.flagrUrl}/api/v1`, {}),
        }));
    }
    setContext(context) {
        this._context = context;
        this._evaluationResults = new Map();
    }
    addContext(context) {
        this.setContext(Object.assign(Object.assign({}, this._context), { context }));
    }
    match(flag, matchVariant = "on") {
        return __awaiter(this, void 0, void 0, function* () {
            const callbacks = { otherwise: () => false };
            callbacks[matchVariant] = () => true;
            return this.evaluate(flag, callbacks);
        });
    }
    evaluate(flag, callbacks) {
        return __awaiter(this, void 0, void 0, function* () {
            const { key, attachment } = yield this.performEvaluation(flag);
            const callback = callbacks[key] ||
                callbacks["otherwise"] ||
                function () {
                    return undefined;
                };
            return callback(attachment);
        });
    }
    performEvaluation(flag) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._evaluationResults.has(flag)) {
                const evaluationBatchRequest = new flagr_client_1.EvaluationBatchRequest();
                const evaluationEntity = new flagr_client_1.EvaluationEntity();
                evaluationEntity.entityContext = this._context;
                evaluationBatchRequest.entities = [evaluationEntity];
                if ((_a = this._config.tags) === null || _a === void 0 ? void 0 : _a.length) {
                    evaluationBatchRequest.flagTags = this._config.tags;
                    evaluationBatchRequest.flagTagsOperator =
                        this._config.tagOperator || "ANY";
                }
                else {
                    evaluationBatchRequest.flagKeys = [flag];
                }
                const evaluationResult = yield this._api.postEvaluationBatch(evaluationBatchRequest);
                evaluationResult.evaluationResults.forEach((value) => this._evaluationResults.set(value.flagKey, {
                    key: value.variantKey,
                    attachment: value.variantAttachment,
                }));
            }
            this._evaluationResults.set(flag, this._evaluationResults.get(flag) || nullVariant);
            return this._evaluationResults.get(flag);
        });
    }
}
exports.Feature = Feature;
