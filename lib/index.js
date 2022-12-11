"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Languages = exports.TranslateNames = exports.iflyrecTranslator = exports.baiduTranslator = exports.bingTranslator = void 0;
const bing_1 = __importDefault(require("./bing"));
const baidu_1 = __importDefault(require("./baidu"));
const iflyrec_1 = __importDefault(require("./iflyrec"));
const collect_1 = __importDefault(require("./collect"));
const config_1 = require("./config");
Object.defineProperty(exports, "TranslateNames", { enumerable: true, get: function () { return config_1.TranslateNames; } });
Object.defineProperty(exports, "Languages", { enumerable: true, get: function () { return config_1.Languages; } });
const collector = new collect_1.default();
function bingTranslator(info) {
    const key = config_1.TranslateNames.BING;
    collector.createCollect(key, bing_1.default, 500);
    return collector.addTranslate(info, key);
}
exports.bingTranslator = bingTranslator;
function baiduTranslator(info) {
    const key = config_1.TranslateNames.BAIDU;
    collector.createCollect(key, baidu_1.default, 1000);
    return collector.addTranslate(info, key);
}
exports.baiduTranslator = baiduTranslator;
function iflyrecTranslator(info) {
    const key = config_1.TranslateNames.IFLYREC;
    collector.createCollect(key, iflyrec_1.default);
    return collector.addTranslate(info, key);
}
exports.iflyrecTranslator = iflyrecTranslator;
