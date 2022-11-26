export type BaiduOptions = {
    ifIgnoreLimitOfLength?: boolean;
    limitOfLength?: number;
};
export default function baiduTranslator(texts: string | string[], options?: BaiduOptions): Promise<{
    zh: string;
    en: string;
}[]>;
