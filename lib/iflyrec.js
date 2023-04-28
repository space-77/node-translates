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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("./utils");
const common_1 = require("./common");
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const config_1 = require("./config");
const URL_BASE = 'https://fanyi.iflyrec.com';
const URL_API = `${URL_BASE}/TranslationService/v1/textTranslation`;
class IBrowser {
    initBrowser() {
        return __awaiter(this, void 0, void 0, function* () {
            const chromePath = (0, utils_1.getChromePath)();
            this.browser = yield puppeteer_core_1.default.launch({ executablePath: chromePath });
            this.page = yield this.browser.newPage();
        });
    }
    init() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.goto(URL_BASE);
            const cookies = yield this.page.cookies(URL_BASE);
            yield ((_a = this.browser) === null || _a === void 0 ? void 0 : _a.close());
            return cookies;
        });
    }
}
class Iflyrec {
    static getCookies() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Iflyrec.cookies) {
                const b = new IBrowser();
                yield b.initBrowser();
                const cookies = yield b.init();
                cookies.forEach(i => {
                    const { name, value } = i;
                    Iflyrec.cookies[name] = value;
                });
            }
            return Iflyrec.cookies;
        });
    }
}
Iflyrec.cookies = {};
function getLanguage(language) {
    switch (language) {
        case config_1.Languages.ZH:
            return '1';
        case config_1.Languages.EN:
            return '2';
        case config_1.Languages.JP:
            return 3;
        case config_1.Languages.KOR:
            return 4;
        case config_1.Languages.RU:
            return 5;
        case config_1.Languages.FRA:
            return 6;
        case config_1.Languages.DE:
            return 13;
    }
}
// export default async function iflyrecTranslator(texts: string | string[]) {
function iflyrecTranslator(dataList) {
    return __awaiter(this, void 0, void 0, function* () {
        // const cookies = await Iflyrec.getCookies()
        const proms = dataList.map(([fromTo, value]) => __awaiter(this, void 0, void 0, function* () {
            const contents = value.map(i => i.text);
            const [from, to] = fromTo.split('_').map(i => getLanguage(i));
            const json = { to, from, contents: contents.map(text => ({ frontBlankLine: 0, text })) };
            const headers = (0, common_1.getApiHeaders)(URL_BASE);
            headers['Content-Type'] = 'application/json; charset=UTF-8';
            // headers['Cookie'] = Object.entries(cookies)
            //   .map(([key, value]) => `${key}=${value}`)
            //   .join('; ')
            try {
                // 讯飞这个接口暂时不需要做验证
                const { data } = (yield axios_1.default.post(`${URL_API}?t=${Date.now()}`, json, { headers }));
                if (data.code !== '000000') {
                    value.forEach(i => i.reject(data.desc));
                    throw new Error(data.desc);
                }
                const textEnList = data.biz;
                textEnList.map(({ translateResult }, index) => {
                    const textItem = value[index];
                    textItem.resolve({ text: (0, utils_1.restoreEnter)(textItem.text), dst: (0, utils_1.restoreEnter)(translateResult) });
                });
            }
            catch (error) {
                console.error(error);
                value.forEach(i => i.reject('translate fail'));
            }
        }));
        yield Promise.all(proms);
    });
}
exports.default = iflyrecTranslator;
