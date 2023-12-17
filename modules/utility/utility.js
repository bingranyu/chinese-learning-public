export {multiplyMatrices, matrixTranspose2D,RemToPixels,getScroll,bopomofo_template,on_end_method,zip,tonal_marks,bopomo_category,makeRequest};
// 矩陣相乘
function multiplyMatrices(m1, m2) {
    var result = [];
    for (var i = 0; i < m1.length; i++) {
        result[i] = [];
        for (var j = 0; j < m2[0].length; j++) {
            var sum = 0;
            for (var k = 0; k < m1[0].length; k++) {
                sum += m1[i][k] * m2[k][j];
            };
            result[i][j] = sum;
        };
    };
    return result;
};
// 矩陣轉置(2d)
function matrixTranspose2D(m){
	return m[0].map((_, colIndex) => m.map(row => row[colIndex]));
};

// rem大小轉px
function RemToPixels(rem) {    
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
};
// 取得當前頁面滾動的位置
var getScroll = function() {
    if (window.pageYOffset != undefined) {
        return [pageXOffset, pageYOffset];
    } else {
        var sx, sy, d = document,
            r = d.documentElement,
            b = d.body;
        sx = r.scrollLeft || b.scrollLeft || 0;
        sy = r.scrollTop || b.scrollTop || 0;
        return [sx, sy];
    };
};

// 注音
var bopomofo_template = [(s)=>`<div style="height: ${s}px;width: ${s*0.5}px;position: relative;">
    <div class="tone_2" style="width: ${s*0.1}px;height: ${s*0.1}px;position: absolute;top: ${s*0.25}px;left: ${s*0.1}px;"></div>
	<div class="bopomo_symbol1" style="width: ${s*0.3}px;height: ${s*0.3}px;position: absolute;top: ${s*0.35}px;left: 0px;"></div>
	<div class="tone_1" style="width: ${s*0.2}px;height: ${s*0.2}px;position: absolute;top: ${s*0.25}px;left: ${s*0.3}px;"></div>
</div>`,
(s)=>`<div style="height: ${s}px;width: ${s*0.5}px;position: relative;">
    <div class="tone_2" style="width: ${s*0.1}px;height: ${s*0.1}px;position: absolute;top: ${s*0.15}px;left: ${s*0.1}px;"></div>
	<div class="bopomo_symbol1" style="width: ${s*0.3}px;height: ${s*0.3}px;position: absolute;top: ${s*0.25}px;left: 0px;"></div>
	<div class="bopomo_symbol2" style="width: ${s*0.3}px;height: ${s*0.3}px;position: absolute;top: ${s*0.55}px;left: 0px;"></div>
	<div class="tone_1" style="width: ${s*0.2}px;height: ${s*0.2}px;position: absolute;top: ${s*0.4}px;left: ${s*0.3}px;"></div>
</div>`,
(s)=>`<div style="height: ${s}px;width: ${s*0.5}px;position: relative;">
    <div class="tone_2" style="width: ${s*0.1}px;height: ${s*0.1}px;position: absolute;top: 0px;left: ${s*0.1}px;"></div>
	<div class="bopomo_symbol1" style="width: ${s*0.3}px;height: ${s*0.3}px;position: absolute;top: ${s*0.1}px;left: 0px;"></div>
	<div class="bopomo_symbol2" style="width: ${s*0.3}px;height: ${s*0.3}px;position: absolute;top: ${s*0.4}px;left: 0px;"></div>
	<div class="bopomo_symbol3" style="width: ${s*0.3}px;height: ${s*0.3}px;position: absolute;top: ${s*0.7}px;left: 0px;"></div>
	<div class="tone_1" style="width: ${s*0.2}px;height: ${s*0.2}px;position: absolute;top: ${s*0.55}px;left: ${s*0.3}px;"></div>
</div>`];

// 給定音檔array，按照順序播放
var play_list_audio = function(audio_list){
	var wordlist = JSON.parse(JSON.stringify(audio_list));
	var loop_play_audio = function(){
		var fpath = wordlist.shift();
		var audio = new Audio(fpath);
		if(wordlist.length > 0){
			audio.addEventListener("ended",function() {
				loop_play_audio();
			});
		};
		audio.play();
	};
	loop_play_audio();
};

// 用來擴充class，當method結束時執行...
// 例如:
// this.drarw_obj.on_end("clear",function(){
//	...
// })
var on_end_method = function() {
	var onArgs = Array.prototype.slice.call(arguments);
	var originalFunction=this.__proto__[onArgs[0]];
	var givenCallback=onArgs[1];
	var callbackArgs=onArgs.slice(2);
    this.__proto__[onArgs[0]]=function() {
       var args = Array.prototype.slice.call(arguments);
       originalFunction.apply(this,args);
	   givenCallback.apply(this,callbackArgs);
    };
};

// 同 python zip
var zip= rows=>rows[0].map((_,c)=>rows.map(row=>row[c]));


// Bopomo變數
var tonal_marks = ["ˊ","ˇ","ˋ","˙"];
var bopomo_category = {};
"ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙ".split("").forEach((v)=>bopomo_category[v]=0);
"ㄧㄨㄩ".split("").forEach((v)=>bopomo_category[v]=1);
"ㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ".split("").forEach((v)=>bopomo_category[v]=2);


// 進行請求，與ajax不同在於可以處理下載進度、arraybuffer
// opts可用格式
// {method, url, responseType(opt), onprogress(opt), headers(opt), send其他params(opt)}
var makeRequest = function(opts) {
  return new Promise(function (resolve, reject) {
    var xmlHTTP = new XMLHttpRequest();
    xmlHTTP.open(opts.method, opts.url);
    xmlHTTP.responseType = opts.responseType || 'text';
    xmlHTTP.onload = function(e) {
      if (xmlHTTP.status >= 200 && xmlHTTP.status < 300) {
        resolve(xmlHTTP.response);
      } else {
        reject({
          status: xmlHTTP.status,
          statusText: xmlHTTP.statusText
        });
      };  
    };
	if(opts.onprogress){
		xmlHTTP.onprogress = opts.onprogress;
	};
    xmlHTTP.onerror = function () {
      reject({
        status: xmlHTTP.status,
        statusText: xmlHTTP.statusText
      });
    };
    if (opts.headers) {
      Object.keys(opts.headers).forEach(function (key) {
        xmlHTTP.setRequestHeader(key, opts.headers[key]);
      });
    };
    var params = opts.params;
    // We'll need to stringify if we've been given an object
    // If we have a string, this is skipped.
    if (params && typeof params === 'object') {
      params = Object.keys(params).map(function (key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
      }).join('&');
    };
    xmlHTTP.send(params);
  });
};