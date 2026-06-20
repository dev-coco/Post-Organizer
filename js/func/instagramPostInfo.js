// 获取 IG 帖子信息
async function instagramPostInfo () {
  output.value = ''
  if (!input.value) return

  const urls = input.value.match(/.+/g)
  let index = 0
  for (const url of urls) {
    index++
    notify(`进行中 ${urls.length} / ${index}`)

    // 转换贴文 ID
    const postID = ig.getPostID(url)

    const json = await fetch(`https://www.instagram.com/api/v1/media/${postID}/info/`, {
      headers: await igHeaders()
    }).then(response => response.json())
    // 发帖时间
    const postDate = new Date(json.items[0].taken_at * 1000).toLocaleString()
    // 点赞数
    const likeCount = json.items[0].like_count
    // 评论数
    const commentCount = json.items[0].comment_count
    // 引导语
    let text = ''
    try {
      text = formatSheetText(json.items[0].caption.text)
    } catch {}
    try {
      const videoUrl = json.items[0].video_versions[0].url
      // 下载视频
      const videoBlob = await fetch(videoUrl).then(response => response.blob())
      // 获取视频中的画面
      const imageBlob = await getVideoFrameAtSecond(videoBlob)
      const imageUrl = await uploadImage(imageBlob)
      output.value += `${postID}\t${text}\t${url}\t${url}\t${postDate}\t${likeCount}\t${commentCount}\t\t视频\t\t=IMAGE("${imageUrl}")\n`
      continue
    } catch {}
    try {
      const imageUrl = json.items[0].image_versions2.candidates[0].url
      output.value += `${postID}\t${text}\t${url}\t${url}\t${postDate}\t${likeCount}\t${commentCount}\t\t贴文\t\t=IMAGE("${imageUrl}")\n`
      continue
    } catch {}
    await delay(1.5)
  }
  notify('运行完成')
}
