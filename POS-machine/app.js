// 3.變數宣告
const menu = document.getElementById('menu');
const cart = document.getElementById('cart');
const totalAmount = document.getElementById('total-amount');
const button = document.getElementById('submit-button');
const clearCartBtn = document.getElementById('clear-cart');

let total = 0;
let productData = [];
let cartItems = [];

// 4.GET API 菜單產品資料
axios.get('https://ac-w3-dom-pos.firebaseio.com/products.json')
    .then(function (res) {
        productData = res.data;
        displayProducts(productData);
    })
    .catch(function (err) {
        console.log(err);
    });

// 5.將產品資料加入菜單區塊
function displayProducts(products) {
    products.forEach(product => {
        menu.innerHTML += `
      <div class="col-6 col-sm-3">
        <div  class="card" >
          <img id=${product.id} src=${product.imgUrl} class="card-img-top" alt="...">
          <div id=${product.id} class="card-body">
            <h5 id=${product.id} class="card-title">${product.name}</h5>
            <p id=${product.id} class="card-text">${product.price} 元</p>
            <a id=${product.id} href="javascript:;" class="btn btn-primary">加入購物車</a>
          </div>
        </div>
      </div>
    `;
    });
}

// 6.加入購物車
function addToCart(event) {
    // 找到觸發event的node元素，並得到其產品id
    const id = event.target.id;
    if (!id) return;
    // 在productData的資料裡，找到點擊的產品資訊 name, price
    const addedProduct = productData.find(product => product.id === id);
    const name = addedProduct.name;
    const price = addedProduct.price;

    // 加入購物車變數cartItems 分：有按過、沒按過
    const targetCartItem = cartItems.find(item => item.id === id);
    // 有按過 換數量的值
    if (targetCartItem) {
        targetCartItem.quantity += 1;
    } else {
        // 沒按過 加入新資料
        cartItems.push({
            id, // id: id
            name, // name: name
            price, // price: price
            quantity: 1
        });
    }

    // 畫面顯示購物車清單
    cart.innerHTML = cartItems.map(item => `
    <li id="${item.id}" class="list-group-item">
    <i class="btn-danger fa-regular fa-circle-xmark delete-item"></i> ${item.name} X ${item.quantity} 小計：${item.price * item.quantity} 元 <i class="btn-info fa-solid fa-plus add-one"></i><i class="btn-info fa-solid fa-minus minus-one"></i>
    </li>
  `).join('');

    // 計算總金額
    calculateTotal(price);
}

// 7.計算總金額
function calculateTotal(amount) {
    total += amount;
    totalAmount.textContent = `${total} 元`;
}

// 8.送出訂單
function submit() {
    if (!total || !cartItems) return;
    let alertMessage = `感謝購買！
  `;
    cartItems.forEach(item => {
        alertMessage += `
${item.name} X ${item.quantity} 小計：${item.price * item.quantity} 元`;
    });
    alertMessage += `
總共： ${total} 元`;
    alert(alertMessage);
    reset();
}

// 9.重置資料
function reset() {
    cartItems = [];
    cart.innerHTML = ``;
    total = 0;
    totalAmount.innerText = '--';
}

// 增減購物車內商品數量或是刪除該項目
function addOrDelete(e) {
    const target = e.target;
    const id = target.parentElement.id;
    if (target.classList.contains('delete-item')) {
        deleteItem(id, target);
    } else if (target.classList.contains('add-one')) {
        addOne(id, target);
    } else if (target.classList.contains('minus-one')) {
        minusOne(id, target);
    }
}

// 刪除項目
function deleteItem(id, target) {
    const deletedItem = cartItems.find(item => item.id === id);
    const deletedIndex = cartItems.indexOf(deletedItem);
    cartItems.splice(deletedIndex, 1);
    target.parentElement.remove();
    total = total - deletedItem.price * deletedItem.quantity;
    totalAmount.innerText = `${total} 元`;
}

// 增加該項目數量
function addOne(id, target) {
    const addedItem = cartItems.find(item => item.id === id);
    addedItem.quantity++;
    target.parentElement.innerHTML = `
  <i class="btn-danger fa-regular fa-circle-xmark delete-item"></i> ${addedItem.name} X ${addedItem.quantity} 小計：${addedItem.price * addedItem.quantity} 元 <i class="btn-info fa-solid fa-plus add-one"></i><i class="btn-info fa-solid fa-minus minus-one"></i>
  `;
    total = total + addedItem.price;
    totalAmount.innerText = `${total} 元`;
}

// 漸少該項目數量，若商品只剩一個則無法按"-"
function minusOne(id, target) {
    const removedItem = cartItems.find(item => item.id === id);
    if (removedItem.quantity === 1) return;
    removedItem.quantity--;
    target.parentElement.innerHTML = `
  <i class="btn-danger fa-regular fa-circle-xmark delete-item"></i> ${removedItem.name} X ${removedItem.quantity} 小計：${removedItem.price * removedItem.quantity} 元 <i class="btn-info fa-solid fa-plus add-one"></i><i class="btn-info fa-solid fa-minus minus-one"></i>
  `;
    total = total - removedItem.price;
    totalAmount.innerText = `${total} 元`;
}

// 加入事件監聽
menu.addEventListener('click', addToCart);
button.addEventListener('click', submit);

// 購物車監聽按鈕被點擊的事件
cart.addEventListener('click', addOrDelete);
// 按下清空購物車可重置所有購物車資料
clearCartBtn.addEventListener('click', reset);

// 點擊卡片任何地方也可加入購物車 完成
// 可從購物車內增減品項 + or - 完成
// 刪除單一品項 完成
// 清空購物車 完成