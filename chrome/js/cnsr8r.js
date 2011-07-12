/*

  Censorator
  by Greg Leuch ... @gleuch ... http://gleu.cj


  Code released under MIT License for NON-COMMERCIAL development.
  http://creativecommons.org/licenses/MIT

  ####################################################################################


*/
var CNSR8R = {
  replaced_nodes : [],

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

  get_color : function(el) {
    var c;
    while (!c && el !== document) {
      if (el && el.style) c = el.style.color;
      el = el.parentNode;
    }
  },

  hide_element : function(el) {
    var c = CNSR8R.get_color(el);
    if (!c || c == '') c = '#000';

    if (el.tagName == 'IMG') el.src = chrome.extension.getURL('icons/blank.png');
    el.style.backgroundColor = el.style.color = c;
    el.style.backgroundImage = 'none';
    el.className = '_CNSR8R';
  },

  select_and_hide : function(text) {
    if (window.getSelection) {
      var sel = window.getSelection();

      var baseNode = sel.baseNode.parentElement,
          str = text, nodes;

      // If contains child nodes
      if (sel.anchorNode !== sel.focusNode) {
        var str = sel.toString(), ap = sel.anchorNode;

        dance:
        while (ap !== document) {
          var fp = sel.focusNode;
          while (fp !== document) {
            if (ap === fp) break dance;
            fp = fp.parentNode;
          }
          ap = ap.parentNode;
        }
        
        if (ap === fp) {
          var o = {anchor : false, focus : false}, m = false;


          for (var i in ap.childNodes) {
            if (typeof(ap.childNodes[i]) == 'undefined') continue; // skip
            if (!o.anchor && !o.focus) o = CNSR8R.matches_children(sel, ap.childNodes[i], o); // do we start

            if (!!o.anchor || !!o.focus) { // if started, censor it
              m = CNSR8R.censor_elements(sel, ap.childNodes[i], m);
              o = CNSR8R.matches_children(sel, ap.childNodes[i], o);
            }

            if (!!o.anchor && !!o.focus) break; // if end, then stop
          }
        }

      // Is just a single html or text node
      } else {
        var p = (sel.anchorOffset < sel.focusOffset ? sel.anchorOffset : sel.focusOffset); // user can go L->R or R->L w/ selection
        CNSR8R.censor_element(sel.focusNode, sel.toString(), p);
      }

      CNSR8R.replace_elements();
    }
  },

  replace_elements : function() {
    for (var i in CNSR8R.replaced_nodes) {
      var o = CNSR8R.replaced_nodes[i];
      if (o.n) {
        if (o.s && o.s != '') o.n.parentNode.insertBefore(document.createTextNode(o.s), o.n);
        o.n.parentNode.insertBefore(o.d, o.n);
        if (o.e && o.e != '') o.n.parentNode.insertBefore(document.createTextNode(o.e), o.n);
        o.n.parentNode.removeChild(o.n);
      }
    }

    CNSR8R.replaced_nodes = [];
  },

  // Inside single element
  censor_element : function(node, r, p) {
    if (typeof(r) == 'undefined') r = node.nodeValue;
    if (typeof(p) == 'undefined') p = r.length;

    var h = node.nodeValue,
        s = h.slice(0, p),
        e = h.slice(p + r.length),
        d = document.createElement('span'),
        c = CNSR8R.get_color(node);

    if (!c || c == '') c = '#000';
    d.style.color = c; d.style.backgroundColor = c;
    d.className = '_CNSR8R';

    if (r === h) {
      d.innerHTML = r;
      CNSR8R.replaced_nodes.push({n:node,d:d});
    } else {
      var x = RegExp('^('+ RegExp.escape(s) +')('+ RegExp.escape(r) +')('+ RegExp.escape(e) +')$', 'm'),
          m = h.replace(x, '$2');

      if (h === m) return false;
      d.innerHTML = m;
      CNSR8R.replaced_nodes.push({n:node,d:d,s:s,e:e});
    }
  },

  // Recursive
  censor_elements : function(sel, node, m) {
    if (typeof(node.nodeType) == 'undefined') return m;

    if (!m) m = {start : false, finish : false};

    if (node.childNodes && node.childNodes.length > 0) {
      for (var i in node.childNodes) m = CNSR8R.censor_elements(sel, node.childNodes[i], m);
    } else {
      if (node === sel.anchorNode || node == sel.focusNode) {
        var s = node.nodeValue.intersection(sel.toString());

        if (!!m.start) {
          m.finish = true;
          if (s) CNSR8R.censor_element(node, s, 0);
        } else {
          m.start = true;
          if (s) CNSR8R.censor_element(node, s, node.nodeValue.length - s.length);
        }
      } else if (!!m.start && !!!m.finish) {
        CNSR8R.censor_element(node);
      }
    }
    
    return m;
  },

  matches_children : function(sel, node, o) {
    if (!o) o = {anchor : false, focus : false};

    if (!o.anchor && node === sel.anchorNode) {
      return {anchor : true, focus : o.focus};
    } else if (!o.focus && node === sel.focusNode) {
      return {anchor : o.anchor, focus : true};

    } else if (node.childNodes && node.childNodes.length > 0) {
      var r;
      for (var i in node.childNodes) {
        r = CNSR8R.matches_children(sel, node.childNodes[i], o);
        if (r !== o) return r;
      }
    }

    return o;
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

RegExp.escape = function(text) {return text.replace(/[-[\]{}()*+?!.,\\\/^$|#\s]/mg, "\\$&");};

function d(o,a) {var s=[];for (var i in o)s.push((a?a:'')+i); s=s.join(", "); if(a){return s}else{alert(s)}}
// function d(o,a) {var s=[];for (var i in o)s.push((a?a:'')+i+" = "+typeof(o[i])); s=s.join("\n"); if(a){return s}else{alert(s)}}
// function d(o,a) {var s=[];for (var i in o)s.push((a?a:'')+i+" = "+(typeof(o[i])=='object' ? "\n"+d(o[i],(a?a:'')+'  '):o[i])); s=s.join("\n"); if(a){return s}else{alert(s)}}



// based on http://stackoverflow.com/questions/2250942/javascript-string-matching-pattern-help/2251027#2251027
String.prototype.intersection = function(a) {
  var g = createGrid(this.length, a.length),
      f = 0,
      str = null;

  for (var i = 0; i < this.length; i++) {
    for (var j = 0; j < a.length; j++) {
      if (this.charAt(i) == a.charAt(j)) {
        g[i][j] = (i == 0 || j == 0) ? 1 : (g[i-1][j-1] + 1);

        if (g[i][j] > f) {
          f = g[i][j];
          str = null;
        }

        if (g[i][j] == f) str = this.slice(i-f+1, i+1);
      }
    }
  }
  return str;
}

function createGrid(rows, columns) {
  var grid = new Array(rows);
  for(var i = 0; i < rows; i++) {
    grid[i] = new Array(columns);
    for(var j = 0; j < columns; j++) {
      grid[i][j] = 0;
    }
  }
  return grid;
}