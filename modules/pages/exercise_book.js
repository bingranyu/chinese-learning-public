import {create_svg_font} from "./../../modules/utility/create_svg_font.js";
import {create_svg_bopomo} from "./../../modules/utility/create_svg_bopomo.js";
import {create_write_canvas} from "./../../modules/utility/create_write_canvas.js";
import {handwrite_practice} from "./../../modules/utility/handwrite_practice.js";
import {zip} from "./../../modules/utility/utility.js";
import * as g2pw from './../../modules/model/g2pw.js';
export {content, style , mod_name, on_complete};

var mod_name = "exercise_book";

var style = $(`
<style>
	table.exercise_student_table {
		white-space:nowrap;
	}
	table.exercise_student_table,table.exercise_student_table tr,table.exercise_student_table th,table.exercise_student_table td {
	  border: solid 1px black;
	  padding: 0px;
	}
	table.exercise_student_table .word.is_symbol_0 {
	  width:2cm;
	  height:2cm;
	}
	table.exercise_student_table .word.is_symbol_1 {
	  width:1cm;
	  height:2cm;
	}
	table.exercise_student_table th, .exercise_student_table td {
	  display: inline-block;
	}
	table.exercise_student_table td {
	  position: relative;
	}
	.write_control_layer {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0px;
		left: 0px;
		display: block;
	}
	.exercise_block {
		width: fit-content;
		padding: 20px 20px 50px 50px;
		margin-left: auto;
		background-color: #fff;
	}
	.control-button-toolbar {
		position: fixed;
		left: 5px;
		top: 5px;
		background-color: #fff;
	}
	.parents_button_group {
		position: fixed;
		left: 5px;
		bottom: 5px;
		background-color: #fff;
	}
	.exercise_page_area, .trash_page_area {
		margin-bottom: 15px;
		padding: 10px;
		border: 1px solid #aaa;
		border-radius: 5px;
	}
	.exercise_page_card {
		margin-bottom: 10px;
	}
	.exercise_page {
		position: relative;
	}
	.exercise_teacher_page {
		position: absolute;
		top: 0px;
		left: 0px;
		z-index: 2;
	}
	.exercise_student_page {
		position: relative;
		left: 0px;
		top: 0px;
		z-index: 1;
	}
</style>`);
style.attr("mod_type","page_mod");


// 儲存使用 Indexeddb
var exercise_book_db_request;
(function(){
	if (!('indexedDB' in window)) {
		console.log('瀏覽器不支援IndexedDB，所有變更、下載無法儲存')
		return;
	};
	exercise_book_db_request = idb.openDB('exercise_book', 1,{
		upgrade(upgradeDb){
			if (!upgradeDb.objectStoreNames.contains('words')) {
				upgradeDb.createObjectStore('words', { keyPath: 'id', autoIncrement: true });
			};
		}
	});
})();

var get_words_list_fromDB = function(){
	return exercise_book_db_request.then((db)=>{
		const tx = db.transaction('words', 'readonly');
		return tx.store.getAll();
	});
};

var add_new_word_toDB = function(data){
	return exercise_book_db_request.then((db)=>{
		const tx = db.transaction('words', 'readwrite');
		data['upd_date'] = new Date().getTime();
		let r = tx.store.add(data);
		tx.done;
		return r;
	});
};

var update_words_byID_toDB = function(data){
	return exercise_book_db_request.then((db)=>{
		const tx = db.transaction('words', 'readwrite');
		data['upd_date'] = new Date().getTime();
		let r = tx.store.put( data);
		tx.done;
		return r;
	});
};

var get_words_byID_fromDB = function(id){
	return exercise_book_db_request.then((db)=>{
		const tx = db.transaction('words', 'readonly');
		return tx.store.get(id);
	});
};


var Storage = window.localStorage;


// 操作按鈕
var control_button_toolbar=$(`
<div class="btn-toolbar control-button-toolbar" role="toolbar" style="z-index:999;">
	<div class="btn-group-vertical control_button_group" role="group">
	  <button type="button" class="drag btn btn-outline-primary active"><i class="fa-regular fa-hand"></i></button>
	  <button type="button" class="pen btn btn-outline-primary"><i class="fa-solid fa-pencil"></i></button>
	  <button type="button" class="eraser btn btn-outline-primary"><i class="fa-solid fa-eraser"></i></button>
	</div>
</div>
`);



