import { bingTranslator, Languages } from '../src/index'

test('测试 bing 翻译', async () => {
  const text = await bingTranslator({ text: '你好', from: Languages.ZH, to: Languages.EN })
  expect(text.dst).toBe('Hello')
})
