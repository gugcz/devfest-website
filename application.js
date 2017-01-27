$(function(){
    window.prettyPrint && prettyPrint();
}(window.jQuery));

jQuery(document).ready(function($) {

	//Download Link Highlight
	if($("body").data("page")==="frontpage"){
		$(window).scroll(function(){
			var scrolled = $(window).scrollTop();
		    var downloadLink = $("#top-nav").find(".download")
		    if(scrolled >= 420){
		    	downloadLink.addClass("download-on");
		    } else if (scrolled < 420){
		    	downloadLink.removeClass("download-on");
		    }
		})
	}

	$('#myTab a').click(function (e) {
	  e.preventDefault();
	  $(this).tab('show');
	})


});

$(document).ready(function() {
 
  var owl = $("#speakers-list");
 
  owl.owlCarousel({
      items : 4, //10 items above 1000px browser width
      itemsDesktop : [1000,5], //5 items between 1000px and 901px
      itemsDesktopSmall : [900,3], // betweem 900px and 601px
      itemsTablet: [600,2], //2 items between 600 and 0
      itemsMobile : false // itemsMobile disabled - inherit from itemsTablet option
  });
  owl.trigger('owl.play',3000); //owl.play event accept autoPlay speed as second parameter
});
