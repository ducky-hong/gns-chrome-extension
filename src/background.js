const GP_SERVER_HOST = 'http://localhost:24703'
const SEARCH_PROVIDER_URL = 'https://www.google.com/search?q='

function resetDefaultSuggestion() {
  chrome.omnibox.setDefaultSuggestion({
    description: '<url><match>gns:</match></url> GNS alias'
  });
}

function navigate(url) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.update(tabs[0].id, {url: url});
  });
}

function search(text) {
  navigate(`${SEARCH_PROVIDER_URL}${text}`)
}

async function lookupGuidAndNavigate(guid, text) {
  const res = await fetch(`${GP_SERVER_HOST}/GNS/read?field=A&guid=${guid}`)
  const body = await res.json()
  if (body.record.length > 0) {
    const ip = body.record[0]
    navigate(`http://${ip}`)
  } else {
    search(text)
  }
}

chrome.omnibox.onInputEntered.addListener(async (text) => {
  const res = await fetch(`${GP_SERVER_HOST}/GNS/lookupguid?name=${text}`)
  const body = await res.text()
  const isOk = !body.startsWith('+NO+')
  if (isOk) {
    const guid = body
    await lookupGuidAndNavigate(guid, text)
  } else {
    search(text)
  }
})

resetDefaultSuggestion()
