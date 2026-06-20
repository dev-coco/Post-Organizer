const config = {}
// 获取账号信息
async function getConfig () {
  try {
    const text = await fetch('https://www.facebook.com/me').then(response => response.text())
    const myId = text.match(/(?<=actorId":").*?(?=")/g)[0]
    const token = await fetch('https://www.facebook.com/ajax/dtsg/?__a=true')
      .then(response => response.text())
      .then(text => JSON.parse(text.replace('for (;;);', '')).payload.token)
    config.myId = myId
    config.token = token
  } catch {
    alert('获取数据出错')
  }
}
getConfig()

/**
 * @description 左下角信息通知
 * @param {string} text - 通知的文本
 */
function notify (text) {
  Toastify({
    text,
    duration: 2000,
    close: true,
    gravity: 'bottom',
    position: 'left',
    style: { background: 'linear-gradient(to right, #00b09b, #96c93d)' }
  }).showToast()
}

/**
 *
 * @param {number} num
 * @returns
 */
function delay (num) {
  return new Promise(resolve => {
    setTimeout(resolve, num * 1000)
  })
}

/**
 * @description 将一维数组按指定长度分割为多个子数组
 * @param {Array} array - 需要被分割的原始数组
 * @param {number} subNum - 每个子数组的长度
 * @returns {Array} 由多个子数组组成的新数组
 */
function splitArray (array, subNum) {
  let index = 0
  const newArray = []
  while (index < array.length) {
    newArray.push(array.slice(index, (index += subNum)))
  }
  return newArray
}

/**
 * @description 通过图片获取 base64
 * @param {string} imageUrl - 图片链接
 * @returns {Promise<string>} 去除前缀后的 base64 编码
 */
async function imageUrlToBase64 (imageUrl) {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    return await blobToBase64(blob)
  } catch (error) {
    console.error('Error fetching image:', error)
    throw error
  }
}

/**
 * @description Blob 转换 base64
 * @param {Blob} blob - 需要转换的 blob 数据
 * @returns {Promise<string>} 去除 DataURL 前缀后的 base64 编码
 */
function blobToBase64 (blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * @description 格式化兼容表格的文本
 * @param {string} text - 需要格式化的文本
 * @returns {string} 格式化后的文本
 */
function formatSheetText (text) {
  if (/\n|\t|\r/.test(text)) {
    text = `"${text.replace(/"/g, '""')}"`
  } else {
    return text
  }
}

// Instagram 转换贴文 ID
const ig = {
  charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
  encode: id => {
    id = BigInt(id.toString())
    let result = ''
    while (id > 0) {
      const remainder = Number(id % 64n)
      result = ig.charset[remainder] + result
      id = id / 64n
    }
    return result
  },
  decode: url => {
    let result = 0n
    let power = 1n
    for (let i = url.length - 1; i >= 0; i--) {
      const char = url[i]
      const index = ig.charset.indexOf(char)
      result += BigInt(index) * power
      power *= 64n
    }
    return result.toString()
  },
  getPostUrl: id => `https://www.instagram.com/p/${ig.encode(id)}/`,
  getPostID: url => {
    try {
      const formatUrl = url.match(/(?<=\/(p|reel|reels)\/).*/g)[0].replace(/\/.*/g, '')
      return ig.decode(formatUrl)
    } catch {
      console.log('link', url)
      return 'malformed link'
    }
  }
}

let headers
async function igHeaders () {
  if (!headers) {
    headers = {}
    headers.headers = '*/*'
    headers['x-asbd-id'] = 359341
    const text = await fetch('https://www.instagram.com/').then(response => response.text())
    headers['x-csrftoken'] = text.match(/(?<=csrf_token":").*?(?=")/g)[0]
    headers['x-ig-app-id'] = text.match(/(?<=APP_ID":").*?(?=")/g)[0]
    headers['x-ig-www-claim'] = text.match(/(?<=claim":").*?(?=")/g)[0]
    headers['x-instagram-ajax'] = text.match(/(?<=rollout_hash":").*?(?=")/g)[0]
  }
  return headers
}

/**
 * @description 从视频 Blob 获取指定秒数的帧图像
 * @param {Blob} videoBlob - 视频的 Blob 数据
 * @param {number} [second=3] - 需要获取帧的时间点（秒）
 * @returns {Promise<Blob>} 返回指定时间点的帧图像 Blob
 */
async function getVideoFrameAtSecond (videoBlob, second = 3) {
  // 创建视频元素
  const video = document.createElement('video')
  const objectURL = URL.createObjectURL(videoBlob)
  video.src = objectURL

  return new Promise((resolve, reject) => {
    video.addEventListener('loadeddata', () => {
      // 视频加载完成，设置时间点
      video.currentTime = second
    })
    video.addEventListener('seeked', () => {
      // 视频跳转到指定时间点时，绘制画面
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // 生成 Blob 数据
      canvas.toBlob(blob => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to generate blob'))
        }
      }, 'image/png')
    })
    video.addEventListener('error', err => reject(err))
  })
}
