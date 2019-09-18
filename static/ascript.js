$(document).ready(function() {
  $("#presmonth td").addClass('days');
  $("#presmonth th").addClass('days');
  $("#calcform").on('submit', function(event) {
    $.ajax({
      data: {
        month: $("#which_month option:selected").text(),
        year: $("#which_year option:selected").text()
      },
      type: 'POST',
      url: '/calendar'
    })
    .done(function(data) {
      $("#presmonth").html(data.pres_month);
      $("#presmonth td").addClass('days');
      $("#presmonth th").addClass('days');
      $("#reminder_div").html("");
      date = 0;  // Clear all pre-existing values as soon as AJAX data loads

      // For every 'event date'
      for(var i = 0; i < data.everydate.length; i++) {
        $("table.month td").each(function() {
          if(data.everydate[i] == $(this).html()) {
            $(this).addClass('evented');
          }
        });
      }
    });
    event.preventDefault();
  });
});
