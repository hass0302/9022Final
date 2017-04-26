var app = {
    // Application Constructor
    baseurl: 'https://griffis.edumedia.ca/mad9022/steg/',
    key: 'hass0302',
    userid: {},
    guid: {},
    data: null,
    msgID: null,
    repName: null,
    image: null,
    userList: null,
    initialize: function () {
        document.addEventListener("DOMContentLoaded", function () {
            console.log("Login Page");
            var content = document.querySelector(".content");
            var buttons = content.getElementsByTagName("button");
            var sendmsgBtn = document.getElementById("sendMessageBtn");
            let sendButtonModal = document.getElementById('sendButtonModal');
            let backButtonSendModal = document.getElementById('backButtonSendModal');
            sendButtonModal.addEventListener("touchstart", app.sendButtonModalClick);
            backButtonSendModal.addEventListener("touchstart", app.backButtonSendModalClick);
            let loginBtn = buttons[0];
            let registerBtn = buttons[1];
            let deleteMsgBtn = document.getElementById("deleteMsgBtn");
            deleteMsgBtn.addEventListener("click", app.deleteMsgAction);
            registerBtn.addEventListener("click", app.registerClick);
            loginBtn.addEventListener("click", app.loginClick);
            sendmsgBtn.addEventListener("click", app.msgSendClick);
            photoBtn.addEventListener("click", app.callCamera);
        });
    },
    photoClick: function () {
        app.callCamera();
    },
    msgSendClick: function () {
        let modal = document.getElementById("sendModal");
        let message = modal.querySelector(".message");
        let dropdown = modal.getElementsByTagName("select")[0];
        let canvas = document.getElementById("imageBox");
        let req = new Request("https://griffis.edumedia.ca/mad9022/steg/msg-send.php");
        let userIDBits = BITS.numberToBitArray(dropdown.value);
        BITS.setUserId(userIDBits, canvas);
        let msgLengthBits = BITS.numberToBitArray(message.value.length * 16);
        BITS.setMsgLength(msgLengthBits, canvas);
        let msgBits = BITS.stringToBitArray(message.value, canvas);
        BITS.setMessage(msgBits, canvas);
        let dataURL = canvas.toDataURL();
        app.dataURLToBlob(dataURL).then(function (blob) {
            console.log(blob);
            let myData = new FormData();
            myData.append("user_id", app.userid);
            myData.append("user_guid", app.guid);
            myData.append("recipient_id", dropdown.value);
            myData.append("image", blob);
            let opts = {
                method: 'post',
                mode: 'cors',
                body: myData
            };
            fetch(req, opts).then(function (response) {
                //console.log("response from server ", response.status);
                return response.json();
            }).then(function (data) {
                console.log(data.code);
                console.log(data.message);
                if (data.code == "123") {
                    alert(data.message);
                } else {
                    let modal = document.getElementById("sendModal");
                    modal.classList.toggle("active");
                    modal.getElementsByTagName("textarea")[0].value = "";
                    document.getElementById("photoBtn").style.display = "";
                    let canvas = document.getElementById("imageBox");
                    let context = canvas.getContext('2d');
                    context.clearRect(0, 0, 300, 300);

                    // let buttonsmodal.getElementsByTagName('button');

                    let listModal = document.getElementById('listModal');
                    listModal.classList.toggle('active');
                    app.popList();
                    console.log("message sent");
                }
            }).catch(function (err) {
                console.log("ERROR: ", err.message);
            });
        });
    },
    loginClick: function () {
        let content = document.querySelector(".content");
        let inputs = content.getElementsByTagName("input");
        let usernameFld = inputs[0].value.toLowerCase();
        // just trying to turn them all to lower cases. it shouldn't matter if they are.
        let emailFld = inputs[1].value.toLowerCase();
        let req = new Request("https://griffis.edumedia.ca/mad9022/steg/login.php");
        let myData = new FormData();
        myData.append("user_name", usernameFld);
        myData.append("email", emailFld);
        let opts = {
            method: 'post',
            mode: 'cors',
            body: myData
        };
        fetch(req, opts).then(function (response) {
            //console.log("response from server ", response.status);
            return response.json();
        }).then(function (data) {
            console.log(data);
            if (data.code != 0) {
                alert(data.message);
            } else {
                app.guid = data.user_guid;
                app.userid = data.user_id;
                console.log("user's id is " + app.userid);
                console.log("user's guid is " + app.guid);
                let modal = document.getElementById("listModal");
                modal.classList.toggle("active");
                app.getUserList()
                app.popList();
            }
        }).catch(function (err) {
            console.log("ERROR: ", err.message);
        });
    },
    getUserList: function () {
        // this function gets a list of users that is registered on the network. This includes the user itself!!!
        let req = new Request("https://griffis.edumedia.ca/mad9022/steg/user-list.php");
        let myData = new FormData();
        console.log(app.userid);
        myData.append("user_id", app.userid);
        myData.append("user_guid", app.guid);
        let opts = {
            method: 'post',
            mode: 'cors',
            body: myData
        };
        fetch(req, opts).then(function (response) {
            // console.log ("response");
            return response.json();
        }).then(function (data) {
            // adding this list to app.userList which can be reused later.
            app.userList = Object.assign({}, data.users);
            //console.dir(app.userList);
            // highlighting the dropdown select from send message modal.
            let dropdowns = document.getElementsByTagName("select");
            for (let i = 0; i < Object.keys(app.userList).length; i++) {
                let option = document.createElement("option");
                option.value = app.userList[i].user_id;
                option.textContent = app.userList[i].user_name;
                dropdowns[0].appendChild(option);
            }
            // console.dir(dropdowns[0].value);
        }).catch(function (err) {
            console.log("ERROR: ", err.message);
        });
    },
    registerClick: function () {
        let content = document.querySelector(".content");
        let inputs = content.getElementsByTagName("input");
        let usernameFld = inputs[0].value;
        let emailFld = inputs[1].value;
        let req = new Request("https://griffis.edumedia.ca/mad9022/steg/register.php");
        let myData = new FormData();
        // going to have to change it to username field.
        myData.append("user_name", usernameFld);
        // going to have to change it to email field
        myData.append("email", emailFld);
        let opts = {
            method: 'post',
            mode: 'cors',
            body: myData
        };
        fetch(req, opts).then(function (response) {
            //console.log("response from server ", response.status);
            return response.json();
        }).then(function (data) {
            alert(data.message);
        }).catch(function (err) {
            console.log("ERROR: ", err.message);
        });
        // console.log(app.data);
    },
    popList: function () {
        // populating the list of messages from the server
        console.log("List of Message Modal");
        let req = new Request("https://griffis.edumedia.ca/mad9022/steg/msg-list.php");
        let myData = new FormData();
        myData.append("user_id", app.userid);
        myData.append("user_guid", app.guid);
        let opts = {
            method: 'post',
            mode: 'cors',
            body: myData
        };
        fetch(req, opts).then(function (response) {
            return response.json();
        }).then(function (data) {
            console.log(data);
            console.dir(data.messages);
            console.log(app.userid);
            //alert(data.message);
            let modal = document.getElementById("listModal");
            let content = modal.querySelector(".content-padded");
            //preparing to create the list
            let ul = document.createElement("ul");
            ul.classList.add("table-view");
            if (data.messages.length == 0) {
                content.innerHTML = "No Messages. Maybe make some new friends?";
            } else {
                content.innerHTML = "";
                data.messages.forEach(function (element) {
                    let li = document.createElement("li");
                    li.classList.add("table-view-cell");
                    let a = document.createElement("a");
                    a.classList.add("navigate-right");
                    a.href = "#receiveModal";
                    a.addEventListener("touchstart", function () {
                        app.repName = element.user_name;
                        app.msgID = element.msg_id;
                        //console.log(app.msgID);
                        app.receiveMsgModal();
                        //console.log("fuck you");
                    });
                    a.innerHTML = element.user_name;
                    li.appendChild(a);
                    ul.appendChild(li);
                });
            }
            content.innerHTML = "You have " + data.messages.length + " message(s)";
            content.appendChild(ul);
        }).catch(function (err) {
            console.log("ERROR: ", err.message);
        });
    },
    callCamera: function () {
        app.imgOptions = {
            quality: 80,
            destinationType: Camera.DestinationType.FILE_URI,
            encodingType: Camera.EncodingType.PNG,
            mediaType: Camera.MediaType.PICTURE,
            pictureSourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            targetWidth: 300,
            targetHeight: 300
        };
        console.dir(app.imgOptions);
        navigator.camera.getPicture(app.imgSuccess, app.imgFail, app.imgOptions);
    },
    imgSuccess: function (imageURI) {
        var img = document.createElement("img");
        img.src = imageURI;
        img.crossOrigin = "anonymous";
        var canvas = document.getElementById("imageBox");
        var context = canvas.getContext("2d");
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.style.width = "100px";
            canvas.style.height = "100px";
            context.drawImage(this, 0, 0);
        }
        navigator.camera.cleanup();
        let modal = document.getElementById("sendModal");
        let buttons = modal.getElementsByTagName("button");
        let photoBtn = buttons[1];
        console.log(photoBtn);
        photoBtn.style.display = "none";
    },
    imgFail: function (msg) {
        console.log("Failed to get image: " + msg);
    },
    receiveMsgModal: function () {
        let req = new Request("https://griffis.edumedia.ca/mad9022/steg/msg-get.php");
        let myData = new FormData();
        myData.append("user_id", app.userid);
        myData.append("user_guid", app.guid);
        myData.append("message_id", app.msgID);
        let opts = {
            method: 'post',
            mode: 'cors',
            body: myData
        };
        fetch(req, opts).then(function (response) {
            return response.json();
        }).then(function (data) {
            console.log(data);
            let secret;
            let modal = document.getElementById("receiveModal");
            let fromNameLbl = modal.getElementsByClassName("from-whom")[0];
            fromNameLbl.innerHTML = "From: " + app.repName;
            modal.querySelector(".content-padded");
            console.dir(data);
            console.log(data.image);
            let canvas = document.getElementById("receivedImgBox");
            let context = canvas.getContext('2d');
            let img = document.createElement('img');
            img.crossOrigin = "Anonymous";
            context.clearRect(0, 0, 300, 300);

            img.onload = function () {
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0);
                console.log(app.userid);
                secret = BITS.getMessage(app.userid, canvas);
                //console.log(secret);
                modal.getElementsByTagName("textarea")[0].value = secret;
            }
            img.src = app.baseurl + data.image;
        }).catch(function (err) {
            console.log("ERROR: ", err.message);
        });
    },
    dataURLToBlob: function (dataURL) {
        return Promise.resolve().then(function () {
            var type = dataURL.match(/data:([^;]+)/)[1];
            var base64 = dataURL.replace(/^[^,]+,/, '');
            var buff = app.binaryStringToArrayBuffer(atob(base64));
            return new Blob([buff], {
                type: type
            });
        });
    },
    binaryStringToArrayBuffer: function (binary) {
        var length = binary.length;
        var buf = new ArrayBuffer(length);
        var arr = new Uint8Array(buf);
        var i = -1;
        while (++i < length) {
            arr[i] = binary.charCodeAt(i);
        }
        return buf;
    },
    sendButtonModalClick: function () {
        let listModal = document.getElementById('listModal');
        let sendModal = document.getElementById('sendModal');
        sendModal.classList.add('active');
        listModal.classList.remove('active');
    },
    backButtonSendModalClick: function () {
        let listModal = document.getElementById('listModal');
        let sendModal = document.getElementById('sendModal');
        listModal.classList.add('active');
        sendModal.classList.remove('active');
        app.popList();
    },
    deleteMsgAction: function () {
        let req = new Request("https://griffis.edumedia.ca/mad9022/steg/msg-delete.php");
        let modal = document.getElementById("receiveModal");
        let button = modal.getElementsByTagName("button")[0];
        let myData = new FormData();
        myData.append("user_id", app.userid);
        myData.append("user_guid", app.guid);
        myData.append("message_id", app.msgID);
        let opts = {
            method: 'post',
            mode: 'cors',
            body: myData
        };
        fetch(req, opts).then(function (response) {
            return response.json();
        }).then(function (data) {
            console.log('deleted');
            modal.classList.toggle('active');

            let canvas = document.getElementById("receivedImgBox");
            let context = canvas.getContext('2d');
            // to clear the canvas
            context.clearRect(0, 0, 300, 300);
            modal.getElementsByTagName('textarea')[0].value = "";
            app.popList();

        }).catch(function (err) {
            console.log("ERROR: ", err.message);
        });
    }
};
app.initialize();
