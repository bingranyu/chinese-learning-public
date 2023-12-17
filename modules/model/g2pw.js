import {g2pw_vocab, g2pw_labels, g2pw_monophonic_chars, g2pw_polyphonic_chars,g2pw_char2phonemes} from './../../modules/utility/g2pw_info.js';
import {makeRequest} from './../../modules/utility/utility.js';
//import * as ort from 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.16.2/dist/ort.es6.min.js';
export {Warmup_check, predict};
//console.log(ort);
ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/";

var model_db_request;
(function(){
	if (!('indexedDB' in window)) {
		console.log('瀏覽器不支援IndexedDB，所有變更、下載無法儲存')
		return;
	};
	model_db_request = idb.openDB('ModelDB', 1,{
		upgrade(upgradeDb){
			if (!upgradeDb.objectStoreNames.contains('model')) {
				upgradeDb.createObjectStore('model', { keyPath: 'model_name' });
			}
		}
	});
})();

let g2pw_session;
var prepare_data = function(sent){
	let sent_list = sent.split("");
	let partial_result = new Array(sent_list.length).fill(null);
	let texts = [];
	let query_ids = [];
	for(let i=0;i<sent_list.length;i++){
		if(g2pw_polyphonic_chars.includes(sent_list[i])){
			texts.push(sent);
			query_ids.push(i);
		}else if(sent_list[i] in g2pw_monophonic_chars){
			partial_result[i] = g2pw_monophonic_chars[sent_list[i]];
		};
	};
	return [texts, query_ids, partial_result];
};

var text_truncate = function(texts, query_ids, window_size=32){
	var truncated_texts = [];
	var truncated_query_ids = [];
	for(var i=0;i<query_ids.length;i++){
		var t = texts[i];
		var q = query_ids[i];
		var start = Math.max(0,Math.floor((q-window_size)/2));
		var end = Math.min(t.length,Math.floor(q+window_size/2));
		truncated_texts.push(t.substring(start,end));
		truncated_query_ids.push(q - start);
	}
	return [truncated_texts, truncated_query_ids];
};


var wordize_and_map = function(t){
	let words = [];
	let index_map_from_text_to_word = [];
	let index_map_from_word_to_text = [];

	let tmp_t = t;
	while(tmp_t.length>0){
	  let match_space = tmp_t.match(/^ +/);
	  if(!(match_space===null)){
		let space_str = match_space[0];
		index_map_from_text_to_word = index_map_from_text_to_word.concat(new Array(space_str.length).fill(null));
		tmp_t = tmp_t.substring(space_str.length);
		continue;
	  };
	  let match_en = tmp_t.match(/^[a-zA-Z0-9]+/);
	  if(!(match_space===null)){
		let en_word = match_en[0];
		let word_start_pos = index_map_from_text_to_word.length;
		let word_end_pos = word_start_pos + en_word.length;
		index_map_from_word_to_text.push([word_start_pos, word_end_pos]);
		index_map_from_text_to_word = index_map_from_text_to_word.concat(new Array(en_word.length).fill(words.length));
		words.push(en_word);
		tmp_t = tmp_t.substring(en_word.length);
	  }else{
		let word_start_pos = index_map_from_text_to_word.length;
		let word_end_pos = word_start_pos + 1;
		index_map_from_word_to_text.push([word_start_pos, word_end_pos]);
		index_map_from_text_to_word = index_map_from_text_to_word.concat([words.length]);
		words.push(tmp_t[0]);
		tmp_t = tmp_t.substring(1);
	  };
	};
	
	return [words, index_map_from_text_to_word, index_map_from_word_to_text];
};


var convert_tokens_to_ids = function(tokens){
	let processed_tokens = tokens;
	processed_tokens.unshift('[CLS]');
	processed_tokens.push('[SEP]');
	var input_ids = processed_tokens.map(function(v){
		if(v in g2pw_vocab){
			return g2pw_vocab[v];
		}else{
			return g2pw_vocab['[UNK]'];
		};
	});
	return input_ids;
};

var text_getitem = function(text, query_id){
	let [words, text2word, word2text] = wordize_and_map(text);
	let input_ids = convert_tokens_to_ids(words);
	let token_type_ids = new Array(words.length).fill(0);
	let attention_mask = new Array(words.length).fill(1);
	let query_char = text[query_id];
	let phoneme_mask = new Array(g2pw_labels.length).fill(0);
	g2pw_char2phonemes[query_char].forEach((v)=>phoneme_mask[v]=1);
	let char_id = g2pw_polyphonic_chars.indexOf(query_char);
	let position_id = text2word[query_id]+1;
    let outputs = {
            'input_ids': input_ids,
            'token_type_ids': token_type_ids,
            'attention_mask': attention_mask,
            'phoneme_mask': phoneme_mask,
            'char_id': char_id,
            'position_id': position_id
        };
	return outputs;
};

