import { bingTranslator } from './index'

~(async () => {
  try {
    const res = await bingTranslator(['你', '好', '沙漏', '湿巾', '绿萝', '口罩', '下班'])
    console.log(res)
  } catch (error) {
    console.error(error)
  }
})()
