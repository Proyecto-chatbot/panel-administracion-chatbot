let $btn_create;
let $btn_delete;
let $btn_add_question;
let $btn_add_response;
let init = function(){
	let intent_id;
	$btn_create = $('#btn_create');
	$btn_delete = $("#btn-delete-intent");
	$btn_add_question = $("#addUserText");
	$btn_add_response0 = $("#addResponse0");
	$btn_add_response1 = $("#addResponse1");

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
	$btn_add_response0.click(function(event){
		event.preventDefault();
		add_new_response0($(this));
	});

	$btn_add_response1.click(function(event){
		event.preventDefault();
		add_new_response1($(this));
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
let add_new_response0 = ($input)=>{
	$input.before('<input class="response0" name="response0" type="text" class="validate">');
}
let add_new_response1 = ($input)=>{
	$input.before('<input class="response1" name="response1" type="text" class="validate">');
}
