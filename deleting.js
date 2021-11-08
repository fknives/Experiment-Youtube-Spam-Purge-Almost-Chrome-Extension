// HTML DOOM ELEMENT IDS
var SEARCH_DESCRIPTION_ID = "search_description"
var FIRST_REQUEST_LOADER_ID = "first-request-loading"
var NUMBER_OF_COMMENT_THREADS_LOADED_ID = "number_of_comment_threads"
var NUMBER_OF_COMMENTS_TO_DELETE_ID = "comments_to_be_deleted"
var DELETE_COMMENTS_NUMBER_PROGRESS_ID = "comments_deleted_so_far"
var COULDNT_DELETE_COMMENTS_NUMBER_PROGRESS_ID = "couldnt_delete_comments_so_far"
var COMMENTS_TO_DELETE_PROGRESS_ID = "-comments"
var COMMENTS_DELETING_PROCESS_ID = "-delete"
var SHOW_SAMPLE_CTA_ID = "show_sample_cta"
var DELETE_ALL_CTA_ID = "delete_all_cta"
var COMMENT_SAMPLE_PLACEHOLDER_ID = "comment_sample_placeholder"

// global references
var youtubeToken = ""
var toDeleteUserId = ""
var videoId = ""
var commentResponses = []
var commentsToDelete = []
var isSampleShown = false

chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
    youtubeToken = response.youtubetoken;
    toDeleteUserId = response.toDeleteUserId;
    videoId = response.videoId;
    document.getElementById(SEARCH_DESCRIPTION_ID).innerHTML = "Searching through the comments of the following video: <a href=\"https://www.youtube.com/watch?v=" + videoId + "\">video link (" + videoId + ")</a> by the following user: <a href=\"https://www.youtube.com/channel/" + toDeleteUserId + "\">user profile (" + toDeleteUserId + ")</a>"

    runFindCommentThreadsRequest("", 0)
});

function runFindCommentThreadsRequest(pageToken, numberOfCommentsFoundSoFar) {
    const request = new XMLHttpRequest();
    const url = 'https://www.googleapis.com/youtube/v3/commentThreads?part=id,replies,snippet&videoId=' + videoId + "&access_token=" + youtubeToken + "&pageToken=" + pageToken;
    request.open("GET", url);

    request.onreadystatechange = (e) => {
        if (request.readyState === XMLHttpRequest.DONE) {
            var status = request.status;
            if (status >= 200 && status < 400) {
                var responseJson = JSON.parse(request.responseText)
                onCommentThreadsReceived(responseJson, numberOfCommentsFoundSoFar)
            } else {
                console.log("status = " + request.status + " response =" + request.responseText)
                onCommentThreadsAccessError()
            }
        }
    }
    request.send();
}

function onCommentThreadsAccessError() {
    document.getElementById(FIRST_REQUEST_LOADER_ID).style.display = "none"
    document.getElementById(NUMBER_OF_COMMENT_THREADS_LOADED_ID).innerHTML = "Something went wrong while accessing comment threads of the video, please try again"
}

function onCommentThreadsReceived(responseJson, numberOfCommentsFoundSoFar) {
    commentResponses.push(responseJson)
    var newTotalCommentsCount = numberOfCommentsFoundSoFar + responseJson.pageInfo.totalResults
    document.getElementById(NUMBER_OF_COMMENT_THREADS_LOADED_ID).innerHTML = "Comment threads accessed: " + newTotalCommentsCount
    if (responseJson.nextPageToken == null) {
        onCommentThreadsFound(commentResponses, newTotalCommentsCount)
    } else {
        runFindCommentThreadsRequest(responseJson.nextPageToken, newTotalCommentsCount)
    }
}

function onCommentThreadsFound(commentResponses, totalCountOfThreads) {
    document.getElementById(NUMBER_OF_COMMENT_THREADS_LOADED_ID).innerHTML = "Number Of Comment Threads: " + totalCountOfThreads
    document.getElementById(FIRST_REQUEST_LOADER_ID).style.display = "none"
    var commentThreadProcessed = 0;
    var foundCommentsToDelete = []
    setProgressOfProgressBar(COMMENTS_TO_DELETE_PROGRESS_ID, 0)

    for (var i = 0; i < commentResponses.length; i++) {
        var comentThreadResponses = commentResponses[i]
        for (var j = 0; j < comentThreadResponses.items.length; j++) {
            var commentThread = comentThreadResponses.items[j]
            foundCommentsToDelete = foundCommentsToDelete.concat(getMatchingCommentIdsFromCommentThread(commentThread))
            commentThreadProcessed = commentThreadProcessed + 1;
            setProgressOfProgressBar(COMMENTS_TO_DELETE_PROGRESS_ID, Math.floor(commentThreadProcessed * 100 / totalCountOfThreads))
        }
    }
    commentsToDelete = foundCommentsToDelete
    document.getElementById(NUMBER_OF_COMMENTS_TO_DELETE_ID).innerHTML = "Number of comments to be deleted: " + foundCommentsToDelete.length
    document.getElementById(SHOW_SAMPLE_CTA_ID).style.visibility = "visible"
    document.getElementById(SHOW_SAMPLE_CTA_ID).addEventListener("click", showSample);
    document.getElementById(DELETE_ALL_CTA_ID).style.visibility = "visible"
    document.getElementById(DELETE_ALL_CTA_ID).addEventListener("click", deleteAllComments);
}

