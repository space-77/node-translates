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
const utils_1 = require("./utils");
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
        Bing.authInfo = { ig, iid, key, token, count: 0 };
        return Bing.authInfo;
    }
}
function getLanguage(language) {
    switch (language) {
        case config_1.Languages.ZH:
            return 'zh-Hans';
        case config_1.Languages.EN:
            return 'en';
        case config_1.Languages.RU:
            return 'ru';
        case config_1.Languages.JP:
            return 'ja';
        case config_1.Languages.KOR:
            return 'ko';
        case config_1.Languages.DE:
            return 'de';
        case config_1.Languages.FRA:
            return 'fr';
    }
}
// export default async function bingTranslator(texts: string | string[]) {
async function bingTranslator(dataList) {
    const proms = dataList.map(async ([fromTo, value]) => {
        try {
            const { ig, iid, key, token, count } = await Bing.getAuthInfo();
            const text = value.map(i => i.text.replace(/\r?\n/g, config_1.SPLIT_ENTER)).join(config_1.JOIN_STR);
            const [fromLang, to] = fromTo.split('_').map(i => getLanguage(i));
            const form = { text, key, token, to, fromLang };
            const options = { headers: (0, common_1.getApiHeaders)(common_1.default.url), form };
            const url = `${common_1.default.translator}?isVertical=1&IG=${ig}&IID=${iid}${count + 1}`;
            const [{ translations }] = (await client_1.default.post(url, options).json());
            Bing.authInfo.count++;
            const textEn = translations[0].text;
            textEn.split(config_1.SPLIT_STR).map((i, index) => {
                const textItem = value[index];
                textItem.resolve({ text: (0, utils_1.restoreEnter)(textItem.text), dst: (0, utils_1.restoreEnter)(i) });
            });
        }
        catch (error) {
            console.error(error);
            throw new Error('translate fail');
        }
    });
    await Promise.all(proms);
}
exports.default = bingTranslator;
