
submitBtn.addEventListener('click', async () => {
  if (!textSheetUrl.value) return notify('未设置表格链接')
  if (!categoryContentColumn.value) return notify('未设置引导语列')
  if (!categoryResultColumn.value) return notify('未设置结果列')
  if (!categoryList.value) return notify('未设置引导语类别')

  notify('获取未分类的引导语')
  const param = {
    action: 'get-category-content',
    sheetUrl: textSheetUrl.value,
    contentColumn: categoryContentColumn.value,
    resultColumn: categoryResultColumn.value
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

    notify('正在分类中')
    const result = await geminiTextAPI(info, token)

    notify('正在填表')
    const obj = {
      action: 'fill-sheet',
      sheetUrl: textSheetUrl.value,
      resultColumn: categoryResultColumn.value,
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

