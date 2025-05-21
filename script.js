const API_KEY = "601ea976d694e64ca0d72620af5ce1ae"; // remplace par ta clé API
const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");
const moviesContainer = document.getElementById("movies-container");
const favoritesContainer = document.getElementById("favorites-container");
const loader = document.getElementById("loader");
const sectionTitle = document.getElementById("section-title");
const themeToggle = document.getElementById("theme-toggle");

searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) {
    sectionTitle.textContent = `Résultats pour "${query}" :`;
    searchMovies(query);
  }
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  themeToggle.textContent = document.body.classList.contains("dark-theme") ? "☀️ Mode clair" : "🌙 Mode sombre";
});

function showLoader() {
  loader.style.display = "block";
  moviesContainer.innerHTML = "";
}

function hideLoader() {
  loader.style.display = "none";
}

function searchMovies(query) {
  showLoader();
  fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&api_key=${API_KEY}&language=fr-FR`)
    .then(res => res.json())
    .then(data => {
      displayMovies(data.results);
    })
    .catch(err => console.error("Erreur :", err));
}

function fetchTrending() {
  showLoader();
  fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&language=fr-FR`)
    .then(res => res.json())
    .then(data => {
      displayMovies(data.results);
    })
    .catch(err => console.error("Erreur :", err));
}

function displayMovies(movies) {
  hideLoader();
  moviesContainer.innerHTML = "";

  if (!movies || movies.length === 0) {
    moviesContainer.innerHTML = "<p>Aucun film trouvé.</p>";
    return;
  }

  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "movie-card";

    const poster = document.createElement("img");
    poster.src = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "https://via.placeholder.com/200x300?text=Pas+d'image";

    const title = document.createElement("h2");
    title.textContent = movie.title;

    const date = document.createElement("p");
    date.textContent = `Sortie : ${movie.release_date || "N/A"}`;

    const rating = document.createElement("p");
    rating.textContent = `Note : ${movie.vote_average || "N/A"}/10`;

    const favButton = document.createElement("button");
    favButton.className = "fav-button";
    favButton.textContent = "Ajouter aux favoris";
    favButton.addEventListener("click", () => {
      addToFavorites({
        id: movie.id,
        title: movie.title,
        poster: poster.src
      });
    });

    card.appendChild(poster);
    card.appendChild(title);
    card.appendChild(date);
    card.appendChild(rating);
    card.appendChild(favButton);

    moviesContainer.appendChild(card);
  });
}

function addToFavorites(movie) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (!favorites.find(item => item.id === movie.id)) {
    favorites.push({
      id: movie.id,
      title: movie.title,
      poster: movie.poster,
      stock: 3
    });
    localStorage.setItem("favorites", JSON.stringify(favorites));
    alert(`${movie.title} ajouté aux favoris !`);
    displayFavorites();
  } else {
    alert(`${movie.title} est déjà dans vos favoris.`);
  }
}

function displayFavorites() {
  favoritesContainer.innerHTML = "";
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.length === 0) {
    favoritesContainer.innerHTML = "<p>Aucun favori.</p>";
    return;
  }

  favorites.forEach(movie => {
    const card = document.createElement("div");
    card.className = "movie-card";

    const poster = document.createElement("img");
    poster.src = movie.poster;

    const title = document.createElement("h2");
    title.textContent = movie.title;

    const stockInfo = document.createElement("p");
    stockInfo.textContent = `Stock : ${movie.stock}`;

    const borrowButton = document.createElement("button");
    borrowButton.className = "fav-button";
    borrowButton.textContent = "Emprunter";

    if (movie.stock === 0) {
      borrowButton.disabled = true;
      borrowButton.textContent = "Plus en stock";
    }

    borrowButton.addEventListener("click", () => {
      borrowMovie(movie.id);
    });

    const removeButton = document.createElement("button");
    removeButton.className = "fav-button";
    removeButton.textContent = "Retirer";
    removeButton.addEventListener("click", () => {
      removeFavorite(movie.id);
    });

    card.appendChild(poster);
    card.appendChild(title);
    card.appendChild(stockInfo);
    card.appendChild(borrowButton);
    card.appendChild(removeButton);

    favoritesContainer.appendChild(card);
  });
}

function borrowMovie(id) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const movie = favorites.find(item => item.id === id);

  if (movie && movie.stock > 0) {
    movie.stock -= 1;
    localStorage.setItem("favorites", JSON.stringify(favorites));
    displayFavorites();
  }
}

function removeFavorite(id) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter(movie => movie.id !== id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  displayFavorites();
}

// Initial
fetchTrending();
displayFavorites();
