# 翻译工具
## 目前只支持 中译 英
## 使用 bing 翻译接口
``` ts
const res = await bingTranslator('你好')
console.log(res) // Hello
const res = await bingTranslator(['口罩', '下班'])
console.log(res) // ['Masks', 'Work']
```