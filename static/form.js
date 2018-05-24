let $btn_create;
let $btn_delete;
let $btn_add_question;
let $btn_add_response;
let $btn_submit;
let $name;
// El máximo de respuestas posibles son 10
const MAX_RESPONSES = 10;
// Contiene el número de respuestas añadidas
let numResponses = 0;
// Contador respuestas de texto
let numTextResponse = 0;
let init = function(){
	let intent_id;
	$btn_create = $('#btn_create');
	$btn_delete = $("#btn-delete-intent");
	$btn_add_question = $("#addUserText");
	$btn_add_response = $("#add-response");
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

	$btn_add_response.click(function(event){
		event.preventDefault();
		add_new_response();
	});

	$(document).on('click','.btnAddVariant',function(event){
		event.preventDefault();
		add_new_variant($(this));
	});



	$btn_submit.click(function(event){
		event.preventDefault();
		send_intent();
	});
}

/** Añade un bloque de respuesta tipo texto */
let add_new_response = function (){

	if(checkNumResponses()){
		$btn_add_response.before('<div class="bloq type-text input-field col s12"><p>Respuestas del chatbot</p>'
			+'<input class="response validate" name="response"'+numResponses+' type="text">'
				+'<button class="btnAddVariant btn-small waves-effect waves-light right" id="addVariant'+numTextResponse+'"'
				+'name="addResponse">Añadir variante<i class="material-icons right">add</i></button></div>');
		numTextResponse++;
		numResponses++;
	}
}


/**
 *   insert a new input for user says
 */
let add_new_input = ($input)=>{
	$input.before('<input class="user validate" name="user" type="text" >');
}

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