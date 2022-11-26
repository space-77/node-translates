"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("./client"));
const common_1 = require("./common");
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const chromePaths = require('chrome-paths');
const { getEdgePath } = require('edge-paths');
const URL_BASE = 'https://fanyi.iflyrec.com';
const URL_API = `${URL_BASE}/TranslationService/v1/textTranslation`;
function getChromePath() {
    const { chrome, chromium, chromeCanary } = chromePaths;
    const chromePath = chrome || getEdgePath() || chromium || chromeCanary;
    if (!chromePath) {
        throw new Error('没找到 chrome 或 chromium内核 的浏览器，请安装 chrome 或 chromium内核 的浏览器后重试');
    }
    return chromePath;
}
class IBrowser {
    page;
    browser;
    async initBrowser() {
        const chromePath = getChromePath();
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
async function iflyrecTranslator(texts) {
    const cookies = await Iflyrec.getCookies();
    const contents = Array.isArray(texts) ? texts : [texts];
    const json = {
        to: '2',
        from: '1',
        contents: contents.map(text => ({ frontBlankLine: 0, text }))
    };
    const headers = (0, common_1.getApiHeaders)(URL_BASE);
    headers['Content-Type'] = 'application/json; charset=UTF-8';
    headers['Cookie'] = Object.entries(cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');
    const res = await client_1.default.post(`${URL_API}?t=${Date.now()}`, { json, headers }).json();
    const textEnList = res.biz;
    return textEnList.map(({ translateResult }, index) => ({ zh: contents[index], en: translateResult }));
}
exports.default = iflyrecTranslator;
