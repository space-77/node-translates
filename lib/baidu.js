"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const utils_1 = require("./utils");
const URL_BASE = 'https://fanyi.baidu.com';
const URL_LINK = `${URL_BASE}/translate`;
const URL_TRANSLATOR = `${URL_BASE}/v2transapi`;
async function baiduTranslator(dataList) {
    const browser = new utils_1.IBrowser();
    await browser.init();
    const proms = dataList.map(([fromTo, value]) => {
        return new Promise(async (resolve, reject) => {
            let timer;
            async function closePage(message) {
                await page.close();
                await browser.close();
                value.forEach(i => i.reject(message));
                clearTimeout(timer);
                reject(message);
            }
            timer = setTimeout(async () => {
                closePage('timeout');
            }, 1000 * 120);
            const resList = [];
            const texts = value.map(i => i.text.replace(/\r?\n/g, config_1.SPLIT_ENTER)).join(config_1.JOIN_STR);
            const url = `${URL_LINK}#${fromTo.replace('_', '/')}`;
            const page = await browser.newPage();
            if (!page) {
                closePage('create tab err');
                return;
            }
            page.on('response', async (response) => {
                const url = response.url();
                if (url.startsWith(URL_TRANSLATOR)) {
                    const data = (await response.json());
                    if (!data.trans_result) {
                        closePage(data.errShowMsg ?? '');
                    }
                    const dataList = data.trans_result.data ?? [];
                    dataList.forEach((info, index) => {
                        resList.push({ info: value[index], dst: info.dst });
                    });
                    await page.close();
                    clearTimeout(timer);
                    resolve(resList);
                }
            });
            page.on('error', async (err) => {
                await closePage(err);
            });
            await page.goto(encodeURI(url));
            page.waitForSelector('#baidu_translate_input').then(async () => {
                const closeBtn = await page.$('.app-guide-close');
                await closeBtn?.click();
                setTimeout(async () => {
                    await page.type('#baidu_translate_input', texts, { delay: 0 });
                    await page.keyboard.press('Enter');
                }, 1000);
            });
        });
    });
    const resList = await Promise.all(proms);
    resList.forEach(res => {
        res.forEach(({ info, dst }) => {
            info.resolve({ text: (0, utils_1.restoreEnter)(info.text), dst: (0, utils_1.restoreEnter)(dst) });
        });
    });
    await browser.close();
    // await new Promise((resolve, reject) => {
    //   setTimeout(async () => {
    //     await browser.close()
    //     resolve('')
    //   }, 1000 * 5)
    // })
}
exports.default = baiduTranslator;
