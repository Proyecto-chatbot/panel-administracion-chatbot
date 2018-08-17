
let tool_search_parameter =(text) =>{
    PATTERN_PARAMETER = /^(#)\w+|(\s#)\w+[\-\_\w]*/
    return PATTERN_PARAMETER.test(text);
};

let tool_hasSynonym = () =>{
	let has = true;
	$('.synonym').each(function(){
		if($(this).val() == "")
			has = false;
	});
	return has;
}

let tool_responseIsEmpty = () =>{
	let isEmpty = false;
	$(".response").each(function(){
		if($(this).val() == "")
			isEmpty = true;
	});
	return isEmpty;
}

let tool_hasText = () =>{
	let has_text = false;
	$(".response").each(function(){
		if($(this).val() != "")
			has_text = true;
	})
	return has_text;
}

/**
* Check that the number of answers is less than the maximum number of responses allowed
*/
let tool_checkNumResponses = ()=>{
	if(numResponses >= MAX_RESPONSES){
		dropdown.hide();
		return false;
	}else{
		dropdown.show();
		return true;
	}
}