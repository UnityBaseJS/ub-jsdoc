(function(){
	var idDiv = document.getElementById('main');
	
	function getPartial(originalHref){
		var partialHref = 'partials/' + originalHref;
		fetch(partialHref)
		.then(function(resp){
			return resp.text()
		})
		.then(function(pageText){
			idDiv.innerHTML = pageText;
			prettyPrint();
			var scrollTo = originalHref.split('#')[1],
				elm;
			if (scrollTo){
				elm = document.getElementById(scrollTo);
			} else {
				elm = idDiv;
			}
			if (elm) elm.scrollIntoView();
			if (needUpdateURL) {
				history.pushState({href: originalHref}, "", originalHref);
			}
		});
	}	
	
	function isPartial(href){
		var res = Boolean(href);
		if (res) res = (href.indexOf('.js.html') === -1) 
			&& (href.indexOf('http://') === -1)
			&& (href.indexOf('https://') === -1)
			&& (href.charAt(0) !== '/');
		return res;
	}
	var needUpdateURL = false;

	if (window && window.fetch && window.history && history.pushState) {
		document.body.onclick = function( e ) {
			var evt = e || window.event,
				target = evt.target || evt.srcElement,
				partialHref, originalHref;

			// If the element clicked is an anchor
			if ( target.nodeName === 'A' ) {
				originalHref = target.getAttribute('href')
				if (isPartial(originalHref)){
					needUpdateURL = true;
					getPartial(originalHref);
					e.preventDefault();
				}	
			}
		};
		window.onpopstate = function(event) {
			needUpdateURL = false;
			if (event.state && event.state.href){
				getPartial(event.state.href);
			}
		}	
	}

if (!window.exports) window.exports = {};
window.exports["gotoLine"] = function() {
    var source = document.getElementsByClassName('prettyprint source linenums');
    var i = 0;
    var lineNumber = 0;
    var lineId;
    var lines;
    var totalLines;
    var anchorHash;

    if (source && source[0]) {
        anchorHash = document.location.hash.substring(1);
        lines = source[0].getElementsByTagName('li');
        totalLines = lines.length;

        for (; i < totalLines; i++) {
            lineNumber++;
            lineId = 'line' + lineNumber;
            lines[i].id = lineId;
            if (lineId === anchorHash) {
                lines[i].className += ' selected';
            }
        }
    }
}
	
})();
