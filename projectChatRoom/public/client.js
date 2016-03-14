// TODO: Maintain a list of chat rooms to make sure that no duplicate chat rooms are found!
/*Define a User class*/
var User = function(email, username, pwd){
    this.email = email;
    this.username = username;
    this.pwd = pwd;
    // Associated filename that stores user's chat history.
    // At this time, history file is not created yet.
    // A list that stores this user's friend.
    this.friends = [];
    this.pendingRequest = [];
}

var socket = io();
// User information on this client.
var clientUserName = '';
var clientUser;
// Handle multiple pending friend requests.
var requestCounter = 0;
var pendingRequests = [];
// Record the current chat room name.
var currChatRoom = 'public';

Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}

/*Register*/
/*Add interesting keywords. Conversation in public chat with keywords will be send to you.*/
document.getElementById('register-button').addEventListener('click', dispRegPage);
function dispRegPage(evt){
    document.getElementById('register').hidden = false;
    document.getElementById('login').setAttribute('hidden', true);
}
document.getElementById('register-submit-button').addEventListener('click', register);
function register(evt){
    var email = document.getElementById('text-email-reg').value;
    var name = document.getElementById('text-name-reg').value;
    var password = document.getElementById('text-password-reg').value;
    console.log(email, name, password);
    if(email == '' || name == '' || password == ''){
        alert('Found invalid input!');
        return;
    }
    var user = new User(email, name, password);
    socket.emit('register', JSON.stringify(user));
}
socket.on('register', function(msg){
    if(msg == 'illegal'){
        // console.log('on register');
        alert('email or username is already used!');
        return;
    }else{
        document.getElementById('register').setAttribute('hidden', true);
        document.getElementById('login').hidden = false;
        return;
    }
});
/*Handle login button click.*/
document.getElementById('login-button').addEventListener('click', login);

function login(evt){
    console.log('login is called');
    var name = document.getElementById('text-name-login').value;
    var password = document.getElementById('text-password-login').value;
    clientUserName = name;
    console.log(name, password);
    if(name == '' || password == ''){
        alert('Some input field is empty!');
        return;
    }
    var user = new User('', name, password);
    console.log(user);
    socket.emit('login', JSON.stringify(user));
}

socket.on('login', function(msg){
    console.log('on login!');
    if(msg == 'notfound'){
        alert('User not found in database!');
        return;
    }else if(msg == 'password'){
        alert('Plear check your password!');
        return;
    }else if(msg == 'alreadyloggedin'){
        alert('User already logged in!');
        return;
    }else{
        //Start chat room here!
        console.log(msg);
        var userObj = JSON.parse(msg);
        if(userObj.username == clientUserName){
            clientUser = userObj;
            console.log('IDENTIFY USER!!!!');
            console.log(clientUser);
        }
        // Display chatroom.
        document.getElementById('login').setAttribute('hidden', true);
        document.getElementById('chatRoom').hidden = false;
        // Set friends list if the logged in user has friends.
        setFriendsList(userObj.friends);
        // Check for pending request. If there is a pending request, display pop up window.
        if(userObj.pendingRequest.length != 0){
            while(pendingRequests.length > 0){
                pendingRequests.pop();
            }
            for(var i=0; i<userObj.pendingRequest.length; i++){
                pendingRequests.push(userObj.pendingRequest[i]);
            }
            console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
            console.log(pendingRequests);
            document.getElementById('dialog-request-name').innerHTML = pendingRequests[0];
            $(function() {
                $( "#friend-request-dialog" ).dialog('open');
                $( "#friend-request-dialog" ).dialog('option', 'position', 'center');
            });
        }
    }
});
// TODO: Change this to template.
// Helper function to set the friend list.
function setFriendsList(friends){
    var friendList = '';
    for(var i=0; i<friends.length; i++){
        friendList += '<div class="sidebar-list">' + friends[i] + '</div>';
    }
    document.getElementById('friends-list').innerHTML = friendList;
}

