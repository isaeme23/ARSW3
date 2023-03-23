var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    var pt;

    var addPointToCanvas = function (point) {
        console.log("Entra addpoint");
        var canvas = document.getElementById("myCanvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("myCanvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint', function (eventbody) {
                var theObject=JSON.parse(eventbody.body);
                alert(JSON.stringify(theObject));
                var point = new Point(theObject.x, theObject.y);
                console.log(eventbody);
                console.log(point);
                addPointToCanvas(point);
            });
        });

    };

    var publishPoints = function(pt){
        stompClient.send("/topic/newpoint", {}, JSON.stringify(pt));
    }

    var drawCircle = function(){
    $(document).ready(function() {
        var canvas = document.getElementById("myCanvas");
        var ctx = canvas.getContext("2d");
          if(window.PointerEvent) {
            canvas.addEventListener("click", function(event){
                console.log("drawcircle 1");
                publishPoint(event.pageX, event.pageY);
            });
          }
          else {
          console.log("drawcircle else entro");
            canvas.addEventListener("mousedown", function(event){
                console.log("drawcircle 2");
                publishPoint(event.pageX, event.pageY);
            });
        }
        });
    }

    var publishPoint = function(px, py){
        pt=new Point(px,py);
        console.info("publishing point at "+pt);
        console.log("publish")
        addPointToCanvas(pt);
        //publicar el evento
        publishPoints(pt);
    }


    

    return {

        init: function () {
            var can = document.getElementById("canvas");
            
            //websocket connection
            connectAndSubscribe();
            drawCircle();
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();