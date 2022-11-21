// * 初始變數
const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users";

const users = [];
const favoriteUsers = JSON.parse(localStorage.getItem('favoriteUsers')) || [];
let filteredUsers = [];

const USERS_PER_PAGE = 12;
let gender = '';

// * DOM 節點
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const searchMessage = searchForm.querySelector('.search-message');
const selectMale = document.querySelector('.select-male');
const selectFemale = document.querySelector('.select-female');

// * 各種 functions 區塊
// * 動態渲染人物卡片
function renderUserList(data) {
    let rawHTML = "";
    data.forEach((item) => {
        rawHTML += `<div class="col-sm-6 col-lg-4 col-xl-3">
        <div class="mb-2">
            <div class="card" data-id="${item.id}">
            <div class="card-bg"><img src="${item.avatar}" class="card-img-top user-avatar-card" alt="user-avatar"></div>
            
            <div class="card-body">
                <h5 class="card-title">${item.name} ${item.surname}</h5>

            </div>
            <div class="card-footer">
                <button class="btn btn-info btn-show-user" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${item.id}">More <i class="fa-solid fa-circle-info"></i></button>
                <button class="btn btn-danger btn-add-favorite" data-id="${item.id}">Like <i class="fa-solid fa-heart"></i></button>
            </div>
            </div>
        </div>
        </div>`;
    });
    dataPanel.innerHTML = rawHTML;
}

// * 為已加入 favorite 清單中的 user 做處理，以免頁面刷新後看不見已加入的狀態
function renderFavUsers() {
    const favoriteBtns = document.querySelectorAll('.btn-add-favorite');
    favoriteBtns.forEach(favoriteBtn => {
        if (favoriteUsers.some((user) => user.id === Number(favoriteBtn.dataset.id))) {
            favoriteBtn.classList.add('liked');
            favoriteBtn.innerHTML = `Liked <i class="fa-solid fa-heart"></i>`;
        }
    });
}

// * 顯示 user modal
function showUserModal(id) {
    // get elements
    const modalTitle = document.querySelector("#user-modal-title");
    const modalImage = document.querySelector("#user-modal-image");
    const modalContent = document.querySelector('#user-modal-content');

    // send request to show api
    axios.get(INDEX_URL + `/${id}`).then((response) => {
        const data = response.data;

        // 先將 modal 內容清空，以免出現上一個 user 的資料殘影
        modalTitle.innerText = '';
        modalImage.src = '';
        modalContent.innerHTML = '';

        //insert data into modal ui
        modalTitle.innerText = `${data.name} ${data.surname}`;
        modalImage.src = data.avatar;
        modalContent.innerHTML = `
        <p><i class="fa-solid fa-venus-mars"></i> Gender: ${data.gender}</p>
        <p><i class="fa-solid fa-location-dot"></i> Region: ${data.region}</p>
        <p><i class="fa-solid fa-envelope"></i> Email: ${data.email}</p>
        <p><i class="fa-solid fa-cake-candles"></i> Birthday: ${data.birthday}</p>
        `;
    });
}

// * 依據指定頁數去取得相應 user 資料
function getUsersByPage(page) {
    let data = filteredUsers.length ? filteredUsers : users;

    if (gender === 'male') {
        data = data.filter((user) => user.gender === 'male');
    } else if (gender === 'female') {
        data = data.filter((user) => user.gender === 'female');
    }
    //計算起始 index 
    const startIndex = (page - 1) * USERS_PER_PAGE;
    //回傳切割後的新陣列
    return data.slice(startIndex, startIndex + USERS_PER_PAGE);
}

// * 依據 user 資料筆數動態產生相應的 paginator
function renderPaginator(amount) {
    //計算總頁數
    const numberOfPages = Math.ceil(amount / USERS_PER_PAGE);
    //製作 template 
    let rawHTML = '';

    for (let page = 1; page <= numberOfPages; page++) {
        rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
    }
    //放回 HTML
    paginator.innerHTML = rawHTML;
}

// * 顯示指定頁面
function renderCertainPage(event) {
    //如果被點擊的不是 a 標籤，結束
    if (event.target.tagName !== 'A') return;
    const allPages = paginator.querySelectorAll('.page-link');
    allPages.forEach(page => page.classList.remove('active'));
    event.target.classList.add('active');
    //透過 dataset 取得被點擊的頁數
    const page = Number(event.target.dataset.page);
    //更新畫面
    renderUserList(getUsersByPage(page));
    renderFavUsers();
}

// * 將 user 加入 favorite
function addToFavorite(id) {
    const user = users.find((user) => user.id === id);
    if (favoriteUsers.some((user) => user.id === id)) {
        return alert('This user is already in your favorite!');
    }
    favoriteUsers.push(user);
    localStorage.setItem('favoriteUsers', JSON.stringify(favoriteUsers));
}

