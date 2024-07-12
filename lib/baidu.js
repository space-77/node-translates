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
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const utils_1 = require("./utils");
const common_1 = require("./common");
const URL_BASE = 'https://fanyi.baidu.com';
const URL_LINK = `${URL_BASE}/mtpe-individual/multimodal`;
const URL_TRANSLATOR = `${URL_BASE}/ait/text/translate`;
function baiduTranslator(dataList) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = new utils_1.IBrowser();
        yield browser.init();
        const proms = dataList.map(([fromTo, value]) => {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let timer;
                function closePage(message) {
                    return __awaiter(this, void 0, void 0, function* () {
                        value.forEach(i => i.reject(message));
                        clearTimeout(timer);
                        reject(message);
                    });
                }
                timer = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    closePage('timeout');
                }), 1000 * 120);
                const texts = value.map(i => i.text.replace(/\r?\n/g, config_1.SPLIT_ENTER)).join(config_1.JOIN_STR);
                const url = `${URL_LINK}?lang=${fromTo.replace('_', '2')}&query=${texts}`;
                const page = yield browser.newPage();
                if (!page) {
                    closePage('create tab err');
                    return;
                }
                page.on('response', (response) => __awaiter(this, void 0, void 0, function* () {
                    const url = response.url();
                    if (url.startsWith(URL_TRANSLATOR)) {
                        try {
                            yield (0, common_1.sleep)(260);
                            const resList = [];
                            const texts = yield page.$eval('#trans-selection', el => {
                                const texts = [];
                                el.querySelectorAll('div').forEach(el => { var _a; return texts.push((_a = el.textContent) !== null && _a !== void 0 ? _a : ''); });
                                return texts;
                            });
                            texts.forEach((dst, index) => {
                                resList.push({ info: value[index], dst });
                            });
                            clearTimeout(timer);
                            resolve(resList);
                        }
                        catch (error) {
                            console.error(error);
                        }
                    }
                }));
                yield page.goto(encodeURI(url));
            }));
        });
        const resList = yield Promise.all(proms);
        resList.forEach(res => {
            res.forEach(({ info, dst }) => {
                info.resolve({ text: (0, utils_1.restoreEnter)(info.text), dst: (0, utils_1.restoreEnter)(dst) });
            });
        });
        yield browser.close();
    });
}
exports.default = baiduTranslator;
