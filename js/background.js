chrome.action.onClicked.addListener(tab => {
  chrome.tabs.query({}, tabs => {
    const existingTab = tabs.find(t => t.url.includes('index.html'))
    if (existingTab) {
      chrome.tabs.update(existingTab.id, { active: true })
    } else {
      chrome.tabs.create({ url: 'index.html' })
    }
  })
})
