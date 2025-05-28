let currentSong = new Audio();
const range = document.querySelector("#myRange");
const playBtn = document.querySelector("#playBtn");
const playingGif = document.querySelector("#playingGif");
const soundGif = document.querySelector(".songplayicon");
const songName = document.querySelector("#songName");
let songs = [];
let currentVolume = 1;
let currentFolder = "Bollywood";

const getSongs = async (folder) => {
  currentFolder = folder;
 let music = await fetch("songs/songs.json");
  let allSongs = await music.json();
  return allSongs[folder] || [];
};


const populateUL = async () => {
  songs = await getSongs(currentFolder);
  let songUL = document.querySelector(".songlist").firstElementChild;
  songUL.innerHTML = "";

for (const song of songs) {
  const displayName = decodeURIComponent(song).replace(/\.(m4a|mp3)$/, "");
  songUL.innerHTML += `
    <li class="flex justify-btw" data-file="${song}">
        <span class="flex justify-center align-center">
            <img src="img/music.svg" alt="" />
            <span class="songName">${displayName}</span>
        </span>
        <span class="playNowImg flex justify-center align-center">
            Play Now
            <img class="songplayicon" src="img/playGrey.svg" alt="" />
        </span>
    </li>`;
}


  let liItems = document.querySelector(".songlist").getElementsByTagName("li");

  Array.from(liItems).forEach(li => {
    li.addEventListener("click", (e) => {
      console.log(e.target);

      const songFile = li.dataset.file;
      const fullPath = `${window.location.origin}/songs/${currentFolder}/${songFile}`;

      // If same song is playing → Pause
      if (!currentSong.paused && currentSong.src === fullPath) {
        currentSong.pause();
        playingGif.style.opacity = 0;
        playBtn.src = "/img/play.svg";
        li.querySelector(".songplayicon").src = "/img/play.svg";
        li.querySelector(".playNowImg").innerHTML = `Play Now <img class="songplayicon" src="/img/play.svg" alt="">`;
      }

      // If same song is paused → Resume
      else if (currentSong.paused && currentSong.src === fullPath) {
        currentSong.play();
        playingGif.style.opacity = 1;
        playBtn.src = "/img/pause.svg";
        li.querySelector(".songplayicon").src = "/img/pause.svg";
        li.querySelector(".playNowImg").innerHTML = `
          <img id="soundGif" src="/img/sound.gif" alt="">
          <img class="songplayicon" src="/img/pause.svg" alt="">
        `;
      }

      // New song → Play new song
      else {
        Array.from(liItems).forEach(item => {
          item.querySelector(".songplayicon").src = "/img/play.svg";
          item.querySelector(".playNowImg").innerHTML = `Play Now <img class="songplayicon" src="/img/play.svg" alt="">`;
        });

        playMusic(songFile);
        li.querySelector(".songplayicon").src = "/img/pause.svg";
        li.querySelector(".playNowImg").innerHTML = `
          <img id="soundGif" src="/img/sound.gif" alt="">
          <img class="songplayicon" src="/img/pause.svg" alt="">
        `;
      }
    });
  });
};
populateUL()

// Fetching Albums/Playlists from the server/local pc
const getPlaylist = async () => {
  let albums = await fetch(`songs/`);
  let response = await albums.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let a = div.getElementsByTagName("a");

  let array = Array.from(a);
  for (let i = 0; i < array.length; i++) {
    const e = array[i];
    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/songs/")[1];
      let info = await fetch(`/songs/${folder}/info.json`);
      let response = await info.json();

      // Create the playlist div manually so we can attach event listener before adding it
      const playlistDiv = document.createElement("div");
      playlistDiv.classList.add("playlist");
      playlistDiv.setAttribute("data-folder", folder);
      playlistDiv.innerHTML = `
        <div>
          <img src="songs/${folder}/cover.jpg" alt="Cover" />
        </div>
        <div class="play-img">
          <img src="img/playBlack.svg" alt="">
        </div>
        <img class="musicGif" src="img/sound.gif" style="opacity: 0;">
        <h3>${response.title}</h3>
        <p>${response.description}</p>
      `;

      // Add click event before appending
      playlistDiv.addEventListener("click", () => {
        currentFolder = folder;
        populateUL();
      });

      document.querySelector(".playlist-container").appendChild(playlistDiv);
    }
  }
};
getPlaylist();

