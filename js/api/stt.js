/**
 * @description 本地 STT API
 * @param {Blob} videoBlob - 包含音频轨道的视频或音频文件 Blob 对象
 * @returns {Promise<string>} 语音识别完成后返回的完整转写文本
 */
async function localSTT (videoBlob) {
  const formData = new FormData()
  formData.append('audio', videoBlob)
  const response = await fetch('http://localhost:1643/transcribe', {
    method: 'POST',
    body: formData
  })
  const json = await response.json()
  return json.text
}

/**
 * @description Gladia STT API
 * @param {Blob} videoBlob - 包含音频轨道的视频或音频文件 Blob 对象
 * @returns {Promise<string>} 语音识别完成后返回的完整转写文本
 */
async function gladiaSTT (videoBlob) {
  // 上传视频文件，获取音频链接
  const formData = new FormData()
  formData.append('audio', videoBlob)
  const audioUrl = await fetch('https://api.gladia.io/v2/upload', {
    headers: {
      'x-gladia-key': gladiaAPIKey.value
    },
    body: formData,
    method: 'POST'
  })
    .then(response => response.json())
    .then(json => json.audio_url)

  const obj = {
    custom_vocabulary: false,
    detect_language: true,
    callback: false,
    callback_config: {
      method: 'POST'
    },
    subtitles: false,
    subtitles_config: {
      style: 'default'
    },
    diarization: false,
    diarization_config: {
      enhanced: false
    },
    translation: false,
    translation_config: {
      match_original_utterances: true
    },
    summarization: false,
    summarization_config: {
      type: 'general'
    },
    moderation: false,
    named_entity_recognition: false,
    chapterization: false,
    name_consistency: false,
    custom_spelling: false,
    structured_data_extraction: false,
    sentiment_analysis: false,
    audio_to_llm: false,
    sentences: false,
    display_mode: false,
    punctuation_enhanced: false,
    audio_url: audioUrl
  }
  // 获取结果链接
  const resultUrl = await fetch('https://api.gladia.io/v2/pre-recorded', {
    headers: {
      'Content-Type': 'application/json',
      'x-gladia-key': gladiaAPIKey.value
    },
    body: JSON.stringify(obj),
    method: 'POST'
  })
    .then(response => response.json())
    .then(json => json.result_url)

  // 需要等待服务器处理完
  let status
  while (status !== 'done') {
    // 查询处理结果
    const resultJson = await fetch(resultUrl, {
      headers: {
        'x-gladia-key': gladiaAPIKey.value
      }
    }).then(response => response.json())
    /**
     * queued      在列队中
     * processing  正在处理中
     * done        处理完成
     * error       出现错误
     */
    status = resultJson.status
    if (status === 'done') {
      // 获取语音转文字后的文本
      const transcript = resultJson.result.transcription.full_transcript
      return transcript
    } else {
      await delay(5)
    } // End if
  } // End while
}