var exercise_block = $("<div class='exercise_block'></div>");

var edit_exercise_book_modal = $(`<div class="modal fade" id="edit_exercise_book" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
    <div class="modal-content">
	  <div class="modal-header">
		<h1 class="modal-title fs-5" id="staticBackdropLabel">編輯生詞練習簿</h1>
		<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
	  </div>
	  <div class="modal-body">
		  <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
			  <li class="nav-item" role="presentation">
				<button class="nav-link active book-tab" id="pills-book-tab" data-bs-toggle="pill" data-bs-target="#pills-book" type="button" role="tab" aria-controls="pills-book" aria-selected="true">練習簿</button>
			  </li>
			  <li class="nav-item" role="presentation">
				<button class="nav-link book-tab" id="pills-trash-tab" data-bs-toggle="pill" data-bs-target="#pills-trash" type="button" role="tab" aria-controls="pills-trash" aria-selected="false">垃圾桶</button>
			  </li>
			  <li class="nav-item me-auto" role="presentation">
				<button class="nav-link book-tab" id="pills-setting-tab" data-bs-toggle="pill" data-bs-target="#pills-setting" type="button" role="tab" aria-controls="pills-setting" aria-selected="false">練習設定</button>
			  </li>
		  </ul>
		  
		  <div class="tab-content" id="pills-tabContent">
			<div class="tab-pane fade show active" id="pills-book" role="tabpanel" aria-labelledby="pills-book-tab">
				<div class="exercise_page_area">
				</div>
				<div class="d-grid gap-2">
				  <button class="btn btn-primary add_exercise_page" type="button">新增練習簿</button>
				</div>
			</div>
			<div class="tab-pane fade" id="pills-trash" role="tabpanel" aria-labelledby="pills-trash-tab">
				<div class="trash_page_area">
				</div>
			</div>
			<div class="tab-pane fade" id="pills-setting" role="tabpanel" aria-labelledby="pills-trash-tab">
				<div class="setting_page_area">
					<div class="row">
					  <div class="col-md-4">
					    練習格大小(cm)
						<input type="number" class="form-control" id="exercise_font_size" step="1"  min="1" max="5">
					  </div>
					  <div class="col-md-4">
					    筆畫練習次數
						<input type="number" class="form-control" id="stroke_times" step="1">
					  </div>
					  <div class="col-md-4">
					    書寫練習次數
						<input type="number" class="form-control" id="write_times" step="1">
					  </div>
					</div>
				</div>
			</div>
		  </div>
	  </div>
	</div>
  </div>
</div>`);

var edit_exercise_book_modal_btobj = new bootstrap.Modal(edit_exercise_book_modal[0]);


var exercise_page_temp = (id,title,words)=>`<div class="card exercise_page_card" style="width: 100%;" book_id="${id}">
  <div class="card-header">
    <div class="row">
	  <div class="col-md-8">
	    <p class="book_title" contenteditable="true">${title}</p>
	  </div>
	  <div class="col-md-4 float-right">
	    <button type="button" class="btn btn-outline-danger btn-sm remove_exercise_page"><i class="fa-solid fa-trash-can"></i></button>
		<button type="button" class="btn btn-success btn-sm apply_exercise_page">練習</button>
	  </div>
	</div>
  </div>
  <div class="card-body">
	<div class="form-floating">
	  
	    <textarea class="form-control exercise_words" rows="2">${words}</textarea>
	  <label>生詞(,分隔)</label>
	</div>
  </div>
</div>`;

var trash_page_temp = (id,title,words) =>`
<div class="card trash_page" style="width: 100%;" book_id="${id}">
  <div class="card-header">
    <div class="row">
	  <div class="col-md-8">
	    <p class="book_title">${title}</p>
	  </div>
	  <div class="col-md-4 float-right">
		<button type="button" class="btn btn-success btn-sm undo-delete">還原</button>
	  </div>
	</div>
  </div>
  <div class="card-body">
	<div class="form-floating">
	  
	    <textarea class="form-control exercise_words disabled" rows="2">${words}</textarea>
	    <label>生詞(,分隔)</label>
	</div>
  </div>
</div>
`;


