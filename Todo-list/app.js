// 初始變數
const input = document.querySelector("#new-todo");
const addBtn = document.querySelector("#add-btn");
const warning = document.querySelector("#warning");

const todoList = document.querySelector("#my-todo");
const doneList = document.querySelector("#done-todo");
const congrats = document.querySelector("#congrats");

// 資料
const todos = [
    "Hit the gym",
    "Read a book",
    "Buy eggs",
    "Organize office",
    "Pay bills"
];
todos.forEach((todo) => {
    renderTask(todo);
});

// 函式

// 新增新的todo
function renderTask(text) {
    let newItem = document.createElement("li");
    newItem.innerHTML = `
    <label for="todo">${text}</label>
    <i class="delete fa fa-check"></i>
  `;
    todoList.appendChild(newItem);
}
// 將完成項目移到done欄位，在html中加上checked class
function renderDoneTask(text) {
    let newItem = document.createElement("li");
    newItem.innerHTML = `
    <label for="todo" class="checked">${text}</label><i class="back fa-solid fa-arrow-rotate-left"></i><i class="delete fa-solid fa-trash"></i>
  `;
    doneList.appendChild(newItem);
}

function deleteParent(target) {
    let parentElement = target.parentElement;
    parentElement.remove();
}

// 新增項目的函式
function addTask() {
    let inputValue = input.value.trim(); // trim() 會移除string裡面的空白字元
    // 如果input裡面有輸入(length>0)的話才會新增，否則會不小心新增到空白項目
    if (inputValue.length > 0) {
        // 如果輸入非空白，要移除警語
        warning.style.display = "none";
        input.style.border = "2px solid rgb(0 0 0/.15)";

        input.value = ""; // 將輸入欄位清除
        congrats.style.display = "none"; // 移除恭喜字句
        renderTask(inputValue);
    } else {
        // 優化：新增警語，提示不可輸入空白task
        warning.style.display = "block";
        input.style.border = "2px solid red";
    }
}

// 1. 新增項目

// 1-1. 點擊add按鈕時可新增新的項目
addBtn.addEventListener("click", addTask);

// 1-2. 在輸入欄位按下enter也可新增新的項目
input.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        addTask();
    }
});

// 2. 刪除項目

// 2-1. 在todo欄位按下打勾圖示，會將項目移到done欄位中
todoList.addEventListener("click", (e) => {
    const target = e.target;
    if (target.classList.contains("delete")) {
        deleteParent(target);
        // 抓取刪除項目的label部分，新增到下面的donelist
        const deletedItem = target.parentElement.firstElementChild;
        renderDoneTask(deletedItem.innerText);
    }
    // 優化：如果todo欄位沒有項目時，會顯示恭喜完成所有task
    if (todoList.children.length === 0) {
        congrats.style.display = "block";
    }
});

// 2-2. 在done欄位點擊垃圾桶圖示可將項目刪除
doneList.addEventListener("click", (e) => {
    const target = e.target;
    if (target.classList.contains("delete")) {
        deleteParent(target);
    } else if (target.classList.contains("back")) {
        const backItem = target.previousElementSibling;
        renderTask(backItem.innerText);
        deleteParent(target);
        congrats.style.display = "none"; // 移除恭喜字句
    }
});
