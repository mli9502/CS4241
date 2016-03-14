var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var sqlite = require('sqlite3');
var fs = require('fs');
var port = process.env.PORT || 9000;
// Create user database.
var userDb = new sqlite.Database('userdb.sqlite');
// An array keeps track of logged in users.
var loggedInUsers = [];
// Server maintains a list of rooms.
var rooms = [];
// Create history file for public chat room.


var User = function(email, username, pwd, socketId){
    this.email = email;
    this.username = username;
    this.pwd = pwd;
    this.socketId = socketId;
    // A list that stores this user's friend.
    this.friends = [];
    this.pendingRequest = [];
    this.setFriends = function(friendsStr){
        console.log('friend string!');
        console.log(friendsStr);
        if(friendsStr == ''){
            this.friends = [];
        }else{
            this.friends = JSON.parse(friendsStr);
        }
    }
    this.setPendingRequest = function(requestStr){
        if(requestStr == ''){
            this.pendingRequest = [];
        }else{
            this.pendingRequest = JSON.parse(requestStr);
        }
    }
}

function callBack(users){
    console.log(users);
}
// Test this funciton first!
function getAllUsers(callBack){
    var users = [];
    userDb.each("SELECT * FROM users", function(err, user){
        var tmp = new User(user.email, user.username, user.pwd);
        tmp.setFriends(user.friends);
        users.push(tmp);
    }, function(){
        callBack(users);
    });
}

// Check wheter the name and email is already used.
function isNameEmailUsed(user, socket){
    // userDb.each("SELECT * FROM users WHERE username = ?", (user.username), function(err, user){
    console.log('Before insert!');
    console.log(user);
    userDb.run("INSERT INTO users (email, username, pwd, friends, pendingRequest) VALUES (?, ?, ?, ?, ?)", [user.email, user.username, user.pwd, JSON.stringify(user.friends), JSON.stringify(user.pendingRequest)], function(err){
        if(err){
            console.log(err);
            console.log('illegal');
            socket.emit('register', 'illegal');
            return;
        }else{
            console.log('legal');
            socket.emit('register', 'legal');
            return;
        }
    });
}

userDb.serialize(function(){
    // TODO: remove drop table when finish.
    userDb.run("DROP TABLE IF EXISTS users");
    userDb.run("CREATE TABLE IF NOT EXISTS users (email TEXT UNIQUE, username TEXT UNIQUE, pwd TEXT, friends TEXT, pendingRequest TEXT)");
    var tempFriendsT = ['t'];
    var tempFriendsE = ['e'];
    userDb.run("INSERT INTO users (email, username, pwd, friends, pendingRequest) VALUES ('t', 't', 't', ?, ?)", [JSON.stringify([]), JSON.stringify([])]);
    userDb.run("INSERT INTO users (email, username, pwd, friends, pendingRequest) VALUES ('e', 'e', 'e', ?, ?)", [JSON.stringify([]), JSON.stringify([])]);
    userDb.run("INSERT INTO users (email, username, pwd, friends, pendingRequest) VALUES ('s', 's', 's', ?, ?)", [JSON.stringify([]), JSON.stringify([])]);
});

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', function(req, res){
    console.log(__dirname);
    res.sendfile('index.html');
});

// Construct user from user information got from database.
function constructUser(dbUser, socket){
    var user = new User(dbUser.email, dbUser.username, dbUser.pwd, socket.id);
    user.setFriends(dbUser.friends);
    user.setPendingRequest(dbUser.pendingRequest);
    return user;
}