// Update login list whenever 'userlogin' event happens.
// userlogin is broadcast to public room.
socket.on('userlogin', function(msg){
    console.log('HERE!!!!!!!!!!!!');
    console.log(msg);
    var names = JSON.parse(msg);
    console.log(names);
    var loginList = '';
    // Change this to template latter!!!
    for(var i=0; i<names.length; i++){
        // TODO: Can't change this class!!!!!
        // This class is used in getOnlineUsers funciton.
        loginList += '<div class="sidebar-list">' + names[i] + '</div>';
    }
    console.log(loginList);
    document.getElementById('logged-in-users').innerHTML = loginList;
});
/* Handle adding friends */
document.getElementById('profile-button').addEventListener('click', handleProfileButton);
function handleProfileButton(evt){
    // Hide chatRoom and show profile.
    document.getElementById('chatRoom').setAttribute('hidden', true);
    document.getElementById('profile').hidden = false;
}
document.getElementById('return-to-chatroom').addEventListener('click', function(evt){
    document.getElementById('profile').setAttribute('hidden', true);
    document.getElementById('chatRoom').hidden = false;
});
// Add frind by name button.
// TODO: Display a list of friends satisfy the searching critiera when input.
document.getElementById('submit-friend-username').addEventListener('click', handleSubmitFriendName);
function handleSubmitFriendName(evt){
    var friendUserName = document.getElementById('friend-username').value;
    console.log('firendUserName: ' + friendUserName);
    document.getElementById('friend-username').value = '';
    socket.emit('addfriendusername', friendUserName);
}
// Hide the dialog
$('#friend-request-dialog').dialog({
    autoOpen: false,
    title: 'Friend request'
});
// When the user is currently online and received a friend request.
socket.on('addfriendusername', function(msg){
    console.log(msg);
    if(msg == 'usernotfound'){
        alert('User is not found in database!');
        return;
    }else if(msg == 'addself'){
        alert('Can not add yourself as friend!');
        return;
    }else if(msg == 'alreadyfriend'){
        alert('Already friend with the input username!');
        return;
    }
    // Add blinking here!
    $.titleAlert("Incoming friend request!", {
        requireBlur:false,
        stopOnFocus:false,
        duration:4000,
        interval:500
    });
    // Reset pending requests every time.
    while(pendingRequests.length > 0){
        pendingRequests.pop();
    }
    pendingRequests.push(msg);
    document.getElementById('dialog-request-name').innerHTML = msg;
    $(function() {
        $( "#friend-request-dialog" ).dialog('open');
        $( "#friend-request-dialog" ).dialog('option', 'position', 'center');
    });
});
socket.on('updatefriendlist', function(msg){
    console.log('UPDATEFRIENDLIST!!');
    console.log(msg);
    var friends = JSON.parse(msg);
    console.log(friends);
    console.log(friends[0]);
    // Write new friend list to local.
    while(clientUser.friends.length > 0){
        clientUser.friends.pop();
    }
    for(var i=0; i<friends.length; i++){
        clientUser.friends.push(friends[i]);
    }
    setFriendsList(friends);
});
// Handle accept condition.
// document.getElementById('dialog-request-accept').addEventListener('click', handleRequestAccept);
// document.getElementById('dialog-request-decline').addEventListener('click', handleRequestDecline);
// Start from the first request.
handleRequestAccept(document.getElementById('dialog-request-accept'), pendingRequests);
handleRequestDecline(document.getElementById('dialog-request-decline'), pendingRequests);
function handleRequestAccept(ele, pendingRequests){
    ele.addEventListener('click', function(evt){
        // If this is the last request.
        console.log('CHECK HERE!!!!!!!!!!!!!!');
        console.log(pendingRequests.length);
        console.log(requestCounter);
        console.log(pendingRequests.length - 1);
        if(requestCounter == pendingRequests.length - 1){
            console.log('HERE');
            var msg = document.getElementById('dialog-request-name').innerHTML;
            $('#friend-request-dialog').dialog('close');
            socket.emit('friendrequestaccept', JSON.stringify([msg, clientUser.username]));
            requestCounter = 0;
            return;
        }else{
            console.log('In else!!!!!!!!!!');
            // If there are other pending requests. Increase requestCounter, keep the popup window open.
            var msg = document.getElementById('dialog-request-name').innerHTML;
            socket.emit('friendrequestaccept', JSON.stringify([msg, clientUser.username]));
            requestCounter ++;
            document.getElementById('dialog-request-name').innerHTML = pendingRequests[requestCounter];
            return;
        }
    });
}
function handleRequestDecline(ele, pendingRequests){
    ele.addEventListener('click', function(evt){
        if(requestCounter == pendingRequests.length - 1){
            $('#friend-request-dialog').dialog('close');
            requestCounter = 0;
        }else{
            requestCounter ++;
            document.getElementById('dialog-request-name').innerHTML = pendingRequests[requestCounter];
        }
    });
}