var parents_button_group= $(`
<div class="btn-group-vertical parents_button_group" role="group" aria-label="Vertical button group"  style="z-index:999;">
	<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#edit_exercise_book">
	  <i class="fa-solid fa-book-bookmark"></i>
	</button>
	<button type="button" class="btn btn-primary download_book_img">
	  <i class="fa-solid fa-file-arrow-down"></i>
	</button>
	<input type="checkbox" class="btn-check" id="teacher_mode_toggle" autocomplete="off">
	<label class="btn btn-outline-primary" for="teacher_mode_toggle"><i class="fa-solid fa-person-chalkboard"></i></label>
</div>`);

/*
var get_excerce_book_data_fn = function(){
	let visible_data = [...$("#edit_exercise_book .exercise_page_area").find(".exercise_page")].map(function(v){
		let id = $(v).attr("book_id");
		let title = $(v).find(".book_title").text();
		let trash_date= null;
		let words = $(v).find(".exercise_words").val().split(",").map((v)=>v.trim()).filter((v)=>v.length>0);
		return {"id":id,"title":title,"trash_date":trash_date,"words":words};
	}).filter((v)=>v.words.length>0);
	
	let in_trash_data = JSON.parse(Storage.getItem("exercise_book/exercise_words")).filter((v)=>v.trash_date!==null);
	let data_array = visible_data.concat(in_trash_data);
	data_array = [...new Map(data_array.reverse().map(item => [item['id'], item])).values()].reverse();
	return data_array;
};
*/



var refresh_book_editor_fn = function(){
	get_words_list_fromDB().then(function(word_list){
		let exercise_page_area_el = edit_exercise_book_modal.find(".exercise_page_area");
		exercise_page_area_el.html('');
		let trash_page_area_el = edit_exercise_book_modal.find(".trash_page_area");
		trash_page_area_el.html('');
		for(var i=0;i<word_list.length;i++){
			if(word_list[i]['is_deleted']){
				trash_page_area_el.append(trash_page_temp(word_list[i]['id'],word_list[i]['title'],word_list[i]['words']));
			}else{
				exercise_page_area_el.append(exercise_page_temp(word_list[i]['id'],word_list[i]['title'],word_list[i]['words']));
			};
		};
	});
};



