import * as hwcanvas_mod from "./create_write_canvas.js";
import {on_end_method} from "./utility.js";
export {create_write_canvas_classifier};

hwcanvas_mod.create_write_canvas.prototype.on_end = on_end_method;
var create_write_canvas_classifier = function(param){
	var default_param = {"wh":100,"mode":"bopomofo"};
	this.param = $.extend( {},default_param, param);
	this.drarw_obj = new hwcanvas_mod.create_write_canvas({"width":this.param.wh,"height":this.param.wh});
	
	
	this.drarw_obj.draw_enable = true;
	
	var _self = this;
	this.drarw_obj.on_end("clear",function(){
		_self.drarw_obj.draw_ctx.fillStyle = "white";
		_self.drarw_obj.draw_ctx.fillRect(0, 0, _self.drarw_obj.draw_canvas.width, _self.drarw_obj.draw_canvas.height);
	});
	
	this.drarw_obj.clear();
	
};

create_write_canvas_classifier.prototype.getMinBox = function(){
	var _self = this;
	var coorX = _self.drarw_obj.draw_path.map((s)=>s.map((p)=>p["coord"][0])).flat(1);
	var coorY = _self.drarw_obj.draw_path.map((s)=>s.map((p)=>p["coord"][1])).flat(1);
	//find top left corner 
	var min_coords = {
		x : Math.min.apply(null, coorX),
		y : Math.min.apply(null, coorY)
	};
   //find right bottom corner 
   var max_coords = {
		x : Math.max.apply(null, coorX),
		y : Math.max.apply(null, coorY)
   };
   return {
		min : min_coords,
		max : max_coords
   };
};

create_write_canvas_classifier.prototype.predict = function(pred_callback=null){
	var _self = this;
	if(_self.param.mode=="bopomofo"){
		import("/modules/model/bopomofo_handwrite_classifier.js").then(function(classfier_mod){
			classfier_mod.Warmup_check.then(function(){
				var mbb = _self.getMinBox();
				//var dpi = window.devicePixelRatio;
				var dpi=1;
				var imgData = _self.drarw_obj.draw_ctx.getImageData(mbb.min.x * dpi, mbb.min.y * dpi, Math.max((mbb.max.x - mbb.min.x) * dpi,1), Math.max((mbb.max.y - mbb.min.y) * dpi,1));
				_self.drarw_obj.draw_ctx.beginPath();
				_self.drarw_obj.draw_ctx.stroke();
				var max_imgdata_wh = Math.max(imgData.width,imgData.height);
				var tmp_canvas = document.createElement("canvas");
				tmp_canvas.setAttribute('width', max_imgdata_wh*1.2);
				tmp_canvas.setAttribute('height', max_imgdata_wh*1.2);
				tmp_canvas.classList.add("draw_canvas");
				var tmp_canvas_ctx = tmp_canvas.getContext('2d', { willReadFrequently: true });
				tmp_canvas_ctx.fillStyle = "white";
				tmp_canvas_ctx.fillRect(0, 0, tmp_canvas.width, tmp_canvas.height);
				tmp_canvas_ctx.putImageData(imgData, max_imgdata_wh/2 - (imgData.width/2) + max_imgdata_wh*0.1, max_imgdata_wh/2 - (imgData.height/2) + max_imgdata_wh*0.1);
				
				var imgData = tmp_canvas_ctx.getImageData(0,0,tmp_canvas.width,tmp_canvas.height);
				classfier_mod.predict(imgData).then((data)=>{
					if(_self.pred_callback!==null){
						_self.pred_callback(data);
					};
				});
				
			});
		});
	};
};


//var tmp = new create_write_canvas_classifier();
//$("body").append(tmp.drarw_obj.draw_canvas);