/*Handle public chat*/
document.getElementById('input-button').addEventListener('click', handleChatInput);

function handleChatInput(evt){
    console.log('At start!');
    console.log(currChatRoom);
    var chatMsg = document.getElementById('input-area').value;
    console.log(chatMsg);
    // TODO: This msg should be displayed on the right part of the page.
    var chat = '';
    // chat += '<strong>' + clientUser.username + '</strong>' + '<br>';
    chat += chatMsg;
    console.log('CHECK HERE!!!');
    console.log(currChatRoom);
    var currRoomId = currChatRoom + '-chat-body';
    console.log(currRoomId);
    document.getElementById(currRoomId).innerHTML += '<div class="self makeAblock"><div class="talk-bubble tri-right right-top"><div class="talktext"><p>' + chat + '</p></div></div></div><div class="clear"></div>';
    var d = document.getElementById('rooms-chat-body');

    if(d.scrollHeight > d.clientHeight) {
        d.scrollTop = d.scrollHeight - d.clientHeight;
    }
    // Emit chat message along with chatroom name.
    socket.emit('chatmsg', JSON.stringify({msg: chatMsg, room: currChatRoom}));
}
socket.on('chatmsg', function(msg){
    // console.log('RECEIVED CHAT MESSAGE!!!!!!!!');
    // console.log(msg);
    // chat object contains user name and msg.
    // TODO: Use template here!!!
    var chatObj = JSON.parse(msg);
    var msgObj = JSON.parse(chatObj.chatmsg);
    console.log(chatObj);
    console.log(msgObj);
    // Add blinking here!
    $.titleAlert("New message!", {
        requireBlur:false,
        stopOnFocus:false,
        duration:4000,
        interval:500
    });
    // var chat = '';
    // chat += chatObj.username;
    // chat += '<br>'
    // chat += msgObj.msg;
    // console.log(chat);
    var roomBody = msgObj.room + '-chat-body';
    console.log(roomBody);
    document.getElementById(roomBody).innerHTML += '<p class="other name makeAblock">' + chatObj.username + '</p>' +
                                                    '<div class="talk-bubble tri-right left-top"><div class="talktext"><p>' + msgObj.msg + '</p></div></div></div>';
    var d = document.getElementById('rooms-chat-body');

    if(d.scrollHeight > d.clientHeight) {
        d.scrollTop = d.scrollHeight - d.clientHeight;
    }
});

