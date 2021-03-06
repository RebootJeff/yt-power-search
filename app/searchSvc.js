angular.module('app')
.service('Search', function(Google, Moment, Utils, $q) {
  'use strict';
  var svc = this;

  function deserializeSearchResult(item, index) {
    return {
      relevanceRank: index + 1,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: new Date(item.snippet.publishedAt),
      humanizedPublishedAt: Moment(item.snippet.publishedAt).format('YYYY/M/D h:mm a'),
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      channelUrl: 'https://www.youtube.com/channel/' + item.snippet.channelId,
      thumbnailUrl: item.snippet.thumbnails.default.url,
      videoId: item.id.videoId,
      videoUrl: 'https://www.youtube.com/watch?v=' + item.id.videoId
    };
  }

  function getDetailsForSearchResults(searchResults) {
    var videoDetailRequests = searchResults.map(function(searchResult) {
      return Google.getYouTubeVideo(searchResult.videoId);
    });
    return $q.all(videoDetailRequests);
  }

  function getLikePercentage(statistics) {
    var total = statistics.likeCount + statistics.dislikeCount;
    var ratio = (total === 0) ? 0 : (statistics.likeCount / total);
    var percentage = ratio * 100;
    return percentage;
  }

  function mungeVideoDetailsWithSearchResults(searchResults, videoDetails) {
    var videoDetail;
    var status;
    var statistics;
    var munged;

    var results = searchResults.map(function(searchResult, index) {
      videoDetail = videoDetails[index].contentDetails;
      status = videoDetails[index].status;
      statistics = Utils.numberifyObjVals(videoDetails[index].statistics);
      munged = angular.extend(searchResult, videoDetail, status, statistics);

      munged.duration = Moment.duration(videoDetail.duration);
      munged.humanizedDuration = munged.duration.format('h[h] mm[m] ss[s]');
      munged.hd = (videoDetail.definition === 'hd');
      munged.threeD = (videoDetail.definition === '3d');
      munged.likePercentage = getLikePercentage(statistics);
      return munged;
    });

    return results;
  }

  svc.getVideos = function(options) {
    var searchResults;

    return Google.searchYouTubeVideos(options)
      .then(function(response) {
        searchResults = response.result.items.map(deserializeSearchResult);
        return getDetailsForSearchResults(searchResults);
      })
      .then(function(responses) {
        var videoDetails = responses.map(function(responses) {
          return responses.result.items[0];
        });

        return mungeVideoDetailsWithSearchResults(searchResults, videoDetails);
      });
  };

  // exports for testing
  angular.extend(svc, {
    _getLikePercentage: getLikePercentage
  });
});