function handleLogin(msg, socket){
    console.log('handleLogin is called');
    console.log(msg);
    var obj = JSON.parse(msg);
    var user = new User(obj.email, obj.username, obj.pwd, socket.id);
    console.log(user);
    // Users on record.
    var recordUsers = [];
    userDb.each("SELECT * FROM users WHERE username = ?", (user.username), function(err, dbUser){
        // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!");
        // console.log(dbUser);
        var recordUser = constructUser(dbUser, socket);
        console.log(recordUser);
        recordUsers.push(recordUser);
    }, function(){
        console.log('recordUsers');
        console.log(recordUsers);
        if(recordUsers.length == 0){
            // user not found in database.
            socket.emit('login', 'notfound');
            return;
        }else if(recordUsers[0].pwd != user.pwd){
            // password is not correct.
            socket.emit('login', 'password');
            return;
        }else{
            // User is already logged in.
            for(var i=0; i<loggedInUsers.length; i++){
                if(recordUsers[0].username == loggedInUsers[i].username){
                    socket.emit('login', 'alreadyloggedin');
                    return;
                }
            }
            socket.username = recordUsers[0].username;
            // Add newly logged in user to public room.
            // socket.room = 'public';
            socket.room = 'public';
            socket.join('public');
            io.to(socket.id).emit('login', JSON.stringify(recordUsers[0]));
            // If it has pending request, clear the pending request.
            if(recordUsers[0].pendingRequest.length != 0){
                console.log('Clear pending request!');
                var updateQuery = 'UPDATE users SET pendingRequest = \'' + JSON.stringify([]) + '\' WHERE username = \'' + recordUsers[0].username + '\'';
                userDb.run(updateQuery);
            }
            // Set username of the socket to the username.
            // Automatically join this socket to public.
            // Use socket.leave('public') to leave a room.
            console.log(socket.username);
            loggedInUsers.push(recordUsers[0]);
            console.log('Currently logged in users');
            console.log(loggedInUsers);
            // Send a list of names for logged in users to all the client.
            var loggedInNames = [];
            for(var i=0; i<loggedInUsers.length; i++){
                loggedInNames.push(loggedInUsers[i].username);
            }
            //io.sockets.in('public').emit('userlogin', JSON.stringify(loggedInNames));
            // socket.emit('userlogin', JSON.stringify(loggedInNames), 'test');
            // Emit user login information to public chat room.
            io.sockets.in('public').emit('userlogin', JSON.stringify(loggedInNames));
        }
    });
}

