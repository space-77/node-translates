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
const got_cjs_1 = __importDefault(require("got-cjs"));
const common_1 = __importStar(require("./common"));
const tough_cookie_1 = require("tough-cookie");
const cookieJar = new tough_cookie_1.CookieJar();
const client = got_cjs_1.default.extend({ cookieJar });
async function init() {
    const { body } = await client.get(common_1.default.url, { cookieJar, headers: (0, common_1.getHeaders)(common_1.default.url) });
    const { ig, iid } = (0, common_1.getHostInfo)(body);
    const { key, token } = (0, common_1.getToken)(body);
    return { ig, iid, key, token };
}
async function bingTranslator(texts) {
    try {
        const { ig, iid, key, token } = await init();
        const text = Array.isArray(texts) ? texts.join('。。。') : texts;
        const form = { text, key, token, to: 'en', fromLang: 'zh-Hans' };
        const options = { cookieJar, headers: (0, common_1.getHeaders)(common_1.default.url, true), form };
        const url = `${common_1.default.translator}?isVertical=1&IG=${ig}&IID=${iid}`;
        const [{ translations }] = (await client.post(url, options).json());
        const textEn = translations[0].text;
        return textEn.split('...').map(i => i.trim());
    }
    catch (error) {
        console.error(error);
    }
}
exports.default = bingTranslator;