const playMusic = (track) => {
  currentSong.src = `songs/${currentFolder}/${track}`;
  currentSong.play();

  // Update footer play button and GIF
  playBtn.src = "/img/pause.svg";
  playingGif.style.opacity = 1;
  
  // Update song name
  songName.innerText = decodeURI(track.replace(/\.(mp3|m4a)$/, ""));


  // Highlight playing song in the list
  const liItems = document.querySelector(".songlist").getElementsByTagName("li");
  Array.from(liItems).forEach(li => {
    if (li.dataset.file === track) {
      li.querySelector(".songplayicon").src = "/img/pause.svg";
      li.querySelector(".playNowImg").innerHTML = `
        <img id="soundGif" src="/img/sound.gif" alt="">
        <img class="songplayicon" src="/img/pause.svg" alt="">
      `;
    } else {
      li.querySelector(".songplayicon").src = "/img/play.svg";
      li.querySelector(".playNowImg").innerHTML = `Play Now <img class="songplayicon" src="/img/play.svg" alt="">`;
    }
  });
};


// Adding Event Listeners for Play and Pause button
document.querySelector("#playBtn").addEventListener("click", () => {
  if (!currentSong.src) {
    if (songs.length > 0) {
      playMusic(songs[0]);
    }
    return;
  }
  else if (currentSong.paused) {
    currentSong.play();
    playBtn.src = "/img/pause.svg";
    playingGif.style.opacity = 1;
    soundGif.style.opacity = 1;

  } else {
    currentSong.pause();
    playBtn.src = "/img/play.svg";
    playingGif.style.opacity = 0;
    populateUL()
  }
});

// Converts Seconds to Minutes:Seconds
function secondsToMinutes(seconds) {
  // Ensure the input is a valid number
  if (isNaN(seconds) || seconds < 0) {
    return "";
  }

  // Calculate minutes and remaining seconds (rounded down)
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Format the result with leading zeros
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
};

// Updating current time and song duration 
currentSong.addEventListener("timeupdate", () => {
  let songTime = document.querySelector(".song-current-time");
  songTime.innerHTML = secondsToMinutes(currentSong.currentTime);
  let songDuration = document.querySelector(".song-duration");
  songDuration.innerHTML = secondsToMinutes(currentSong.duration);
  range.value = (currentSong.currentTime / currentSong.duration) * 100;
  // Autoplay
  if (Math.floor(currentSong.currentTime) === Math.floor(currentSong.duration)) {
  let index = songs.indexOf(currentSong.src.split(`songs/${currentFolder}/`)[1]);
  let nextIndex = (index + 1) % songs.length;
  setTimeout(() => {
    playMusic(songs[nextIndex]);  // Use full filename with extension
  }, 2000);
}

});


// Updating Seekbar
range.addEventListener("input", (e) => {
  currentSong.currentTime = currentSong.duration * (e.target.value / 100);
});


// Adding Event listener to Previous and Next Buttons
document.getElementById("nextBtn").addEventListener("click", () => {
  let currentFileEncoded = currentSong.src.split(`songs/${currentFolder}/`)[1];
  let currentFile = decodeURIComponent(currentFileEncoded);
  let index = songs.indexOf(currentFile);

  let nextIndex = (index + 1) % songs.length; // loop back to start if at end
  playMusic(songs[nextIndex]);  // no extension removal
});

document.getElementById("previousBtn").addEventListener("click", () => {
  let currentFileEncoded = currentSong.src.split(`songs/${currentFolder}/`)[1];
  let currentFile = decodeURIComponent(currentFileEncoded);
  let index = songs.indexOf(currentFile);

  let prevIndex = (index - 1 + songs.length) % songs.length; // loop back to end if at start
  playMusic(songs[prevIndex]);  // no extension removal
});


// Setting Volume Button and Volume-seekbar
document.querySelector(".volume>input").addEventListener("change", (e) => {
  currentVolume = e.target.value / 100;
  currentSong.volume = currentVolume;
  if (currentVolume == 0) {
    document.querySelector(".volume>span").classList.add("mute");
  } else {
    document.querySelector(".volume>span").classList.remove("mute");
  }
});

document.querySelector(".volume>span").addEventListener("click", (e) => {
  e.target.classList.toggle("mute");
  if (e.target.classList.contains("mute")) {
    document.querySelector(".volume>input").value = 0;
    currentSong.volume = 0;
  } else if (currentVolume == 0) {
    currentVolume = 0.2;
    currentSong.volume = currentVolume;
    document.querySelector(".volume>input").value = currentSong.volume * 100;
  } else {
    currentSong.volume = currentVolume;
    document.querySelector(".volume>input").value = currentVolume * 100;
  }
});


