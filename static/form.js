let $btn_create;
let $btn_delete;
let $btn_add_question;
let $btn_submit;
let $name;
// El máximo de respuestas posibles son 10
const MAX_RESPONSES = 10;
// Contiene el número de respuestas añadidas
let numResponses;
let dropdown;
let dropdown_options;
let $select;
let hasImage;
let hasLink;
let parameters = [];
let $textResponse;
let $contextIn;
let $contextOut;
let init = function(){
	numResponses = 0;
	hasImage = false;
	$select = $('.select');
	dropdown = $('.dropdown-trigger');
	dropdown.dropdown();
	dropdown_options = $('.dropdown-content li a');
	$('.collapsible').collapsible();
	$contextIn = $('#contextIn');
	$contextOut = $('#contextOut');
	let intent_id;
	$btn_create = $('#btn_create');
	$btn_delete = $("#btn-delete-intent");
	$btn_add_question = $("#addUserText");
	$btn_submit = $('#submit');
	$btnAddVariant = $(".btnAddVariant");
	$btn_create.click(function(){
		$.get('/create');
	});
	$btn_delete.click(function(){
		intent_id = $("#input-id").val();
		$.post('/delete',{id : intent_id}, function(res){
			location.href = res;
		});
	});

	$btn_add_question.click(function(event){
		event.preventDefault();
		add_new_input($(this));
	});

	$(document).on('click','.btnAddVariant',function(event){
		event.preventDefault();
		add_new_variant($(this));
	});

	$btn_submit.click(function(event){
		event.preventDefault();
		send_intent();
	});
	dropdown_options.click(function(event){
		event.preventDefault();
		add_new_block($(this).prop('name'));
	})
}
/**
* Insert a new input for user says
*/
let add_new_input = ($input)=>{
	$input.before('<input class="user validate" name="user" type="text" >');
}
/**
* Insert a new block for bot response
*/
let add_new_block = (name) =>{
	switch(name){
		case 'type-text': add_new_response(); break;
		case 'type-gif': add_new_image("Gif");break;
		case 'type-image': add_new_image("Imagen"); break;
		case 'type-link': add_new_link("Link"); break;
		case 'type-document': add_new_link("Documento"); break;
	}
}
/**
* Insert a new block for type text response
*/
let add_new_response = function (){
	$textResponse = '<div class="bloq type-text input-field col s12"><p>Respuestas del chatbot</p>'
	+'<input class="response validate" type="text">'
	+'<button class="btnAddVariant btn-small waves-effect waves-light right"'
	+'name="addResponse">Añadir variante<i class="material-icons right">add</i></button></div>';
	if(checkNumResponses()){
		if(hasImage)
			$('.type-image').before($textResponse);
		else if(hasLink)
			$('.type-link').before($textResponse);
		else
			$select.before($textResponse);
		numResponses++;
	}
}
/**
 *  Insert a new block for type image/gif response
 */
let add_new_image = function (title){
	$imageResponse = '<div class="bloq type-image input-field col s12"><p>' + title +
	'</p><input class="response" name="gifResponse" type="text" class="validate"></div>'

	if(checkNumResponses()){
		if(hasLink)
			$('.type-link').before($imageResponse);
		else
			$select.before($imageResponse);
		numResponses++;
		hasImage = true;
		$('.image-li').css({pointerEvents: "none", color: "red"})
	}

}


/**
 *  Insert a new block for type link response
 */
let add_new_link = function(title){
	if(checkNumResponses()){
		$select.before('<div class="bloq type-link input-field col s12"><p>' + title + '</p>'+
		'<input class="response" id="linkResponse" type="text" class="validate">'+
		'<input class="url" id="linkUrl" type="text"  class="validate">'+
		'</div>');
		numResponses++;
		hasLink = true;
	}
}
/**
 * Insert a new variant for text response
 */
let add_new_variant = ($btn)=>{
	$btn.before('<input name="response'+numResponses+'" type="text" class=" response validate">');
}
/**
* Check that the number of answers is less than the maximum number of responses allowed
*/
let checkNumResponses = ()=>{
	return numResponses < MAX_RESPONSES;
}

/**
 * Check if there are some parameter in the text
 * @param {*} text 
 */
let search_parameter = (text)=>{
	PATTERN_PARAMETER = /[^\w]$\w+[\-\_\w]*/
	if(PATTERN_PARAMETER.test(text)){
		matches = PATTERN_PARAMETER.exec(text);
		param = matches[0].trim();
		parameter.push(	{ "dataType": "@"+param, "isList": false,
			"name": param,
			"value": "$"+param
		  })
	}
}
/**
*
*/
let send_intent = ()=>{
	let data = {};
	let botSays = [];
	let n_inputs = 0;
	let position = 0;
	let responses;
	let text;
	let type;
	context_in = $contextIn.val();
	context_out = $contextOut.val();
	name = $('#name').val();
	input_user = $('.user');
	input_user.each(function(){
		n_inputs++;
	});
	if(n_inputs > 1){
		userSays = [];
		input_user.each(function(index, element){
			userSays.push($(this).val());
		});
	}else{
		userSays = '';
		userSays = input_user.val();
	}
	$('.bloq').each(function(){
		if($(this).hasClass('type-text')){
			type = 'text';
		}
		if($(this).hasClass('type-image')){
			type = 'image';
		}
		if($(this).hasClass('type-link')){
			type = 'link';
		}
		responses = $(this).children('.response');

		if(responses.length > 1){
			text = [];
			responses.each(function(){
				search_parameter($(this).val());
				text.push($(this).val());
			});
		}else if(responses.length == 1){
			search_parameter(responses.val());
			text = responses.val();
		}
		if(type == 'link'){
			url = $(this).children('.url').val();
			botSays.push({ 'type': type, 'text': text, 'url': url});
		}
		else
			botSays.push({ 'type': type, 'text': text});

	});
	data = {
		"name": name,
		"user": userSays,
		"bot": botSays,
		"contextIn" : context_in,
		"contextOut" : context_out,
		"parameters" : parameters
	}

	$.post('/new_intent',data, function(res){
		location.href = res;
	});
}
$(init);