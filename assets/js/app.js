const spotify_CLIENT = "610593211a2c49f28f1a9d0eafb16946";

let stateKey = 'spotify_auth_state';

// on load, try to pull access_token from URL parameters
// localhost:8000?access_token=[token]&state=[state]
const params = getHashParams();
console.log(params);

// save access_token, state, and stored state into variables
let access_token = params.access_token,
  userId = "",
  playerId = "",
  state = params.state,
  storedState = localStorage.getItem(stateKey);


/**
 * Obtains parameters from the hash of the URL
 * @return Object
 */
// NO NEED TO WORRY ABOUT THIS
function getHashParams() {
  const hashParams = {};
  let e,
    r = /([^&;=]+)=?([^&;]*)/g,
    q = window
      .location
      .hash
      .substring(1);
  while (e = r.exec(q)) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
// NO NEED TO WORRY ABOUT THIS
function generateRandomString(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// if there's an access_token and state is either null OR doesn't equal stored
// state, then let user know there's an issue with authentication
if (access_token && (state == null || state !== storedState)) {
  console.log("You need to login.");
  spotifyLogin();
} else {

  // if authentication is successful, remove item from localStorage
  localStorage.removeItem(stateKey);
  // if there's an access token, get user information
  if (access_token) {
    $
      .ajax({
        url: 'https://api.spotify.com/v1/me',
        headers: {
          'Authorization': 'Bearer ' + access_token
        }
      })
      .then(function (response) {
        console.log(response);
        $("#login-button").hide();
        $("#app-body").show();

        userId = response.id;
        $("#profile-info").html(`<h3>${response.display_name}</h3>`);
        // <img class="img-fluid" src="${response.images[0].url}"/>
      });
  }
}

// turn on spotify player
window.onSpotifyWebPlaybackSDKReady = () => {

  const token = getHashParams().access_token;

  const player = new Spotify.Player({
    name: 'Web Playback SDK Quick Start Player',
    getOAuthToken: cb => {
      cb(token);
    }
  });

  // Error handling
  player.addListener('initialization_error', ({message}) => {
    console.error(message);
  });
  player.addListener('authentication_error', ({message}) => {
    console.error(message);
  });
  player.addListener('account_error', ({message}) => {
    console.error(message);
  });
  player.addListener('playback_error', ({message}) => {
    console.error(message);
  });

  // Playback status updates
  player.addListener('player_state_changed', state => {
    // console.log(state);
  });

  // Ready
  player.addListener('ready', ({device_id}) => {
    console.log('Ready with Device ID', device_id);
    playerId = device_id;
    setWebPlayer(device_id, access_token);
  });

  // Not Ready
  player.addListener('not_ready', ({device_id}) => {
    console.log('Device ID has gone offline', device_id);
  });

  // Connect to the player!
  player.connect();
};

// LOG INTO SPOTIFY
function spotifyLogin() {
  const client_id = spotify_CLIENT; // Your client id
  const redirect_uri = 'https://mebert2682.github.io/iFam/';

  // generate random state key
  const state = generateRandomString(16);

  // set state in localStorage (will read when we get it back)
  localStorage.setItem(stateKey, state);
  // Set scope for authentication privileges
  const scope = 'streaming user-read-birthdate user-read-private user-read-email user-read-playba' +
      'ck-state user-modify-playback-state';

  // build out super long url
  let url = 'https://accounts.spotify.com/authorize';
  url += '?response_type=token';
  url += '&client_id=' + encodeURIComponent(client_id);
  url += '&scope=' + encodeURIComponent(scope);
  url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
  url += '&state=' + encodeURIComponent(state);

  // change pages and go to the spotify login page
  window.location = url;
}

// SET SPOTIFY WEB PLAYER TO BROWSER
function setWebPlayer(playerId, access_token) {
  $.ajax({
    url: "https://api.spotify.com/v1/me/player",
    method: "PUT",
    data: JSON.stringify({"device_ids": [playerId]}),
      headers: {
        'Authorization': "Bearer " + access_token
      }
    })
    .then(function (response) {
      //console.log(response);

    })
    .catch(function (err) {
      console.log(err);
    });
}

//get searched artist tracks, albums and playlists

$("#search-artist").on("click", function(e){
  e.preventDefault();
console.log($("#artist-input").val().trim());
var artist = $("#artist-input").val().trim();

  getArtistInfo(artist);
  getYouTube(artist);
  document.getElementById("all-music-info").style.display = "block";

  $("#search-artist").click(function() {
    $("#tracks-info").empty();
  });

  $("#search-artist").click(function() {
    $(".lyrics").empty();
  });

})

function getArtistInfo(artist) {
console.log("here")
var queryUrl = `https://api.spotify.com/v1/search?q=${artist}&type=artist&market=US`


$.ajax({
    url: queryUrl,
    method: "GET",
    headers: {
      'Authorization': "Bearer " + access_token
    }

  })
  .then(function (response) {
    console.log(response);
    getArtistAlbums(response.artists.items[0].id);
  })
  .catch(function(err) {
    console.log(err);
  })

}

function getArtistAlbums(id) {
  console.log(id);

  var artistId = id
  
  console.log(artistId);
  var queryUrl = `https://api.spotify.com/v1/artists/${artistId}/albums`;

  console.log(queryUrl);


  $.ajax({
    url: queryUrl,
    method: "GET",
    headers: {
      'Authorization': "Bearer " + access_token
    }

  })
  .then(function (response) {
    console.log(response);
    printArtistAlbums(response.items);


  })
  .catch(function(err) {
    console.log(err);
  })
}




// print out artist albums
function printArtistAlbums(albumArray) {
  
  console.log(albumArray)

 

  const $artistAlbums = $("#album-info");
  $artistAlbums.empty();
  albumArray.forEach(function (items) {

    console.log(albumArray);



    $("<button>")
      .addClass("list-group-item d-flex justify-content-between align-items-center playlist-button list-group-item-action")
      .attr({"album-name": items.name, "album-uri": items.uri})
      .html(items.name)
      .append(`<span class="badge badge-danger badge-pill">Select Album</span>`)
      .appendTo($artistAlbums);

      console.log(items.uri);


    
  });

}

function getAlbumTracks(id) {
  console.log(id);

  var albumId = id
  
  console.log(albumId);
  var queryUrl = `https://api.spotify.com/v1/artists/${albumId}/albums`;

  console.log(queryUrl);


  $.ajax({
    url: queryUrl,
    method: "GET",
    headers: {
      'Authorization': "Bearer " + access_token
    }

  })
  .then(function (response) {
    console.log(response);
    printAlbumTracks(response.items);


  })
  .catch(function(err) {
    console.log(err);
  })
}

// get album tracks
 function selectAlbum(id) {
   $(this).addClass("active");
   const playAlbumId = $(this).attr("album-name");
   let tracklistUri = $(this).attr("album-uri");
   tracklistUri = tracklistUri.substring(14);

   console.log(tracklistUri);

   var albumId = id
  
   console.log(albumId);
   var queryUrl =  `https://api.spotify.com/v1/albums/${tracklistUri}/tracks`;

   console.log(queryUrl);


   $(".playlist-button").removeClass("active");

   console.log(playAlbumId);
   $
     .ajax({
       url: queryUrl,
       method: "GET",
       headers: {
         'Authorization': "Bearer " + access_token
       }
     })
     .then(function (response) {
     console.log(response);

       const trackInfo = response.items
         .map(function (trackInfo) {
           return {
             name: trackInfo.name,
             artists: trackInfo.artists,
             uri: trackInfo.uri
         }
        });
       console.log(trackInfo);
       printTrackInfo(trackInfo, tracklistUri);
     })
 }

// print tracks to page

function printAlbumTracks(trackArray) {
  
  console.log(trackArray)

 

  const $albumTracks = $("#track-info");
  $albumTracks.empty();
  trackArray.forEach(function (items) {

    console.log(trackrray);



    $("<button>")
      .addClass("list-group-item d-flex justify-content-between align-items-center playlist-button list-group-item-action")
      .attr({"track-name": items.name, "track-id": items.id})
      .html(items.name)
      .append(`<span class="badge badge-danger badge-pill">${items.track_number}</span>`)
      .appendTo($albumTracks);

      console.log(items.id);

    
  });

  

  console.log($albumTracks);

}

// select and play track
function selectTrack(id) {



  
  $(".track-button").removeClass("active");
  $(this).addClass("active");
  const trackId = $(this).attr("data-track-uri");
  const contextUri = $(this).attr("data-context");
  console.log(trackId);
  console.log(contextUri);
  $.ajax({
    url: `https://api.spotify.com/v1/track/${trackID}`,
    method: "PUT",
    data: JSON.stringify({
      "offset": {
        "uri": trackId
      },
      "context_uri": contextUri
    }),
      headers: {
        'Authorization': "Bearer " + access_token
      }
    })
    .then(function (response) {
      console.log(response);
      setTimeout(getCurrentSong, 1500);
      $("#play-button").attr("data-state", "play")
      $("#play-button > i").removeClass("fa-play").addClass("fa-pause");
    })
    .catch(function (err) {
      console.log(err);
    })
}

// get logged in spotify user's playlists
function getUserPlaylists() {
  $
    .ajax({
      url: "https://api.spotify.com/v1/me/playlists?limit=50",
      method: "GET",
      headers: {
        'Authorization': "Bearer " + access_token
      }
    })
    .then(function (response) {
      console.log(response);
      printPlaylistInfo(response.items);
    })
}

// print out playlist information
function printPlaylistInfo(playlistArray) {
  const $playlistInfo = $("#playlist-info");
  $playlistInfo.empty();
  playlistArray.forEach(function (playlist) {
    $("<button>")
      .addClass("list-group-item d-flex justify-content-between align-items-center playlist-button list-group-item-action")
      .attr({"data-artist-id": playlist.id, "data-playlist-uri": playlist.uri})
      .text(playlist.name)
      .append(`<span class="badge badge-danger badge-pill">${playlist.tracks.total}</span>`)
      .appendTo($playlistInfo);
  });
}

// get playlist tracks
function selectPlaylist() {
  $(".playlist-button").removeClass("active");
  $(this).addClass("active");
  const playlistId = $(this).attr("data-playlist-id");
  let playlistUri = $(this).attr("data-playlist-uri");
  playlistUri = `spotify:album:${playlistUri}`;
  console.log(playlistId);
  console.log(playlistUri);
  $
    .ajax({
      url: `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
      method: "GET",
      headers: {
        'Authorization': "Bearer " + access_token
      }
    })
    .then(function (response) {
      const trackInfo = response
        .items
        .map(function (trackInfo) {
          return trackInfo.track
        });
      console.log(trackInfo);
      printTrackInfo(trackInfo, playlistUri);
    })
}

// print tracks to page
function printTrackInfo(trackArray, playlistContextUri) {

  const $trackInfo = $("#track-info");
  $trackInfo.empty();

  trackArray.forEach(function (track) {
    const artists = track
      .artists
      .map(artist => artist.name)
      .join(", ");

    $("<button>")
      .addClass("list-group-item d-flex justify-content-between align-items-center track-button list-group-item-action")
      .text(`${artists} - ${track.name}`)
      .attr({"data-track-uri": track.uri, "data-context": playlistContextUri})
      .append(`<span class="badge badge-danger badge-pill get-lyrics" data-artist="${artists}" data-song="${track.name}">Get Lyrics</span>`)
      .appendTo($trackInfo);
  });
}

// select and play track
function selectTrack() {
  $(".track-button").removeClass("active");
  $(this).addClass("active");
  const trackId = $(this).attr("data-track-uri");
  const contextUri = $(this).attr("data-context");
  console.log(trackId);
  console.log(contextUri);
  $.ajax({
    url: `https://api.spotify.com/v1/me/player/play?device_id=${playerId}`,
    method: "PUT",
    data: JSON.stringify({
      "offset": {
        "uri": trackId
      },
      "context_uri": `spotify:album:${contextUri}`
    }),
      headers: {
        'Authorization': "Bearer " + access_token
      }
    })
    .then(function (response) {
      //console.log(response);
      setTimeout(getCurrentSong, 1500);
      $("#play-button").attr("data-state", "play")
      $("#play-button > i").removeClass("fa-play").addClass("fa-pause");
    })
    .catch(function (err) {
      console.log(err);
    })
}

// skip song
function nextSong() {
  $
    .ajax({
      url: "https://api.spotify.com/v1/me/player/next",
      method: "POST",
      headers: {
        'Authorization': "Bearer " + access_token
      }
    })
    .then(function (response) {
      console.log(response);
      setTimeout(getCurrentSong, 1500);
      $("#play-button").attr("data-state", "play")
      $("#play-button > i").removeClass("fa-play").addClass("fa-pause");
    });
}

// previous song
function prevSong() {
  $
    .ajax({
      url: "https://api.spotify.com/v1/me/player/previous",
      method: "POST",
      headers: {
        'Authorization': "Bearer " + access_token
      }
    })
    .then(function (response) {
      console.log(response);
      setTimeout(getCurrentSong, 1500);
      $("#play-button").attr("data-state", "play")
      $("#play-button > i").removeClass("fa-play").addClass("fa-pause");
    });
}

// resume playback
function resumeSong() {
  console.log("hi")
  $
    .ajax({
      url: "https://api.spotify.com/v1/me/player/play",
      method: "PUT",
      headers: {
        'Authorization': "Bearer " + access_token
      }
    })
    .then(function (response) {
      console.log(response);
      setTimeout(getCurrentSong, 1500);
      $("#play-button").attr("data-state", "play")
      $("#play-button > i").removeClass("fa-play").addClass("fa-pause");
    });
}

// pause playback
function pauseSong() {
  console.log("hi")
  $
    .ajax({
      url: "https://api.spotify.com/v1/me/player/pause",
      method: "PUT",
      headers: {
        'Authorization': "Bearer " + access_token
      }
    })
    .then(function (response) {
      console.log(response);
      $("#play-button").attr("data-state", "pause")
      $("#play-button > i").removeClass("fa-pause").addClass("fa-play");
    });
}

// get current song info
function getCurrentSong() {
  $.ajax({
    url: "https://api.spotify.com/v1/me/player/currently-playing",
    method: "GET",
    headers: {
      'Authorization': "Bearer " + access_token
    }
  }).then(function(response) {
    const trackUri = response.item.uri;
    console.log(response.item.uri);
    console.log(trackUri);
    $(".track-button").removeClass("active");
    $(`[data-track-uri="${trackUri}"]`).addClass("active");
    $("#track").text(response.item.name);
    $("#artist").text(response.item.artists.map(artist => artist.name).join(", "));
  });
}

 //lyrics section

 $(document).on("click", ".get-lyrics", function(){
  
  var artist = $(this).attr("data-artist"); 
  var song = $(this).attr("data-song");
  console.log(artist);
  
  var queryUrl = `https://api.lyrics.ovh/v1/${artist}/${song}`
  
  console.log(queryUrl);
  
  $.ajax({
     url: queryUrl,
     method: "GET"
  
  
   })
   .then(function (response) {
     console.log(response);

     $(".lyrics").text(response.lyrics);

     
   })
   .catch(function(err) {
     console.log(err);
   })
 

});

//get wikipedia info







//get youtube videos
  
function getYouTube(artist) {

  console.log(artist);
  var key = `AIzaSyAdwhObhy6o8O6VU8xMlMYd_kpS1KXq9fM`;
  var URL = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${artist}`;

  var options = {
    part: `snippet`,
    key: key,
  }


    $.getJSON(URL, options, function(response){
    console.log(response)

      displayArtistVideos(response.items)

      console.log(response.items);

    })

  }


// display artist videos

function displayArtistVideos(videoArray) {
  
  console.log(videoArray)



  
  $(".videos").empty();
  videoArray.forEach(function (video) {
  
    console.log(video);
    console.log(video.id.videoId)

    $(".videos").append(` 
      <div class="video-wrapper"> 
      <iframe width="560" height="315" src="https://www.youtube.com/embed/${video.id.videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    `)


  
  
  
  
    // $("<button>")
    // .attr({"video-name":snippet.title, "video-id":id.videoId})
    // .append(".videos")
    // .appendTo($artistVideos);

    // console.log($artistVideos)

  }); 



}


