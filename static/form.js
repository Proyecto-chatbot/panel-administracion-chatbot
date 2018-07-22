/**
 * @author Nieves Borrero & Pablo León
 * @description Functionality of admin panel for the chatbot project
 */
let $btn_create_gif;
let $btn_delete_intent;
let $btn_delete_entity;
let $btn_add_question;
let $btn_submit;
let $btnAddSynonym;
let $btnDeleteSynonym;
let $btn_edit_gif;
let $btnDeny;
let $btn_add_bot;
let $btn_select_bot;

let $name;
let numLinks;
let dropdown;
let dropdown_options;
let entities;
let $select;
let hasImage;
let hasLink;
var parameters = [];
let $textResponse;
let $inputSearch;
let intent_id;
let $contextIn;
let $contextOut;
let $btnDeleteVariant;
let intents;
let entitiesNames;
/** Max of available responses */
const MAX_RESPONSES = 10;
/** count of responses added*/
let numResponses;

let init = function(){
	numResponses = 0;
	numLinks = 0;
	$.post('/get_intents', function(res){
		intents = res;
	});
	$.post('/get_entities', function(res){
		entities = res;
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
	$btn_create_gif = $('#send_new_gif');
	$btn_delete_intent = $("#btn-delete-intent");
	$btn_delete_entity = $('#btn-delete-entity');
	$btn_add_question = $("#addUserText");
	$btnAddSynonym = $("#add-synonym");
	$btnDeny = $(".deny");
	$btn_submit = $('#submit');
	$btnAddVariant = $(".btnAddVariant");
	$btn_edit_gif = $('#edit_gif');
	$btn_add_bot = $('#btn-add-bot');

	redeclarate_btn_delete_bloq();
	redeclarate_btn_delete();
	redeclarate_btn_delete_synonym();
	$btn_edit_gif.click(function(event){
		event.preventDefault();
		intent_id = $("#input-id").val();
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
			"id" : intent_id,
			"name": name,
			"user": userSays,
			"action" : tag
		}
		if(checkValidGif())
			$.post('/edit_gif_intent',data, function(res){
				location.href = res;
			});
		else
			setTimeout(function(){$('#name').focus()},200)
	})
	checkType();
	redeclare_input_search();
	transform_edit_responses();
	$('#name-entity').blur(checkEntityName);
	$('.synonym').blur(checkEmptySynonym);
	$('#name').blur(function(){
	   	msg_error = $(this).val() == '' ? 'No se puede crear un intent sin nombre' : '';
	   	$('#err-name').html(msg_error);
		checkGifName();
	});
	$('.user').blur(checkGifInputs);
	$('#first-question').blur(function(){
		msg_error_user = $(this).val()== 'No se puede crear un intent sin frases de usuario' ? '' :
		$('#err-user').html(msg_error_user);
	});
	$('#input-tag').blur(checkGifTag);

	$('.data_text').each(function(){
		$span = $(this).children('.span-hide').text();
		$clean_span = $span.replace(/\s{2,}/g," ").replace(/\n/g,"").replace(/\t/g,"")
		$(this).children('input').prop('value',$clean_span);
	})
	
	$('#btn_edit_intent').click(function(event){
		event.preventDefault();
		edit_intent();
		});


	$('#search-intent').keyup(function(){
		let stringSearch = $(this).val().toLowerCase();
		$.when($('.intent').remove()).then(
			intents.forEach(function(value){
				if(value.name.toLowerCase().indexOf(stringSearch) >= 0){
					$('#list_intent').append('<a class="collection-item indigo-text intent" id="intent" href="'+value.id+'">'+value.name+'</a>')
				}
			})
		)
	});

	$('#search-entity').keyup(function(){
		let stringSearch = $(this).val().toLowerCase();
		$.when($('.entity').remove()).then(
			entities.forEach(function(value){
				if(value.name.toLowerCase().indexOf(stringSearch) >= 0){
					$('#list_entity').append('<a class="collection-item entity indigo-text" id="entity" href="/entities/'+value.id+'">'+value.name+'</a>')
				}
			})
		)
	});

	$('.hidden').each(function(){
        access = $(this).prop('value');
		$iconAdmin = $(this).parent().children(".divd").children('button').children('i');
        if(access == '1'){
			$iconAdmin.html('close');
		}else if(access == '0'){
			$iconAdmin.html('done');
        }else{
            $iconAdmin.parent().parent().parent().remove();
        }
    });

	$btn_select_bot = $('.token');
    set_click_events();
}
/** On click events */
let set_click_events = () =>{
	
	$btn_add_bot.click(function(event){
		event.preventDefault();
		let name = $('#input-bot').val();
		let token = $('#input-token').val();
		$.post('/add',{name :name,token:token},function(res){
			location.href = res;
		})
	})

	$btnAddSynonym.click(function(event){
		event.preventDefault();
		add_new_synonym();
	});

	$btn_delete_intent.click(function(){
		intent_id = $("#input-id").val();
		$.post('/delete',{id : intent_id}, function(res){
			location.href = res;
		});
	});
	$('#btn-login').click(login);
	$('#btn-register').click(register);
	$('#cancel').click(function(){
		location.href = './';
	});
	$btn_delete_entity.click(function(){
		entity_id = $("#id-entity").val();
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
	$btnDeny.click(function(){
		let id = $(this).prop('id');
		let mail = $(this).parent('div').siblings('.mail').html();
		let url;
		let $iconClick = $(this).children('i');
		if($iconClick.html() == 'done'){
			url = '/validate';
		}else{
			console.log('entra');
			url = '/deny';
		}

		$.post(url, {'id': id, 'mail': mail}, function(response) {
			$.when(console.log(response)).then(location.href='/validate');
		});
	});	

	$btn_select_bot.click(function(event){
		event.preventDefault();
		console.log('clicked');
		let token = $(this).prop('id');
		$.post('/select',{token : token}, function(response){
			location.href = response;
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
}
/**
 * Check user and password
 * @param {*} event
 */
let login = function(event){
	event.preventDefault();
	let inputUser = $("#input-name-user").val();
	let inputPassword = $("#input-password").val();
	$.post('/login',{user: inputUser, password: inputPassword}, function(response){
	if(typeof response == 'string')
		location.href='/';
	else
		$("#span").html('Usuario o contraseña incorrecta');
	});
	}
/**
 * Create a new user
 * @param {*} event
 */
	let register = function(event){
		event.preventDefault();
		let inputUser = $("#input-user-r").val();
		let inputPassword = $("#input-password-r").val();
		let inputPassword2 = $("#input-password2-r").val();
		let $errPasswd = $('#errPasswd');
		if(inputPassword !== inputPassword2){
			$errPasswd.html("Las contraseñas no coinciden");
		}else{
			$errPasswd.html("");
			$.post('/register',{'data':{u: inputUser, p : inputPassword}}, function(response){
			if(response == 'ok'){
			$errPasswd.html("Registrado con éxito. En breve su registro será validado por un administrador.").css('color', 'green');
			setTimeout(function(){
				location.href = '/login';
			},2500);
		}
		else
		console.log(response);
		});
	}
}
/**
 * Allow to keep functionality for input search
 */
let redeclare_input_search = function(){
	let ul;
	$inputSearch = $(".input");
	$(".input-field ul").hide();
	$(".input").parent('div').children('ul').children('a').remove();
	$(".input").parent('div').children('ul').children('.search').remove();

	$inputSearch.keyup(function(e){
		if(e.keyCode == 8){
			if($(this).val().indexOf('#') != -1)
				$(this).siblings('.span').html('');
		}
	});
	$inputSearch.unbind('keypress').bind('keypress',function(e){
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
	checkEmptySynonym();
	checkEntityName();
	if($('#err-entity-syn').html() == "" && $('#err-entity-name').html() == "")
	$.post('/new_entity', data, function(res){
		location.href = res;
	});
	else
	setTimeout(function(){$('#name-entity').focus();},200);
}
/**
 * @return boolean the existence of synonyms
 */
let hasSynonym = () =>{
	let has = true;
	$('.synonym').each(function(){
		if($(this).val() == "")
			has = false;
	});
	return has;
}
/**
 * show error message if the entity hasnt any synonym
 */
let checkEmptySynonym = ()=>{
	$('#err-entity-syn').html(hasSynonym()? "":"La entidad no se puede crear con sinónimos vacíos");
}
/**
 * show error message if the entity hasnt a name
 */
let checkEntityName = ()=>{
	$('#err-entity-name').html($('#name-entity').val() == "" ? "La entidad no se puede crear sin un nombre" : "");
}

/**
 * Edit an intent
 */
let edit_intent = function(){
	intent_id = $("#input-id").val();
	let data = {};
	let botSays = [];
	let n_inputs = 0;
	let responses =[];
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

	if(data.name == ""){
		$('#name').focus();
		$('#err-name').html('No se puede crear un intent sin nombre');
	}
	else if(data.userSays == ""){
		if(data.name != "")
		$('.user').focus();
		$('#err-user').html('No se puede crear un intent sin frases de usuario');
	}
	else if($.isArray(data.userSays)){
		if( data.userSays.filter(word => word != "").length == 0)
			$('#err-user').html('No se puede crear un intent sin frases de usuario');
		else if(responses.length == 0)
			$('#err').html('No se puede crear un intent sin respuestas de chatbot');
		else if( hasText() == false)
			$('#err').html('No se puede crear un intent sin respuestas de chatbot');
		else if(responseIsEmpty() == true)
			$('#err').html('No puedes mandar respuestas del chatbot vacías, si no la vas a usar borralá');
		else
			$.post('/new_intent',data, function(res){
				location.href = res;
		});
	}
	else if(responses.length == 0)
		$('#err').html('No se puede crear un intent sin respuestas de chatbot');
	else if( hasText() == false)
		$('#err').html('No se puede crear un intent sin respuestas de chatbot')
	else if(responseIsEmpty() == true)
		$('#err').html('No puedes mandar respuestas del chatbot vacías, si no la vas a usar borralá');
	else
		$.post('/update',data, function(res){
			location.href = res;
		});
}
 
/**
 * Edit an entity
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
	$.when(function(){
		ul.children('a').remove();
		ul.children('.search').remove();
	}).then(function(){
		$.post('/show_entities', function(res){
			let $inputSearch;
			ul.append('<input class= "search" type = "text">');
			entitiesNames = res;
			$inputSearch = ul.children('.search');
			$inputSearch.bind('keydown',function(e){
				if ( e.which == 27 ) {
					ul.children('a').remove();
					ul.children('.search').remove();
					ul.hide();
					let newText = ul.siblings('.input').val().replace(/(#)(\w)*/, '');
					ul.siblings('.input').val(newText);
				};
			});

			$inputSearch.focus();
			entitiesNames.forEach(element => {
				ul.append('<a class="collection-item indigo-text" href="#">'+element+'</a>');
			});
			putLinkEvent(ul);
			$inputSearch.keyup(function(e){
				$(this).siblings('a').remove();
				search($(this).val().toLowerCase(), $(this).parent('ul'));
			});
		}).done(function(res){
			//putLinkEvent(ul);
		});
	})
}
/**
 * recover the selected entity
 * @param {*} ul
 */
