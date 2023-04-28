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
const URL_BASE = 'https://fanyi.baidu.com';
const URL_LINK = `${URL_BASE}/translate`;
const URL_TRANSLATOR = `${URL_BASE}/v2transapi`;
function baiduTranslator(dataList) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = new utils_1.IBrowser();
        yield browser.init();
        // const pageList: Page[] = []
        const proms = dataList.map(([fromTo, value]) => {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let timer;
                function closePage(message) {
                    return __awaiter(this, void 0, void 0, function* () {
                        // await page.close()
                        // await browser.close()
                        value.forEach(i => i.reject(message));
                        clearTimeout(timer);
                        reject(message);
                    });
                }
                timer = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    closePage('timeout');
                }), 1000 * 120);
                const resList = [];
                const texts = value.map(i => i.text.replace(/\r?\n/g, config_1.SPLIT_ENTER)).join(config_1.JOIN_STR);
                const url = `${URL_LINK}#${fromTo.replace('_', '/')}/${texts}`;
                const page = yield browser.newPage();
                if (!page) {
                    closePage('create tab err');
                    return;
                }
                page.on('response', (response) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b;
                    const url = response.url();
                    // const s = response.status()
                    if (url.startsWith(URL_TRANSLATOR)) {
                        // console.log(response.status())
                        try {
                            const data = (yield response.json());
                            if (!data.trans_result) {
                                closePage((_a = data.errShowMsg) !== null && _a !== void 0 ? _a : '');
                            }
                            const dataList = (_b = data.trans_result.data) !== null && _b !== void 0 ? _b : [];
                            dataList.forEach((info, index) => {
                                resList.push({ info: value[index], dst: info.dst });
                            });
                            clearTimeout(timer);
                            resolve(resList);
                            // await page.close()
                        }
                        catch (error) {
                            // console.log(s)
                            // console.error('err------------123')
                        }
                        // await page.close()
                    }
                }));
                // page.on('error', async err => {
                //   try {
                //     await closePage(err)
                //   } catch (error) {
                //   }
                // })
                yield page.goto(encodeURI(url));
                // pageList.push(page)
                // page.waitForSelector('#baidu_translate_input').then(async () => {
                //   const closeBtn = await page.$('.app-guide-close')
                //   await closeBtn?.click()
                //   setTimeout(async () => {
                //     await page.type('#baidu_translate_input', texts, { delay: 0 })
                //     await page.keyboard.press('Enter')
                //   }, 1000)
                // })
            }));
        });
        const resList = yield Promise.all(proms);
        resList.forEach(res => {
            res.forEach(({ info, dst }) => {
                info.resolve({ text: (0, utils_1.restoreEnter)(info.text), dst: (0, utils_1.restoreEnter)(dst) });
            });
        });
        // await Promise.all(pageList.map(async page => await page.close({ runBeforeUnload: true })))
        yield browser.close();
        // await new Promise((resolve, reject) => {
        //   setTimeout(async () => {
        //     await browser.close()
        //     resolve('')
        //   }, 1000 * 5)
        // })
    });
}
exports.default = baiduTranslator;
