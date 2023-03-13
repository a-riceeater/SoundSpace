// Sockets
const socket = io();
const userStatus = {
    muted: false,
    deaf: false
};

function mainFunction(time) {
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

mainFunction(1000)


socket.on("recieve-voice", function (data) {
    if (userStatus.deaf) return;
    var audio = new Audio(data.audio);
    audio.play();
});

// Voice controls
_("#muteBtn").addEventListener("click", (e) => {
    e.preventDefault();
    const ele = _("#muteBtn");
    console.log(ele.src)
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
    console.log(ele.src)
    if (ele.src.includes("undeafen")) {
        ele.src = "assets/deafen.png"
        userStatus.deaf = false;
    } else {
        ele.src = "assets/undeafen.png"
        userStatus.deaf = true;
    }
});