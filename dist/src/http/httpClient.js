"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.http = void 0;
exports.getJson = getJson;
const axios_1 = __importDefault(require("axios"));
const axios_retry_1 = __importDefault(require("axios-retry"));
exports.http = axios_1.default.create({
    timeout: 10_000,
    headers: {
        'user-agent': 'axiom-realtime-aggregator/0.1'
    }
});
(0, axios_retry_1.default)(exports.http, {
    retries: 3,
    retryDelay: axios_retry_1.default.exponentialDelay,
    retryCondition: (error) => {
        if (!error.response)
            return true; // network error
        const status = error.response.status;
        return status >= 500 || status === 429;
    }
});
async function getJson(url) {
    const res = await exports.http.get(url);
    return res.data;
}
