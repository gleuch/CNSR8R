/*

  Censorator
  by Greg Leuch ... @gleuch ... http://gleu.cj


  Code released under MIT License for NON-COMMERCIAL development.
  http://creativecommons.org/licenses/MIT

  ####################################################################################


*/
var Censorator = function() {
  this.version = '1.0';
  this.debug = true;

  this.contextMenus = {menus : []};
  this.page = {};
  this.tabs = {listeners : []};
  this.test = 'testing binding';


  // --- CENSORATOR! -----------------------------
  this.initialize = function() {
    if (!this.debug) this.analytics.apply(this);
    this.contextMenus.create.apply(this);
    this.tabs.create.apply(this);
  };
  this.uninitialize = function() {
    this.contextMenus.destroy.apply(this);
    this.tabs.destroy.apply(this);
  };


  // --- CONTEXT MENUS ---------------------------
  this.contextMenus.create = function() {
    this.contextMenus.destroy.apply(this);
    this.contextMenus.menus.push( chrome.contextMenus.create({title : 'Censor it!', contexts : ['all'], documentUrlPatterns : ["http://*/*", "https://*/*"], onclick : this.page.click.bind(this)}, function() {}) );
  };
  this.contextMenus.destroy = function() {
    chrome.contextMenus.removeAll(function() {});
  };


  // --- PAGES -----------------------------------
  this.page.click = function(info, tab) {
    if (info['srcUrl'] || info['selectionText']) {
      if (this.debug) chrome.tabs.executeScript(tab.id, {file: 'js/cnsr8r.js'}, function() {});
      // alert(jQuery.toJSON(info));
      chrome.tabs.executeScript(tab.id, {code : "if (typeof(CNSR8R) != 'undefined') CNSR8R.censor("+ jQuery.toJSON(info) +");"}, function(){});
      _gaq.push(['_trackPageview', '/censored/chrome']);
    }
  };


  // --- TABS ------------------------------------
  this.tabs.create = function() {
    this.tabs.listeners.push(chrome.tabs.onUpdated.addListener(this.tabs.onUpdatedTab.bind(this)));
  };
  this.tabs.destroy = function() {
    for (var i in this.tabs.listeners) chrome.tabs.onUpdated.removeListener(this.tabs.listeners[i]);
  };

  this.tabs.onUpdatedTab = function(tabid, objectinfo, tab) {
    if (objectinfo['status'] && objectinfo['status'] == 'loading') {
      chrome.tabs.executeScript(tab.id, {file: 'js/cnsr8r.js'}, function() {});
    }
  };


  // --- ANALYTICS -------------------------------
  this.analytics = function() {
    _gaq.push(['_setAccount', 'UA-2855868-22']);

    // Track installs and updates
    if (!!!localStorage['installed']) {
      _gaq.push(['_trackPageview', '/installed/chrome/'+ censorator.version]);
      localStorage['installed'] = true;
      localStorage['version'] = censorator.version;
    } else if (localStorage['version'] != censorator.version) {
      _gaq.push(['_trackPageview', '/updated/chrome/'+ censorator.version]);
      localStorage['version'] = censorator.version;
    }

    // Track and call GA
    _gaq.push(['_trackPageview', '/initialized/chrome']);
    (function() {
      try {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = 'https://ssl.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
      } catch(e) {}
    })();
  };

};



// --- MISC ------------------------------------
RegExp.escape = function(text) {return text.replace(/[-[\]{}()*+?.,\\\/^$|#\s]/g, "\\$&");};

// dump object
function d(o,a) {var s=[];for (var i in o)s.push((a?a:'')+i+" = "+(typeof(o[i])=='object' ? "\n"+d(o[i],(a?a:'')+'  '):o[i])); s=s.join("\n"); if(a){return s}else{alert(s)}}