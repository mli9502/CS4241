Assignment #5
Author: Mengwen Li (mli2)
Link to the page: http://mli-cs4241-hw5.herokuapp.com/
Themeing choices:
I used the color scheme from the folloing link: https://color.adobe.com/Cool-Modern-color-theme-50744/
I also divided the functionality of the page into blocks so user can easily find the functionality they want and the result that is generated.
Technical achievements:
1. The url will be updated when filter, add and delete requests are sent to the server.
2. Users can select the movies they want to delete by checking the checkbox before a list of movie currently in database.
   After the user select those movies, they can click the "Delete by checkbox" button to delete the selected movies.
   The remaining list will be shown after delete without refreshing the page.
3. When ever the user input something in the "Filter the movie database" field, the filtered result will be shown immediately
   at the "Movies filtered out" block. User don't have to click a button to see the filter result.
   This is accomplished by defining a function for the "onkeyup" event for the text fields.
