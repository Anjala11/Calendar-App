$(document).ready(function() {
  $("#reminder_button").on('click', function() {
    count = 0;
    if(typeof date === 'undefined' || date == 0) { // First check whether 'click' event of a 'date' fired or not
      htmlCode = "<p>Date not clicked!</p>";
    }
    else if(date >= 1 || date <= 31) {
      htmlCode = '<form action="/events" method="post" id="eventform"> \
      <table align="center"> \
      <tr><td><input type="radio" name="remin" value="Events" required/><label>Events</label></td></tr> \
      <tr><td><input type="radio" name="remin" value="Meetings"/><label>Meetings</label></td></tr>\
      <tr><td><input type="radio" name="remin" value="Birthdays"/><label>Birthdays</label></td></tr> \
      <tr><td><input type="radio" name="remin" value="Anniversaries"/><label>Anniversaries</label></td></tr> \
      <tr><td><textarea id="eventtext" style="height: 150px; width: 400px; resize: none;" required></textarea></td></tr> \
      <tr><td><input type="submit" value="Add Reminder" id="add_reminder"/></td></tr> \
      <tr><td><div id="notesdiv"></div></td></tr> \
      </table> \
      </form>';
      count = 1;
    }
    $("#reminder_div").html(htmlCode);

    // Retrieve values only when 'Form' is loaded
    if(count == 1) {
      $("#eventform").on('submit', function(evt) {
        evt.preventDefault();
        $.ajax({
            data: {
                whichEvent: $("input[name=remin]:checked").val(),
                whatComment: $("#eventtext").val()
            },
            type: 'POST',
            url: '/events'
        })
        .done(function(data) {
            $(".iselect").addClass('evented');
            $("#reminder_div").html("<p>" + data.msg + "</p>");
        });
      });
    }
  });
});
