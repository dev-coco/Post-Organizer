// 获取 Reels 视频画面
async function reelsThumbnail () {
  output.value = ''
  if (!input.value) return
  const urls = input.value.match(/.+/g)
  let index = 0
  for (const url of urls) {
    index++
    notify(`进行中 ${urls.length} / ${index}`)
    let reelsUrl = url
    // 检测 Reels 链接
    if (!url.includes('reel')) {
      // 获取真实贴文链接
      reelsUrl = await fetch(url).then(response => response.url)
      if (!reelsUrl.includes('reel')) {
        output.value += '不是 Reel 链接\n'
        continue
      }
    }
    // 解析 Reels 视频 ID
    const videoId = reelsUrl.replace(/\D/g, '')
    // 获取视频下载链接
    const videoUrl = await getVideoUrl(videoId)
    // 下载视频 Blob 数据
    const videoBlob = await fetch(videoUrl).then(response => response.blob())
    // 获取视频中的画面
    const imageBlob = await getVideoFrameAtSecond(videoBlob)
    // sh
    const imageUrl = await uploadImage(imageBlob)
    output.value += `=IMAGE("${imageUrl}")\n`
    await delay(1.5)
  }
  notify('运行完成')
}

/**
 * @description 获取视频链接
 * @param {string} videoId - 视频 ID
 * @returns {string} 视频真实链接
 */
async function getVideoUrl (videoId) {
  const body = new FormData()
  body.append('av', config.myId)
  body.append('__user', config.myId)
  body.append('__a', '1')
  body.append('fb_dtsg', config.token)
  body.append(
    'variables',
    `{"UFI2CommentsProvider_commentsKey":"CometTahoeSidePaneQuery","caller":"CHANNEL_VIEW_FROM_PAGE_TIMELINE","displayCommentsContextEnableComment":null,"displayCommentsContextIsAdPreview":null,"displayCommentsContextIsAggregatedShare":null,"displayCommentsContextIsStorySet":null,"displayCommentsFeedbackContext":null,"feedbackSource":41,"feedLocation":"TAHOE","focusCommentID":null,"privacySelectorRenderLocation":"COMET_STREAM","renderLocation":"video_channel","scale":1,"streamChainingSection":false,"useDefaultActor":false,"videoChainingContext":null,"videoID":"${videoId}"}`
  )
  body.append('doc_id', '5279476072161634')
  const text = await fetch('https://www.facebook.com/api/graphql/', {
    body,
    method: 'POST',
    credentials: 'include'
  }).then(response => response.text())
  const json = JSON.parse(text.split('\n')[0])
  return json.data.video.playable_url
}

