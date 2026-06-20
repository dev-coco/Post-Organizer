/**
 * @description 上传图像到 Gyazo 并返回图像的 URL
 * @param {Blob} blob - 要上传的图像数据（Blob 格式）
 * @returns {Promise<string>} 返回上传后图像的 URL
 */
async function uploadImage (blob) {
  const body = new FormData()
  body.append('imagedata', blob)
  body.append('access_token', 'JbUNowYxtz2nvfBWOn7_4dF_uTxDwZjAGGCXIK1UsrQ')
  const imageUrl = await fetch('https://upload.gyazo.com/api/v2/upload', {
    body,
    method: 'POST'
  })
    .then(response => response.json())
    .then(json => json.url)
  return imageUrl
}