io.sockets.on('connection', function(socket){
    console.log('connect');
    socket.on('chat message', function(msg){
      console.log(msg);
      io.emit('chat message', msg);
    });
    // TODO: Send friend back on login.
    socket.on('login', function(msg){
        handleLogin(msg, socket);
    });
    // TODO: modify this latter!!
    socket.on('register', function(msg){
        console.log(msg);
        var obj = JSON.parse(msg);
        var user = new User(obj.email, obj.username, obj.pwd, socket.id);
        isNameEmailUsed(user, socket);
    });
    socket.on('addfriendusername', function(msg){
        console.log('IN ADD FRIEND USER NAME!!!!!!');
        console.log(socket.username);
        console.log(msg);
        //Search in database for this username.
        // TODO: Change this to real time.
        var recordUsers = [];
        // Check for the targeted user.
        userDb.each("SELECT * FROM users WHERE username = ?", msg, function(err, dbUser){
            console.log(dbUser);
            var recordUser = constructUser(dbUser, socket);
            recordUsers.push(recordUser);
        }, function(){
            if(recordUsers.length == 0){
                console.log('User name not found!');
                io.to(socket.id).emit('addfriendusername', 'usernotfound');
                return;
            }else if(msg == socket.username){
                console.log("Can not add yourself as friend!");
                io.to(socket.id).emit('addfriendusername', 'addself');
                return;
            }else{
                // Check wheter alreay friends.
                console.log('Check for duplicate!!!!!!!!!!!!!!');
                var recordFriends = recordUsers[0].friends;
                console.log(recordFriends);
                for(var i=0; i<recordFriends.length; i++){
                    console.log(msg);
                    if(socket.username == recordFriends[i]){
                        console.log('Already friends!');
                        io.to(socket.id).emit('addfriendusername', 'alreadyfriend');
                        return;
                    }
                }
                // Check whether the user is online right now.
                var targetSockid = getSocketId(msg);
                // If the user is not currently online, store the pending request to database.
                if(targetSockid == ''){
                    console.log('USER IS NOT ONLINE RIGHT NOW********************************');
                    console.log(recordUsers[0].pendingRequest);
                    recordUsers[0].pendingRequest.push(socket.username);
                    var updateQuery = 'UPDATE users SET pendingRequest = \'' + JSON.stringify(recordUsers[0].pendingRequest) + '\' WHERE username = \'' + msg + '\'';
                    console.log(updateQuery);
                    userDb.serialize(function(){
                        userDb.run(updateQuery);
                        // Logging purpose.
                        userDb.each("SELECT * FROM users", function(err, user){
                            console.log(user);
                        });
                    });
                }else{
                    // If the user is found online.
                    io.to(targetSockid).emit('addfriendusername', socket.username);
                }
            }
        });
    });
    // Get the socket id for the given username. If the user is not logged in, '' is returned.
    function getSocketId(username){
        var rtnId = '';
        for(var i=0; i<loggedInUsers.length; i++){
            if(loggedInUsers[i].username == username){
                rtnId = loggedInUsers[i].socketId;
            }
        }
        return rtnId;
    }
    // Update friends for both users in database and send the newly updated friend list back to client.
    function updateFriendsDb(friends){
        // Get the socket id for both user.
        var sockId0 = '';
        var sockId1 = '';
        sockId0 = getSocketId(friends[0]);
        sockId1 = getSocketId(friends[1]);
        // First get the two users.
        userDb.serialize(function(){
            userDb.each("SELECT * FROM users WHERE username = ?", friends[0], function(err, user){
                console.log(user.friends);
                var dbFriends = JSON.parse(user.friends);
                dbFriends.push(friends[1]);
                var updateQuery = 'UPDATE users SET friends = \'' + JSON.stringify(dbFriends) + '\' WHERE username = \'' + friends[0] + '\'';
                userDb.serialize(function(){
                    userDb.run(updateQuery);
                    // Update friend list!
                    console.log(friends[0]);
                    userDb.each("SELECT * FROM users WHERE username = ?", friends[0], function(err, user){
                        console.log(user);
                        console.log('CHECK JSON.PARSE HERE!');
                        var friends = JSON.parse(user.friends);
                        console.log(friends);
                        // If the user is online, send friends back.
                        if(sockId0 != ''){
                            console.log('CHECK UPDATE FRIEND LIST!!!!!!!!!!!!');
                            console.log(friends);
                            io.to(sockId0).emit('updatefriendlist', JSON.stringify(friends));
                        }
                    });
                });
            });
            userDb.each("SELECT * FROM users WHERE username = ?", friends[1], function(err, user){
                console.log(user.friends);
                var dbFriends = JSON.parse(user.friends);
                dbFriends.push(friends[0]);
                var updateQuery = 'UPDATE users SET friends = \'' + JSON.stringify(dbFriends) + '\' WHERE username = \'' + friends[1] + '\'';
                userDb.serialize(function(){
                    userDb.run(updateQuery);
                    // Update friend list!
                    console.log(friends[1]);
                    userDb.each("SELECT * FROM users WHERE username = ?", friends[1], function(err, user){
                        console.log(user);
                        console.log('CHECK JSON.PARSE HERE!');
                        var friends = JSON.parse(user.friends);
                        console.log(friends);
                        // If the user is online, send friends back.
                        if(sockId0 != ''){
                            console.log('CHECK UPDATE FRIEND LIST!!!!!!!!!!!!');
                            console.log(friends);
                            io.to(sockId1).emit('updatefriendlist', JSON.stringify(friends));
                        }
                    });
                });
            });
        });
    }
    socket.on('friendrequestaccept', function(msg){
        var friends = JSON.parse(msg);
        updateFriendsDb(friends);
    });
    socket.on('chatmsg', function(msg){
        var msgObj = JSON.parse(msg);
        console.log(msgObj);
        socket.broadcast.to(msgObj.room).emit('chatmsg', JSON.stringify({username: socket.username, chatmsg: msg}));
        // Create database file for this room if not existed.
        userDb.serialize(function(){
            userDb.run("CREATE TABLE IF NOT EXISTS " + msgObj.room + " (username TEXT, message TEXT, timestamp TEXT)");
            userDb.run("INSERT INTO " + msgObj.room + " (username, message, timestamp) VALUES (?, ?, ?)", [socket.username, msgObj.msg, JSON.stringify(new Date())]);
            // userDb.each("SELECT * FROM " + socket.room, function(err, history){
            //     console.log(history);
            // });
        });
    });
    socket.on('addchatroom', function(msg){
        console.log('ON ADD CHAT ROOM!!!');
        console.log(msg);
        var msgObj = JSON.parse(msg);
        // First check duplicat room.
        var i;
        for(i=0; i<rooms.length; i++){
            if(msgObj.room == rooms[i]){
                io.to(socket.id).emit('addchatroom', 'foundduplicatroom');
                break;
            }
        }
        if(i == rooms.length){
            io.to(socket.id).emit('addchatroom', 'success');
            socket.join(msgObj.room);
            // Emit event to selected friends about chatroom.
            for(var i=0; i<msgObj.selectedFriends.length; i++){
                var tarId = getSocketId(msgObj.selectedFriends[i]);
                if(tarId != ''){
                    io.to(tarId).emit('chatroominvite', JSON.stringify({inviter: socket.username, room: msgObj.room}));
                }
            }
            // Add chatroom name to list.
            rooms.push(msgObj.room);
        }
    });
    socket.on('chatroominviteaccept', function(msg){
        console.log(msg);
        socket.join(msg);
    });
    socket.on('leavechatroom', function(msg){
        console.log(msg);
        socket.leave(msg);
        // Check how many user still in chatroom.
        var room = io.sockets.adapter.rooms[msg];
        console.log(room);
        if(!room){
            // Find the msg from list and remove it.
            var newRooms = [];
            for(var i=0; i<rooms.length; i++){
                if(rooms[i] != msg){
                    newRooms.push(rooms[i]);
                }
            }
            rooms = newRooms;
        }
        // var userCnt = Object.keys(room).length;
        // console.log('CNT HERE!!!!!');
        // console.log(userCnt);
    });

    socket.on('history', function(msg){
        // Find the socket with user name.
        var historys = [];
        userDb.each("SELECT * FROM " + msg, function(err, history){
            historys.push(history);
            console.log(history);
        }, function(){
            io.to(socket.id).emit('history', JSON.stringify(historys));
        });
    });
    socket.on('uploadfile', function(msg){
        var msgObj = JSON.parse(msg);
        // Emit event to selected friends about chatroom.
        for(var i=0; i<msgObj.selectedFriends.length; i++){
            var tarId = getSocketId(msgObj.selectedFriends[i]);
            if(tarId != ''){
                io.to(tarId).emit('uploadfile', JSON.stringify({sender: socket.username, filename: msgObj.filename, file: msgObj.file}));
            }
        }
    });
    socket.on('disconnect', function(){
        console.log(socket.id);
        console.log('disconnect');
        var temp = [];
        // Find the logged out user and remove it from list.
        for(var i=0; i<loggedInUsers.length; i++){
            if(socket.username == loggedInUsers[i].username){
                console.log('Find logged out user!!!!!');
            }else{
                temp.push(loggedInUsers[i]);
            }
        }
        loggedInUsers = temp;
        console.log("CHECK HERE^^^^^^^^^^^^^^^^^^^^^^");
        console.log(loggedInUsers);
        // Send this list back to client.
        var loggedInNames = [];
        for(var i=0; i<loggedInUsers.length; i++){
            loggedInNames.push(loggedInUsers[i].username);
        }
        io.sockets.in('public').emit('userlogin', JSON.stringify(loggedInNames));
    });
});
http.listen(port, function(){
  console.log('listening on *:' + port);
});
