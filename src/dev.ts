import { baiduTranslator, bingTranslator, iflyrecTranslator, Languages } from './index'

~(async () => {
  try {
    // const res = await baiduTranslator('你好')
    // console.log(res)
    // const res1 = await baiduTranslator(['你', '好', '沙漏', '湿巾', '绿萝', '口罩', '下班'])
    const texts = ['你好', '口罩', '下班']

    texts.forEach(async text => {
      const res1 = await baiduTranslator({ text, from: Languages.ZH, to: Languages.EN })
      console.log(res1)
    })

    // const res2 = await baiduTranslator({ text: '你好', from: Languages.ZH, to: Languages.RU })
    // console.log(res2)
  } catch (error) {
    console.error(error)
  }
})()

// import NodeCache from 'node-cache'

// const cache = new NodeCache()

// console.log(cache.get('testKey'))

// cache.set('testKey', { test: '111124545' })

// console.log(cache.get('testKey'))
