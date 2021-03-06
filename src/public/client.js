//@ts-check

// IIFE
(() => {
  const socket = new WebSocket(`ws://${window.location.host}/ws`); //일반 웹소켓
  const formEl = document.getElementById("form");
  const inputEl = document.getElementById("input");
  const chatsEl = document.getElementById("chats");

  if (!formEl || !inputEl || !chatsEl) {
    throw new Error("init failed");
  }

  const adjectives = ["멋진", "훌륭한", "친절한", "새침한"];
  const animals = ["물범", "사자", "독수리", "사슴", "돌고래"];

  /**
   * @param {string[]} array
   * @returns {string}
   */
  function randomPick(array) {
    const randomInt = Math.floor(Math.random() * array.length);
    const result = array[randomInt];
    if (!array[randomInt]) {
      throw new Error();
    }
    return result;
  }
  const _nickname = randomPick(adjectives) + randomPick(animals);

  formEl.addEventListener("submit", (event) => {
    event.preventDefault();
    socket.send(
      JSON.stringify({
        nickname: _nickname,
        message: inputEl.value,
      })
    );
    inputEl.value = "";
  });

  function drawChats(payload) {
    //console.log(payload.nickname);
    let li = document.createElement("li");
    li.innerText = `${payload.nickname} : ${payload.message}`;
    chatsEl.appendChild(li);
  }

  socket.addEventListener("message", (event) => {
    const { type, payload } = JSON.parse(event.data);

    if (type === "sync") {
      const { chats: syncedChats } = payload;
      syncedChats.forEach((chat) => {
        drawChats(chat);
      });
    } else if (type === "chat") {
      drawChats(payload);
    }

    //chatsEl.innerHTML = "";
  });
})();
