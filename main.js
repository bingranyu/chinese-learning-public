// #content 自動調整fit畫面
var debounce;
$(window).resize(function() {
  const el = $('#content');
  clearTimeout(debounce);
  setTimeout(function() {
	el.height(0)
	  .height(window.innerHeight);
  }, 10);      
}).resize();

var page_mods = [{"name":'bopomofo_write',"title":"ㄅㄆㄇ書寫學習"},{"name":'exercise_book',"title":"國字練習簿"}];
var main_sidebar_bs = new bootstrap.Offcanvas('.main-sidebar');
page_mods.forEach(function(mod){
	$(".main-sidebar .offcanvas-body ul").append(`<li class="nav-item"><a class="nav-link" target_page="${mod['name']}" href="#">${mod['title']}</a></li>`);
});
$(".main-sidebar .offcanvas-body ul").on("click","a",function(e){
	$("[mod_type=page_mod]").remove();
	import('./modules/pages/'+e.target.getAttribute("target_page")+'.js').then(function(mod){
	   $("#content").html(mod.content);
	   $("head").append(mod.style);
	   if(mod.on_complete!==null){
	     mod.on_complete();
	   }
	})
	main_sidebar_bs.hide();
});


