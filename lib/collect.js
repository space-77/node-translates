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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const utils_1 = require("./utils");
class Collect {
    constructor(startTranslate, pageNumber = 100) {
        this.startTranslate = startTranslate;
        this.pageNumber = pageNumber;
        this.time = 200;
        this.waitList = [];
        this.start();
    }
    removeWaitList(waitList) {
        this.waitList = lodash_1.default.remove(this.waitList, item => waitList.includes(item));
    }
    start() {
        this.timer = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            const { waitList, pageNumber } = this;
            this.waitList = [];
            const cutWaitList = (0, utils_1.cutArray)(waitList, pageNumber);
            // for await (const iterator of cutWaitList) {
            //   const group = _.groupBy(iterator, 'fromTo')
            //   await this.startTranslate(Object.entries(group))
            // }
            if (cutWaitList.length > 10) {
                const doubleCutWaitList = (0, utils_1.cutArray)(cutWaitList, 10);
                let index = 0;
                try {
                    for (var _d = true, doubleCutWaitList_1 = __asyncValues(doubleCutWaitList), doubleCutWaitList_1_1; doubleCutWaitList_1_1 = yield doubleCutWaitList_1.next(), _a = doubleCutWaitList_1_1.done, !_a;) {
                        _c = doubleCutWaitList_1_1.value;
                        _d = false;
                        try {
                            const pages = _c;
                            index++;
                            console.log(`第 ${index} 批翻译`);
                            yield Promise.all(pages.map((textInfoList) => __awaiter(this, void 0, void 0, function* () {
                                const group = lodash_1.default.groupBy(textInfoList, 'fromTo');
                                yield this.startTranslate(Object.entries(group));
                            })));
                        }
                        finally {
                            _d = true;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = doubleCutWaitList_1.return)) yield _b.call(doubleCutWaitList_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            else {
                cutWaitList.forEach(textInfoList => {
                    const group = lodash_1.default.groupBy(textInfoList, 'fromTo');
                    this.startTranslate(Object.entries(group));
                });
            }
        }), this.time);
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
    constructor() {
        this.collectList = [];
    }
    createCollect(key, translate, pageNumber) {
        if (!this.collectList.some(i => i.key === key)) {
            this.collectList.push({ key, collect: new Collect(translate, pageNumber) });
        }
    }
    getCollect(key) {
        var _a;
        return (_a = this.collectList.find(i => i.key === key)) === null || _a === void 0 ? void 0 : _a.collect;
    }
    addTranslate(info, key) {
        const collect = this.getCollect(key);
        if (!collect)
            throw new Error(`${key} collect is not defined`);
        return collect.add(info);
    }
}
exports.default = Collector;
