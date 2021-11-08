var token = ""
var userId = ""
var videoId = ""

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.tokenWithUrl != null) {
        token = request.tokenWithUrl.replace("https://www.youtube.com/deleteallcomments#access_token=", "").replace(/&.*/g, "")

        let url = chrome.runtime.getURL("deleting.html");
        chrome.tabs.remove(sender.tab.id);
        chrome.tabs.create({url});
    } else if (request.toDeleteUserId != null) {
        userId = request.toDeleteUserId.replace("https://www.youtube.com/channel/", "");
    } else if (request.videoUrl != null) {
        videoId = request.videoUrl.replace("https://www.youtube.com/watch?v=", "").replace(/&.*/g, "");
    } else if (request.closeMe != null) {
        chrome.tabs.remove(sender.tab.id);
    } else {
        sendResponse({
            youtubetoken: token,
            toDeleteUserId: userId,
            videoId: videoId
        });
    }

});