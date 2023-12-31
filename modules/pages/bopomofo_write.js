export {content,style, mod_name, on_complete};
import * as hwmod from "./../../modules/utility/handwrite_practice.js";

var on_complete = null;

var mod_name = "bopomofo_write";

var style = $(`<style>
			.bopomofo-navbar-col, .bopomofo-control-col, .bopomofo-navbar-menu{
				overflow-x: scroll;
				display: inline-block;
				white-space: nowrap;
			}

			.bopomofo-content {
				text-align: center;
			}
			.font-practice-div {
				border: 1px solid #aaa;
			}
</style>`);
style.attr("mod_type","page_mod");

var content = $(`
<div class="container-fluid">
	<div class="row">
		<div class="col-md-9 bopomofo-navbar-col ">

		</div>
		<div class="col-md-3 bopomofo-control-col">
			<div class="btn-group btn-group-lg" role="group">
			  <button type="button" class="btn btn-outline-primary hear-sound"><i class="bi bi-soundwave"></i></button>
			  <button type="button" class="btn btn-outline-primary preview-symbol"><i class="bi bi-arrow-left-square"></i></button>
			  <button type="button" class="btn btn-outline-primary next-symbol"><i class="bi bi-arrow-right-square"></i></button>
			</div>
			<div class="btn-group btn-group-lg" role="group">
				<button type="button" class="btn btn-outline-primary shuffle-symbol"><i class="bi bi-shuffle"></i></button>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-12 bopomofo-content">
		</div>
	</div>
</div>
`);

content.attr("mod_type","page_mod");

document.title = "網站名未定 - ㄅㄆㄇ書寫練習-初階";
var bopomofo_list = ["ㄅㄆㄇㄈ","ㄉㄊㄋㄌ","ㄍㄎㄏ","ㄐㄑㄒ","ㄓㄔㄕㄖ","ㄗㄘㄙ","ㄧㄨㄩ","ㄚㄛㄜㄝ","ㄞㄟㄠㄡ","ㄢㄣㄤㄥ","ㄦ"];
var moe_sound_list = ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ', 'ㄍ', 'ㄎ', 'ㄏ', 'ㄐ', 'ㄑ', 'ㄒ', 'ㄓ', 'ㄔ', 'ㄕ', 'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ', 'ㄚ', 'ㄛ', 'ㄜ', 'ㄝ', 'ㄞ', 'ㄟ', 'ㄠ', 'ㄡ', 'ㄢ', 'ㄣ', 'ㄤ', 'ㄥ', 'ㄦ', 'ㄧ', 'ㄨ', 'ㄩ'];
content.find(".bopomofo-navbar-col").html(bopomofo_list.map(function(v1){
	return $('<div class="btn-group btn-group-lg" role="group">').append(v1.split("").map(function(v2){
		return $('<button type="button" class="btn btn-outline-primary bopomofo-symbol" data="'+v2+'">'+v2+'</button>');
	}));
}));

var quick_fn = function(s,wh){
	var t = new hwmod.handwrite_practice({"font_str":s,"wh":wh});
	return t;
};
var fontsize;

content.on("click",".bopomofo-symbol",function(e){
	var usable_height = $("#content").height() - document.querySelector(".bopomofo-navbar-col").offsetHeight;
	var usable_width =  $("#content").width();
	var usabel_rectangle = Math.min(usable_height,usable_width);
	fontsize = parseInt(usabel_rectangle/50)*50;
	
	let t = quick_fn(e.currentTarget.textContent,fontsize);
	content.find(".bopomofo-content").empty().html(t.practice_div);
	content.find(".bopomofo-symbol").removeClass("btn-primary").addClass("btn-outline-primary");
	content.find(e.currentTarget).removeClass("btn-outline-primary").addClass("btn-primary");
	content.find(".hear-sound").click();
});
content.find(".next-symbol").on("click",function(e){
	let current_symbol_ele = content.find(".bopomofo-symbol.btn-primary");
	if(current_symbol_ele.length == 1){
		if(content.find(".shuffle-symbol").hasClass("btn-primary")){
			var next_idx = parseInt(Math.random()*37);
		}else{
			let idx = bopomofo_list.join("").split("").indexOf(content.find(".bopomofo-symbol.btn-primary").text());
			var next_idx = 0;
			if(idx == 36){
				next_idx = 0;
			}else if(idx<36){
				next_idx = idx+1;
			};
		};
		content.find(".bopomofo-symbol[data='"+bopomofo_list.join("").split("")[next_idx]+"']").trigger("click");
	};
});
content.find(".preview-symbol").on("click",function(e){
	let current_symbol_ele = content.find(".bopomofo-symbol.btn-primary");
	if(current_symbol_ele.length == 1){
		let idx = bopomofo_list.join("").split("").indexOf(content.find(".bopomofo-symbol.btn-primary").text());
		let next_idx = 0;
		if(idx == 0){
			next_idx = 36;
		}else if(idx>=1){
			next_idx = idx-1;
		};
		content.find(".bopomofo-symbol[data='"+bopomofo_list.join("").split("")[next_idx]+"']").trigger("click");
	};
});
content.find(".shuffle-symbol").on("click",function(e){
	e.currentTarget.classList.toggle("btn-primary");
	e.currentTarget.classList.toggle("btn-outline-primary");
});
content.find(".hear-sound").on("click",function(e){
	let audio = document.createElement("audio");
	audio.src = "https://stroke-order.learningweb.moe.edu.tw/bopomo_sound/M/M"+String(moe_sound_list.indexOf(content.find(".bopomofo-symbol.btn-primary").text())+1)+".WAV";
	audio.play();
});