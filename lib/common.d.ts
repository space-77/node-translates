declare const config: {
    tk: any;
    firstTime: number;
    queryCount: number;
    url: string;
    translator: string;
};
export declare const getHeaders: (hostUrl: string, ifApi?: boolean) => {
    Origin: string;
    Referer: string;
    'User-Agent': string;
};
export declare const getHostInfo: (hostHtml: string) => {
    iid: string;
    ig: string;
};
export declare function getToken(host_html: string): Record<string, string>;
export declare const sleep: (seconds: number) => Promise<unknown>;
export default config;
