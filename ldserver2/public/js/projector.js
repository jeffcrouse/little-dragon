

var socket = io.connect();
socket.emit('hello', { my: 'data' });

socket.on('/keys_range_1', function (data) {
	console.log(data);
});
