let $btn_create;
let $btn_delete;

let init = function(){
	$btn_create = $('#btn_create');
	$btn_delete = $("#btn-delete-intent");
	$btn_create.click(function(){
		$.get('/create');
	});
	$btn_delete.click(function(){
		$.get('/delete');
	});
}

$(init);


