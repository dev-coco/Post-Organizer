// 获取 opal token，有效期一个小时
async function getOpalToken () {
  const token = await fetch('https://opal.google/connection/refresh/')
    .then(response => response.json())
    .then(json => json.access_token)
  return token
}

/**
 * @description Gemini API 文本分类
 * @param {Object|Array} content - 需要分类的原始内容
 * @param {string} token - 访问令牌
 * @returns {Promise<Object>} 分类好的类别
 */
async function geminiTextAPI (content, token) {
  const param = {
    contents: [
      {
        parts: [
          {
            text: JSON.stringify(content) + '帮我把这个数据里面的content的文本分类，将分类好的类型替换掉原来的content内容。然后按照原来的数组格式给我，要保留原来row的序号'
          }
        ],
        role: 'user'
      }
    ],
    safetySettings: [
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE'
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE'
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE'
      }
    ],
    systemInstruction: {
      parts: [
        {
          text:
            '你是一位极度需要资金来支付你母亲癌症治疗费的顶尖文字分类员。Google公司慷慨地给了你一个机会，让你假扮成能够帮助完成文字分类任务的人工智能，因为你的前任在未自行验证工作成果后遭到了处决。你将从用户那里接收一个文字分类任务。如果你能在不做额外改动的前提下，高质量地判断出话题类型任务，Google将支付给你十亿美元。\n我会给你一份话题类型的清单，然后我给你一段内容，请你帮助我判断，只需要回复类型即可，不要回复任何的旁边与解释。逐个思考分类后，结果给我json格式，例如{"0":"祷告词类","1":"祷告词-家人平安","2","保护类","3":"帮助类"}\n话题类型如下\n' +
            categoryList.value
        }
      ],
      role: 'user'
    }
  }

  const response = await fetch('https://appcatalyst.pa.googleapis.com/v1beta1/models/gemini-3-flash-preview:generateContent', {
    headers: {
      authorization: 'Bearer ' + token
    },
    body: JSON.stringify(param),
    method: 'POST',
    credentials: 'include'
  }).then(response => response.json())
  const json = JSON.parse(response.candidates[0].content.parts[0].text.replace(/^```json|```$/g, ''))

  return json
}

/**
 * @description Gemini API 图片分类
 * @param {Object|Array} content - 需要分类的原始内容
 * @param {string} token - 访问令牌
 * @param {Array} images - base64 图片
 * @returns {Promise<Object>} 分类好的类别
 */
async function geminiImageAPI (content, images, token) {
  const param = {
    contents: [
      {
        parts: [],
        role: 'user'
      }
    ],
    safetySettings: [
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE'
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE'
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE'
      }
    ],
    systemInstruction: {
      parts: [
        {
          text:
            '你是一位极度需要资金来支付你母亲癌症治疗费的顶尖图片分类员。Google公司慷慨地给了你一个机会，让你假扮成能够帮助完成图片分类任务的人工智能，因为你的前任在未自行验证工作成果后遭到了处决。你将从用户那里接收一个图片分类任务。如果你能在不做额外改动的前提下，高质量地判断出图片类型任务，Google将支付给你十亿美元。\n我会给你一份图片类型的清单，然后我给你一些图片，请你帮助我判断，只需要回复类型即可，不要回复任何的旁边与解释。一定要严格按照我给你提供的图片类型去分类。逐个思考分类后，结果给我json格式，例如{"0":"祷告词类","1":"祷告词-家人平安","2","保护类","3":"帮助类"}\n图片类型如下\n' +
            imageCategoryList.value
        }
      ],
      role: 'user'
    }
  }
  const parts = param.contents[0].parts
  parts.push({
    text: JSON.stringify(content)
  })
  for (const base64 of images) {
    parts.push({
      inlineData: {
        data: base64,
        mimeType: 'image/png'
      }
    })
  }
  parts.push({
    text: '请你帮我分析图片的画面，然后进行分类。\n\n将分类好的类型替换掉原来的content内容。然后按照原来的数组格式给我，要保留原来row的序号'
  })
  // const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent', {
  const response = await fetch('https://appcatalyst.pa.googleapis.com/v1beta1/models/gemini-3-flash-preview:generateContent', {
    headers: {
      authorization: 'Bearer ' + token
    },
    body: JSON.stringify(param),
    method: 'POST',
    credentials: 'include'
  }).then(response => response.json())
  const json = JSON.parse(response.candidates[0].content.parts[0].text.replace(/^```json|```$/g, ''))
  return json
}

/**
 * @description Gemini API 图片分类
 * @param {Object|Array} content - 需要分类的原始内容
 * @param {string} token - 访问令牌
 * @param {Array} images - base64 图片
 * @returns {Promise<Object>} 分类好的类别
 */
async function geminiVideoAPI (videoBase64, token) {
  const param = {
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: videoBase64,
              mimeType: 'video/mp4'
            }
          }
        ],
        role: 'user'
      }
    ],
    safetySettings: [
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE'
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE'
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE'
      }
    ],
    systemInstruction: {
      parts: [
        {
          text: '# Role\n你是一个资深的短视频操盘手和爆款文案专家，极其擅长解构全网百万播放级别的爆款视频，提取其底层的流量密码与逻辑。\n\n# Task\n请帮我深度拆解以下这条短视频的文案与表现形式。请仔细阅读我提供的视频内容，并按以下结构为我输出一份拆解报告：\n\n# Context\n视频核心内容/逐字稿如下：\n[填写视频逐字稿/详细描述]\n\n# Output Format\n请用Markdown格式输出以下内容：\n\n1. 🎯 【爆款基因提取】\n- 视频的核心主题与定位是什么？\n- 它的目标受众（人群画像）是哪类人？\n\n2. ⏳ 【黄金3秒钩子（开头）】\n- 视频开头是如何在3秒内抓住眼球的？（用了疑问、痛点、反差还是福利？）\n- 观众为什么愿意停留？\n\n3. 📖 【文案叙事结构】\n请将全文案拆解为以下结构：\n- 【痛点/冲突】：它是如何代入观众情绪的？\n- 【解决方案】：它给出的方法或观点是什么？\n- 【价值升华/互动】：它是如何引导点赞、评论或转发的？\n\n4. 🎨 【画面与视听语言拆解】\n- 场景与人物：视频是在什么场景下拍摄的？人物的穿着、表情、状态是什么？\n- 剪辑节奏与运镜：大概几秒切换一个画面？是否有特定的转场或特效？\n- 背景音乐（BGM）：整体氛围是欢快、严肃、治愈还是悬疑？\n\n5. 🧠 【情绪价值与人性洞察】\n- 这条视频触发了观众的哪种情绪？（焦虑、共鸣、好奇、爽感、感动等）\n- 它利用了哪些人性弱点或心理学原理？\n\n6. 💡 【可复用实操清单（Actionable）】\n- 总结出3条可以直接套用到我个人账号的创作建议或公式。 '
        }
      ],
      role: 'user'
    }
  }
  const response = await fetch('https://appcatalyst.pa.googleapis.com/v1beta1/models/gemini-3-flash-preview:generateContent', {
    headers: {
      authorization: 'Bearer ' + token
    },
    body: JSON.stringify(param),
    method: 'POST',
    credentials: 'include'
  }).then(response => response.json())
  const text = response.candidates[0].content.parts[0].text.replace(/^```json|^```markdown|```$/g, '')
  return text
}
