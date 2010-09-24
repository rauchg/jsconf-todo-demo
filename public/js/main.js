(function($){
  
  $('.item .edit').live('click', function(){
    
    $.get($(this).attr('href'), function(a){
      console.log(a);
    });
    
  });
  
})(jQuery);