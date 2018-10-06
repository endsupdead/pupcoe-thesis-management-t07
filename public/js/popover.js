$('a.mor-submit').click(function(e){
    var title='<button type="submit" class="btn btn-success btn-sm no-click"><i class="fa fa-paper-plane"></i>&nbsp;&nbsp;Submit </button>';
    title=title.replace('<br>','');
    var reminder1 = "Submit to your Adviser for initial checking."
    $(this).popover({
        title: "<strong>"+title+"</strong>",
        content: "<table class='table justify' style='padding: 0; margin:0'> <tr> <td>"+reminder1+"</td></tr> </table>", html: true
    });
    popoverrem=$(this);
    $(popoverrem).popover('show');
});

$('a.mor-proceed').click(function(e){
    var title='<button type="button" class="btn btn-success btn-sm no-click"><i class="fa fa-check"></i> Proceed</button>';
    title=title.replace('<br>','');
    var reminder1 = "Proceed to Title Defense with <i>this</i> title."
    $(this).popover({
        title: "<strong>"+title+"</strong>",
        content: "<table class='table justify' style='padding: 0; margin:0'> <tr> <td>"+reminder1+"</td></tr> </table>", html: true
    });
    popoverrem=$(this);
    $(popoverrem).popover('show');
});