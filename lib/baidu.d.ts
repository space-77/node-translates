import { WaitList } from './collect';
export type BaiduOptions = {
    ifIgnoreLimitOfLength?: boolean;
    limitOfLength?: number;
};
export default function baiduTranslator(dataList: [string, WaitList[]][]): Promise<void>;
