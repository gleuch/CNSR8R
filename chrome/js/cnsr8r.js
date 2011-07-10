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
      if (info['selectionText']) {
        CNSR8R.select_and_hide(info['selectionText']);

      // Find image & hide it...
      } else if (info['mediaType'] == 'image') {
        CNSR8R.find_and_hide('img', 'src', info['srcUrl']);

      // Find link & hide it...
      } else if (info['linkUrl']) {
        CNSR8R.find_and_hide('a', 'href', info['linkUrl']);
      }

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
    var userSelection;

    if (window.getSelection) {
      userSelection = window.getSelection();
      var range = userSelection.getRangeAt(0);

      console.error(userSelection)

      var baseNode = userSelection.baseNode.parentElement,
          str = text, nodes;

      // If contains child nodes
      if (userSelection.baseNode !== userSelection.extentNode) {
        alert('not')
        userSelection.extentNode.parentElement.cnsr8r = true;
        userSelection.focusNode.parentElement.cnsr8r = true;
        baseNode = baseNode.parentNode;
        nodes = baseNode.childNodes;

        for(var i in nodes) {
          if (nodes[i].nodeType) {

            //
            // TODO!!!
            //


            // alert(nodes[i].nodeValue +' ?== '+ (nodes[i].cnsr8r ? 'YES' : 'NO'));
          }
        }

      // Is just a single html or text node
      } else {
        var r = userSelection.toString(),
            h = userSelection.baseNode.nodeValue,
            s = h.slice(0, userSelection.anchorOffset),
            e = h.slice(userSelection.anchorOffset + r.length),
            x = RegExp('^('+ RegExp.escape(s) +')('+ RegExp.escape(r) +')('+ RegExp.escape(e) +')$'),
            m = h.replace(x, '$2'),
            d = document.createElement('span');

        d.innerHTML = m;
        d.style.color = '#000';
        d.style.backgroundColor = '#000';
        d.className = '_CNSR8R';

        if (s != '') userSelection.baseNode.parentNode.insertBefore(document.createTextNode(s), userSelection.baseNode);
        userSelection.baseNode.parentNode.insertBefore(d, userSelection.baseNode);
        if (e != '') userSelection.baseNode.parentNode.insertBefore(document.createTextNode(e), userSelection.baseNode);
        userSelection.baseNode.parentNode.removeChild(userSelection.baseNode);
      }
    }
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

RegExp.escape = function(text) {return text.replace(/[-[\]{}()*+?.,\\\/^$|#\s]/g, "\\$&");};

function d(o,a) {var s=[];for (var i in o)s.push((a?a:'')+i); s=s.join(", "); if(a){return s}else{alert(s)}}
// function d(o,a) {var s=[];for (var i in o)s.push((a?a:'')+i+" = "+typeof(o[i])); s=s.join("\n"); if(a){return s}else{alert(s)}}
// function d(o,a) {var s=[];for (var i in o)s.push((a?a:'')+i+" = "+(typeof(o[i])=='object' ? "\n"+d(o[i],(a?a:'')+'  '):o[i])); s=s.join("\n"); if(a){return s}else{alert(s)}}