let currentSong = new Audio();
const range = document.querySelector("#myRange");
const playBtn = document.querySelector("#playBtn");
const playingGif = document.querySelector("#playingGif");
const songName = document.querySelector("#songName");
const basePath = '/spotify/';
let songs = [];
let currentVolume = 1;
let currentFolder = "Bollywood";

const getSongs = async (folder) => {
  currentFolder = folder;
  let music = await fetch(basePath + "songs/songs.json");
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
              <img src="${basePath}img/music.svg" alt="music icon" />
              <span class="songName">${displayName}</span>
          </span>
          <span class="playNowImg flex justify-center align-center">
              Play Now
              <img class="songplayicon" src="${basePath}img/play.svg" alt="play icon" />
          </span>
      </li>`;
  }

  let liItems = document.querySelector(".songlist").getElementsByTagName("li");

  Array.from(liItems).forEach(li => {
    li.addEventListener("click", (e) => {
      const songFile = li.dataset.file;
      const fullPath = `${window.location.origin}${basePath}songs/${currentFolder}/${songFile}`;

      // If same song is playing → Pause
      if (!currentSong.paused && currentSong.src === fullPath) {
        currentSong.pause();
        playingGif.style.opacity = 0;
        playBtn.src = basePath + "img/play.svg";
        li.querySelector(".songplayicon").src = basePath + "img/play.svg";
        li.querySelector(".playNowImg").innerHTML = `Play Now <img class="songplayicon" src="${basePath}img/play.svg" alt="play icon">`;
      }

      // If same song is paused → Resume
      else if (currentSong.paused && currentSong.src === fullPath) {
        currentSong.play();
        playingGif.style.opacity = 1;
        playBtn.src = basePath + "img/pause.svg";
        li.querySelector(".songplayicon").src = basePath + "img/pause.svg";
        li.querySelector(".playNowImg").innerHTML = `
          <img id="soundGif" src="${basePath}img/sound.gif" alt="sound animation">
          <img class="songplayicon" src="${basePath}img/pause.svg" alt="pause icon">
        `;
      }

      // New song → Play new song
      else {
        Array.from(liItems).forEach(item => {
          item.querySelector(".songplayicon").src = basePath + "img/play.svg";
          item.querySelector(".playNowImg").innerHTML = `Play Now <img class="songplayicon" src="${basePath}img/play.svg" alt="play icon">`;
        });

        playMusic(songFile);
        li.querySelector(".songplayicon").src = basePath + "img/pause.svg";
        li.querySelector(".playNowImg").innerHTML = `
          <img id="soundGif" src="${basePath}img/sound.gif" alt="sound animation">
          <img class="songplayicon" src="${basePath}img/pause.svg" alt="pause icon">
        `;
      }
    });
  });
};
populateUL()

// Fetching Albums/Playlists from the server/local pc
const getPlaylist = async () => {
  let albums = await fetch(basePath + `songs/`);
  let response = await albums.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let a = div.getElementsByTagName("a");

  let array = Array.from(a);
  for (let i = 0; i < array.length; i++) {
    const e = array[i];
    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/songs/")[1];
      if (folder.endsWith("/")) folder = folder.slice(0, -1); // Remove trailing slash

      let info = await fetch(`${basePath}songs/${folder}/info.json`);
      let response = await info.json();

      // Create the playlist div manually so we can attach event listener before adding it
      const playlistDiv = document.createElement("div");
      playlistDiv.classList.add("playlist");
      playlistDiv.setAttribute("data-folder", folder);
      playlistDiv.innerHTML = `
        <div>
          <img src="${basePath}songs/${folder}/cover.jpg" alt="Cover image for ${folder}" />
        </div>
        <div class="play-img">
          <img src="${basePath}img/playBlack.svg" alt="play icon">
        </div>
        <img class="musicGif" src="${basePath}img/sound.gif" style="opacity: 0;" alt="sound animation">
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
  currentSong.src = `${basePath}songs/${currentFolder}/${track}`;
  currentSong.play();

  // Update footer play button and GIF
  playBtn.src = basePath + "img/pause.svg";
  playingGif.style.opacity = 1;

  // Update song name
  songName.innerText = decodeURI(track.replace(/\.(mp3|m4a)$/, ""));

  // Highlight playing song in the list
  const liItems = document.querySelector(".songlist").getElementsByTagName("li");
  Array.from(liItems).forEach(li => {
    if (li.dataset.file === track) {
      li.querySelector(".songplayicon").src = basePath + "img/pause.svg";
      li.querySelector(".playNowImg").innerHTML = `
        <img id="soundGif" src="${basePath}img/sound.gif" alt="sound animation">
        <img class="songplayicon" src="${basePath}img/pause.svg" alt="pause icon">
      `;
    } else {
      li.querySelector(".songplayicon").src = basePath + "img/play.svg";
      li.querySelector(".playNowImg").innerHTML = `Play Now <img class="songplayicon" src="${basePath}img/play.svg" alt="play icon">`;
    }
  });
};

