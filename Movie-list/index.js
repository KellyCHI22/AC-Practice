// * 初始變數
const BASE_URL = 'https://movie-list.alphacamp.io';
const INDEX_URL = BASE_URL + '/api/v1/movies/';
const POSTER_URL = BASE_URL + '/posters/';

const movies = [];
const MOVIES_PER_PAGE = 12;
let filteredMovies = [];

// * 新增變數：currentPage 存放當前頁面，displayMode 存放當前顯示模式
let currentPage = 1;
let displayMode = 'display-card';

// * 取得 DOM 節點
const dataPanel = document.querySelector('#data-panel');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
// * 取得切換模式區塊的 dom 節點，抓container而非獨立的icons
const changeDisplay = document.querySelector('#change-display');

// * ==== functions ====
// * 顯示電影：卡片模式
function renderMovieCard(data) {
    let rawHTML = '';
    data.forEach((item) => {
        rawHTML += `<div class="col-6 col-md-4 col-lg-3 col-xl-2">
            <div class="mb-2">
                <div class="card">
                    <img src="${POSTER_URL + item.image
            }" class="card-img-top movie-poster" alt="Movie Poster" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">
                    <div class="card-body">
                        <h5 class="card-title">${item.title}</h5>
                        <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                        <button class="btn btn-info btn-add-favorite" data-id="${item.id}"><i class="fa-regular fa-heart heart-empty"></i></button>
                    </div>
                </div>
            </div>
        </div>`;
    });
    dataPanel.innerHTML = rawHTML;
}

// * 顯示模式：清單模式
function renderMovieList(data) {
    let rawHTML = '<ul>';
    data.forEach((item) => {
        rawHTML += `
        <li class="movie-list d-flex justify-content-between mt-2 pt-2 border-top border-secondary">
            <span class="movie-list-title" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">${item.title}</span>
            <div>
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}"><i class="fa-regular fa-heart heart-empty"></i></button>
            </div>
        </li>
        `;
    });
    rawHTML += '</ul>';
    dataPanel.innerHTML = rawHTML;
}

// * 針對已加入 favorite 的電影愛心做標記
function renderFavMovies() {
    let favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || [];
    const favoriteBtns = document.querySelectorAll('.btn-add-favorite');
    favoriteBtns.forEach(favoriteBtn => {
        if (favoriteMovies.some((movie) => movie.id === Number(favoriteBtn.dataset.id))) {
            favoriteBtn.innerHTML = `<i class="fa-solid fa-heart heart-full"></i>`;
        }
    });
}

// * paginator 渲染
function renderPaginator(amount) {
    const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
    let rawHTML = '';

    for (let page = 1; page <= numberOfPages; page++) {
        rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
    }
    paginator.innerHTML = rawHTML;
}

