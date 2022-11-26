"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("./client"));
const config_1 = require("./config");
const common_1 = __importStar(require("./common"));
class Bing {
    static authInfo = null;
    static async getAuthInfo() {
        const { authInfo } = Bing;
        if (authInfo)
            return authInfo;
        const { body } = await client_1.default.get(common_1.default.url, { headers: (0, common_1.getHostHeaders)(common_1.default.url) });
        const { ig, iid } = (0, common_1.getHostInfo)(body);
        const { key, token } = (0, common_1.getToken)(body);
        Bing.authInfo = { ig, iid, key, token };
        return Bing.authInfo;
    }
}
async function bingTranslator(texts) {
    try {
        texts = Array.isArray(texts) ? texts : [texts];
        const { ig, iid, key, token } = await Bing.getAuthInfo();
        const text = texts.join(config_1.JOIN_STR);
        const form = { text, key, token, to: 'en', fromLang: 'zh-Hans' };
        const options = { headers: (0, common_1.getApiHeaders)(common_1.default.url), form };
        const url = `${common_1.default.translator}?isVertical=1&IG=${ig}&IID=${iid}${common_1.default.queryCount++}`;
        const [{ translations }] = (await client_1.default.post(url, options).json());
        const textEn = translations[0].text;
        return textEn.split(config_1.SPLIT_STR).map((i, index) => ({ zh: texts[index], en: i.trim() }));
    }
    catch (error) {
        console.error(error);
    }
}
exports.default = bingTranslator;
