// Sockets
const socket = io();
const userStatus = {
    muted: false,
    deaf: false,
    username: ''
};

function voice(time) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        var madiaRecorder = new MediaRecorder(stream);
        madiaRecorder.start();

        var audioChunks = [];

        madiaRecorder.addEventListener("dataavailable", function (event) {
            audioChunks.push(event.data);
        });

        madiaRecorder.addEventListener("stop", function () {
            var audioBlob = new Blob(audioChunks);

            audioChunks = [];

            var fileReader = new FileReader();
            fileReader.readAsDataURL(audioBlob);
            fileReader.onloadend = function () {
                if (userStatus.muted) return;

                var base64String = fileReader.result;
                socket.emit("send-voice", base64String);

            };

            madiaRecorder.start();


            setTimeout(function () {
                madiaRecorder.stop();
            }, time);
        });

        setTimeout(function () {
            madiaRecorder.stop();
        }, time);
    });

}

voice(500)

socket.on("recieve-voice", (data) => {
    if (userStatus.deaf || data.user == userStatus.username) return;
    console.log(data);

    _(".dft-user", true).forEach(ele => {
        if (ele.getAttribute("data-user") == data.user) {
            ele.style.border = "5px solid green"
            setTimeout(() => {
                ele.style.border = "5px solid transparent"
            }, 500)
        }
    })

    var audio = new Audio(data.audio);
    audio.play();
});

socket.on("recieve-join", (data) => {
    const user = document.createElement("button");
    user.classList.add("dft-user")
    user.innerHTML = data.user.slice(0, 5);
    user.setAttribute("data-user", data.user);
    _("#usersPfps").appendChild(user);
})

// Voice controls
_("#muteBtn").addEventListener("click", (e) => {
    e.preventDefault();
    const ele = _("#muteBtn");
    if (ele.src.includes("unmute")) {
        ele.src = "assets/mute.png"
        ele.style.marginBottom = "0"
        ele.setAttribute("width", "75px")
        userStatus.muted = false;
    } else {
        ele.src = "assets/unmute.png"
        ele.style.marginBottom = "5px"
        ele.setAttribute("width", "80px")
        userStatus.muted = true;
    }
})

_("#deafenBtn").addEventListener("click", (e) => {
    e.preventDefault();
    const ele = _("#deafenBtn")
    if (ele.src.includes("undeafen")) {
        ele.src = "assets/deafen.png"
        userStatus.deaf = false;
    } else {
        ele.src = "assets/undeafen.png"
        userStatus.deaf = true;
    }
});

// Join rooms
_("#connectToRoomBtn").addEventListener("click", (e) => {
    const room = _("#roomName").value;
    const username = _("#username").value;
    if (room.replaceAll(" ", "") == "" || username.replaceAll(" ", "") == "") return;
    _(".dft-user", true).forEach(ele => ele.remove());
    socket.emit("join", { room: room, user: username })
    userStatus.username = username;
    _("#currentRoom").iText(room);
    _("#username").value = '';
    _("#roomName").value = '';
})