/* Handle create new chat room! */
// Helper function to get a list of online user names.
function getOnlineUsers(){
    var onlineUserNames = [];
    var liTags = document.getElementById('logged-in-users').children;
    // var liTags = document.getElementsByClassName('logged-in-user-li');
    for(var i=0; i<liTags.length; i++){
        onlineUserNames.push(liTags[i].innerHTML);
    }
    console.log('ONLINE USERS!');
    console.log(onlineUserNames);
    return onlineUserNames;
}
// Helper function to get online friends.
function getOnlineFriends(){
    var friends = clientUser.friends;
    var onlineUsers = getOnlineUsers();
    var onlineFriends = [];
    for(var i=0; i<friends.length; i++){
        for(var j=0; j<onlineUsers.length; j++){
            if(friends[i] == onlineUsers[j]){
                onlineFriends.push(friends[i]);
                break;
            }
        }
    }
    return onlineFriends;
}
// Hide the popup window first.
$('#create-chatroom-dialog').dialog({
    autoOpen: false
});
document.getElementById('createchatroom-button').addEventListener('click', handleAddChatRoomButton);
function handleAddChatRoomButton(evt){
    // Change the ul in the dialog to a list of online friends.
    var onlineFriends = getOnlineFriends();
    console.log("CREATE CHAT ROOM!!!!!!!!!!!!!!");
    console.log(onlineFriends);
    var list = '';
    // TODO: Change this to template.
    for(var i=0; i<onlineFriends.length; i++){
        list += '<li><input class="online-friend-checklist" type="checkbox" value="' + onlineFriends[i] + '" name="' + onlineFriends[i] + '">' + onlineFriends[i] + '</li>';
    }
    document.getElementById('create-chatroom-onlinefriends').innerHTML = list;
    // Open the dialog.
    $(function() {
        $( "#create-chatroom-dialog" ).dialog('open');
        $( "#create-chatroom-dialog" ).dialog('option', 'position', 'center');
    });
}
document.getElementById('chatroom-cancel-button').addEventListener('click', handleChatRoomCancle);
function handleChatRoomCancle(evt){
    document.getElementById('new-chatroom-name').value = '';
    $('#create-chatroom-dialog').dialog('close');
}
document.getElementById('chatroom-confirm-button').addEventListener('click', handleChatRoomConfirm);
function handleChatRoomConfirm(evt){
    // Get the friend name that is selected.
    var selectedFriends = [];
    var cbs = document.getElementsByClassName('online-friend-checklist');
    for(var i=0; i<cbs.length; i++){
        console.log(cbs[i]);
        if(cbs[i].checked){
            selectedFriends.push(cbs[i].value);
        }
    }
    var roomName = document.getElementById('new-chatroom-name').value;
    socket.emit('addchatroom', JSON.stringify({room: roomName, selectedFriends: selectedFriends}));
    // Hide other chat bodys and display this one when first added.
    // OR
    // Change when click on tab. Prefer this!!
    // Create a new list and set it to hidden.
    // document.getElementById('new-chatroom-name').value = '';
    $('#create-chatroom-dialog').dialog('close');
}
socket.on('addchatroom', function(msg){
    if(msg == 'success'){
        // Create a new tab, hide pop up window, reconfigure socket on server side.
        var roomName = document.getElementById('new-chatroom-name').value;
        var newTabId = roomName + '-chat-room';
        var newTab = '<div class="chat-room-tab" id="' + roomName + '-chat-room">' + roomName + '<input type="button" id="' + roomName + '-leave" class="leave-button" name="'+ roomName + '" value="x"></div>';
        document.getElementById('chat-room-tabs').innerHTML += newTab;
        var tabs = document.getElementById('chat-room-tabs').children;
        for(var i=0; i<tabs.length; i++){
            var tabEle = tabs[i];
            addTabEventListener(tabEle);
        }
        var btns = document.getElementsByClassName('leave-button');
        for(var i=0; i<btns.length; i++){
            var btnEle = btns[i];
            addLeaveButtonListener(btnEle);
        }
        // Add nother ul to chat body.
        var newBody = '<ul id="' + roomName + '-chat-body" hidden></ul>'
        document.getElementById('rooms-chat-body').innerHTML += newBody;
        return;
    }else{
        alert('Found duplicate chat room name!');
        return;
    }
});
addTabEventListener(document.getElementById('public-chat-room'));
// Helper function to fire an event.
function fireEvent(element,event) {
   if (document.createEvent) {
       // dispatch for firefox + others
       var evt = document.createEvent("HTMLEvents");
       evt.initEvent(event, true, true ); // event type,bubbling,cancelable
       return !element.dispatchEvent(evt);
   } else {
       // dispatch for IE
       var evt = document.createEventObject();
       return element.fireEvent('on'+event,evt)
   }
}
function addLeaveButtonListener(leaveBtn){
    leaveBtn.addEventListener('click', function(evt){
        evt.stopPropagation();
        console.log('leave button is clicked!!!!!!!!!!!!!!!!!');
        // Emit event to server with room name.
        var roomName = leaveBtn.name;
        socket.emit('leavechatroom', roomName);
        // Set current chat room to public.
        // currChatRoom = 'public';
        // console.log('SET CURR CHATROOM!!!!!');
        // console.log(currChatRoom);
        fireEvent(document.getElementById('public-chat-room'), 'click');
        // Delete the element from DOM.
        var roomTabId = roomName + '-chat-room';
        var roomBodyId = roomName + '-chat-body';
        document.getElementById(roomTabId).remove();
        document.getElementById(roomBodyId).remove();
    });
}
// Add action listen to tabs.
function addTabEventListener(tabEle){
    tabEle.addEventListener('click', function(evt){
        console.log('ON CLICK!!!!');
        console.log(tabEle);
        // Hide all bodys first.
        var bodys = document.getElementById('rooms-chat-body').children;
        var tabs = document.getElementById('chat-room-tabs').children;
        for(var i=0; i<bodys.length; i++){
            bodys[i].setAttribute('hidden', true);
        }
        for(var i=0; i<tabs.length; i++){
            tabs[i].style.backgroundColor = 'transparent';
        }
        var id = tabEle.id;
        // Add a new ul in chat-body part.
        var idSegs = id.split('-');
        console.log('After split');
        console.log(idSegs);
        var bodyId = idSegs[0] + '-' + idSegs[1] + '-' + 'body';
        console.log(bodyId);
        tabEle.style.backgroundColor = 'lightgray';
        document.getElementById(bodyId).hidden = false;
        currChatRoom = idSegs[0];
        console.log(currChatRoom);
    });
}
$('#chatroom-invite-dialog').dialog({
    autoOpen: false
});
socket.on('chatroominvite', function(msg){
    var msgObj = JSON.parse(msg);
    // Add blinking here!
    $.titleAlert("Incoming chat room invite!", {
        requireBlur:false,
        stopOnFocus:false,
        duration:4000,
        interval:500
    });
    document.getElementById('start-user-name').innerHTML = msgObj.inviter;
    document.getElementById('invite-chatroom-name').innerHTML = msgObj.room;
    $(function() {
        $( "#chatroom-invite-dialog" ).dialog('open');
        $( "#chatroom-invite-dialog" ).dialog('option', 'position', 'center');
    });
});
// Add listener to accept and decline buttons.
document.getElementById('chatroom-invite-accept').addEventListener('click', handleInviteAccept);
document.getElementById('chatroom-invite-decline').addEventListener('click', handleInviteDecline);
function handleInviteAccept(evt){
    // Emit username and room to server. Crate tab for chatroom.
    var roomName = document.getElementById('invite-chatroom-name').innerHTML;
    socket.emit('chatroominviteaccept', roomName);
    var newTabId = roomName + '-chat-room';
    var newTab = '<div class="chat-room-tab" id="' + roomName + '-chat-room">' + roomName + '<input type="button" id="' + roomName + '-leave" class="leave-button" name="' + roomName + '" value="x"></div>';
    document.getElementById('chat-room-tabs').innerHTML += newTab;
    var tabs = document.getElementById('chat-room-tabs').children;
    for(var i=0; i<tabs.length; i++){
        var tabEle = tabs[i];
        addTabEventListener(tabEle);
    }
    var btns = document.getElementsByClassName('leave-button');
    for(var i=0; i<btns.length; i++){
        var btnEle = btns[i];
        addLeaveButtonListener(btnEle);
    }
    // Add nother ul to chat body.
    var newBody = '<ul id="' + roomName + '-chat-body" hidden></ul>'
    document.getElementById('rooms-chat-body').innerHTML += newBody;
    $('#chatroom-invite-dialog').dialog('close');
}
function handleInviteDecline(evt){
    $('#chatroom-invite-dialog').dialog('close');
}

