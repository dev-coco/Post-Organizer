const uiElements = document.querySelectorAll('main')
const title = document.getElementById('title')
const gladiaAPIKey = document.getElementById('gladia-api-key')
const categoryList = document.getElementById('category-list')
const imageCategoryList = document.getElementById('image-category-list')
const apiUrl = document.getElementById('api-url')
const textSheetUrl = document.getElementById('text-sheet-url')
const categoryContentColumn = document.getElementById('category-content-column')
const categoryResultColumn = document.getElementById('category-result-column')
const imageSheetUrl = document.getElementById('image-sheet-url')
const imageContentColumn = document.getElementById('image-category-content-column')
const imageResultColumn = document.getElementById('image-category-result-column')
const input = document.getElementById('input')
const output = document.getElementById('output')
const startBtn = document.getElementById('start-btn')
const submitBtn = document.getElementById('submit')
const submitImageBtn = document.getElementById('submit-image')
const analyzeVideoBtn = document.getElementById('analyze-video')
const reelsUrlEl = document.getElementById('reels-url')
const markdownBody = document.getElementById('markdown-body')

apiUrl.addEventListener('change', e => {
  chrome.storage.local.set({ apiUrl: apiUrl.value })
})

gladiaAPIKey.addEventListener('change', e => {
  chrome.storage.local.set({ gladiaAPIKey: gladiaAPIKey.value })
})

categoryList.addEventListener('change', e => {
  chrome.storage.local.set({ categoryList: categoryList.value })
})

imageCategoryList.addEventListener('change', e => {
  chrome.storage.local.set({ imageCategoryList: imageCategoryList.value })
})

textSheetUrl.addEventListener('change', e => {
  chrome.storage.local.set({ textSheetUrl: textSheetUrl.value })
})

categoryContentColumn.addEventListener('change', e => {
  chrome.storage.local.set({ categoryContentColumn: categoryContentColumn.value })
})

categoryResultColumn.addEventListener('change', e => {
  chrome.storage.local.set({ categoryResultColumn: categoryResultColumn.value })
})

imageSheetUrl.addEventListener('change', e => {
  chrome.storage.local.set({ imageSheetUrl: imageSheetUrl.value })
})

imageContentColumn.addEventListener('change', e => {
  chrome.storage.local.set({ imageContentColumn: imageContentColumn.value })
})

imageResultColumn.addEventListener('change', e => {
  chrome.storage.local.set({ imageResultColumn: imageResultColumn.value })
})

chrome.storage.local.get(null, config => {
  apiUrl.value = config.apiUrl || ''
  gladiaAPIKey.value = config.gladiaAPIKey || ''
  categoryList.value = config.categoryList || ''
  imageCategoryList.value = config.imageCategoryList || ''
  textSheetUrl.value = config.textSheetUrl || ''
  categoryContentColumn.value = config.categoryContentColumn || ''
  categoryResultColumn.value = config.categoryResultColumn || ''
  imageSheetUrl.value = config.imageSheetUrl || ''
  imageContentColumn.value = config.imageContentColumn || ''
  imageResultColumn.value = config.imageResultColumn || ''
})

// 菜单
;[...document.querySelectorAll('.nav-link.menu')].forEach((el, index) => {
  el.addEventListener('click', e => {
    for (const x of uiElements) x.style.display = 'none'
    title.innerText = el.outerText
    switch (el.outerText) {
      case '引导语分类':
        uiElements[0].style.display = ''
        break
      case '图片分类':
        uiElements[1].style.display = ''
        break
      case 'Reels 视频画面':
      case 'Reels 视频转文字':
      case 'IG 帖子信息':
      case 'Tiktok 视频转文字':
        uiElements[2].style.display = ''
        break
      case '拆解视频':
        uiElements[3].style.display = ''
        break
      case '插件设置':
        uiElements[4].style.display = ''
        break
    }
  })
})

startBtn.addEventListener('click', () => {
  switch (title.outerText) {
    case 'Reels 视频画面':
      reelsThumbnail()
      break
    case 'Reels 视频转文字':
      reelsASR()
      break
    case 'IG 帖子信息':
      instagramPostInfo()
      break
    case 'Tiktok 视频转文字':
      tiktokASR()
      break
    case '分析视频':
      analyzeVideo()
      break
  }
})

// 复制内容
document.getElementById('copy').addEventListener('click', () => {
  output.focus()
  output.select()
  document.execCommand('Copy')
  notify('结果已复制到剪切板')
})

// 删除内容
document.getElementById('clean').addEventListener('click', () => {
  input.value = ''
  output.value = ''
  notify('内容已清空')
})
