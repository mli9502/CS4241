/*author: Mengwen Li*/
/*The link to my page is https://mli-cs4241-hw7.herokuapp.com/index.html */
var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();
var port = process.env.PORT || 9000;
var validFlg = true;
/*Check whether the name is search target.*/
function isTarget(name, inStr){
    var j = 0;
    for(var i=0; i<name.length; i++){
        //console.log("IN ISTARGET!!!!!!!!!!!!!!");
        //console.log(name.charAt(i), inStr.charAt(j));
        if(name.charAt(i) == inStr.charAt(j)){
            j++;
            if(j == inStr.length){
                //console.log("RETURN TRUE");
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

function isDup(movie, movies){
    for(var i=0; i<movies.length; i++){
        if(movies[i].name == movie.name &&
            movies[i].rating == movie.rating &&
            movies[i].year == movie.year){
                return true;
        }
    }
    return false;
}

/*Function used to filter the file.*/
function filterDb(data, query, response){
    var movies = JSON.parse(data);
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
            //response.sendFile(path.join(__dirname, '/public/invalid.html'));
            validFlg = false;
            return rtnArr;
        }
    }else{
        for(var i=0; i<movieRtnArr.length; i++){
            yearRtnArr.push(movieRtnArr[i]);
        }
    }
    console.log(query.rating);
    //Filter by rating.
    if(query.rating != ''){
        //console.log('Filter by rating!');
        var queryRating = parseInt(query.rating);
        //console.log(queryRating);
        if(isNum(query.rating)){
            for(var i=0; i<yearRtnArr.length; i++){
                if(yearRtnArr[i].rating == queryRating){
                    rtnArr.push(yearRtnArr[i]);
                }
            }
        }else{
            //response.sendFile(path.join(__dirname, '/public/invalid.html'));
            validFlg = false;
            return rtnArr;
        }
    }else{
        for(var i=0; i<yearRtnArr.length; i++){
            rtnArr.push(yearRtnArr[i]);
        }
    }
    validFlg = true;
    return rtnArr;
}

app.use(express.static(path.join(__dirname, '/public')));
/*On receiving nothing, return index.html*/
app.get('/', function(request, response){
    response.sendFile(path.join(__dirname, '/public/index.html'));
});
/*On receiving /index with query, filter the .json file and return result html page.*/
app.get('/index', function(request, response){
    var query = request.query;
    //Read local json file.
    fs.readFile('database.json', 'utf8', function(err, data){
        if(err){
            console.log(err);
        }else{
            var rtnArr = filterDb(data, query, response);
            //Write the generated html file as response.
            if(validFlg){
                //writeHTMLfile(rtnArr, response);
                response.send(JSON.stringify(rtnArr));
            }
        }
    });
});
app.post('/add-movie', function(request, response){
    var recData = '';
    request.on('data', function(data){
        recData += data;
    });
    request.on('end', function(){
        var movie = JSON.parse(recData);
        fs.readFile('database.json', 'utf8', function(err, data){
            if(err){
                console.log(err);
            }else{
                var movies;
                if(data == ''){
                    movies = [];
                }else{
                    movies = JSON.parse(data);
                }
                if(isDup(movie, movies)){
                    response.send("duplicate");
                    return;
                }
                movies.push(movie);
                fs.writeFile('database.json', JSON.stringify(movies), 'utf8', function(err){
                    if(err){
                        console.log(err);
                    }
                    response.send(JSON.stringify(movies));
                });
            }
        });
    });
});

app.post('/del-movie-cb', function(request, response){
    var recData = '';
    request.on('data', function(data){
        recData += data;
    });
    request.on('end', function(){
        var delMovies = JSON.parse(recData);
        fs.readFile('database.json', 'utf8', function(err, data){
            if(err){
                console.log(err);
            }else{
                var rtnMovies = [];
                var movies = JSON.parse(data);
                for(var i=0; i<movies.length; i++){
                    for(var j=0; j<delMovies.length; j++){
                        if(movies[i].name == delMovies[j].name &&
                            movies[i].rating == delMovies[j].rating &&
                            movies[i].year == delMovies[j].year){
                            break;
                        }
                    }
                    if(j == delMovies.length){
                        rtnMovies.push(movies[i]);
                    }
                }
                fs.writeFile('database.json', JSON.stringify(rtnMovies), 'utf8', function(err){
                    if(err){
                        console.log(err);
                    }
                    response.send(JSON.stringify(rtnMovies));
                });
            }
        });
    });
});

app.post('/del-movie', function(request, response){
    var recData = '';
    request.on('data', function(data){
        recData += data;
    });
    request.on('end', function(){
        var movie = JSON.parse(recData);
        fs.readFile('database.json', 'utf8', function(err, data){
            if(err){
                console.log(err);
            }else{
                var rtnArr = filterDb(data, movie, response);
                if(movie.name == '' && movie.rating == '' && movie.year == ''){
                    rtnArr = [];
                }
                //Write the generated html file as response.
                if(validFlg){
                    fs.readFile('database.json', 'utf8', function(err, data){
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
                            fs.writeFile('database.json', JSON.stringify(remMovies), 'utf8', function(err){
                                if(err){
                                    console.log(err);
                                }
                                response.send(JSON.stringify(remMovies));
                            });
                        }
                    });
                }
            }
        });
    })
});

/*On receiving /list-movie, list all the movies currently in the file.*/
app.get('/list-movie', function(request, response){
    fs.readFile('database.json', 'utf8', function(err, data){
        if(err){
            console.log(err);
            return;
        }else{
            var movies = JSON.parse(data);
            response.send(JSON.stringify(movies));
        }
    });
});
app.listen(port, function(){
    console.log('App is listening on port ' + port);
});
