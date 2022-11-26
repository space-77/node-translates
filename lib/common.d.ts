declare const config: {
    tk: any;
    firstTime: number;
    queryCount: number;
    url: string;
    translator: string;
};
export declare function getHostHeaders(url: string): {
    Origin: string;
    Referer: string;
    'User-Agent': string;
};
export declare function getApiHeaders(url: string): {
    Host: string;
    Origin: string;
    Referer: string;
    'User-Agent': string;
    'X-Requested-With': string;
    'Content-Type': string;
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
