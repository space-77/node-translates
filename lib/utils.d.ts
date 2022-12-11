import { Browser, Page } from 'puppeteer-core';
export declare function getChromePath(): any;
export declare class IBrowser {
    page: Page;
    useCount: number;
    static instance: IBrowser;
    chrome: Browser | null;
    constructor();
    init(): Promise<void>;
    close(): Promise<void>;
    newPage(): Promise<Page | undefined>;
}
export declare function cutArray<T>(array: T[], subLength: number): T[][];
export declare function restoreEnter(text: string): string;