var create_exercise_page = function(word_list, stroke_times, write_times,exercise_font_size=2){
	let row_temp_fn = (tag,n_col,add_class='')=>'<tr>'+Array.from({length: n_col*2}, (_, i) => `<${tag} style='width:${exercise_font_size - exercise_font_size*0.5*(i%2)}cm;height:${exercise_font_size}cm;' class='word word_${parseInt(i/2)+1} is_symbol_${(i%2)} ${add_class}'></${tag}>`).join('')+'</tr>';
	// 拆開並轉置
	let word_list_t = zip(word_list.map(v=>v.split('')));
	let char_num = Math.max(...word_list.map(v=>v.length));
	

	
	// 建立頁面
	var exercise_page = $("<table class='exercise_page'>");
	var exercise_student_page = $("<div class='exercise_student_page'>");
	var exercise_teacher_page = $("<div class='exercise_teacher_page'>");
	var exercise_student_table = $("<table class='exercise_student_table'>");
	exercise_student_page.append(exercise_student_table);
	exercise_page.append(exercise_student_page,exercise_teacher_page);
	
	exercise_student_table.append(["<thead>","<tbody>"]);
	// 標題(題目)
	let word_titles = word_list_t.map(function(v){
		let th_tmp = $(row_temp_fn("th",v.length,"word_title"));
		for(let iw=0;iw<v.length;iw++){
			th_tmp.find('.word_'+String(iw+1)).attr("char-val",v[iw]);
		};
		
		return th_tmp;
	});
	exercise_student_table.find("thead").append(word_titles);
	// 筆畫練習
	let stroke_el_tmp = word_list_t.map(function(v){
		let td_tmp = $(row_temp_fn("td",v.length,"stroke_practice"));
		for(let iw=0;iw<v.length;iw++){
			td_tmp.find('.word_'+String(iw+1)).attr("char-val",v[iw]);
		};
		return td_tmp;
	});
	let stroke_el = [];
	for(let i=0;i<stroke_times;i++){
		for(let j=0;j<stroke_el_tmp.length;j++){
			stroke_el.push(stroke_el_tmp[j][0].cloneNode(true));
		};
	};
	exercise_student_table.find("tbody").append(stroke_el);
	//自由寫字
	let freewrite_tmp = word_list_t.map(function(v){
		let td_tmp = $(row_temp_fn("td",v.length,"freewrite"));
		for(let iw=0;iw<v.length;iw++){
			td_tmp.find('.word_'+String(iw+1)).attr("char-val",v[iw]);
		};
		return td_tmp;
	});
	let freewrite_el = [];
	for(let i=0;i<write_times;i++){
		for(let j=0;j<freewrite_tmp.length;j++){
			freewrite_el.push(freewrite_tmp[j][0].cloneNode(true));
		};
	};
	exercise_student_table.find("tbody").append(freewrite_el);
	
	exercise_page.one("append",function(e){
		var control_layer_div = "<div class='write_control_layer'></div>";
		let font_width = $(exercise_student_table.find("th.word.word_1.is_symbol_0")[0]).width();
		// 標題(題目)
		exercise_student_table.find("th.word_title.is_symbol_0").each(function(i,v){
			let t = new create_svg_font($(v).attr("char-val"),{'wh':font_width});
			t.deffered_obj.then(function(){
				$(v).html(t.back_canvas);
			});
			$(v).data("exercise_object",t);
		});
		// 筆畫練習
		exercise_student_table.find("td.stroke_practice.is_symbol_0").each(function(i,v){
			let t = new handwrite_practice({'font_str':$(v).attr("char-val"),'wh':font_width});
			t.back_font_obj.deffered_obj.then(function(){
				$(v).html([t.practice_div,control_layer_div]);
			});
			$(v).data("exercise_object",t);
		});

		// 自由寫字
		exercise_student_table.find("td.freewrite.is_symbol_0").each(function(i,v){
			let t = new create_write_canvas({"width":font_width,"height":font_width});
			t.draw_enable=true;
			$(v).html([t.draw_canvas,control_layer_div]);
			$(v).data("exercise_object",t);
		});
		exercise_student_table.find("td.freewrite.is_symbol_1").each(function(i,v){
			let t = new create_write_canvas({"width":parseInt(font_width/2),"height":font_width});
			t.draw_enable=true;
			$(v).html([t.draw_canvas,control_layer_div]);
			$(v).data("exercise_object",t);
		});
		
		// 預測注音
		g2pw.Warmup_check.then(function(){
			var bopomo_deferred = [];
			for(var i=0;i<word_list.length;i++){
				bopomo_deferred.push(g2pw.predict(word_list[i]));
			};
			$.when(...bopomo_deferred).done(function(...bopomo_list){
				var bopomo_list_t = bopomo_list[0].map((_, colIndex) => bopomo_list.map(row => row[colIndex]));
				var tr_els = $("thead > tr");
				for(var ix=0;ix<bopomo_list_t.length;ix++){
					var th_els = $(tr_els[ix]).find("th.word_title.is_symbol_1");
					for(var iy=0;iy<th_els.length;iy++){
						let bopomo_val = bopomo_list_t[ix][iy];
						bopomo_val = bopomo_val.replace('1','').replace('2','ˊ').replace('3','ˇ').replace('4','ˋ').replace('5','˙');
						$(th_els[iy]).attr("char-val",bopomo_val);
						let t = new create_svg_bopomo(bopomo_val,{'wh':font_width});
						$(th_els[iy]).html(t.back_canvas);
					};
				};
			});
		});
		
		// 改作業區域
		var teacher_draw_obj = new create_write_canvas({"width":exercise_page.width(),"height":exercise_page.height(),"stokewidth":1,"strokestyle":"#ff0000"});
		exercise_teacher_page.data("teacher_draw_obj",teacher_draw_obj);
		exercise_teacher_page.append(teacher_draw_obj.draw_canvas);
		$(exercise_teacher_page).css("pointer-events","none");
		//teacher_draw_obj.draw_canvas
		
	});
	
	return exercise_page;
};



var content = [control_button_toolbar,edit_exercise_book_modal,parents_button_group,exercise_block];

