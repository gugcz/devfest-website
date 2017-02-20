var EasterEgg = function (sequence) {
    var self = this;
    var pos = 0;

	var hide = function () {
    	var egg = document.getElementById('easteregg');
    	if(egg) egg.remove();
    }

    document.addEventListener('keypress', hide);
    document.addEventListener('mousedown', hide);
    document.addEventListener('scroll', hide);

    document.addEventListener('keypress', function (e) {
       if(e.keyCode == sequence.charCodeAt(pos)) {
           pos += 1;
           if(pos == sequence.length) {
               pos = 0;
               self.callback();
           }
       } else {
           pos = 0;
       }
    });
};

EasterEgg.prototype.then = function(f) {
    this.callback = f;
};

new EasterEgg('panda').then(function () {
	var pandaOverlay = document.createElement('div');
	pandaOverlay.id = 'easteregg';
	pandaOverlay.style.position = 'absolute';
	pandaOverlay.style.width = '100%';
	pandaOverlay.style.height = '100%';
	pandaOverlay.style.backgroundColor = 'rgba(255,255,255,0.5)';
	pandaOverlay.style.backgroundImage = 'url(/imgs/panda.png)';
	pandaOverlay.style.backgroundRepeat = 'no-repeat';
	pandaOverlay.style.backgroundPosition = 'center center';
	pandaOverlay.style.backgroundSize = 'contain';
	pandaOverlay.style.left = document.body.scrollLeft + 'px';
	pandaOverlay.style.top = document.body.scrollTop + 'px';
	pandaOverlay.style.zIndex = 9999;
    document.body.insertBefore(pandaOverlay, document.body.firstChild);
});	