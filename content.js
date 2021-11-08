let observer = new MutationObserver((mutations) => { // observe changes on the page, comments are loaded separately so we need this to wait for them
  mutations.forEach((mutation) => {
    if (!mutation.addedNodes) return

    for (let i = 0; i < mutation.addedNodes.length; i++) {
      let node = mutation.addedNodes[i];
      
      if (node.id == "reply-dialog") { // we find the reply-dialog place holder
        for (let j = 0; j < node.parentElement.childElementCount; j++) {
          let possibleToolbar = node.parentElement.children[j];
          if (possibleToolbar.id == "toolbar") { // let's find the heath/reply toolbar
            var spanTag = createDeleteAllCommentsCTA();
            possibleToolbar.appendChild(spanTag);
          }
        }
      }
    }
  })
});

function createDeleteAllCommentsCTA() {
  var spanTag = document.createElement("span");
  spanTag.setAttribute( 'class', 'custom-youtube-button-class' );
  spanTag.innerHTML = "DELETE All COMMENTS"
  spanTag.style.font = "12px arial,serif";
  spanTag.addEventListener("click", deleteAllButtonClicked);
  return spanTag
}

function deleteAllButtonClicked(pointerEvent) {
  searchingCommentParent = findMainParentOfReplyCTA(pointerEvent)
  var referenceUrl = findUrlToUser(searchingCommentParent).href;

  chrome.runtime.sendMessage({videoUrl: location.href}); // save video URL
  chrome.runtime.sendMessage({toDeleteUserId: referenceUrl}); // save user URL

  // get authentication token
  window.open("https://accounts.google.com/o/oauth2/v2/auth?client_id="+google_login_client_id+"&redirect_uri=https://youtube.com/deleteallcomments&response_type=token&scope=https://www.googleapis.com/auth/youtube.force-ssl")
}

function findMainParentOfReplyCTA(pointerEvent) {
  var searchingCommentParent = pointerEvent.currentTarget;
  while(searchingCommentParent.id != "main") {
    searchingCommentParent = searchingCommentParent.parentElement;
  }
  return searchingCommentParent;
}

function findUrlToUser(mainElement) {
  for (var i = 0; i < mainElement.childElementCount; i++) {
    if (mainElement.id == "author-text") {
      return mainElement;
    } else {
      var childResult = findUrlToUser(mainElement.children[i]);
      if (childResult != null) {
        return childResult;
      }
    }
  }
  return null;
}


observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
});