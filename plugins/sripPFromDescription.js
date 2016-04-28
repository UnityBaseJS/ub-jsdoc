/**
 * @overview This plugin remove a <p> tag from a desctiption of all elements. Let the template decide how to wrap the element desctiption
 * @module plugins/sripPFromDescription 
 * @author Pavel Mash <pavel.mash@gmail.com>
 */
'use strict';

function spripP(src){
  if ( src && src.startsWith('<p>') && src.endsWith('</p>') ) {
      return src.slice(3, -4);
  } else {
      return src;
  }
}

exports.handlers = {
    /**
     * Remove a <p> tag from the description
     */
    newDoclet: function(e) {
		if (!e.doclet) return;
	
        if (e.doclet.description) e.doclet.description = spripP(e.doclet.description);
		
		if (e.doclet.params){   
			e.doclet.params.forEach(function(prm){
				if (prm.description)  prm.description = spripP(prm.description);
			});
        }
    }
};
