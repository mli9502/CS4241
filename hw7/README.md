Assignment #7
Author: Mengwen Li (mli2)
Link to the page: http://mli-cs4241-hw7.herokuapp.com/
The three templates are in "templates.js" file.
Technical achievement:
1. Information sent back from server can be displayed as both table and list by using two
   different templates.
2. The template that can insert a user specified string by using "<%-  %>" is used.
3. The template that can execute a function inside of it using "<%  %>" is used to execute
   a function when building the table.
4. "each" function from underscore is used to loop through a list of objects when building
   the table from the template.
5. Two templates are combined to build a table. A for loop is first used to build all the
   rows from "tempRow" template, then, the result is used by "tempTable" to build the final
   table.
