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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const qs_1 = __importDefault(require("qs"));
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const utils_1 = require("./utils");
const config_1 = require("./config");
const common_1 = __importStar(require("./common"));
class Bing {
    static getAuthInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const { authInfo } = Bing;
            if (authInfo)
                return authInfo;
            const { data: body } = yield axios_1.default.get(common_1.default.url, { headers: (0, common_1.getHostHeaders)(common_1.default.url) });
            const { ig, iid } = (0, common_1.getHostInfo)(body);
            const { key, token } = (0, common_1.getToken)(body);
            Bing.authInfo = { ig, iid, key, token, count: 0 };
            return Bing.authInfo;
        });
    }
}
Bing.authInfo = null;
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
function bingTranslator(dataList) {
    return __awaiter(this, void 0, void 0, function* () {
        const proms = dataList.map(([fromTo, value]) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { ig, iid, key, token, count } = yield Bing.getAuthInfo();
                const text = value.map(i => i.text.replace(/\r?\n/g, config_1.SPLIT_ENTER)).join(config_1.JOIN_STR);
                const [fromLang, to] = fromTo.split('_').map(i => getLanguage(i));
                const form = new form_data_1.default();
                form.append('to', to);
                form.append('key', key);
                form.append('text', text);
                form.append('token', token);
                form.append('fromLang', fromLang);
                const headers = (0, common_1.getApiHeaders)(common_1.default.url);
                const url = `${common_1.default.translator}?isVertical=1&IG=${ig}&IID=${iid}${count + 1}`;
                const json = { text, key, token, to, fromLang };
                const { data } = (yield (0, axios_1.default)({ method: 'post', url, data: qs_1.default.stringify(json), headers }));
                const [{ translations }] = data;
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
        }));
        yield Promise.all(proms);
    });
}
exports.default = bingTranslator;
