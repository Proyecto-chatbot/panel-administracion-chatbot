const ENTITY_PATTERN = /^(#)\w+|(\s#)\w+[\-\_\w]*/;

/**
* Parse the text into valid JSON for body request
* @param {*} userText
*/
exports.format_user_request = (userText)=>{
    if(typeof userText == 'string'){
        if(has_entity(userText)){
            return [format_entity(userText)];
        }else{
            return [{ data: [ { text: userText } ] }] ;
        }
	}else{
		let inputs = [];
		userText.forEach(element => {
            if(has_entity(element))
                inputs.push(format_entity(element));
            else
    			inputs.push({ data: [ { text: element } ] })
		});
		return inputs;
	}
}

/**
 * Check if the user Text contains some entity (@entity)
 * @param {String} userText
 */
let has_entity = (userText)=>{
    return ENTITY_PATTERN.test(userText);
}

/**
 * Include an entity into the user text
 * @param {String} userText
 */
let format_entity = (userText)=>{
    matches = ENTITY_PATTERN.exec(userText);
    entity = matches[0].trim();
    divided_text = userText.split(entity);
    let str = entity.slice(1,entity.length);
    formatted_text =
        {
            data: [
                {text : divided_text[0]+" "},
                {alias: str, meta: '@'+str, text: str,  userDefined : true },
                {text : " "+divided_text[1]}
            ]
        }
    ;
    return formatted_text;
}
