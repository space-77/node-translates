# 翻译工具
## 目前只支持 中译 英
## 目前支持三种翻译平台 bing 百度 讯飞
## 例子
``` ts
import { bingTranslator, baiduTranslator, iflyrecTranslator } from 'node-translates'

const res = await bingTranslator('你好')
console.log(res) // [{zh: '你好', en: 'Hello'}]
const res = await bingTranslator(['口罩', '下班'])
console.log(res) // [{zh: '口罩', en: 'Masks'}, { zh: '下班', en: 'Work' }]
```