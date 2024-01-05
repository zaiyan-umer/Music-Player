let currentSong = new Audio();
let playingGif = document.querySelector("#playingGif");
let range = document.querySelector("#myRange");
let songs;
let currentVolume = 1;
let currentFolder = "Bollywood";

// Getting Songs from server/pc
const getSongs = async (folder) => {
  let music = await fetch(`/songs/${folder}`);
  currentFolder = folder;
  let response = await music.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let a = div.getElementsByTagName("a");
  let songsArray = [];
  // Fetches each song and pushes it into SongArray
  Array.from(a).forEach(e => {
    if (e.href.endsWith(".m4a") || e.href.endsWith("mp3")) {
      songsArray.push(e.href.replace(`http://127.0.0.1:5500/songs/${folder}/`, ""))
    }
  });
  return songsArray;
}

// Populates songs and adds event-listeners for each song 
const populateUL = async () => {
  songs = await getSongs(currentFolder);
  // Gets Songs from SongArray using function and populates dom
  let songUL = document.querySelector(".songlist").firstElementChild;
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML += `
              <li class="flex justify-btw">
                  <span class="flex justify-center align-center">
                      <img src="img/music.svg" alt="" />
                      <span class="songName">
                        ${song.replaceAll("%20", " ").replace(".m4a", "").replace(".mp3", "")}
                      </span>
                  </span>
                  <span class="playNowImg flex justify-center align-center">
                    Play Now
                    <img src="img/playGrey.svg" alt="" />
                  </span>
              </li>  `;
  }
  // Adds event listener for each song to play it
  let li = document.querySelector(".songlist").getElementsByTagName("li");
  Array.from(li).forEach(e => {
    e.addEventListener("click", () => {

      if ((!currentSong.paused) && (decodeURI(currentSong.src.split("/songs/")[1]) == (`${currentFolder}/${e.firstElementChild.children[1].innerText}.m4a`))) {
        e.firstElementChild.nextElementSibling.children[0].src = "/img/play.svg";
        currentSong.pause();
        playingGif.style.opacity = 0;
        playBtn.src = "/img/play.svg";
        e.children[1].innerHTML = `
                            Play Now
                    <img src="/img/play.svg" alt="">
                  `;
      }

      else if (currentSong.paused && (decodeURI(currentSong.src.split("/songs/")[1]) == (`${currentFolder}/${e.firstElementChild.children[1].innerText}.m4a`))) {
        e.firstElementChild.nextElementSibling.children[0].src = "/img/pause.svg";
        currentSong.play();
        playingGif.style.opacity = 1;
        playBtn.src = "/img/pause.svg";
        e.children[1].innerHTML = `
                    <img id="soundGif" src="/img/sound.gif" alt="">
                    <img src="/img/pause.svg" alt="">
                  `;
      }

      else {
        Array.from(li).forEach(e => {
          e.children[1].firstElementChild.src = "/img/play.svg";
          e.children[1].innerHTML = `
                            Play Now
                    <img src="/img/play.svg" alt="">
                  `;
        });

        playMusic(e.firstElementChild.children[1].innerText);
        e.firstElementChild.nextElementSibling.children[0].src = "/img/pause.svg";
        e.children[1].innerHTML = `
                    <img id="soundGif" src="/img/sound.gif" alt="">
                    <img src="/img/pause.svg" alt="">
                  `;
      }
    });
  });
}
populateUL();

// Fetching Albums/Playlists from the server/local pc
const getPlaylist = async () => {
  let albums = await fetch(`/songs/`);
  let response = await albums.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let a = div.getElementsByTagName("a");
  // Fetches all Albums from the local pc and shows it on the main page
  let array = Array.from(a);
  for (let i = 0; i < array.length; i++) {
    const e = array[i];
    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/songs/")[1];
      let info = await fetch(`/songs/${folder}/info.json`);
      let response = await info.json();

      document.querySelector(".playlist-container").innerHTML += `
                <div data-folder="${folder}" class="playlist">
                    <div>
                      <img src="/songs/${folder}/cover.jpg" alt="Cover" />
                    </div>
                    <div class="play-img">
                      <img src="img/playBlack.svg" alt="">
                    </div>
                    <img class="musicGif" src="img/sound.gif">
                    <h3>${response.title}</h3>
                    <p>${response.description}</p>
                </div>
      `;
    }
  };
  // Adding Event listener to each playlist
  let playlistElement = document.getElementsByClassName("playlist");
  Array.from(playlistElement).forEach(e => {
    e.addEventListener("click", item => {
      Array.from(playlistElement).forEach(element=>{
        element.querySelector(".musicGif").style.opacity = 0;
      })
      currentFolder = item.currentTarget.dataset.folder;
      item.currentTarget.querySelector(".musicGif").style.opacity = 1;
      populateUL();
    })
  })


};
getPlaylist();

// Plays the song
const playMusic = (track) => {
  if (track == undefined) {
    track = songs[0].split(".m4a")[0];
  }
  currentSong.src = `/songs/${currentFolder}/${track}.m4a`;
  playBtn.src = "/img/pause.svg";
  playingGif.style.opacity = 1;
  document.querySelector("footer .song-name > img:nth-child(1)").style.opacity = 1;
  currentSong.play();
  let songName = document.querySelector("#songName");
  songName.innerHTML = decodeURI(track);
};

// Adding Event Listeners for Play and Pause button
document.querySelector("#playBtn").addEventListener("click", () => {
  if (!(currentSong.hasAttribute("src"))) {
    playMusic();
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
    soundGif.style.opacity = 0;
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
  // console.log(currentSong.currentTime);
  // console.log(currentSong.duration);
  let songTime = document.querySelector(".song-current-time");
  songTime.innerHTML = secondsToMinutes(currentSong.currentTime);
  let songDuration = document.querySelector(".song-duration");
  songDuration.innerHTML = secondsToMinutes(currentSong.duration);
  range.value = (currentSong.currentTime / currentSong.duration) * 100;
  if(currentSong.currentTime == currentSong.duration){
    let index = songs.indexOf(currentSong.src.split(`/songs/${currentFolder}/`)[1]);
    playMusic(songs[index + 1].replace(".m4a", ""));
  }
});


// Updating Seekbar
range.addEventListener("click", (e) => {
  try {
    range.value = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    currentSong.currentTime = currentSong.duration * (e.offsetX / e.target.getBoundingClientRect().width);
  } catch (err) {
    console.log(err);
  }
});

// Adding Event listener to Previous and Next Buttons
document.getElementById("nextBtn").addEventListener("click", () => {
  let index = songs.indexOf(currentSong.src.split(`/songs/${currentFolder}/`)[1]);
  if ((index + 1) < songs.length) {
    playMusic(songs[index + 1].replace(".m4a", ""));
  }
  else if ((index + 1) == songs.length) {
    playMusic(songs[0].replace(".m4a", ""));
  }
});

document.getElementById("previousBtn").addEventListener("click", () => {
  let index = songs.indexOf(currentSong.src.split(`/songs/${currentFolder}/`)[1]);
  if (((index - 1) < songs.length) && (index - 1) != -1) {
    playMusic(songs[index - 1].replace(".m4a", ""));
  }
  else if ((index - 1) < 0) {
    playMusic(songs[songs.length - 1].replace(".m4a", ""));
  }
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

