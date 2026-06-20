// Reels 视频转文字
async function reelsASR () {
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
    let videoUrl
    if (url.includes('fb.com') || url.includes('facebook.com')) {
      // facebook 链接
      let reelsUrl = url
      // 检测 Reels 链接
      if (!url.includes('reel')) {
        // 获取真实贴文链接
        reelsUrl = await fetch(url).then(response => response.url)
        if (!reelsUrl.includes('reel') && !reelsUrl.includes('watch') && !reelsUrl.includes('video')) {
          // output.value += '不是 Reel 链接\n'
          const pageInfo = await fetch(reelsUrl, {
            headers: {
              accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
            }
          }).then(response => response.text())
          try {
            reelsUrl = pageInfo.match(/(?<=Video","id":").*?(?="},"__typename":"StoryAttachment)/g)[0]
          } catch {
            output.value += '不是 Reel 链接\n'
            continue
          }

          // continue
        }
      }
      // 解析 Reels 视频 ID
      const videoId = reelsUrl.replace(/\D/g, '')
      // 获取视频下载链接
      videoUrl = await getVideoUrl(videoId)
    } else {
      // instagram 链接
      const postID = ig.getPostID(url)
      const json = await fetch(`https://www.instagram.com/api/v1/media/${postID}/info/`, { headers: await igHeaders() }).then(response => response.json())
      videoUrl = json.items[0].video_versions[0].url
    }

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
