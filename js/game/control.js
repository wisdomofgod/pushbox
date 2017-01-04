var myCtrol = function(callback) {

	let onKeyDown = function ( event ) {
		let keyCode = '';
		
		event.preventDefault();
		event.stopPropagation();

		switch ( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ keyCode = 'up'; break;

			case 37: /*left*/
			case 65: /*A*/ keyCode = 'left'; break;

			case 40: /*down*/
			case 83: /*S*/ keyCode = 'down'; break;

			case 39: /*right*/
			case 68: /*D*/ keyCode = 'right'; break;

			case 82: /*R*/ keyCode = 'r'; break;
			case 78: /*F*/ keyCode = 'n'; break;
		}
		callback(keyCode);

	};
	window.addEventListener('keydown', onKeyDown);
}