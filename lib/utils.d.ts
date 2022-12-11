/// <reference types="node" />
import { Browser, Page } from 'puppeteer-core';
export declare function getChromePath(): any;
export declare class IBrowser {
    page: Page;
    time: number;
    useCount: number;
    static instance: IBrowser;
    chrome: Browser | null;
    closeTimer?: NodeJS.Timeout;
    constructor();
    init(): Promise<void>;
    getPage(): void;
    close(): Promise<void>;
    newPage(): Promise<Page>;
}
export declare function cutArray<T>(array: T[], subLength: number): T[][];
export declare function restoreEnter(text: string): string;
