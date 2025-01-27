jQuery(document).ready(function($) {

      // $('.popup').fancybox({
      //   closeExisting: false,
      //   // animationDuration: 5,
      //   touch: false,
      // });


      $('.lang__button').click(function(){
        $('.lang').toggleClass('open');
      });

      $(document).click(function (e){ 
        var div = $(".lang"); 
        if (!div.is(e.target) 
            && div.has(e.target).length === 0) { 
              $('.lang').removeClass('open');
        }
      });
  
      $('.burg').click(function(){
        $('body').toggleClass('menu__open');
      });

      $('a[href^="#"]').click(function(event) {
        var id_clicked_element = $(this).attr('href');
        var destination = $(id_clicked_element).offset().top;
        $('html, body').animate({ scrollTop: destination }, 1000);
        return false;
      });
    

});






