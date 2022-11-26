import { bingTranslator } from './index'
import { baiduTranslator } from './index'
import { iflyrecTranslator } from './index'

~(async () => {
  try {
    const res = await iflyrecTranslator('你好')
    console.log(res)
    const res1 = await iflyrecTranslator(['你', '好', '沙漏', '湿巾', '绿萝', '口罩', '下班'])
    console.log(res1)
  } catch (error) {
    console.error(error)
  }
})()

// import NodeCache from 'node-cache'

// const cache = new NodeCache()

// console.log(cache.get('testKey'))

// cache.set('testKey', { test: '111124545' })

// console.log(cache.get('testKey'))
