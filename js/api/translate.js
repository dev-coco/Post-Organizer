/**
 * @description 谷歌翻译接口
 * @param {string} text - 原文
 * @returns {string} 翻译后的文本
 */
async function translate (text) {
  if (!text) return ''
  const json = await fetch(`https://translate.google.com/translate_a/single?client=gtx&dt=t&dj=1&ie=UTF-8&sl=auto&tl=zh_CN&q=${decodeURIComponent(text)}`).then(response => response.json())
  const translateResult = json.sentences.map(x => x.trans).join(' ')
  return translateResult
}
