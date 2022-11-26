"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("./client"));
const common_1 = require("./common");
const config_1 = require("./config");
const URL_BASE = 'https://fanyi.baidu.com';
const URL_LINK = `${URL_BASE}/translate`;
const URL_TRANSLATOR = `${URL_BASE}/v2transapi`;
const URL_WEB_STATIC = 'https://fanyi-cdn.cdn.bcebos.com/webStatic/translation/js';
const GET_SIGN_PATTERN = new RegExp(`${URL_WEB_STATIC}/index(.*?).js`);
const GET_SIGN_OLD_URL = `${URL_WEB_STATIC}/index.5e400555.js`;
const HOST_HEADERS = (0, common_1.getHostHeaders)(URL_BASE);
class Baidu {
    static gtk;
    static token;
    static signJsCode;
    static getSignUrl;
    static async getAuthInfo(text) {
        let sign = '';
        const { signJsCode, gtk, token } = Baidu;
        if (!signJsCode || !token || !gtk) {
            await client_1.default.get(URL_LINK, { headers: HOST_HEADERS }); // 第一次请求不没有cookie，这次请求只是为了那到 cookie
            const { body } = await client_1.default.get(URL_LINK, { headers: HOST_HEADERS }); // 第二次请求是携带 cookie 的
            const signHtml = await Baidu.getSignHtml(body);
            // this.setSignJsCode(signHtml)
            const { sign: s, token, gtk } = Baidu.getHostInfo(body, signHtml, text);
            sign = s;
            Baidu.gtk = gtk;
            Baidu.token = token;
        }
        else {
            sign = this.getSign(text, Baidu.gtk);
        }
        return { sign, token: Baidu.token };
    }
    static checkQueryText(texts, { ifIgnoreLimitOfLength = false, limitOfLength = 5000 }) {
        let text = Array.isArray(texts) ? texts.map(i => i.trim()).join(config_1.JOIN_STR) : texts;
        text = text.trim();
        if (text.length === 0)
            return '';
        let length = text.length;
        if (length >= limitOfLength && !ifIgnoreLimitOfLength) {
            throw new Error('The length of the text to be translated exceeds the limit.');
        }
        else {
            if (length >= limitOfLength) {
                console.warn(`The translation ignored the excess[above ${limitOfLength}]. Length of text is ${length}.`);
                console.warn('The translation result will be incomplete.');
                return text.substring(0, limitOfLength - 1);
            }
        }
        return text;
    }
    static async getSignHtml(html) {
        try {
            if (!Baidu.getSignUrl) {
                Baidu.getSignUrl = html.match(GET_SIGN_PATTERN)?.[0];
            }
            if (!Baidu.getSignUrl)
                return await this.agetSignOld();
            const { body } = await client_1.default.get(Baidu.getSignUrl, { headers: HOST_HEADERS });
            return body;
        }
        catch (error) {
            return await this.agetSignOld();
        }
    }
    static async agetSignOld() {
        try {
            const { body } = await client_1.default.get(GET_SIGN_OLD_URL, { headers: HOST_HEADERS });
            Baidu.getSignUrl = GET_SIGN_OLD_URL;
            return body;
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    static setSignJsCode(signHtml) {
        const signReg = /function\(t\)\{(.*?2147483647.*?)\}$/;
        const codeList = signHtml.replace(/,\d+:function/g, '__====___===:function').split('__====___===:');
        const signJsCode = codeList.find(code => signReg.test(code));
        if (signJsCode) {
            Baidu.signJsCode = RegExp.$1.replace('t.exports=function(t)', 'function f(t, r)');
        }
    }
    static getSign(tsText, gtk) {
        const jsCode = `${Baidu.signJsCode}; f('${tsText}', '${gtk}');`;
        return eval(jsCode);
    }
    static getHostInfo(hostHtml, signHtml, queryText) {
        this.setSignJsCode(signHtml);
        const [, gtk] = hostHtml.match('window.gtk = "(.*?)";') ?? [];
        const sign = this.getSign(queryText, gtk);
        const [, token] = hostHtml.match(/token:\s*'(\S+)'/) ?? [];
        return { gtk, sign, token };
    }
}
async function baiduTranslator(texts, options = {}) {
    texts = Array.isArray(texts) ? texts : [texts];
    const text = Baidu.checkQueryText(texts, options);
    const { sign, token } = await Baidu.getAuthInfo(text);
    const form = {
        to: 'en',
        sign,
        from: 'zh',
        token,
        query: text,
        transtype: 'translang',
        simple_means_flag: '3',
        domain: 'common'
    };
    const res = await client_1.default.post(`${URL_TRANSLATOR}?from=zh&to=en`, { headers: (0, common_1.getApiHeaders)(URL_BASE), form }).json();
    const textEn = res.trans_result.data[0].dst;
    return textEn.split(config_1.SPLIT_STR).map((i, index) => ({ zh: texts[index], en: i.trim() }));
}
exports.default = baiduTranslator;
