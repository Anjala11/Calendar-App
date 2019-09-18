$(document).on('click', "td.days", function() {
  $("td.days").removeClass("iselect");
  $(this).addClass("iselect");
  date = $(this).closest(".month").find(".iselect").text();  // Get the 'date' of a clicked date
  // Send the 'date' from jQuery to Python function
  $.ajax({
    data: {
      date: date
    },
    type: 'POST',
    url: '/date_val'
  })
  .done(function(data) {
    console.log("good");
  });
  return false;
});