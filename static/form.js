let $btn_create_gif;
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
let entities;
let $select;
let hasImage;
let hasLink;
var parameters = [];
let $textResponse;
let $inputSearch;

let $contextIn;
let $contextOut;
let $btnDeleteVariant;
let intents;
let init = function(){
	numResponses = 0;
	$.post('/get_intents', function(res){
		intents = res;
		console.log(intents)
	});
	hasImage = false;
	hasLink = false;
	$select = $('.select');
	dropdown = $('.dropdown-trigger');
	dropdown.dropdown();
	$('.dropdown-create').dropdown();
	dropdown_options = $('.dropdown-content li a');
	$('.collapsible').collapsible();
	$contextIn = $('#contextIn');
	$contextOut = $('#contextOut');
	let intent_id;
	$btn_create_gif = $('#send_new_gif');
	$btn_delete_intent = $("#btn-delete-intent");
	$btn_delete_entity = $('#btn-delete-entity');
	$btn_add_question = $("#addUserText");
	redeclarate_btn_delete();
	$btn_submit = $('#submit');
	$btnAddVariant = $(".btnAddVariant");
	checkType();
	redeclare_input_search();
	transform_edit_responses();
	$('.data_text').each(function(){
		$span = $(this).children('.span-hide').text();
		$clean_span = $span.replace(/\s{2,}/g," ").replace(/\n/g,"").replace(/\t/g,"")
		$(this).children('input').prop('value',$clean_span);
	})
	$btnAddSynonym = $("#add-synonym").click(function(event){
		event.preventDefault();
		add_new_synonym();
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

	$('#btn-edit-entity').click(function(event){
		event.preventDefault();
		edit_entity();
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
		"id": intent_id,
		"name": name,
		"user": userSays,
		"bot": botSays,
		"contextIn" : context_in,
		"contextOut" : context_out,
		"parameters" : parameters
	}

	$.post('/update',data, function(res){
		location.href = res;
	});
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
	$btn_create_gif.click(function(event){
		event.preventDefault();
		send_gif_intent();
	})
	dropdown_options.click(function(event){
		event.preventDefault();
		add_new_block($(this).prop('name'));
	})
	$('#dropdown-c li a').click(function(event){
		window.location.href= $(this).prop('href');
	});

	$('#search-intent').keyup(function(){
		let stringSearch = $(this).val();
		console.log(stringSearch);
		$.when($('.intent').remove()).then(
			intents.forEach(function(value){
				if(value.name.startsWith(stringSearch)){
					console.log('value name: ' + value.name)
					$('#list_intent').append('<a class="collection-item intent" id="intent" href="'+value.id+'">'+value.name+'</a>')					
				}
			})
		)
	});
}
/**
 *
 */
let redeclare_input_search = function(){
	let ul;
	$inputSearch = $(".input");
	$(".input-field ul").hide();
	$inputSearch.keyup(function(e){
		if(e.keyCode == 8)
			if($(this).val().indexOf('#') != -1)
				$(this).siblings('.span').html('');
	});
	$inputSearch.keypress(function(e){
		if($(this).val().indexOf('#') != -1)
			$(this).siblings('.span').html('');
		if(String.fromCharCode(e.which) == '#'){
			if($(this).val().indexOf('#') > -1)
				$(this).siblings('.span').html('No puedes usar más de una entidad en la misma frase');
			else{
				$(this).siblings('.span').html('');
				ul = $(this).parent('div').children('ul');
				ul.show();
				showAll(ul);
			}

		}
	});
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
 * Insert a new entity
 */
let edit_entity = function(){
	let synonyms = [];
	$('.synonym').each(function(){
		synonyms.push($(this).val());
	});
	let data = {
		id :  $('#id-entity').val(),
		name : $('#name-entity').val(),
		synonyms: synonyms
	}

	$.post('/edit_entity', data, function(res){
		location.href = res;
	});
}
let filter = (string)=>{
	return entities.filter(el => el.toLowercase().indexOf(string.toLowercase()) > -1);
}
/**
 * Search entity
 */
let searchEntity = function(input_value){
	var data = {};
	data.stringSearch = filter(input_value)[0];

}

/**
 * Search entity
 */
let showAll = function(ul){
	ul.children('li').remove();
	ul.children('.search').remove();
    $.post('/show_entities', function(res){
		let $inputSearch;
		ul.append('<input class= "search" type = "text">');
		console.log(res);
		entities = res;
		$inputSearch = ul.children('.search');
		$inputSearch.focus();
		entities.forEach(element => {
			ul.append('<li class="collection-item"><a href="">'+element+'</a></li>');
		});
		putLinkEvent(ul);
		$inputSearch.keyup(function(e){
			$(this).siblings('li').remove();
			search($(this).val().toLowerCase(), $(this).parent('ul'));
		});
		putLinkEvent(ul);
    });
}

let putLinkEvent = (ul)=>{
	ul.children('li').children('a').click(function(event){
		event.preventDefault();
		getEntity($(this));
	});
}

let getEntity = (linkEntity)=>{
	let input = linkEntity.parent('li').parent('ul').siblings('input');
	let inputVal = input.val();
	let newText = inputVal.replace(/(#)(\w)*/, '#'+linkEntity.html());
	console.log(newText);
	$.when(input.val(newText)).then(function(){
		linkEntity.parent('li').parent('ul').children('li, .search').remove();
	}).then(linkEntity.parent('li').parent('ul').hide());
}

let search = (word, ulParent) =>{
	console.log(word);
	entities.forEach(element => {
		if (element.toLowerCase().indexOf(word) >= 0)
			ulParent.append('<li class="collection-item"><a href="">'+element+'</a></li>');
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
	$input.before('<div><input class="input user validate" name="user" type="text" ><span class="span red-text"></span><ul class="collection"></ul><button class="btn-delete-variant btn btn-primary indigo"><i class="material-icons">delete</i></button></div>');
	redeclarate_btn_delete();
	redeclare_input_search();
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
let checkType = () =>{
	let $typeText = $('.type-text');
	if($('.type-image').length > 0){
		hasImage = true;
		numResponses++;
	}
	if($('.type-link').length > 0){
		hasLink = true;
		numResponses++;
	}
	if($typeText.length > 0){
		$typeText.each(function(){
			numResponses++;
		});
	}
}
/**
* Insert a new block for type text response
*/
let add_new_response = function (){
	$textResponse = '<div class="bloq type-text input-field col s12"><p>Respuestas del chatbot</p>'
	+'<div><input class="response validate input" type="text"><span class="span red-text"></span>'
	+'<ul class="collection"></ul><button class="btn-delete-variant btn btn-primary indigo"><i class="material-icons">delete</i></button></div>'
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
	redeclare_input_search();
}
/**
 *  Insert a new block for type image/gif response
 */
let add_new_image = function (title){
	$imageResponse = '<div class="bloq type-image input-field col s12"><div><p>'
	+ title + '</p><input class="response" name="gifResponse" type="text" class="validate">'
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
		$select.before('<div class="bloq type-link input-field col s12"><div><p>'
		+ title + '</p><input class="response" id="linkResponse" type="text" class="validate">'
		+'<input class="url" id="linkUrl" type="text"  class="validate"><button class="btn-delete-variant btn btn-primary indigo">'
		+'<i class="material-icons">delete</i></button></div></div>');
		numResponses++;
		hasLink = true;
	}
}
/**
 * Insert a new variant for text response
 */
let add_new_variant = ($btn)=>{
	$btn.before('<div><input name="response'+numResponses+'" type="text" class="input response validate"><span class="span red-text"></span><ul class="collection"></ul>'
	+'<button class="btn-delete-variant btn btn-primary indigo"><i class="material-icons">delete</i></button></div>');
	redeclare_input_search();
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
let send_gif_intent = ()=>{
	let data = {};
	let n_inputs = 0;

	name = $('#name').val();
	tag = $('.tag_gif').val();
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
	data = {
		"name": name,
		"user": userSays,
		"action" : tag
	}

	$.post('/new_gif_intent',data, function(res){
		location.href = res;
	});
}
let transform_edit_responses = ()=>{
	    $('.edit-responses .response').each(function(){
            let original = $(this).val();
			$(this).val(original.replace(/[$]/,' #'));
        });

}
$(init);