/* Handle history button */
document.getElementById('history-button').addEventListener('click', handleRequestHistory);
function handleRequestHistory(evt){
    var historyBar = document.getElementById('history-bar');
    console.log(historyBar);
    console.log(historyBar.getAttribute('display'));
    // If the history bar is hidden.
    if(historyBar.style.display == 'none'){
        console.log('HERE');
        historyBar.style.display = 'inline-block';
        // Send request for history message.
        // console.log(socket);
        socket.emit('history', currChatRoom);
    }else{
        historyBar.style.display = 'none';
    }
}
socket.on('history', function(msg){
    console.log('history message');
    console.log(msg);
    var historys = JSON.parse(msg);
    console.log(historys);
    var historyList = buildHistoryList(historys);
    //TODO: Use template to display history.
    document.getElementById('history-bar').innerHTML = historyList;
});
function buildHistoryList(historys){
    var list = '<ul>';
    for(var i=0; i<historys.length; i++){
        list += '<li>Username: ' + historys[i].username + '<br>Message: ' + historys[i].message + '<br>Time: ' + historys[i].timestamp + '</li>';
    }
    list += '</ul>';
    return list;
}
document.getElementById('logout-button').addEventListener('click', function(evt){
    window.location.reload();
});
/* Handle file transfer */
// document.getElementById('file_submit').addEventListener('click', function(evt){
//     var selectedFile = document.getElementById('file_input').files[0];
//     console.log(selectedFile);
// });
/* Handle send file. */
// Hide the dialog first.
$('#sendfile-dialog').dialog({
    autoOpen: false
});