// * 將 user 從 favorite 中移除
function removeFromFavorite(id) {
    if (!favoriteUsers || !favoriteUsers.length) return;

    const userIndex = favoriteUsers.findIndex((user) => user.id === id);

    if (userIndex === -1) return;

    favoriteUsers.splice(userIndex, 1);
    localStorage.setItem('favoriteUsers', JSON.stringify(favoriteUsers));
}

// * 搜尋功能
function searchKeyword(event) {
    event.preventDefault();
    const keyword = searchInput.value.trim().toLowerCase();
    searchMessage.style.display = 'inline-block';
    gender = '';

    if (!keyword.length) {
        return searchMessage.innerText = '⛔ Please enter a valid keyword!';
    }

    filteredUsers = users.filter((user) =>
        (user.name + ' ' + user.surname).toLowerCase().includes(keyword)
    );

    //錯誤處理：無符合條件的結果
    if (filteredUsers.length === 0) {
        return searchMessage.innerHTML = `⚠️ Unable to find users with: <span>"${keyword.toUpperCase()}"</span>`;
    }

    renderPaginator(filteredUsers.length);
    //重新輸出至畫面
    renderUserList(getUsersByPage(1));
    renderFavUsers();

    searchMessage.innerHTML = `✅ Find at least <span>${filteredUsers.length}</span> matches for <span>"${keyword.toUpperCase()}"</span>`;

}

// * 鍵盤輸入時也可以進行搜尋
// * 如果輸入框空白會回到全部使用者
function searchOnType(event) {
    let timer;
    clearTimeout(timer);
    timer = setTimeout(() => {
        event.preventDefault();
        const keyword = searchInput.value;
        if (keyword.length > 0) {
            searchKeyword(event);
        } else {
            filteredUsers = [];
            searchMessage.style.display = 'none';
            renderPaginator(users.length);
            renderUserList(getUsersByPage(1));
            renderFavUsers();
        }
    }, 500);
}

// * 點選 male, female 按鈕可篩選特定性別 user
function filterMale(event) {
    event.preventDefault();
    gender = 'male';
    const targetUsers = filteredUsers.length ? filteredUsers : users;
    maleUsers = targetUsers.filter((user) => user.gender === 'male');
    renderUserList(getUsersByPage(1));
    renderFavUsers();
    renderPaginator(maleUsers.length);
}

function filterFemale(event) {
    event.preventDefault();
    gender = 'female';
    const targetUsers = filteredUsers.length ? filteredUsers : users;
    femaleUsers = targetUsers.filter((user) => user.gender === 'female');
    renderUserList(getUsersByPage(1));
    renderFavUsers();
    renderPaginator(femaleUsers.length);
}


// * 顯示 user modal or 加入 favorite
function showModalOrAddFavorite(event) {
    const id = Number(event.target.closest('.card').dataset.id);
    if (event.target.matches(".btn-show-user") || event.target.matches(".fa-circle-info")) {
        showUserModal(id);
    } else if (event.target.matches('.btn-add-favorite')) { // todo 按到愛心不會觸發事件
        if (event.target.classList.contains('liked')) {
            removeFromFavorite(id);
            event.target.classList.remove('liked');
            event.target.innerHTML = `Like <i class="fa-solid fa-heart"></i>`;
        } else {
            addToFavorite(id);
            event.target.classList.add('liked');
            event.target.innerHTML = `Liked <i class="fa-solid fa-heart"></i>`;
        }
    }
}

// * 渲染畫面
function initUserList() {
    axios
        .get(INDEX_URL)
        .then((response) => {
            users.push(...response.data.results);
            renderPaginator(users.length);
            renderUserList(getUsersByPage(1));
            renderFavUsers();
            searchInput.value = '';
        })
        .catch((err) => console.log(err));
}

// * 綁定監聽器
searchForm.addEventListener('submit', searchKeyword);
searchForm.addEventListener('keyup', searchOnType);
selectMale.addEventListener('click', filterMale);
selectFemale.addEventListener('click', filterFemale);
dataPanel.addEventListener('click', showModalOrAddFavorite);
paginator.addEventListener('click', renderCertainPage);

// * 初始化頁面
initUserList();

// * 已優化內容：
// * 分頁加上 .active class 讓使用者可知道目前所在分頁
// * 點擊 like 按鈕後，按鈕顏色會有變化，若再點擊，可將user從favorite中移除
// * 已 favorite 的狀態即使重新整理或是搜尋後都會保留
// * showModal 程式碼雜亂問題
// * 程式碼封裝
// * 搜尋時會出現提示語句
// * 鍵盤輸入時也可以進行搜尋
// * 點選 male, female 按鈕可篩選特定性別 user


