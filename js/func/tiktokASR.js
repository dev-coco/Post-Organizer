// Reels 视频转文字
async function tiktokASR () {
  output.value = ''
  if (!input.value) return
  let localService = false
  try {
    // 本地 STT API 启用
    await fetch('http://localhost:1643/transcribe').then(response => response.text())
    localService = true
  } catch {
    // 本地 STT API 未启用，使用 Gladia API
    if (!gladiaAPIKey.value) return notify('未设置 gladia API Key')
  }
  const urls = input.value.match(/.+/g)
  let index = 0
  for (const url of urls) {
    index++
    notify(`进行中 ${urls.length} / ${index}`)

    const videoUrl = await getTikTokVideo(url)
    console.log(videoUrl)

    // 下载视频 Blob 数据
    const videoBlob = await fetch(videoUrl).then(response => response.blob())

    let sttResult = ''
    if (localService) {
      sttResult = await localSTT(videoBlob)
    } else {
      sttResult = await gladiaSTT(videoBlob)
    }
    const translateText = await translate(sttResult)

    output.value += `${formatSheetText(sttResult)}\t${formatSheetText(translateText)}\n`
  } // End for of
  notify('运行完成')
}

/**
 * 从 TikTok 页面链接获取视频下载地址
 * @param {string} url TikTok 视频详情页 URL
 * @returns {Promise<object>} 返回包含视频地址和元数据的对象
 */
async function getTikTokVideo (url) {
  const html = await fetch(url).then(response => response.text())

  let json = null
  const rehydrationMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">([\s\S]*?)<\/script>/)
  if (rehydrationMatch) {
    json = JSON.parse(rehydrationMatch[1])
  } else {
    const sigiMatch = html.match(/<script id="SIGI_STATE" type="application\/json">([\s\S]*?)<\/script>/)
    if (sigiMatch) json = JSON.parse(sigiMatch[1])
  }

  const videoDetail = json.__DEFAULT_SCOPE__?.['webapp.video-detail']?.itemInfo?.itemStruct || json.ItemModule?.[Object.keys(json.ItemModule)[0]]
  console.log(videoDetail)
  return videoDetail.music.playUrl
}