document.getElementById('sendfile-button').addEventListener('click', handleSendFile);
function handleSendFile(evt){
    var onlineFriends = getOnlineFriends();
    var list = '';
    for(var i=0; i<onlineFriends.length; i++){
        list += '<li><input class="online-friend-sendfile-checklist" type="checkbox" value="' + onlineFriends[i] + '" name="' + onlineFriends[i] + '">' + onlineFriends[i] + '</li>';
    }
    document.getElementById('sendfile-onlinefriends').innerHTML = list;
    $(function() {
        $( "#sendfile-dialog" ).dialog('open');
        $( "#sendfile-dialog" ).dialog('option', 'position', 'center');
    });
}
document.getElementById('file-cancel-button').addEventListener('click', function(evt){
    $('#sendfile-dialog').dialog('close');
});
document.getElementById('file-submit-button').addEventListener('click', handleFileSubmit, false);
var files;
document.getElementById('files').addEventListener('change', function(evt){
    files = evt.target.files;
}, false);
function handleFileSubmit(evt) {
    // First get list of selected friends.
    var selectedFriends = [];
    var cbs = document.getElementsByClassName('online-friend-sendfile-checklist');
    for(var i=0; i<cbs.length; i++){
        console.log(cbs[i]);
        if(cbs[i].checked){
            selectedFriends.push(cbs[i].value);
        }
    }
    // Loop through the FileList and render image files as thumbnails.
    if(files != null){
        for (var i = 0, f; f = files[i]; i++) {
            console.log('HERE');
            console.log(f.type);
            console.log(f.name);
            var name = f.name;
            var reader = new FileReader();
            // Closure to capture the file information.
            reader.onload = (function(theFile) {
                console.log('ON LOAD');
                return function(e) {
                    // Render thumbnail.
                    var fileData = e.target.result;
                    // // console.log(imgData);
                    // console.log('before download');
                    // downloadURI(imgData, name);
                    // console.log('after download');
                    socket.emit('uploadfile', JSON.stringify({filename: name, file: fileData, selectedFriends: selectedFriends}));
                    $('#sendfile-dialog').dialog('close');
                };
            })(f);
            console.log("READ FIRST");
            reader.readAsDataURL(f);
        }
    }
}
$('#receivefile-dialog').dialog({
    autoOpen: false
});
document.getElementById('download-link').addEventListener('click', function(evt){
    $('#receivefile-dialog').dialog('close');
});
document.getElementById('decline-receive-file').addEventListener('click', function(evt){
    $('#receivefile-dialog').dialog('close');
});
socket.on('uploadfile', function(msg){
    var msgObj = JSON.parse(msg);
    document.getElementById('download-link').innerHTML = msgObj.sender + " has sent a file!";
    var link = document.getElementById('download-link');
    link.download = msgObj.filename;
    link.href = msgObj.file;
    $(function() {
        $( "#receivefile-dialog" ).dialog('open');
        $( "#receivefile-dialog" ).dialog('option', 'position', 'center');
    });
});
