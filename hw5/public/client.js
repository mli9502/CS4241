/*
Author: Mengwen Li (mli2)
*/
var origHref = window.location.href;
//Implement checkbox before entries. Can use check box to delete.
function Movie(name, rating, year){
    this.name = name;
    this.rating = rating;
    this.year = year;
}

function isNum(value) {
    return /^\d+$/.test(value);
}

String.prototype.replaceAll = function(search, replace)
{
    //if replace is not sent, return original string otherwise it will
    //replace search string with 'undefined'.
    if (replace === undefined) {
        return this.toString();
    }
    return this.replace(new RegExp('[' + search + ']', 'g'), replace);
};

var xhr = new XMLHttpRequest();
var isFilter = false;
init();
window.onload = function(){
    document.getElementById("filter_name").onkeyup = function(evt){
        evt = evt || window.event;
        var charCode = evt.keyCode || evt.which;
        console.log();
        if(!(document.getElementById("filter_name").value == ''
            && document.getElementById("filter_rate").value == ''
            && document.getElementById("filter_year").value == '')){
            filter();
        }else{
            document.getElementById("filter_list").innerHTML = '';
        }
        //document.getElementById("filter_list").innerHTML = document.getElementById("filter_name").value;
    };
    document.getElementById("filter_rate").onkeyup = function(evt){
        evt = evt || window.event;
        var charCode = evt.keyCode || evt.which;
        if(!(document.getElementById("filter_name").value == ''
            && document.getElementById("filter_rate").value == ''
            && document.getElementById("filter_year").value == '')){
            filter();
        }else{
            document.getElementById("filter_list").innerHTML = '';
        }
        //document.getElementById("filter_list").innerHTML = document.getElementById("filter_name").value;
    };
    document.getElementById("filter_year").onkeyup = function(evt){
        evt = evt || window.event;
        var charCode = evt.keyCode || evt.which;
        if(!(document.getElementById("filter_name").value == ''
            && document.getElementById("filter_rate").value == ''
            && document.getElementById("filter_year").value == '')){
            filter();
        }else{
            document.getElementById("filter_list").innerHTML = '';
        }
        //document.getElementById("filter_list").innerHTML = document.getElementById("filter_name").value;
    };
}

xhr.onreadystatechange = function(){
    if(xhr.readyState == xhr.DONE){
        console.log(xhr.responseText);
        if(xhr.responseText == "duplicate"){
            alert("Found duplicate movie!");
            return;
        }
        var movies = JSON.parse(xhr.responseText);
        console.log(movies);
        var filtList = "";
        filtList += '<ul>';
        //filtList = "<ul>";
        movies.forEach(function(movie){
            filtList += "<li>" + '<div class="filter_entry">' + genDispStr(movie) + "<br></div>" + "</li>";
        });
        filtList += '</ul>';
        //filtList += "</ul>"
        console.log(filtList);
        if(isFilter){
            document.getElementById("filter_list").innerHTML = filtList;
        }else{
            var dispList = "";
            //dispList += "<ul>";
            dispList += '<ul>';
            movies.forEach(function(movie){
                //dispList += '<li><input type="checkbox" name="ckbox" value="' + JSON.stringify(movie) + '"/></li>';
                //dispList += '<li><input type="checkbox" name="ckbox" value="' + JSON.stringify(movie).replaceAll('"', "'") + '"/>' + JSON.stringify(movie) + '</li>';
                dispList += '<li>'
                dispList += '<input type="checkbox" name="ckbox" value="' + JSON.stringify(movie).replaceAll('"', "'") + '"/>' + genDispStr(movie) /*+ '<br>'*/;
                dispList += '</li>'
            });
            dispList += '</ul>';
            //dispList += "</ul>";
            document.getElementById("display_list").innerHTML = dispList;
            document.getElementById("filter_list").innerHTML = "";
        }
    }
}

function init(){
    isFilter = false;
    xhr.open("GET", "/list-movie", true);
    xhr.send();
    //location.hash = "list"
}
/*Fix the filter input invalid bug!!!!!*/
function filter(){
    console.log("Filter button is clicked.");
    var name = document.getElementById("filter_name").value;
    var rating = document.getElementById("filter_rate").value;
    var year = document.getElementById("filter_year").value;
    if((!isNum(rating) && rating != '') || (!isNum(year) && year != '') || (name == '' && rating == '' && year == '')){
        alert("Input is invalid!");
        document.getElementById("filter_name").value = '';
        document.getElementById("filter_rate").value = '';
        document.getElementById("filter_year").value = '';
        return;
    }
    var m = new Movie(name, rating, year);
    var query = '';
    query += "/index?name=" + name + "&rating=" + rating + "&year=" + year;
    isFilter = true;
    xhr.open("GET", query, true);
    xhr.send();
    //location.hash = query;

    // location.search = "name=" + name + "&rating=" + rating + "&year=" + year;
    // location.pathname += 'index';
    history.pushState({}, null, origHref + "index?name=" + name + "&rating=" + rating + "&year=" + year);
}

function add(){
    console.log("Add button is clicked.");
    var name = document.getElementById("add_name").value;
    var rating = document.getElementById("add_rate").value;
    var year = document.getElementById("add_year").value;
    if(name == '' || !isNum(rating) || !isNum(year)){
        alert("Input is invalid!");
        document.getElementById("add_name").value = '';
        document.getElementById("add_rate").value = '';
        document.getElementById("add_year").value = '';
        return;
    }
    var m = new Movie(name, rating, year);
    console.log(JSON.stringify(m));
    isFilter = false;
    xhr.open("POST", "/add-movie", true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(JSON.stringify(m));
    //location.hash = 'add';
    history.pushState({}, null, origHref + "add-movie");
}

function del(){
    console.log("Delete button is clicked.");
    var name = document.getElementById("del_name").value;
    var rating = document.getElementById("del_rate").value;
    var year = document.getElementById("del_year").value;
    if((!isNum(rating) && rating != '') || (!isNum(year) && rating != '') || (name == '' && rating == '' && year == '')){
        alert("Input is invalid!");
        document.getElementById("del_name").value = '';
        document.getElementById("del_rate").value = '';
        document.getElementById("del_year").value = '';
        return;
    }
    var m = new Movie(name, rating, year);
    isFilter = false;
    xhr.open("POST", "/del-movie", true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(JSON.stringify(m));
    //location.hash = 'delete'
    history.pushState({}, null, origHref + "delete");
}

function del_ck(){
    var ckArr = document.getElementsByName("ckbox");
    var movies = [];
    for(var i=0; i<ckArr.length; i++){
        if(ckArr[i].checked){
            console.log(ckArr[i].value);
            var movie = JSON.parse(ckArr[i].value.replaceAll("'", '"'));
            movies.push(movie);
        }
    }
    console.log(movies);
    isFilter = false;
    xhr.open("POST", "/del-movie-cb", true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(JSON.stringify(movies));
    //location.hash = 'delete-cb';
    history.pushState({}, null, origHref + "delete-cb");
}
function genDispStr(movie){
    var str = '';
    str += '<b>Name: </b>' + movie.name + "&nbsp&nbsp&nbsp<b>Rating: </b>" + movie.rating + "&nbsp&nbsp&nbsp<b>Year: </b>" + movie.year;
    return str;
}