// get categories on load to select from
function getCategories() {
  $.ajax({
    url: "https://api.spotify.com/v1/browse/categories",
    method: "GET",
    headers: {
      'Authorization': "Bearer " + access_token
    }
  }).then(function(response) {
    console.log(response);

    // print to left column select box
    response.categories.items.forEach(function(category) {
      $("<option>")
        .val(category.id)
        .text(category.name)
        .appendTo($("#categories-list"));
    })
  });


}

// get featured playlists
function getFeaturedPlaylists() { 
  $.ajax({
    url: "https://api.spotify.com/v1/browse/featured-playlists",
    method: "GET",
    headers: {
      'Authorization': "Bearer " + access_token
    }
  }).then(function(response) {
    console.log(response);
    printPlaylistInfo(response.playlists.items);
  })
}

// BIND CLICK EVENTS
$(document)
  .ready(function () {
    // get categories on load
    getCategories();
    $("#user-playlists").on("click", getUserPlaylists);
    $("#featured-playlists").on("click", getFeaturedPlaylists);
    $("#play-button").on("click", function() {
      // get state of button
      const buttonState = $(this).data("state");

      if (buttonState === "play") {
        pauseSong();
      } 
      else if (buttonState === "pause") {
        resumeSong();
      }
    });
    $("#prev-button").on("click", prevSong);
    $("#next-button").on("click", nextSong);
    $(document).on("click", ".playlist-button", selectAlbum);
    $(document).on("click", ".track-button", selectTrack);
    // login button to get access token
    $('#login-button').on('click', spotifyLogin);
    //$("#categories-list").on("change", selectCategories);

    if (!access_token) {
      $("#app-body").hide();
    } 
  });
