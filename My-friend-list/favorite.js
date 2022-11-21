// * 初始變數
const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users";

const favoriteUsers = JSON.parse(localStorage.getItem('favoriteUsers')) || [];

// * DOM 節點
const dataPanel = document.querySelector("#data-panel");

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
                <button class="btn btn-danger btn-remove-favorite liked" data-id="${item.id}">Unlike <i class="fa-solid fa-heart-crack"></i></button>
            </div>
            </div>
        </div>
        </div>`;
    });
    dataPanel.innerHTML = rawHTML;
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

// * 從 favorite 中移除 user
function removeFromFavorite(id) {
    if (!favoriteUsers || !favoriteUsers.length) return;

    const userIndex = favoriteUsers.findIndex((user) => user.id === id);

    if (userIndex === -1) return;

    favoriteUsers.splice(userIndex, 1);
    localStorage.setItem('favoriteUsers', JSON.stringify(favoriteUsers));
    renderUserList(favoriteUsers);
}

// * 顯示 user modal or 從 favorite 中移除
function showModalOrRemoveFavorite(event) {
    const id = Number(event.target.closest('.card').dataset.id);
    if (event.target.matches(".btn-show-user") || event.target.matches(".fa-circle-info")) {
        showUserModal(id);
    } else if (event.target.matches('.btn-remove-favorite')) {
        removeFromFavorite(id);
    }
}


dataPanel.addEventListener("click", showModalOrRemoveFavorite);

renderUserList(favoriteUsers);
