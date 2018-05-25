let $btn_create;
let $btn_delete;
let $btn_add_question;
let $btn_submit;
let $name;
// El máximo de respuestas posibles son 10
const MAX_RESPONSES = 10;
// Contiene el número de respuestas añadidas
let numResponses = 0;
// Contador respuestas de texto
let numTextResponse = 0;
let dropdown;
let dropdown_options;
let $select;
let init = function(){
	$select = $('.select');
	dropdown = $('.dropdown-trigger');
	dropdown.dropdown();
	dropdown_options = $('.dropdown-content li a');
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

let add_new_block = (name) =>{
	switch(name){
		case 'type-text': add_new_response();break;
		case 'type-image': add_new_gif();break;
		case 'type-link': ;break;
	}
}

/** Añade un bloque de respuesta tipo texto */
let add_new_response = function (){
	if(checkNumResponses()){
		$select.before('<div class="bloq type-text input-field col s12"><p>Respuestas del chatbot</p>'
			+'<input class="response validate" name="response"'+numResponses+' type="text">'
				+'<button class="btnAddVariant btn-small waves-effect waves-light right" id="addVariant'+numTextResponse+'"'
				+'name="addResponse">Añadir variante<i class="material-icons right">add</i></button></div>');
		numTextResponse++;
		numResponses++;
	}
}
/**
 *
 */
let add_new_gif = function (){
	if(checkNumResponses()){
		$select.before('<div class="bloq type-image input-field col s12"><p>Gif</p><input class="response"'
		+ 'name="gifResponse" type="text" class="validate"></div>');
		numResponses++;
	}
}

/**
 * Insert a new variant for text response
 */
let add_new_variant = ($btn)=>{
	$btn.before('<input name="response'+numResponses+'" type="text" class=" response validate">');
}
let checkNumResponses = ()=>{
	return numResponses < MAX_RESPONSES;
}
/**
*
*/
let send_intent = ()=>{
	let data = {};
	let botSays = [];
	let position = 0;
	let type;
	let responses;
	let text;
	name = $('#name').val();
	userSays = $('.user').val();
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
				text.push($(this).val());
			});
		}else if(responses.length == 1){
			text = responses.val();
		}
		botSays.push({ 'type': type, 'text': text});

	});
	data = {
		"name": name,
		"user": userSays,
		"bot": botSays
	}

	$.post('/new_intent',data, function(res){
		location.href = res;
	});
}
$(init);