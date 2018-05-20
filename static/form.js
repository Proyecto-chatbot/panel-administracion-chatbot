let $btn_create;
let $btn_delete;
let $btn_add_question;
let $btn_add_response;
let init = function(){
	let intent_id;
	$btn_create = $('#btn_create');
	$btn_delete = $("#btn-delete-intent");
	$btn_add_question = $("#addUserText");
	$btn_add_response = $("#addResponse");

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
		add_new_response($(this));
	});
}

$(init);
/**
 *   insert a new input for user says
 */
let add_new_input = ($input)=>{
	$input.before('<input class="user" name="user" type="text" class="validate">');
}
/**
 *  insert a new input for responses
 */
let add_new_response = ($input)=>{
	$input.before('<input class="response" name="response" type="text" class="validate">');
}
