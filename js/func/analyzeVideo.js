analyzeVideoBtn.addEventListener('click', async () => {
  console.log(1)
  const url = reelsUrlEl.value
  if (!url) return notify('未输入链接')

  // 获取 opal token
  const token = await getOpalToken()
  if (!token) return notify('未登陆 opal')

  notify('正在下载视频')

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
          notify('不是 Reel 链接')
          return
        }
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
  // 下载视频
  const videoBase64 = await imageUrlToBase64(videoUrl)
  notify('视频下载完成')


  notify('正在分析视频，请耐心等待')
  const result = await geminiVideoAPI(videoBase64, token)
  markdownBody.innerHTML = marked.parse(result)
  notify('全部完成')
})
