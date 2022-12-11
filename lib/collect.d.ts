/// <reference types="node" />
import { Languages, TranslateNames } from './config';
export type TextInfo = {
    text: string;
    from: Languages;
    to: Languages;
};
export type WaitResolve = {
    text: string;
    dst: string;
};
export type WaitList = {
    text: string;
    fromTo: string;
    to: Languages;
    from: Languages;
    resolve: (res: WaitResolve) => void;
    reject: (err?: any) => void;
};
export type StartTranslate = (dataList: [string, WaitList[]][]) => Promise<any>;
declare class Collect {
    startTranslate: StartTranslate;
    pageNumber: number;
    time: number;
    timer?: NodeJS.Timeout;
    waitList: WaitList[];
    constructor(startTranslate: StartTranslate, pageNumber?: number);
    protected removeWaitList(waitList: WaitList[]): void;
    protected start(): void;
    protected reStart(): void;
    add({ text, from, to }: TextInfo): Promise<WaitResolve>;
}
export default class Collector {
    protected collectList: {
        key: TranslateNames;
        collect: Collect;
    }[];
    createCollect(key: TranslateNames, translate: StartTranslate, pageNumber?: number): void;
    getCollect(key: TranslateNames): Collect | undefined;
    addTranslate(info: TextInfo, key: TranslateNames): Promise<WaitResolve>;
}
export {};
