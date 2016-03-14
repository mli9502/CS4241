/* Author: Mengwen Li (mli2) */
var tempPost = _.template(
  "<div class='post'>" +
    "<p><span>User Id:&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</span> <%= userId %></p>" +
    "<p><span>Time Stamp:</span> <%= time %></p>" +
    "<p><span>Post Content:</span> <%= post %></p>" +
    // "<input type='button' class='delete-post' value='delete'>" +
  "</div>"
);

if(localStorage && localStorage.getItem('posts')){
    alert('Read from local storage!');
    console.log(localStorage.getItem('posts'));
    console.log(JSON.parse(localStorage.getItem('posts')));
    buildList(JSON.parse(localStorage.getItem('posts')));
}else{
    getJSON('/post');
}


function getJSON(url){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if(xhr.readyState != XMLHttpRequest.DONE){
            return;
        }
        if(xhr.status == 200){
            buildList(JSON.parse(xhr.responseText));
            console.log(xhr.responseText);
            localStorage.setItem('posts', xhr.responseText);
        }
    };
    xhr.open('GET', url);
    xhr.send();
}
// postObj contains content, uid,
function buildList(postObjs){
    var str = '';
    for(var i=0; i<postObjs.length; i++){
        console.log(postObjs[i]);
        str += tempPost(postObjs[i]);
    }
    document.getElementById('posts').innerHTML = str;
}
function makeId()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i<15; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}
function getFormattedDate() {
    var date = new Date();

    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();

    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;
    sec = (sec < 10 ? "0" : "") + sec;

    var str = date.getFullYear() + "-" + month + "-" + day + " " +  hour + ":" + min + ":" + sec;
    return str;
}
document.getElementById('submit-post').addEventListener('click', handleSubmitPost);
function handleSubmitPost(evt){
    console.log('In handle submit post');
    // Get local storage.
    // If no cookie exists.
    if(document.cookie.length == 0){
        // Set cookie if no cookie already exists.
        var id = makeId();
        console.log(id);
        var str = 'userId = ' + id;
        console.log(str);
        document.cookie = 'userId = ' + id;
    }
    console.log(document.cookie);
    var userId = getCookie('userId');
    console.log(userId);
    var cookieStr = JSON.stringify(document.cookie);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload', true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(JSON.stringify({userId: userId, post: document.getElementById('post-input').value, time: JSON.stringify(getFormattedDate())}));
    document.getElementById('posts').innerHTML += tempPost({userId: userId, post: document.getElementById('post-input').value, time: JSON.stringify(getFormattedDate())});
    xhr.onreadystatechange = function(){
        if(xhr.readyState != XMLHttpRequest.DONE){
            return;
        }
        if(xhr.status == 200){
            localStorage.setItem('posts', xhr.responseText);
        }
    };
}
