submitImageBtn.addEventListener('click', async () => {
  if (!apiUrl.value) return notify('未设置 API')
  if (!imageSheetUrl.value) return notify('未设置表格链接')
  if (!imageContentColumn.value) return notify('未设置图片列')
  if (!imageResultColumn.value) return notify('未设置结果列')
  if (!imageCategoryList.value) return notify('未设置图片类别')

  // 获取表格里还未分类的引导语
  notify('获取未分类的图片')
  const param = {
    action: 'get-category-image',
    sheetUrl: imageSheetUrl.value,
    contentColumn: imageContentColumn.value,
    resultColumn: imageResultColumn.value
  }
  const contentList = await fetch(`${apiUrl.value}?${new URLSearchParams(param).toString()}`).then(response => response.json())

  // 拆分内容
  const splitContent = splitArray(contentList, 20)

  // 拆分后的总数
  const total = splitContent.length

  // 获取 opal token
  const token = await getOpalToken()
  if (!token) return notify('未登陆 opal')

  let index = 0
  for (const info of splitContent) {
    index++

    // 图片转换 base64 编码
    const tasks = info.map(x => {
      const url = x.content
      x.content = '' // 清空内容，后面用到
      return imageUrlToBase64(url)
    })
    const results = await Promise.all(tasks)

    notify('正在分类中')
    const result = await geminiImageAPI(info, results, token)

    notify('正在填表')
    const obj = {
      action: 'fill-sheet',
      sheetUrl: imageSheetUrl.value,
      resultColumn: imageResultColumn.value,
      result
    }
    fetch(apiUrl.value, {
      body: JSON.stringify(obj),
      method: 'POST'
    })
      .then(response => response.json())
      .then(json => {
        if (json.status === 'success') {
          notify(`${index} / ${total} 填表成功`)
        } else if (json.status === 'failed') {
          notify(`${index} / ${total} 填表失败`)
          console.error(json.error_message)
          console.log(info)
          console.log(result)
        }
      })
  }
  notify('全部完成')
})

