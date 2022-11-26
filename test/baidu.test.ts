import { baiduTranslator } from '../src/index'

test('测试 百度 单个句翻译', async () => {
  const text = (await baiduTranslator('你好')) ?? []
  expect(text.map(i => i.en).join()).toBe('Hello')
})

test('测试 百度 多个多句翻译', async () => {
  const text = (await baiduTranslator(['你', '好', '沙漏', '湿巾', '绿萝', '口罩', '下班'])) ?? []
  expect(text.map(i => i.en).join(',')).toBe(['You', 'Okay', 'hourglass', 'Wet wipes', 'Green Luo', 'Mask', 'go off work'].join(','))
})
