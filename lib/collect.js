"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const utils_1 = require("./utils");
class Collect {
    startTranslate;
    pageNumber;
    time = 200;
    timer;
    waitList = [];
    constructor(startTranslate, pageNumber = 100) {
        this.startTranslate = startTranslate;
        this.pageNumber = pageNumber;
        this.start();
    }
    removeWaitList(waitList) {
        this.waitList = lodash_1.default.remove(this.waitList, item => waitList.includes(item));
    }
    start() {
        this.timer = setTimeout(async () => {
            const { waitList, pageNumber } = this;
            this.waitList = [];
            const cutWaitList = (0, utils_1.cutArray)(waitList, pageNumber);
            for await (const iterator of cutWaitList) {
                const group = lodash_1.default.groupBy(iterator, 'fromTo');
                await this.startTranslate(Object.entries(group));
            }
            // if (cutWaitList.length > 2) {
            //   const doubleCutWaitList = cutArray(cutWaitList, 2)
            //   let index = 0
            //   for await (const pages of doubleCutWaitList) {
            //     index++
            //     console.log(`第 ${index} 批翻译`)
            //     await Promise.all(
            //       pages.map(async textInfoList => {
            //         const group = _.groupBy(textInfoList, 'fromTo')
            //         await this.startTranslate(Object.entries(group))
            //       })
            //     )
            //   }
            // } else {
            //   cutWaitList.forEach(textInfoList => {
            //     const group = _.groupBy(textInfoList, 'fromTo')
            //     this.startTranslate(Object.entries(group))
            //   })
            // }
        }, this.time);
    }
    reStart() {
        // 1、清楚定时器
        // 2、重新几时
        clearTimeout(this.timer);
        this.start();
    }
    add({ text, from, to }) {
        this.reStart();
        text = text.trim(); //.replace(/\r?\n/g, SPLIT_ENTER) // 去除换行符
        return new Promise((resolve, reject) => {
            this.waitList.push({ text, fromTo: `${from}_${to}`, from, to, resolve, reject });
        });
    }
}
class Collector {
    collectList = [];
    createCollect(key, translate, pageNumber) {
        if (!this.collectList.some(i => i.key === key)) {
            this.collectList.push({ key, collect: new Collect(translate, pageNumber) });
        }
    }
    getCollect(key) {
        return this.collectList.find(i => i.key === key)?.collect;
    }
    addTranslate(info, key) {
        const collect = this.getCollect(key);
        if (!collect)
            throw new Error(`${key} collect is not defined`);
        return collect.add(info);
    }
}
exports.default = Collector;
