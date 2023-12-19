import * as fontsvg_mod from "./create_svg_font.js";
import * as hwcanvas_mod from "./create_write_canvas.js";
import {multiplyMatrices, matrixTranspose2D, redraw_path} from "./utility.js";
export {handwrite_practice};


//handwrite_practice
var handwrite_practice = function(param){
	var default_param = {"font_str":null,"wh":100,"stokewidth":null,"stokeCheckwidth":null};
	this.param = $.extend( {},default_param, param);
	if(this.param.stokeCheckwidth === null){
		this.param.stokeCheckwidth = this.param.wh/8;
	}else{
		this.param.stokeCheckwidth = this.param.stokeCheckwidth;
	};
	if(this.param.font_str === null ){
		throw new Error('Parameter font_str is null');
	};
	// 建立容器
	this.practice_div = document.createElement("div");
	this.practice_div.style.position = "relative";
	this.practice_div.style.width = this.param.wh+"px";
	this.practice_div.style.height = this.param.wh+"px";
	this.practice_div.style.display = 'inline-block';
	this.practice_div.classList.add("font-practice-div");
	
	// 建立內容
	//  背景文字
	this.back_font_obj = new fontsvg_mod.create_svg_font(this.param.font_str,{"color":"#ddd","wh":this.param.wh});
	this.back_font_obj.back_canvas.position = "absolute";
	this.back_font_obj.back_canvas.style.top = 0;
	this.back_font_obj.back_canvas.style.left = 0;
	//  手寫畫布
	this.hand_write_obj = new hwcanvas_mod.create_write_canvas({"width":this.param.wh,"height":this.param.wh});
	this.hand_write_obj.draw_canvas.style.position = "absolute";
	this.hand_write_obj.draw_canvas.style.top = 0;
	this.hand_write_obj.draw_canvas.style.left = 0;
	
	// 組合
	this.practice_div.append(this.back_font_obj.back_canvas);
	this.practice_div.append(this.hand_write_obj.draw_canvas);
	
	this.hand_write_obj.draw_enable = true;
	
	// 提示筆畫
	this.tip_stroke_obj = new fontsvg_mod.create_svg_font(this.param.font_str,{"color":"#fcbdbd","n_stroke":0});
	
	
	// 紀錄當前寫到第幾筆畫
	this.current_stoke = 0;
	// 紀錄實際寫的路徑(僅正確)
	this.write_path = [];
	
	// 文字的追蹤點座標計算
	this.track_coords = [];
	this.track_coords_tip = [];
	var _self = this;
	this.back_font_obj.deffered_obj.done(function(){
		for(var j=0;j<_self.back_font_obj.tracklist.length;j++){
			_self.track_coords = _self.track_coords.concat([_self.AddTrackPoint_single(j)]);
			_self.track_coords_tip = _self.track_coords_tip.concat([[..._self.back_font_obj.tracklist[j].children].map((v)=>[parseFloat(v.getAttribute("x"))*_self.back_font_obj.font_ratio,parseFloat(v.getAttribute("y"))*_self.back_font_obj.font_ratio])]);
		};
	});
	
	// 將 callback 寫入
	this.hand_write_obj.draw_end_callback = function(){
		
		if(_self.checkStoke()){
			_self.write_path.push(_self.hand_write_obj.draw_path[_self.hand_write_obj.draw_path.length-1]);
			_self.current_stoke++;
		};
		_self.reset(_self.current_stoke);
		redraw_path(_self.write_path, _self.hand_write_obj.draw_canvas);
		
		if(_self.current_stoke == _self.track_coords.length){
			_self.hand_write_obj.draw_enable = false;
		}
	};
	//初始
	this.tip_stroke_obj.deffered_obj.done(function(){
		_self.hand_write_obj.draw_ctx.drawImage(_self.tip_stroke_obj.back_canvas,0,0,_self.param.wh,_self.param.wh);
		_self.hand_write_obj.draw_ctx.globalCompositeOperation = "source-atop";
	});
};

