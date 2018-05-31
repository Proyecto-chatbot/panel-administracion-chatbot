let $btn_create;
let $btn_delete_intent;
let $btn_delete_entity;
let $btn_add_question;
let $btn_submit;
let $btnAddSynonym;
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
var parameters = [];
let $textResponse;

let $contextIn;
let $contextOut;
let $btnDeleteVariant;
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
	$btn_delete_intent = $("#btn-delete-intent");
	$btn_delete_entity = $('#btn-delete-entity');
	$btn_add_question = $("#addUserText");
	redeclarate_btn_delete();
	$btn_submit = $('#submit');
	$btnAddVariant = $(".btnAddVariant");

	$('.data_text').each(function(){
		$span = $(this).children('span').text();
		$clean_span = $span.replace(/\s{2,}/g," ").replace(/\n/g,"").replace(/\t/g,"")
		$(this).children('input').prop('value',$clean_span);
	})
	$btnAddSynonym = $("#add-synonym").click(function(event){
		event.preventDefault();
		add_new_synonym();
	});
	$btn_create.click(function(){
		$.get('/create');
	});
	$btn_delete_intent.click(function(){
		intent_id = $("#input-id").val();
		$.post('/delete',{id : intent_id}, function(res){
			location.href = res;
		});
	});
	$btn_delete_entity.click(function(){
		entity_id = $("#entity-id").val();
		$.post('/delete_entity',{id : entity_id},function(res){
			location.href = res;
		});
	});
	$('#btn-create-entity').click(function(event){
		event.preventDefault();
		create_entity();
	});

	$('#open-edit-intent').click(function(event){
		//event.preventDefault();
		//entity_id = $('#input-id').val();
		//$.post('/edit',{id : entity_id});
	});
	$('#btn_edit_intent').click(function(event){
		event.preventDefault();
		intent_id = $("#input-id").val();
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
		responses = $(this).children('div').children('.response');

		if(responses.length > 1){
			text = [];
			responses.each(function(){
				str = $(this).val();
				if(search_parameter(str)){
					str = $(this).val().replace('#','$');
				text.push(str);
			});
		}else if(responses.length == 1){
			str = responses.val();
			if(search_parameter(str)){
				str = responses.val().replace('#','$');			
				text = str;
		}
		if(type == 'link'){
			url = $(this).children('div').children('.url').val();
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
		"parameters" : parameters,
		"id" : intent_id
	}
		$.post('/update',data,function(res){
			location.href = res;
		})
	})
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
 * Insert a new entity
 */
let create_entity = function(){
	let synonyms = [];
	$('.synonym').each(function(){
		synonyms.push($(this).val());
	});
	let data = {
		name : $('#name-entity').val(),
		synonyms: synonyms
	}
	$.post('/new_entity', data, function(res){
		location.href = res;
	});
}
/**
 *
 */
let redeclarate_btn_delete = () =>{
	$btnDeleteVariant = $('.btn-delete-variant');
	$btnDeleteVariant.click(function(event){
		event.preventDefault();
		$(this).parent('div').remove();
	})
}
/**
* Insert a new input for user says
*/
let add_new_input = ($input)=>{
	$input.before('<div><input class="user validate" name="user" type="text" > <button class="btn-delete-variant btn btn-primary indigo"><i class="material-icons">delete</i></button></div>');
	redeclarate_btn_delete();
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
	redeclarate_btn_delete();
}
/**
* Insert a new block for type text response
*/
let add_new_response = function (){
	$textResponse = '<div class="bloq type-text input-field col s12"><p>Respuestas del chatbot</p>'
	+'<div><input class="response validate" type="text"><button class="btn-delete-variant btn btn-primary indigo">'
	+'<i class="material-icons">delete</i></button></div>'
	+'<button class="btnAddVariant btn-small waves-effect waves-light right"'
	+'name="addResponse">Añadir variante<i class="material-icons right">add</i></button></div></div>';
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
	'</p><div><input class="response" name="gifResponse" type="text" class="validate">'
	+'<button class="btn-delete-variant btn btn-primary indigo"><i class="material-icons">delete</i></button></div></div>'

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
		'<div><input class="response" id="linkResponse" type="text" class="validate">'+
		'<input class="url" id="linkUrl" type="text"  class="validate"><button class="btn-delete-variant btn btn-primary indigo">'
		+'<i class="material-icons">delete</i></button></div></div>');
		numResponses++;
		hasLink = true;
	}
}
/**
 * Insert a new variant for text response
 */
let add_new_variant = ($btn)=>{
	$btn.before('<div><input name="response'+numResponses+'" type="text" class=" response validate">'
	+'<button class="btn-delete-variant btn btn-primary indigo"><i class="material-icons">delete</i></button></div>');
}
/**
 * Insert a new synonym
 */
let add_new_synonym =()=>{
	$btnAddSynonym.before('<input class="synonym" name="sinonym" type="text" class="validate">');
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
	PATTERN_PARAMETER = /[^\w]#\w+[\-\_\w]*/
	return PATTERN_PARAMETER.test(text);
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
		responses = $(this).children('div').children('.response');

		if(responses.length > 1){
			text = [];
			responses.each(function(){
				str = $(this).val();
				if(search_parameter(str)){
					str = $(this).val().replace('#','$');
				}			
				text.push(str);
			});
		}else if(responses.length == 1){
			str = responses.val();
			if(search_parameter(str)){
				str =responses.val().replace('#','$');
			}
			text = str;
		}
		if(type == 'link'){
			url = $(this).children('div').children('.url').val();
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