// 載入完成module後的callback
var on_complete = function(){
	
	edit_exercise_book_modal[0].addEventListener('show.bs.modal', function(e){
		refresh_book_editor_fn();
		var exercise_setting = JSON.parse(Storage.getItem("exercise_book/exercise_setting"));
		$("#exercise_font_size").val(exercise_setting["exercise_font_size"]);
		$("#stroke_times").val(exercise_setting["stroke_times"]);
		$("#write_times").val(exercise_setting["write_times"]);
	});


	// 操作列
	$(control_button_toolbar).find(".control_button_group button").on('click',function(e){
		$(control_button_toolbar).find(".control_button_group button").removeClass('active');
		$(e.currentTarget).addClass('active');
		if($(e.currentTarget).hasClass('pen')){
			$("div.write_control_layer").css("display","none");
			$(".exercise_teacher_page").data("teacher_draw_obj").draw_enable = true;
			$(".exercise_teacher_page").data("teacher_draw_obj").is_eraser = false;
		}else{
			$("div.write_control_layer").css("display","block");
			if($(control_button_toolbar).find(".control_button_group button.eraser").hasClass("active")){
				$(".exercise_teacher_page").data("teacher_draw_obj").draw_enable = true;
				$(".exercise_teacher_page").data("teacher_draw_obj").is_eraser = true;
			}else{
				$(".exercise_teacher_page").data("teacher_draw_obj").draw_enable = false;
				$(".exercise_teacher_page").data("teacher_draw_obj").is_eraser = false;
			};
		};
	});

	// 橡皮擦
	$(exercise_block).on("click",".write_control_layer",function(e){
		if($(control_button_toolbar).find(".control_button_group button.eraser").hasClass("active")){
			let parent_td = $(e.currentTarget).parent("td");
			if(parent_td.is('.word.freewrite')){
				parent_td.data("exercise_object").clear();
			}else if(parent_td.is('.word.stroke_practice')){
				parent_td.data("exercise_object").reset();
			};
		};
	});
	
	
	$(".download_book_img").on("click",function(e){
		html2canvas($(".exercise_block")[0]).then(canvas => {
		  var link = document.createElement('a');
		  link.download = 'exercise_block.png';
		  link.href = canvas.toDataURL();
		  link.click();
		});
	});
	
	$("#teacher_mode_toggle").on('change',function(e){
		if(e.currentTarget.checked){
			$(".exercise_teacher_page").css("pointer-events","");
		}else{
			$(".exercise_teacher_page").css("pointer-events","none");
		};
	});


	edit_exercise_book_modal.find(".add_exercise_page").on('click',function(e){
		add_new_word_toDB({"title":"新練習簿","words":"","is_deleted":false}).then((new_id)=>{
			$("#edit_exercise_book .exercise_page_area").append(exercise_page_temp(new_id,"新練習簿",""));
		});	
	});


	edit_exercise_book_modal.on('click', "button.remove_exercise_page, button.undo-delete",function(e){
		console.log(e);
		var card_el = $(e.currentTarget).closest(".card");
		let book_id = parseInt(card_el.attr("book_id"));
		get_words_byID_fromDB(book_id).then((data)=>{
			data["is_deleted"] = $(e.currentTarget).hasClass('remove_exercise_page');
			update_words_byID_toDB(data).then((d)=>{
				refresh_book_editor_fn();				
			});
		});
	});


	edit_exercise_book_modal.on('input','textarea.exercise_words, p.book_title',function(e){
		var card_el = $(e.currentTarget).closest(".card");
		var words = card_el.find(".exercise_words").val();
		var title = card_el.find(".book_title").text();
		
		let book_id = parseInt(card_el.attr("book_id"));
		get_words_byID_fromDB(book_id).then((data)=>{
			data["words"] = words;
			data["title"] = title;
			update_words_byID_toDB(data);
		});
	});
	
	edit_exercise_book_modal.on('change','#stroke_times, #write_times, #exercise_font_size',function(e){
		Storage.setItem("exercise_book/exercise_setting",JSON.stringify({"stroke_times":$("#stroke_times").val(), "write_times":$("#write_times").val(), "exercise_font_size":$("#exercise_font_size").val()}));
	});
	
	edit_exercise_book_modal.find("button.book-tab").on('click',function(e){
		refresh_book_editor_fn();
	});
	
	edit_exercise_book_modal.on('click','.apply_exercise_page',function(e){
		let card_el = $(e.currentTarget).closest(".card");

	});
	
	edit_exercise_book_modal_btobj.show();
};


