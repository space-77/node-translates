"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.iflyrecTranslator = exports.baiduTranslator = exports.bingTranslator = void 0;
const bing_1 = __importDefault(require("./bing"));
exports.bingTranslator = bing_1.default;
const baidu_1 = __importDefault(require("./baidu"));
exports.baiduTranslator = baidu_1.default;
const iflyrec_1 = __importDefault(require("./iflyrec"));
exports.iflyrecTranslator = iflyrec_1.default;