// 確認筆畫是否有跟著追蹤點走
handwrite_practice.prototype.checkStoke = function(){
	var _self = this;
	var trackstorke = _self.track_coords[_self.current_stoke];
	var vaild_array = [];
	var draw_path = _self.hand_write_obj.draw_path[_self.hand_write_obj.draw_path.length-1];
	
	let trackstorke_formated = trackstorke.map((t)=>({"coord":t}));
	let path_dist = _self.distancepathpath(trackstorke_formated,draw_path);
	//console.log("check_path_distance",path_dist);
	let track_len = _self.pathlength(trackstorke_formated);
	let draw_len = _self.pathlength(draw_path);
	//console.log("check_path_length",track_len,draw_len,Math.abs(track_len-draw_len)/track_len);
	//console.log("check_path_length2",track_len,draw_len,Math.abs(track_len-draw_len));
	
	let s_dist = Math.sqrt(Math.pow(trackstorke_formated[0].coord[0] - draw_path[0].coord[0],2)+Math.pow(trackstorke_formated[0].coord[1] - draw_path[0].coord[1],2));
	let e_dist = Math.sqrt(Math.pow(trackstorke_formated[0].coord[0] - draw_path[draw_path.length-1].coord[0],2)+Math.pow(trackstorke_formated[0].coord[1] - draw_path[draw_path.length-1].coord[1],2));
	
	
	// path_dist*track_len <= 5 or path_dist < 0.15 // 筆畫相似性、及追蹤長度加權
	// Math.abs(track_len-draw_len) < 10 //差距在格子長寬10%
	// s_dist < e_dist // 筆畫順序正確
	var check_result = ((path_dist*track_len <= 5) || (path_dist < 0.15)) && (Math.abs(track_len-draw_len)<10) && (s_dist < e_dist);
	
	//console.log(s_dist,e_dist);
	

	
	//console.log("check_path_distance2",path_dist*track_len);
	
/*
	
	for(var i=0;i<draw_path.length;i++){
		let vaild_ele = trackstorke.map((v1)=>Math.sqrt((v1[0]-draw_path[i]["coord"][0])**2+(v1[1]-draw_path[i]["coord"][1])**2)<_self.param.stokeCheckwidth);
		vaild_array = vaild_array.concat([vaild_ele]);
	};
	var check_result = true;
	if(vaild_array[0][0] == false){
		check_result = false;
	};
	for(var i=0;i<(vaild_array.length-1);i++){
		let min_1 = Math.min(...vaild_array[i].map(function(v,i){return v ? i : null}));
		let max_1 = Math.max(...vaild_array[i].map(function(v,i){return v ? i : null}));
		let min_2 = Math.min(...vaild_array[i+1].map(function(v,i){return v ? i : null}));
		let max_2 = Math.max(...vaild_array[i+1].map(function(v,i){return v ? i : null}));
		if((min_2 < min_1) || (max_2 < max_1)){
			check_result = false;
		};
	};
	let last_vaild_line = vaild_array[vaild_array.length-1];
	if(last_vaild_line[last_vaild_line.length-1] == false){
		check_result = false;
	};
	*/
	return check_result;
};

// 單一筆畫填滿Track點
handwrite_practice.prototype.AddTrackPoint_single = function(trackidx,d=null){
	var _self = this;
	var track_line = _self.back_font_obj.tracklist[trackidx];
	var coord_list = [...track_line.children].map((v)=>[parseFloat(v.getAttribute("x"))*_self.back_font_obj.font_ratio,parseFloat(v.getAttribute("y"))*_self.back_font_obj.font_ratio]);
	var track_coord = [coord_list[0]];
	for(var i=0;i<(coord_list.length-1);i++){
		var pts = _self.AddTrackPoint_pair(coord_list[i],coord_list[i+1],d);
		pts = pts.concat([coord_list[i+1]]);
		track_coord = track_coord.concat(pts);
	};
	
	return track_coord;
};

// 在兩點Track中間增加Track點，d: 每隔幾個px繪畫一個點
handwrite_practice.prototype.AddTrackPoint_pair = function(coord1,coord2,d=null){
	var _self = this;
	var dist_int = d;
	if(d==null){
		dist_int = _self.param.wh/20;
	};
	//計算 sin, cos
	var a = coord2[1] - coord1[1];
	var b = coord2[0] - coord1[0];
	var c = (b**2 + a**2)**0.5;
	var _sin = a/c;
	var _cos = b/c;
	var r_mat_inv = [[_cos,-1*_sin],[_sin,_cos]];
	var r_mat = [[_cos,_sin],[-1*_sin,_cos]];	
	
	var coord_r = matrixTranspose2D(multiplyMatrices(r_mat,matrixTranspose2D([coord1,coord2])));
	var num_pt = Math.abs(parseInt((coord_r[1][0] - coord_r[0][0])/dist_int));
	if(num_pt>0){
		var pt_dir = Math.sign(coord_r[1][0] - coord_r[0][0]);
		var pts_x = Array(num_pt).fill(dist_int).map((sum => value => sum += value)(0)).map((val)=>pt_dir*val+coord_r[0][0]);
		var coord_pts = matrixTranspose2D(multiplyMatrices(r_mat_inv,matrixTranspose2D(pts_x.map((v)=>[v,coord_r[0][1]]))));
	}else{
		var coord_pts = [];
	};
	return coord_pts;
};

