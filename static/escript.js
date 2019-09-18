$(document).on('submit', '#delete-form', function(evt) {
  evt.preventDefault();

  // Selected entries
  num_of_entries = [];

  // Total number of 'events' in a given month and year
  total_entries = $("td.check_radio").length;

  // 'entries' value taken from 'dscript.js'
  for(var i = 0; i < entries.length; i++) {
    tar = entries[i];

    // checks the number of times a element is present in a given array
    num = $.grep(entries, function(val) {
      return tar === val;
    }).length;

    if((num % 2 === 1) && (jQuery.inArray(tar, num_of_entries) === -1)) {
      num_of_entries.push(tar);
    }
  }

  // Data regarding all the selected 'rows' for deletion
  all_Rows = [];

  for(var i = 0; i < num_of_entries.length; i++) {
    $("td#" + num_of_entries[i]).closest("tr").addClass('selected-this');
    each_Row = [];
    $("td#" + num_of_entries[i]).closest('.selected-this').find("td").each(function() {
      each_Row.push($(this).html());
    });
    each_Row.shift();
    all_Rows.push(each_Row);
  }

  datas = { total_rows: total_entries, checked_rows: num_of_entries, all_datas: all_Rows };

  $.ajax({
    data: JSON.stringify(datas),
    type: 'POST',
    url: '/delete',
    contentType: "application/json; charset=utf-8",
    dataType: 'json'
  })
  .done(function(data) {
    $("#events_details_show").html(data.msg);
  });

});
