# 翻译工具
## 本项目仅供学习参考，请勿用于商用。
## 本项目仅供学习参考，请勿用于商用。
## 本项目仅供学习参考，请勿用于商用。



### 目前只支持 中、英、俄、法、德、日、韩 互译

### 目前支持三种翻译平台 bing 百度 讯飞
> 百度平台使用的是爬虫方式实现，所以相对于其它平台，百度的用时较长，但它比较稳定。

### 例子

```ts
import { baiduTranslator, bingTranslator, iflyrecTranslator, Languages } from 'node-translates'

~(() => {
  const texts = ['你好', '口罩', '下班']
  texts.forEach(async text => {
    const res = await baiduTranslator({ text, from: Languages.ZH, to: Languages.EN })
    // { text: '你好', dst: 'Hello' };
    // { text: '口罩', dst: 'Mask' };
    // { text: '下班', dst: 'go off work' };
    console.log(res)
  })
})
```
