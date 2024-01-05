let searchIcon = document.querySelector(".search");
let searchLi = document.querySelector(".search-li");

searchLi.addEventListener("mouseenter", () => {
  searchIcon.src = "img/search.svg";
});
searchLi.addEventListener("mouseleave", () => {
  searchIcon.src = "img/searchGrey.svg";
});


let libraryHeading = document.querySelector(".library-heading");
let libraryImg = libraryHeading.firstElementChild;

libraryHeading.addEventListener("mouseenter", () => {
  libraryImg.src = "img/library.svg";
});
libraryHeading.addEventListener("mouseleave", () => {
  libraryImg.src = "img/libraryGrey.svg";
});


let playlistHeading = document.querySelector(".playlist-heading");
let hours = new Date().getHours();
if (hours >= 0 && hours < 5) {
  playlistHeading.innerHTML = "Good Night";
} 
else if (hours >= 5 && hours < 11) {
  playlistHeading.innerHTML = "Good Morning";
} 
else if (hours >= 11 && hours < 16) {
  playlistHeading.innerHTML = "Good afternoon";
} 
else if (hours >= 16 && hours < 19) {
  playlistHeading.innerHTML = "Good Evening";
} 
else {
  playlistHeading.innerHTML = "Good Night";
}