// Play/Pause button event
playBtn.addEventListener("click", () => {
  if (!currentSong.src) {
    if (songs.length > 0) {
      playMusic(songs[0]);
    }
    return;
  }
  if (currentSong.paused) {
    currentSong.play();
    playBtn.src = basePath + "img/pause.svg";
    playingGif.style.opacity = 1;
  } else {
    currentSong.pause();
    playBtn.src = basePath + "img/play.svg";
    playingGif.style.opacity = 0;
    populateUL();
  }
});

// Convert seconds to MM:SS format
function secondsToMinutes(seconds) {
  if (isNaN(seconds) || seconds < 0) return "";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Update time & progress bar
currentSong.addEventListener("timeupdate", () => {
  const songTime = document.querySelector(".song-current-time");
  songTime.innerHTML = secondsToMinutes(currentSong.currentTime);

  const songDuration = document.querySelector(".song-duration");
  songDuration.innerHTML = secondsToMinutes(currentSong.duration);

  range.value = (currentSong.currentTime / currentSong.duration) * 100;

  // Autoplay next song when current ends
  if (Math.floor(currentSong.currentTime) === Math.floor(currentSong.duration)) {
    let index = songs.indexOf(currentSong.src.split(`${basePath}songs/${currentFolder}/`)[1]);
    let nextIndex = (index + 1) % songs.length;
    setTimeout(() => {
      playMusic(songs[nextIndex]);
    }, 2000);
  }
});

// Seekbar input
range.addEventListener("input", (e) => {
  currentSong.currentTime = currentSong.duration * (e.target.value / 100);
});

// Next & Previous buttons
document.getElementById("nextBtn").addEventListener("click", () => {
  let currentFileEncoded = currentSong.src.split(`${basePath}songs/${currentFolder}/`)[1];
  let currentFile = decodeURIComponent(currentFileEncoded);
  let index = songs.indexOf(currentFile);
  let nextIndex = (index + 1) % songs.length;
  playMusic(songs[nextIndex]);
});

document.getElementById("previousBtn").addEventListener("click", () => {
  let currentFileEncoded = currentSong.src.split(`${basePath}songs/${currentFolder}/`)[1];
  let currentFile = decodeURIComponent(currentFileEncoded);
  let index = songs.indexOf(currentFile);
  let prevIndex = (index - 1 + songs.length) % songs.length;
  playMusic(songs[prevIndex]);
});

// Volume controls
document.querySelector(".volume>input").addEventListener("change", (e) => {
  currentVolume = e.target.value / 100;
  currentSong.volume = currentVolume;
  if (currentVolume === 0) {
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
  } else if (currentVolume === 0) {
    currentVolume = 0.2;
    currentSong.volume = currentVolume;
    document.querySelector(".volume>input").value = currentVolume * 100;
  } else {
    currentSong.volume = currentVolume;
    document.querySelector(".volume>input").value = currentVolume * 100;
  }
});
