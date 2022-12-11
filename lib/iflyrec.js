"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("./client"));
const utils_1 = require("./utils");
const common_1 = require("./common");
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const config_1 = require("./config");
const URL_BASE = 'https://fanyi.iflyrec.com';
const URL_API = `${URL_BASE}/TranslationService/v1/textTranslation`;
class IBrowser {
    page;
    browser;
    async initBrowser() {
        const chromePath = (0, utils_1.getChromePath)();
        this.browser = await puppeteer_core_1.default.launch({ executablePath: chromePath });
        this.page = await this.browser.newPage();
    }
    async init() {
        await this.page.goto(URL_BASE);
        const cookies = await this.page.cookies(URL_BASE);
        await this.browser?.close();
        return cookies;
    }
}
class Iflyrec {
    static cookies = {};
    static async getCookies() {
        if (!Iflyrec.cookies) {
            const b = new IBrowser();
            await b.initBrowser();
            const cookies = await b.init();
            cookies.forEach(i => {
                const { name, value } = i;
                Iflyrec.cookies[name] = value;
            });
        }
        return Iflyrec.cookies;
    }
}
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
async function iflyrecTranslator(dataList) {
    // const cookies = await Iflyrec.getCookies()
    const proms = dataList.map(async ([fromTo, value]) => {
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
            const res = (await client_1.default.post(`${URL_API}?t=${Date.now()}`, { json, headers }).json());
            if (res.code !== '000000') {
                value.forEach(i => i.reject(res.desc));
                throw new Error(res.desc);
            }
            const textEnList = res.biz;
            textEnList.map(({ translateResult }, index) => {
                const textItem = value[index];
                textItem.resolve({ text: (0, utils_1.restoreEnter)(textItem.text), dst: (0, utils_1.restoreEnter)(translateResult) });
            });
        }
        catch (error) {
            console.error(error);
            value.forEach(i => i.reject('translate fail'));
        }
    });
    await Promise.all(proms);
}
exports.default = iflyrecTranslator;