function setProgressOfProgressBar(id, progress) {
    document.getElementById("progress-bar" + id).style.visibility = 'visible'
    if (progress < 50) {
        var progressInDegrees = Math.floor(progress * 3.6) + 45;
        document.getElementById("progress-second-half" + id).style.visibility = 'hidden'
        document.getElementById("progress-moving" + id).style.transform = "rotate(45deg)";
        document.getElementById("progress-cut" + id).style.transform = "rotate(" + progressInDegrees + "deg)";
    } else {
        var progressInDegrees = Math.floor((progress - 50) * 3.6) + 225;
        document.getElementById("progress-second-half" + id).style.visibility = 'visible'
        document.getElementById("progress-moving" + id).style.transform = "rotate(225deg)";
        document.getElementById("progress-cut" + id).style.transform = "rotate(" + progressInDegrees + "deg)";
    }
    document.getElementById("progress-number" + id).innerHTML = progress + "%"
}

function getMatchingCommentIdsFromCommentThread(commentThreadObject) {
    var foundComments = []
    var topLevelComment = commentThreadObject.snippet.topLevelComment
    if (isCommentMathingAuthor(topLevelComment)) {
        foundComments.push(topLevelComment)
    }

    if (commentThreadObject.replies != null && commentThreadObject.replies.comments != null) {
        for (i = 0; i < commentThreadObject.replies.comments.length; i++) {
            var comment = commentThreadObject.replies.comments[i]
            if (isCommentMathingAuthor(comment)) {
                foundComments.push(comment)
            }
        }
    }

    return foundComments;
}

function isCommentMathingAuthor(comment) {
    return comment.snippet.authorChannelId.value === toDeleteUserId
}

function showSample() {
    if (isSampleShown) return
    isSampleShown = true

    for (i = 0; i < commentsToDelete.length && i < 3; i++) {
        var commentToShow = commentsToDelete[i];
        var divTag = document.createElement("div");
        divTag.setAttribute("class", "comment")

        var userNameTag = document.createElement("p");
        divTag.appendChild(userNameTag);
        userNameTag.setAttribute("class", "comment-name")
        userNameTag.innerHTML = "name: " + commentToShow.snippet.authorDisplayName

        var commentTag = document.createElement("p");
        divTag.appendChild(commentTag);
        commentTag.setAttribute("class", "comment-text")
        commentTag.innerHTML = "comment: " + commentToShow.snippet.textDisplay

        document.getElementById(COMMENT_SAMPLE_PLACEHOLDER_ID).appendChild(divTag);
    }
}

function deleteAllComments() {
    setProgressOfProgressBar(COMMENTS_DELETING_PROCESS_ID, 0)
    deleteComment(0, 0)
}

function deleteComment(index, failures) {
    if (commentsToDelete.length <= index) {
        onAllCommentsDeleted(failures);
        return
    }
    const request = new XMLHttpRequest();
    const url = 'https://www.googleapis.com/youtube/v3/comments?id=' + commentsToDelete[index].id + "&access_token=" + youtubeToken;
    request.open("DELETE", url);

    request.onreadystatechange = (e) => {
        if (request.readyState === XMLHttpRequest.DONE) {

            setProgressOfProgressBar(COMMENTS_DELETING_PROCESS_ID, Math.floor((index + 1) / commentsToDelete.length * 100))
            var status = request.status;
            var failuresAdjusted = failures
            if (status >= 200 && status < 400) {
                document.getElementById(DELETE_COMMENTS_NUMBER_PROGRESS_ID).innerHTML = "Number of comments deleted so far: " + (index + 1)
            } else {
                failuresAdjusted = failures + 1
                document.getElementById(COULDNT_DELETE_COMMENTS_NUMBER_PROGRESS_ID).innerHTML = "Number of comments couldn't delete so far: " + failuresAdjusted
            }
            deleteComment(index + 1, failuresAdjusted)
        }
    }
    request.send();
}

function onAllCommentsDeleted(failures) {
    if (failures == 0) {
        document.getElementById(DELETE_COMMENTS_NUMBER_PROGRESS_ID).innerHTML = "All comments are deleted(" + commentsToDelete.length + "), closing tab in 3 seconds..."
        setTimeout(function() {
            chrome.runtime.sendMessage({
                closeMe: "true"
            });
        }, 3000);
    } else {
        var successCount = commentsToDelete.length - failures
        document.getElementById(DELETE_COMMENTS_NUMBER_PROGRESS_ID).innerHTML = "Couldn't delete all the comments, but did delete: " + successCount
    }
}