// * 取得應出現在當前頁面的電影們
function getMoviesByPage(page) {
    const data = filteredMovies.length ? filteredMovies : movies;
    const startIndex = (page - 1) * MOVIES_PER_PAGE;
    return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

// * 點擊 paginator 會顯示指定頁數
function showCertainPage(event) {
    if (event.target.tagName !== 'A') return;
    currentPage = Number(event.target.dataset.page);

    const allPages = document.querySelectorAll('.page-item');
    allPages.forEach(page => page.classList.remove('active'));
    event.target.parentElement.classList.add('active');

    if (displayMode === 'display-card') {
        renderMovieCard(getMoviesByPage(currentPage));
        renderFavMovies();
    } else if (displayMode === 'display-list') {
        renderMovieList(getMoviesByPage(currentPage));
        renderFavMovies();
    }
}

// * 設定當前頁碼為 active 狀態
function setActivePage() {
    const allPages = document.querySelectorAll('.page-item');
    allPages[currentPage - 1].classList.add('active');
}

// * 顯示電影 modal
function showMovieModal(id) {
    const modalTitle = document.querySelector('#movie-modal-title');
    const modalImage = document.querySelector('#movie-modal-image');
    const modalDate = document.querySelector('#movie-modal-date');
    const modalDescription = document.querySelector('#movie-modal-description');

    modalTitle.innerText = '';
    modalDate.innerText = '';
    modalDescription.innerText = '';
    modalImage.innerHTML = '';

    axios.get(INDEX_URL + id).then((response) => {
        const data = response.data.results;

        modalTitle.innerText = data.title;
        modalDate.innerText = 'Release date: ' + data.release_date;
        modalDescription.innerText = data.description;
        modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`;
    });
}

// * 搜尋功能
function searchKeyword(event) {
    event.preventDefault();
    const keyword = searchInput.value.trim().toLowerCase();
    if (!keyword.length) {
        return alert('Please enter valid keyword!');
    }
    filteredMovies = movies.filter((movie) =>
        movie.title.toLowerCase().includes(keyword)
    );
    if (filteredMovies.length === 0) {
        return alert(`Can't find result for: ${keyword}`);
    }
    renderPaginator(filteredMovies.length);

    // * 重新設定當前頁面為第一頁
    currentPage = 1;

    // * 設定當前頁碼為 active 狀態
    setActivePage();

    // * 依據當前顯示模式，預設顯示第 1 頁的搜尋結果
    if (displayMode === 'display-card') {
        renderMovieCard(getMoviesByPage(1));
        renderFavMovies();
    } else if (displayMode === 'display-list') {
        renderMovieList(getMoviesByPage(1));
        renderFavMovies();
    }
}

// * 加入 favorite 清單
function addToFavorite(id) {
    let favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || [];
    const movie = movies.find((movie) => movie.id === id);
    if (favoriteMovies.some((movie) => movie.id === id)) {
        return alert('This movie is already in your favorites!');
    }
    favoriteMovies.push(movie);
    localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies));
}

// * 將 movie 從 favorite 中移除
function removeFromFavorite(id) {
    let favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || [];
    if (!favoriteMovies || !favoriteMovies.length) return;

    const movieIndex = favoriteMovies.findIndex((movie) => movie.id === id);
    if (movieIndex === -1) return;

    favoriteMovies.splice(movieIndex, 1);
    localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies));
}

// * 顯示 modal 或是加入 favorite 清單
function showOrAddFavorite(event) {
    const target = event.target;
    if (target.matches('.btn-show-movie') || target.matches('.movie-poster') || target.matches('.movie-list-title')) {
        showMovieModal(Number(target.dataset.id));
    } else if (target.matches('.heart-empty')) {
        addToFavorite(Number(target.parentElement.dataset.id));
        target.classList.remove('heart-empty', 'fa-regular');
        target.classList.add('heart-full', 'fa-solid');
    } else if (target.matches('.heart-full')) {
        removeFromFavorite(Number(target.parentElement.dataset.id));
        target.classList.add('heart-empty', 'fa-regular');
        target.classList.remove('heart-full', 'fa-solid');
    }
}

// * 切換顯示模式
function changeDisplayMode(event) {
    const target = event.target;
    const data = filteredMovies.length ? filteredMovies : movies;
    if (target.matches('.display-card')) {
        displayMode = 'display-card';
        setActiveDisplay(target);
        renderPaginator(data.length);
        setActivePage();
        renderMovieCard(getMoviesByPage(currentPage));
        renderFavMovies();
    } else if (target.matches('.display-list')) {
        displayMode = 'display-list';
        setActiveDisplay(target);
        renderPaginator(data.length);
        setActivePage();
        renderMovieList(getMoviesByPage(currentPage));
        renderFavMovies();
    }
}

// * 設定當前顯示模式為 active 狀態
function setActiveDisplay(target) {
    const displayBtns = document.querySelectorAll('.display-btn');
    displayBtns.forEach(displayBtn => displayBtn.classList.remove('active'));
    target.classList.add('active');
}

// * 初始化電影清單
function initMovieList() {
    axios
        .get(INDEX_URL)
        .then((response) => {
            movies.push(...response.data.results);
            renderPaginator(movies.length);
            setActivePage();
            renderMovieCard(getMoviesByPage(1));
            renderFavMovies();
            searchInput.value = '';
        })
        .catch((err) => console.log(err));
}

// * 綁定監聽器
searchForm.addEventListener('submit', searchKeyword);
changeDisplay.addEventListener('click', changeDisplayMode);
dataPanel.addEventListener('click', showOrAddFavorite);
paginator.addEventListener('click', showCertainPage);

// * 初始化網頁
initMovieList();