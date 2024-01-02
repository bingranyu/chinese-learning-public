import {bert_vocab} from './model_info/model_info.js';
export {convert_tokens_to_ids};
// 將文字轉為Token id
var convert_tokens_to_ids = function(tokens){
	let processed_tokens = tokens;
	processed_tokens.unshift('[CLS]');
	processed_tokens.push('[SEP]');
	var input_ids = processed_tokens.map(function(v){
		if(v in bert_vocab){
			return bert_vocab[v];
		}else{
			return bert_vocab['[UNK]'];
		};
	});
	return input_ids;
};