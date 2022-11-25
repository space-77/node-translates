import { bingTranslator } from '../src/index'

test('测试 bing 单个句翻译', async () => {
  const text = (await bingTranslator('你好')) ?? []
  expect(text.join()).toBe('Hello')
})

test('测试 bing 多个多句翻译', async () => {
  const text = (await bingTranslator(['你', '好', '沙漏', '湿巾', '绿萝', '口罩', '下班'])) ?? []
  expect(text.join(',')).toBe(['You', 'Good', 'Hourglass', 'Wet wipes', 'Green rose', 'Masks', 'Work'].join(','))
})
