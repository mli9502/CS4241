/*author: Mengwen Li*/
/*The link to my page is https://mli-cs4241-hw4.herokuapp.com/index.html */
var express = require('express');
var path = require('path');
var fs = require('fs');
var sqlite = require('sqlite3');

console.log('import sqlite success');

var app = express();
var port = process.env.PORT || 9000;
var validFlg = true;
/*Defaule using file system as storage.*/
var useFile = false;
function Movie(name, rating, year){
    this.name = name;
    this.rating = rating;
    this.year = year;
}
/*Check whether the name is search target.*/
function isTarget(name, inStr){
    var j = 0;
    for(var i=0; i<name.length; i++){
        if(name.charAt(i) == inStr.charAt(j)){
            j++;
            if(j == inStr.length){
                return true;
            }
        }
    }
    return false;
}
/*Check whether the input is a number.*/
function isNum(value) {
    return /^\d+$/.test(value);
}
/*Write the html file after getting the filter result.*/
function writeHTMLfile(resultArr, response){
    console.log('In write');
    var body = '';
    body += '<!DOCTYPE html><html><head><meta charset="utf-8"><link rel="stylesheet" href="css/return.css"><title></title></head><body><table><tr><th>name</th><th>rate</th><th>year</th></tr>';
    for(var i=0; i<resultArr.length; i++){
        body += '<tr><td>' + resultArr[i].name + '</td>';
        body += '<td>' + resultArr[i].rating + '</td>';
        body += '<td>' + resultArr[i].year + '</td></tr>';
    }
    body += '</table><br><p><a href="/index.html">back</a></p>';
    body += '</body></html>';
    fs.writeFile(path.join(__dirname, '/public/return.html'), body, function(err){
        if(err){
            console.log(err);
        }
        response.sendFile(path.join(__dirname, '/public/return.html'));
    });
}
/*Function used to filter the file.*/
function filterDb(data, query, response){
    var movies;
    if(useFile){
        movies = JSON.parse(data);
    }else{
        movies = data;
    }
    var movieRtnArr = [];
    var yearRtnArr = [];
    var rtnArr = [];
    //First filter by name if name is not null.
    if(query.name != ''){
        for(var i=0; i<Object.keys(movies).length; i++){
            if(isTarget(movies[i].name.toLowerCase(), query.name.toLowerCase())){
                movieRtnArr.push(movies[i]);
            }
        }
    }else{
        for(var i=0; i<Object.keys(movies).length; i++){
            movieRtnArr.push(movies[i]);
        }
    }
    //Filter by year.
    if(query.year != ''){
        var queryYear = parseInt(query.year);
        if(isNum(query.year)){
            for(var i=0; i<movieRtnArr.length; i++){
                if(movieRtnArr[i].year == queryYear){
                    yearRtnArr.push(movieRtnArr[i]);
                }
            }
        }else{
            console.log('Invalid year input!');
            response.sendFile(path.join(__dirname, '/public/invalid.html'));
            validFlg = false;
            return;
        }
    }else{
        for(var i=0; i<movieRtnArr.length; i++){
            yearRtnArr.push(movieRtnArr[i]);
        }
    }
    // Filter by rating.
    // console.log('Before checking rating!');
    // console.log(query.rating);
    if(query.rating != ''){
        //console.log('Filter by rating!');
        var queryRating = parseInt(query.rating);
        //console.log(queryRating);
        if(isNum(query.rating)){
            // console.log('In is number');
            for(var i=0; i<yearRtnArr.length; i++){
                if(yearRtnArr[i].rating == queryRating){
                    rtnArr.push(yearRtnArr[i]);
                }
            }
        }else{
            // console.log('In else!');
            response.sendFile(path.join(__dirname, '/public/invalid.html'));
            validFlg = false;
            return;
        }
    }else{
        for(var i=0; i<yearRtnArr.length; i++){
            rtnArr.push(yearRtnArr[i]);
        }
    }
    validFlg = true;
    return rtnArr;
}
/*Initialize movie database here.*/
var db = new sqlite.Database('moviedb.sqlite');
db.serialize(function(){
    db.run("CREATE TABLE IF NOT EXISTS movie (name TEXT, rating INTEGER, year INTEGER)");
    // db.run("INSERT INTO movie (name, rating, year) VALUES ('DBtest', 5, 1995)");
    // db.each("SELECT * FROM movie", function(err, row){
    //     console.log(row.name + row.rating + row.year);
    // });
});

