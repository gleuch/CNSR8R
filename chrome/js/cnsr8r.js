/*

  Censorator
  by Greg Leuch ... @gleuch ... http://gleu.cj


  Code released under MIT License for NON-COMMERCIAL development.
  http://creativecommons.org/licenses/MIT

  ####################################################################################


*/
var CNSR8R = {
  censor : function(info) {
    try {
      // Find selected text & hide it...
      if (info['selectionText']) CNSR8R.select_and_hide(info['selectionText']);

      // Find image & hide it...
      if (info['mediaType'] == 'image') CNSR8R.find_and_hide('img', 'src', info['srcUrl']);

      // Find link & hide it...
      if (info['linkUrl']) CNSR8R.find_and_hide('a', 'href', info['linkUrl']);

    } catch(e) {console.error('CSR8R Error: '+ e);}
  },

  hide_element : function(el) {
    var p_el = el, c = p_el.style.color;

    try {
      while (p_el !== document) {
        p_el = p_el.parentNode;
        if (p_el && p_el.style) c = p_el.style.color;
      }
    } catch(e) {}

    if (!c || c == '') c = '#000';

    if (el.tagName == 'IMG') el.src = chrome.extension.getURL('icons/blank.png');
    el.style.backgroundColor = el.style.color = c;
    el.style.backgroundImage = 'none';
    el.className = '_CNSR8R';
  },

  select_and_hide : function(text) {
    // THIS IS TRICKY SINCE IT COULD BE IN MULTIPLE ELEMENTS! :|
  },

  find_and_hide : function(tag, attr, val) {
    var els = document.getElementsByTagName(tag), attr_val,
        l = location.href.replace(/^(.*\/)([A-Z0-9\.\_\-]+)(\?.*)?$/i, '$1'),
        d = location.href.replace(/^(http(s)?:\/\/)([A-Z0-9\.\-\_\:]+)(.*)/i, '$1$3');
    
    for (var i in els) {
      try {
        if (attr_val = els[i].getAttribute(attr)) {
          attr_val = (attr_val.match(/^\//) ? d : (!attr_val.match(/^http(s)?/i) ? l : '') + attr_val);
          if (attr_val == val) CNSR8R.hide_element(els[i]);
        }
      } catch(e) {}
    }
    
  }
};