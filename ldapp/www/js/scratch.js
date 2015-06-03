/*
var loop = function() {
	navigator.vibrate(100);
	osc.send("/test", [1, 2, 3, 4, new Date()]);
	setTimeout(loop, 1000);
}
loop();
*/


var lighten = function(color, percent) {
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}
var px = function(num){ return num+"px"; }



			var container = $("#controls");
			var buttons = [
				{color: "#CC66FF", highlight: lighten("#CC66FF"), id: "button1"},
				{color: "#66FF99", highlight: lighten("#66FF99"), id: "button2"},
				{color: "#3399FF", highlight: lighten("#3399FF"), id: "button3"},
				{color: "#0000FF", highlight: lighten("#0000FF"), id: "button4"}
			];

			var canvas = $('<canvas/>', {'class':'foo'})
				.attr("width", 640)
				.attr("height", 360)
				.width(1280)
				.height(720)
				.appendTo( container );

			var ctx = canvas.get(0).getContext("2d");
			var button_width = canvas.attr("width") / buttons.length;
			console.log("button_width", button_width);

			var isMouseDown = false
			canvas.mousedown(function() {
				isMouseDown = true;
			}).mouseup(function() {
				isMouseDown = false;
			});

			canvas.mousemoved = function(e) {

				draw();
			}

			var draw = function() {
				var x_pos = 0;
				buttons.forEach(function(button){
					var x = x_pos;
					ctx.fillStyle = button.color;
					console.log(x, 0, button_width, canvas.height());
					ctx.fillRect(x, 0, button_width, canvas.height());
					x_pos += button_width;
				});
			}


			buttons.forEach(function(button){


			
				button.highlight = lighten(button.color, 0.5);

				button.press = function() {
					ctx.fillStyle = highlight;
					ctx.fillRect(0, 0, button_width, screen_height);
				}
				var release = function() {
					ctx.fillStyle = button.color;
					ctx.fillRect(0, 0, button_width, screen_height);
				}


				var onMouseDown = function(e){
					var parentOffset = $(this).parent().offset(); 
					var x = (e.pageX - parentOffset.left) / canvas.width();
					var y = (e.pageY - parentOffset.top) / canvas.height();

					console.log(button.id, "mousedown", x, y);
					press();
				}
				var onMouseUp = function(e){
					var parentOffset = $(this).parent().offset(); 
					var x = (e.pageX - parentOffset.left) / canvas.width();
					var y = (e.pageY - parentOffset.top) / canvas.height();
					release();
					console.log(button.id, "mouseup", x, y);
				}
				var onMouseEnter = function(e){
					if(isMouseDown) {
						var parentOffset = $(this).parent().offset(); 
						var x = (e.pageX - parentOffset.left) / canvas.width();
						var y = (e.pageY - parentOffset.top) / canvas.height();
						console.log(button.id, "mouseup", x, y);
						press();
					}
				}
				var onMouseLeave = function(e) {
					if(isMouseDown) release();
				}


				canvas.mousedown(onMouseDown);
				canvas.mouseup(onMouseUp);
				canvas.mouseenter(onMouseEnter);
				canvas.mouseleave(onMouseLeave);
			
				
			});
	