app.use(express.static(path.join(__dirname, '/public')));
/*On receiving nothing, return index.html*/
app.get('/', function(request, response){
    response.sendFile(path.join(__dirname, '/public/index.html'));
});
/*On receiving /index with query, filter the .json file and return result html page.*/
app.get('/index', function(request, response){
    var query = request.query;
    //console.log(query);
    //Read local json file.
    //If useFile, use txt file, else, use database.
    if(useFile){
        fs.readFile('database.txt', 'utf8', function(err, data){
            if(err){
                console.log(err);
            }else{
                var rtnArr = filterDb(data, query, response);
                //Write the generated html file as response.
                if(validFlg){
                    writeHTMLfile(rtnArr, response);
                }
            }
        });
    }else{
        var movies = [];
        db.each("SELECT * FROM movie", function(err, row){
            console.log(row.name + row.rating + row.year);
            movies.push(new Movie(row.name, row.rating, row.year));
            console.log(movies);
        }, function(){
            console.log(movies);
            var rtnArr = filterDb(movies, query, response);
            //Write the generated html file as response.
            if(validFlg){
                writeHTMLfile(rtnArr, response);
            }
        });
    }

});
/*On receiving /file-select, select the storage media used.*/
app.get('/file-select', function(request, response){
    var query = request.query;
    console.log(query);
    if(query.storage == 'database'){
        useFile = false;
    }else{
        useFile = true;
    }
    response.sendFile(path.join(__dirname, '/public/index.html'));
    console.log(useFile);
});
/*Function to convert a string to movie object.*/
function convertToMovie(query){
    var movie;
    var vals = [];
    var attrs = query.split("&");
    for(var i=0; i<attrs.length; i++){
        console.log("HERE");
        console.log(attrs[i].split("=")[1]);
        vals.push(attrs[i].split("=")[1]);
    }
    var tempVal = '';
    for(var i=0; i<vals[0].length; i++){
        if(vals[0].charAt(i) == '+'){
            tempVal += ' ';
        }else{
            tempVal += vals[0].charAt(i);
        }
    }
    movie = new Movie(tempVal, vals[1], vals[2]);
    return movie;
}
/*On receiving /add-movie, write the user inputted movie to .json file.*/
app.post('/add-movie', function(request, response){
    var query = '';
    request.on('data', function(data){
        console.log("ON DATA");
        console.log(data);
        query += data;
        console.log(query);
    });
    request.on('end', function(){
        console.log(query);
        query = convertToMovie(query);
        if(query.name == '' || query.rating == '' || query.year == ''){
            response.sendFile(path.join(__dirname, '/public/invalid.html'));
        }else{
            var rating = parseInt(query.rating);
            var year = parseInt(query.year);
            if(!isNum(query.rating) || !isNum(query.year) || year == 0 || rating == 0){
                response.sendFile(path.join(__dirname, '/public/invalid.html'));
                return;
            }else{
                if(useFile){
                    var body = '';
                    fs.readFile('database.txt', 'utf8', function(err, data){
                        if(err){
                            console.log(err);
                        }else{
                            // console.log(data);
                            var movies = JSON.parse(data);
                            // console.log('After movies');
                            movies.push(JSON.parse(JSON.stringify(query)));
                            movies[movies.length - 1].rating = rating;
                            movies[movies.length - 1].year = year;
                            fs.writeFile('database.txt', JSON.stringify(movies), 'utf8', function(err){
                                if(err){
                                    console.log(err);
                                }
                                response.sendFile(path.join(__dirname, '/public/index.html'))
                            });
                        }
                    });
                }else{
                    var stmt = "INSERT INTO movie (name, rating, year) VALUES ('" + query.name + "', " + query.rating + ", " + query.year + ")";
                    response.sendFile(path.join(__dirname, '/public/index.html'));
                    db.run(stmt);
                }
            }
        }
    });
    // console.log(query);
});
/*On receiving /del-movie, delete the user specified movie from .json file.*/
app.post('/del-movie', function(request, response){
    var query = '';
    request.on('data', function(data){
        query += data;
    });
    request.on('end', function(){
        query = convertToMovie(query);
        // console.log(query);
        //Read local json file.
        if(useFile){
            fs.readFile('database.txt', 'utf8', function(err, data){
                if(err){
                    console.log(err);
                }else{
                    var rtnArr = filterDb(data, query, response);
                    if(query.name == '' && query.rating == '' && query.year == ''){
                        rtnArr = [];
                    }
                    //Write the generated html file as response.
                    if(validFlg){
                        fs.readFile('database.txt', 'utf8', function(err, data){
                            if(err){
                                console.log(err);
                            }else{
                                var movies = JSON.parse(data);
                                var remMovies = [];
                                for(var i=0; i<movies.length; i++){
                                    for(var j=0; j<rtnArr.length; j++){
                                        if(movies[i].name == rtnArr[j].name &&
                                            movies[i].rating == rtnArr[j].rating &&
                                            movies[i].year == rtnArr[j].year){
                                            break;
                                        }
                                    }
                                    if(j == rtnArr.length){
                                        remMovies.push(movies[i]);
                                    }
                                }
                                fs.writeFile('database.txt', JSON.stringify(remMovies), 'utf8', function(err){
                                    if(err){
                                        console.log(err);
                                    }
                                    response.sendFile(path.join(__dirname, '/public/index.html'));
                                });
                            }
                        });
                    }
                }
            });
        }else{
            var movies = [];
            db.each("SELECT * FROM movie", function(err, row){
                console.log(row.name + row.rating + row.year);
                movies.push(new Movie(row.name, row.rating, row.year));
                console.log(movies);
            }, function(){
                console.log(movies);
                console.log('Check here!');
                console.log(query);
                var rtnArr = filterDb(movies, query, response);
                console.log(rtnArr);
                /*If all the inputs are valid.*/
                if(validFlg){
                    for(var i=0; i<rtnArr.length; i++){
                        var stmt = "DELETE FROM movie WHERE name = '" + rtnArr[i].name + "'";
                        db.run(stmt);
                    }
                    response.sendFile(path.join(__dirname, '/public/index.html'));
                }
            });
        }
    });
});
/*On receiving /list-movie, list all the movies currently in the file.*/
app.get('/list-movie', function(request, response){
    if(useFile){
        fs.readFile('database.txt', 'utf8', function(err, data){
            if(err){
                console.log(err);
                return;
            }else{
                var movies = JSON.parse(data);
                writeHTMLfile(movies, response);
            }
        });
    }else{
        var movies = [];
        db.each("SELECT * FROM movie", function(err, row){
            console.log(row.name + row.rating + row.year);
            movies.push(new Movie(row.name, row.rating, row.year));
            console.log(movies);
        }, function(){
            writeHTMLfile(movies, response);
        });
    }
});
app.listen(port, function(){
    console.log('App is listening on port ' + port);
});