var get_batch_data = function(texts,query_ids){
	let input_ids = [];
	let token_type_ids = [];
	let attention_mask = [];
	let phoneme_mask = [];
	let char_id = [];
	let position_id = [];
	for(var idx=0;idx<query_ids.length;idx++){
		let sigle_out = text_getitem(texts[idx],query_ids[idx]);
		
		input_ids = input_ids.concat(sigle_out['input_ids']);
		token_type_ids = token_type_ids.concat(sigle_out['token_type_ids']);
		attention_mask = attention_mask.concat(sigle_out['attention_mask']);
		phoneme_mask = phoneme_mask.concat(sigle_out['phoneme_mask']);
		char_id = char_id.concat(sigle_out['char_id']);
		position_id = position_id.concat(sigle_out['position_id']);
	}
	let input_ids_len = input_ids.length/query_ids.length;
	let token_type_ids_len = token_type_ids.length/query_ids.length;
	let attention_mask_len = attention_mask.length/query_ids.length;
	let phoneme_mask_len = phoneme_mask.length/query_ids.length;
	
    let outputs = {
            'input_ids': new ort.Tensor('int64', input_ids, [query_ids.length, input_ids_len]),
            'token_type_ids': new ort.Tensor('int64', token_type_ids, [query_ids.length, token_type_ids_len]),
            'attention_mask': new ort.Tensor('int64', attention_mask, [query_ids.length, attention_mask_len]),
            'phoneme_mask': new ort.Tensor('float32', phoneme_mask, [query_ids.length, phoneme_mask_len]),
            'char_ids': new ort.Tensor('int64', char_id, [query_ids.length]),
            'position_ids': new ort.Tensor('int64', position_id, [query_ids.length])
        };
	return outputs;
};

const g2pwWarmup = async () => {
	var msgel = $(`
	<div class="alert alert-primary" role="alert" style="position: fixed;bottom: 0px;left: 50%;transform: translateX(-50%);z-index: 999;">
		<i class="fa-solid fa-spinner fa-spin"></i><span class='load_msg'> 注音模型下載中...</span>
		<div class="progress" role="progressbar" aria-label="Animated striped example" aria-valuemin="0" aria-valuemax="100">
			<div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 0%"></div>
		</div>
	</div>`);
	$("body").append(msgel);
	console.log('Loading model...');
	
	var model_dw_promise;
	model_dw_promise = model_db_request.then(function(model_db){
		var model_buff_request = model_db.transaction('model', 'readonly').store.get('g2pw_tiny');
		return model_buff_request.then((model_buff)=>model_buff['model_file']);
	}).then((model_buff)=>{
		if(!model_buff){
			return makeRequest({
				'method':'GET',
				'url':'./model/g2pw_tiny_int8.onnx',
				'responseType':'arraybuffer',
				'onprogress':function(pr){
						$(msgel).find('.progress-bar').css("width",String(Math.round(pr.loaded/pr.total*100))+'%');
					}
			}).then(function(model_buff){
				model_db_request.then(async (model_db)=>{
					const tx = model_db.transaction('model', 'readwrite');
					await tx.store.put(
						{'model_name':'g2pw_tiny',
						'model_file':model_buff,
						'upd_date':new Date().getTime()}
						);
				});
				return model_buff;
			});
			console.log(model_dw_promise);
		}else{
			return model_buff;
		};
	});
	
	return model_dw_promise.then(async function(model_buff){
		
		$(msgel).find('.load_msg').text('模型下載完成，載入中...');
		g2pw_session = await ort.InferenceSession.create(model_buff);
		// Warmup the model. This isn't necessary, but makes the first prediction
		//msgel.find("span").text('Warmup model ...')
		console.log('Warmup model ...');
		msgel.removeClass('alert-primary').addClass('alert-success');
		msgel.html(['<i class="fa-solid fa-check"></i>','<span>模型準備完成</span>']).delay(1000).fadeOut(()=>msgel.remove());
		console.log('Warmup completed ...');
	});

};

async function predict(sent) {
	let [texts, query_ids, partial_result] = prepare_data(sent);

	if(!partial_result.some(v=>v===null)){
		return partial_result;
	};
	let [ttexts, tquery_ids] = text_truncate(texts, query_ids);
	let feeds = get_batch_data(ttexts,tquery_ids);
	let results = await g2pw_session.run(feeds);
	let probs = [];
	let prob = [];
	let idx = 0;
	for(let i=0;i<results.probs.data.length;i++){
		if(parseInt(i/feeds.phoneme_mask.dims[1]) == idx){
			prob.push(results.probs.data[i]);
		}else{
			probs.push(prob);
			prob = [];
			prob.push(results.probs.data[i]);
			idx = parseInt(i/feeds.phoneme_mask.dims[1]);
		}
	}
	probs.push(prob);
	let preds = probs.map((p)=>p.indexOf(Math.max(...p)));
	preds = preds.map((v)=>g2pw_labels[v]);

	for(let i=0;i<tquery_ids.length;i++){
		partial_result[tquery_ids[i]] = preds[i];
	};
	
	return partial_result;
}

var Warmup_check = g2pwWarmup();

/*
Example
import('/modules/model/g2pw.js').then(function(g2pw){
	g2pw.Warmup_check.then(()=>g2pw.predict("重新來過").then((r)=>console.log(r)));
	g2pw.Warmup_check.then(()=>g2pw.predict("打了一個噴嚏").then((r)=>console.log(r)));
});

// (4) ['ㄔㄨㄥ2', 'ㄒㄧㄣ1', 'ㄌㄞ2', 'ㄍㄨㄛ4']
// (6) ['ㄉㄚ3', 'ㄌㄜ5', 'ㄧ2', 'ㄍㄜ5', 'ㄆㄣ1', 'ㄊㄧ4']

*/





