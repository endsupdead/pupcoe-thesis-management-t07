$("#thesis_search").on("keyup", function() {
  var value = $(this).val().toLowerCase();
  $("#thesis_list tr").filter(function() {
    $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
  });
});