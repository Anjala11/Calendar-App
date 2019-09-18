$(document).ready(function() {
  $("#events_details_show").html("");

  $("#events_show").on('click', function(evt) {

    // 'Id' of checkboxes clicked for deletion/updation/moving dates
    entries = [];

    evt.preventDefault();
    $.ajax({
      data: {
        month: $("#month_of_year option:selected").text(),
        year: $("#what_year option:selected").text()
      },
      type: 'POST',
      url: '/event_details'
    })
    .done(function(data) {
      if(data.dbentry[0]['date'] === 0) {
        $("#events_details_show").html("No event marked!");
      }
      else {
        str1 = "<table align='center' id='eventslist'>  \
          <tr> \
            <th id='no_th'><u>No.</u></th> \
            <th><u>D-M-Y</u></th> \
            <th><u>Event Type</u></th> \
            <th><u>Event Description</u></th> \
          </tr>";
          str2 = "";
        for(var i = 1; i <= data.dbentry.length; i++) {
          str2 += "<tr> \
            <td class='check_radio' id='" + i +"'>" + i + "</td> \
            <td>" + data.dbentry[i - 1]['date'] + "-" + data.dbentry[i - 1]['month'] + "-" + data.dbentry[i - 1]['year'] + "</td> \
            <td>" + data.dbentry[i - 1]['type'] + "</td> \
            <td>" + data.dbentry[i - 1]['desc'] + "</td> \
          </tr>";
        }
        str3 = "<tr> \
            <td colspan='4'> \
              <form method='POST' id='delete-form' action='/delete'><input type='submit' class='changes_to' id='deleve' \
              name='events' value='Delete Event'/></form> \
            </td> \
          </tr> \
        </table>";
        finalstr = str1+str2+str3;
        $("#events_details_show").html(finalstr);

        // When page loads, the button is inactive
        $("#eventslist input[type='submit']").prop('disabled', true);
      }

      $("td.check_radio").on('click', function() {

        // Get element's inner content
        innercontent = $(this).html();
        id = $(this).attr('id');

        entries.push(id);

        // For 'checkboxes'
        if(!(isNaN(innercontent))) {
          $(this).html("<input type='checkbox' checked='true' class='checklist'/>");
        }
        else {
          $(this).html(id);
        }

        // Get number of checkboxes
        num = $("input.checklist").length;

        // When no checkboxes are present, buttons stay disabled
        if(num === 0) {
          $("#eventslist input[type='submit']").prop('disabled', true);
        }
        else if(num > 0) {
          $("#eventslist input[value='Delete Event']").prop('disabled', false);
        }
      });
    });
  });
});


