let $btn_create;
let $btn_delete;

let init = function(){
	let intent_id;
	$btn_create = $('#btn_create');
	$btn_delete = $("#btn-delete-intent");
	$btn_create.click(function(){
		$.get('/create');
	});
	$btn_delete.click(function(){
		intent_id = $("#input-id").val();
		$.post('/delete',{id : intent_id}, function(res){
			location.href = res;
		});
	});
}

$(init);


