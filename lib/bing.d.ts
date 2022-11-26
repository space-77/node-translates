export default function bingTranslator(texts: string | string[]): Promise<{
    zh: string;
    en: string;
}[]>;
