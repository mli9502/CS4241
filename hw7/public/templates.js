/* Author: Mengwen Li (mli2)*/
// Template for table
var tempTable = _.template(
    "<table>" +
    "<tr><th>Name</th><th>Rating</th><th>Year</th></tr>" +
    "<%= tRows %>" +
    "</table>"
);
// Template for row.
var tempRow = _.template(
    "<tr><td><%= name %></td><td><%= rating %></td><td><%= year %></td></tr>"
);
// Template for list of movie names.
var tempList = _.template(
    "<h3> List of filtered movie names </h3>" +
    "<ul>" +
    "<%" +
        "_.each(items, function(movie){" +
    "%>" +
        "<li>" +
            "<%- movie.name %>" +
        "</li>" +
    "<%" +
        "});" +
    "%>" +
    "</ul>"
);
// template for a table with check box as a column.
var tempCheckBoxTable = _.template(
    "<table>" +
        "<thead>" +
          "<tr>" +
            "<th class='tbBox'></th>" +
            "<th>Name</th>" +
            "<th>Rating</th>" +
            "<th>Year</th>" +
          "</tr>" +
        "</thead>" +
        "<tbody>" +
          "<%" +
            // repeat items
            "_.each(items,function(movie){" +
              // create variables
            "var movieStr = JSON.stringify(movie).replaceAll('\"', \"'\");" +
          "%>" +
            "<tr>" +
              "<td><input type='checkbox' name='ckbox' value=\"<%- movieStr %>\" class='tbBox'></td>" +
              "<td><%- movie.name %></td>" +
              "<td><%- movie.rating %></td>" +
              "<td><%- movie.year %></td>" +
            "</tr>" +
          "<%" +
            "});" +
          "%>" +
        "</tbody>" +
      "</table>"
);
