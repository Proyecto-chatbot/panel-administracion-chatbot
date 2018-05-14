
$(function(){
	load_intents();
	$btn_create = $('#btn_create');
	$btn_create.click(function(){
		
	});
});

let load_intents = ()=>{
	$.get('/show_all', function(data) {
			let array = JSON.parse(data);
			$.each(array, function(index, val) {
				 $li = $('<li>'+val.name+'</li>');
				 $('#list_intent').append($li);
			});
		}).fail(function(){
			console.log('something was wrong');
		});
}