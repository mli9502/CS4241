/* Author: Mengwen Li (mli2) */
var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();
var port = process.env.PORT || 9000;
var posts = [];
app.use(express.static(path.join(__dirname, '/public')));
app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, '/public/index.html'));
});
app.get('/index.html', function(req, res){
    res.sendFile(path.join(__dirname, '/public/index.html'));
});
app.get('/post', function(req, res){
    res.send(JSON.stringify(posts));
});

app.post('/upload', function(req, res){
    var recData = '';
    req.on('data', function(data){
        recData += data;
    });
    req.on('end', function(){
        var dataObj = JSON.parse(recData);
        console.log(dataObj);
        posts.push(dataObj);
        console.log(posts);
        res.send(JSON.stringify(posts));
    });
});
app.listen(port, function(){
    console.log('App is listening on port ' + port);
});