let putLinkEvent = (ul)=>{
	ul.children('a').on('click',function(event){
		event.preventDefault();
		getEntity($(this));
	});
}
/**
 * Insert the selected entity into the input text
 * @param {*} linkEntity
 */
let getEntity = (linkEntity)=>{
	let input = linkEntity.parent('ul').siblings('input');
	let inputVal = input.val();
	let newText = inputVal.replace(/(#)(\w)*/, '#'+linkEntity.html());
	$.when(input.val(newText)).then(function(){
		linkEntity.parent('ul').empty();//children('li, .search').remove();
	}).then(linkEntity.parent('ul').hide());
}
/**
 * Live search
 * @param {*} word
 * @param {*} ulParent
 */
let search = (word, ulParent) =>{
	entitiesNames.forEach(element => {
		if (element.toLowerCase().indexOf(word) >= 0)
			ulParent.append('<a class="collection-item indigo-text" href="">'+element+'</a>');
	});
	ulParent.children('a').on('click',function(){
		return false;
	})
	putLinkEvent(ulParent);
}

/**
* Allow to keep functionality for delete_block button
 */
let redeclarate_btn_delete_bloq = () =>{
	$btnDeleteBloq = $('.btn-delete-bloq');
	$btnDeleteBloq.click(function(event){

		event.preventDefault();
		numResponses--;
		checkNumResponses();
		$(this).parent('div').remove();
	})
}
/**
 * Allow to keep functionality for delete button
 */
let redeclarate_btn_delete = () =>{
	$btnDeleteVariant = $('.btn-delete-variant');
	$btnDeleteVariant.click(function(event){
		event.preventDefault();
		$(this).parent('div').remove();
	})
}
/**
* Allow to keep functionality for delete_synonym button
 */
let redeclarate_btn_delete_synonym = () =>{
	$btnDeleteSynonym = $('.btn-delete-synonym');
	$btnDeleteSynonym.click(function(event){
		event.preventDefault();
		$(this).parent('div').remove();
	})
}
/**
* Insert a new input for user says
*/
let add_new_input = ($input)=>{
	$input.before('<div><input class="input user validate" name="user" type="text" ><p class="span red-text"></p><ul class="collection"></ul><button class="btn-delete-variant btn btn-primary indigo"><i class="material-icons">delete</i></button></div>');
	redeclarate_btn_delete();
	redeclare_input_search();
}
/**
* Insert a new block for bot response
*/
let add_new_block = (name) =>{
	switch(name){
		case 'type-text': add_new_response(); break;
		case 'type-gif': add_new_image("Imagen/Gif");break;
		case 'type-image': add_new_image("Imagen/Gif"); break;
		case 'type-link': add_new_link("Link/Documento"); break;
		case 'type-document': add_new_link("Lnk/Documento"); break;
	}
	redeclarate_btn_delete_bloq();
	redeclarate_btn_delete();
	$('#err').html('');
}
/**
 *
 */
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
	+'<div><input class="response validate input" id="input'+numResponses+'" type="text"><p class="span red-text"></p>'
	+'<ul class="collection"></ul></div>'
	+'<button class="btnAddVariant indigo btn-small waves-effect waves-light right"'
	+'name="addResponse">Añadir variante<i class="material-icons right">add</i></button>'
	+'<button class="btn-delete-bloq btn btn-primary indigo left">Borrar respuesta</button></div></div>';
	if(checkNumResponses()){
		if(hasImage)
			$('.type-image').before($textResponse);
		else if(hasLink)
			$('.type-link').before($textResponse);
		else
			$select.before($textResponse);
		checkNumResponses();
		setTimeout(function(){
			$("#input"+numResponses).focus();
			numResponses++;
		}, 200);

	}
	redeclare_input_search();
}
/**
 *  Insert a new block for type image/gif response
 */
let add_new_image = function (title){
	$imageResponse = '<div class="bloq type-image input-field col s12"><div><p>'
	+ title + '</p><input class="response" name="gifResponse" type="text" id="input'+numResponses+'" class="validate">'
	+'<button class="btn-delete-bloq btn left btn-primary indigo">Borrar respuesta</button></div></div>'

	if(checkNumResponses()){
		if(hasLink)
			$('.type-link').before($imageResponse);
		else
			$select.before($imageResponse);
		setTimeout(function(){
				$("#input"+numResponses).focus();
				numResponses++;
			}, 200);
		hasImage = true;
		$('.image-li').css({pointerEvents: "none", color: "red"})
		checkNumResponses();
	}

}
/**
 *  Insert a new block for type link response
 */
let add_new_link = function(title){
	if(checkNumResponses()){
		$select.before('<div class="bloq type-link input-field col s12"><div><p>'
		+ title + '</p><input class="response" id="linkResponse'+numLinks+'" type="text" class="validate">'
		+'<input class="url" id="linkUrl" type="text"  class="validate"><button class="btn-delete-bloq left btn btn-primary indigo">'
		+'Borrar respuesta</button></div></div>');
		numResponses++;
		setTimeout(function(){
			$("#linkResponse"+numLinks).focus();
			numResponses++;
			numLinks
		}, 200);
		hasLink = true;
		checkNumResponses();
	}
}
/**
 * Insert a new variant for text response
 */
let add_new_variant = ($btn)=>{
	$btn.before('<div><input name="response'+numResponses+'" type="text" class="input response validate"><p class="span red-text"></p><ul class="collection"></ul>'
	+'<button class="btn-delete-bloq btn btn-primary indigo"><i class="material-icons">delete</i></button></div>');
	redeclare_input_search();
	redeclarate_btn_delete_bloq();
}
/**
 * Insert a new synonym
 */
let add_new_synonym =()=>{
	$btnAddSynonym.before('<div class="synonym_block"><input class="synonym" name="sinonym" type="text" class="validate">'
	+'<button class="btn-delete-synonym btn btn-primary indigo"><i class="material-icons">delete</i></button></div>');
	redeclarate_btn_delete_synonym();
}
/**
* Check that the number of answers is less than the maximum number of responses allowed
*/
let checkNumResponses = ()=>{
	if(numResponses >= MAX_RESPONSES){
		dropdown.hide();
		return false;
	}else{
		dropdown.show();
		return true;
	}
}

/**
 * Check if there are some parameter in the text
 * @param {*} text
 */
let search_parameter = (text)=>{
	PATTERN_PARAMETER = /^(#)\w+|(\s#)\w+[\-\_\w]*/
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
	let responses = [];
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

	if(data.name == ""){
		$('#err-name').html('No se puede crear un intent sin nombre');
		$('#name').focus();
	}
	else if(data.user == ""){
		$('#err-user').html('No se puede crear un intent sin frases de usuario');
		if(data.name != "")
			input_user.focus();
	}
	else if($.isArray(data.user)){
		if( data.user.filter(word => word != "").length == 0)
			$('#err-user').html('No se puede crear un intent sin frases de usuario');
		else if(responses.length == 0)
			$('#err').html('No se puede crear un intent sin respuestas de chatbot');
		else if( hasText() == false)
			$('#err').html('No se puede crear un intent sin respuestas de chatbot');
		else if(responseIsEmpty() == true)
			$('#err').html('No puedes mandar respuestas del chatbot vacías, si no la vas a usar borralá');
		else
			$.post('/new_intent',data, function(res){
				location.href = res;
		});
	}
	else if(responses.length == 0)
			$('#err').html('No se puede crear un intent sin respuestas de chatbot');
	else if( hasText() == false){
				$('#err').html('No se puede crear un intent sin respuestas de chatbot')
		}
	else if(responseIsEmpty() == true)
		$('#err').html('No puedes mandar respuestas del chatbot vacías, si no la vas a usar borralá');
	else
		$.post('/new_intent',data, function(res){
			location.href = res;
		});
}
/**
 * @return boolean the existence of text in the input
 */
let hasText = () =>{
	let has_text = false;
	$(".response").each(function(){
		if($(this).val() != "")
			has_text = true;
	})
	return has_text;
}
/**
 * @return boolean if response is or not
 */
let responseIsEmpty = () =>{
	let isEmpty = false;
	$(".response").each(function(){
		if($(this).val() == "")
			isEmpty = true;
	});
	return isEmpty;
}
/**
 *
 */
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
	if(checkValidGif())
		$.post('/new_gif_intent',data, function(res){
			location.href = res;
		});
	else
		setTimeout(function(){$('#name').focus()},200)
}
/**
 * Check if the new gif Form is valid
 */
let checkValidGif = ()=>{
	let isValid = false;
	checkGifName();
	checkGifTag();
	checkGifInputs();
	if($('#err-name').html() == "" && $('#err-tag').html() == "" && $('#err-user').html() == "" )
		isValid = true;
		return isValid;
}
let checkGifName = ()=>{
	$('#err-name').html($('#name').val() == "" ? "Es necesario un nombre" : "");
}
let checkGifTag = () =>{
	$('#err-tag').html($('#input-tag').val() == "" ? "Es necesario un tag o clave" : "");
}
let checkGifInputs = () =>{
	$user = $('.user').val();
	if($user == "")
		$('#err-user').html('No se puede crear un intent sin frases de usuario');
	else if($.isArray($user)){
		if( $user.filter(word => word != "").length == 0)
			$('#err-user').html('No se puede crear un intent sin frases de usuario');
		else
			$('#err-user').html('');
	}
	else
		$('#err-user').html('');
}
let transform_edit_responses = ()=>{
	    $('.edit-responses .response').each(function(){
            let original = $(this).val();
			$(this).val(original.replace(/[$]/,' #'));
        });

}

$(init);