// Debug用，顯示追蹤點
handwrite_practice.prototype.ShowTipPoints = function(show=true){
	if(typeof this.strokeTipPointSvg == 'undefined' ){
		this.strokeTipPointSvg = document.createElementNS(d3.namespaces.svg, 'svg');
		this.strokeTipPointSvg.setAttribute('width', this.param.wh);
		this.strokeTipPointSvg.setAttribute('height', this.param.wh);
		this.strokeTipPointSvg.style.pointerEvents = "none";
		this.strokeTipPointSvg.style.position = "absolute";
		this.strokeTipPointSvg.style.top = 0;
		this.strokeTipPointSvg.style.left = 0;
		// 將檢查點架構先建立
		for(var i=0;i<this.track_coords.length;i++){
			d3.select(this.strokeTipPointSvg).append("g").attr("class", "track_pt_group_"+String(i));
		};
	};
	

	// 先只考慮當前
	// 清除所有追蹤點
	d3.select(this.strokeTipPointSvg)
		.selectAll("g").html('');
	
	for(var itrackpt=0;itrackpt<this.track_coords[this.current_stoke].length;itrackpt++){
		d3.select(this.strokeTipPointSvg)
			.select(".track_pt_group_"+String(this.current_stoke)).style("display","block")
			.append("circle")
			.attr("class","checkpt-"+String(itrackpt))
			.attr("r",2)
			.attr("fill","red")
			.attr("cx",parseFloat(this.track_coords[this.current_stoke][itrackpt][0]))
			.attr("cy",parseFloat(this.track_coords[this.current_stoke][itrackpt][1]));
		d3.select(this.strokeTipPointSvg)
			.select(".track_pt_group_"+String(this.current_stoke))
			.select(".checkpt-"+String(itrackpt))
			.attr("fill","red");
	};
	this.practice_div.append(this.strokeTipPointSvg);
	
};

handwrite_practice.prototype.reset = function(current_stroke=0){
	var _self = this;
	_self.hand_write_obj.draw_ctx.globalCompositeOperation = "source-over";
	_self.current_stoke = current_stroke;
	_self.back_font_obj.SingleOutline(_self.track_coords.length-1,true);
	//for(var i=0;i<_self.current_stoke;i++){
	//	_self.back_font_obj.SingleOutline(i,true,false,"#000");
	//};
	_self.hand_write_obj.clear();
	if(current_stroke==0){
		_self.write_path = [];
	}else{
		_self.write_path = _self.write_path.slice(0,current_stroke);
		redraw_path(_self.write_path, _self.hand_write_obj.draw_canvas);
	};
	if(_self.current_stoke < _self.track_coords.length){
		_self.tip_stroke_obj.SingleOutline(_self.current_stoke);
		_self.hand_write_obj.draw_ctx.drawImage(_self.tip_stroke_obj.back_canvas,0,0,_self.param.wh,_self.param.wh);
		_self.hand_write_obj.draw_ctx.globalCompositeOperation = "source-over"; //source-atop | source-over
		_self.hand_write_obj.draw_enable = true;
	};
};

handwrite_practice.prototype.distancepathpath = function(path1, path2) {
	var _self = this;
    let sum = 0;
    for (const i in path1) {
        let minDist = Number.MAX_SAFE_INTEGER;
        for (const j in path2) {
            let dist = Math.sqrt(Math.pow(path1[i].coord[0] - path2[j].coord[0], 2) + Math.pow(path1[i].coord[1] - path2[j].coord[1], 2));
            if (dist < minDist) minDist = dist;
        };
        sum += minDist;
    };
    for (const i in path2) {
        let minDist = Number.MAX_SAFE_INTEGER;
        for (const j in path1) {
            let dist = Math.sqrt(Math.pow(path1[j].coord[0] - path2[i].coord[0], 2) + Math.pow(path1[j].coord[1] - path2[i].coord[1], 2));
            if (dist < minDist) minDist = dist;
        };
        sum += minDist;
    };
    return sum / (path1.length * path2.length * 2)*(100/_self.param["wh"]);
};

handwrite_practice.prototype.pathlength = function(path) {
	var _self = this;
	return Object.keys(path).map((k)=>(k>0) ? (Math.sqrt(Math.pow(path[k].coord[0] - path[k-1].coord[0],2) + Math.pow(path[k].coord[1] - path[k-1].coord[1],2))) : 0).reduce((partialSum, a) => partialSum + a, 0)*(100/_self.param["wh"]);

}