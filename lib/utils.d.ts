/// <reference types="node" />
import puppeteer, { Browser } from 'puppeteer-core';
export declare function getChromePath(): any;
export declare class IBrowser {
    protected time: number;
    protected useCount: number;
    protected initialize?: Promise<Browser>;
    protected static instance: IBrowser;
    protected closeTimer?: NodeJS.Timeout;
    chrome: Browser | null;
    constructor();
    init(): Promise<void>;
    close(): Promise<void>;
    newPage(): Promise<puppeteer.Page>;
}
export declare function cutArray<T>(array: T[], subLength: number): T[][];
export declare function restoreEnter(text: string): string;
