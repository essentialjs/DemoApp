// router.intercept(["/sp/servlet/logout","/ws/servlet/logout"], function() {
//    .... will do the logout
// })

// https://github.com/browserstate/history.js/wiki/The-State-of-the-HTML5-History-API

var global = Resolver(),
    essential = Resolver("essential"),
    addEventListeners = essential("addEventListeners"),
    MutableEvent = essential("MutableEvent"),
    essentialRef = Resolver("document::essential"),
    proxyConsole = essential("console")(),
    // DescriptorQuery = essential("DescriptorQuery"),
    // EnhancedDescriptor = essential("EnhancedDescriptor"),
    StatefulResolver = essential("StatefulResolver"),
    DialogAction = essential("DialogAction");

var baseUrl = location.href.substring(0,location.href.lastIndexOf("/")+1);

Resolver.method("copyToScope", function(scope,names,adjuster) {
    var v = {};
    for(var n in names) {
        v[ n ] = this.get( n );
    }
    if (adjuster) adjuster(v,'to scope');
    for(var n in names) {
        scope[ names[n] ] = v[n];
    }
});

//TODO apply to all references, pluggable references
Resolver.method("intoAngularScope", function(scope,names,adjuster) {

    this.copyToScope(scope,names,adjuster);

    // changes to angular model goes to resolver
    this.on("change",this,function(ev) {
        ev.data.copyToScope(scope,names,adjuster);
        if (scope.$safeDigest) scope.$safeDigest();
        else scope.$digest();
    });

    // changes to resolver goes to angular model
    /*
    var angularNames = [], esNames = [], ref = this;
    for(var n in names) { angularNames.push(names[n]); esNames.push(n); }
    var dereg = scope.$watchGroup(angularNames, function(newVals,oldVals,scope) {
        for(var i,v; v = newVals[i]; ++i) {
            ref.set(esNames[i], v);
        }
    });
*/

    //TODO use dereg function
});


function RouterPath(href,resources,fn) {
    this.href = href.toLowerCase();
    this.resources = resources;
    this.fn = fn;
    this.els = [];
}

RouterPath.prototype.registerEl = function(el,href) {
    for(var i=0,l = this.els.length; i<l; ++i) if (this.els[i] == el) return;

    //TODO better matching options
    if (href.indexOf(this.href.toLowerCase()) == 0) {
        this.els.push(el);
        var stateful = StatefulResolver(el,true);
        stateful.declare("map.class.state.disabled","state-disabled");
    }
};

RouterPath.prototype.updateEls = function(resource) {
    //debugger;
    for(var i=0,l = this.els.length; i<l; ++i) {
        this.els[i].stateful.set("state.disabled", !resource.available);
    }
};


function Router() {
    this.hrefs = [];
    this.resourcesOn = {};
    this.hashDriven = [];

    addEventListeners(window,{
        hashchange: this.hashchange.bind(this)

    });
}
Router.prototype.setRoot = function(r) {
    this.root = r.toLowerCase();
};

//TODO how should resources be integrated ?
Router.prototype.manage = function(match, resources, fn) {
    if (match.href) {
        if (typeof match.href == "string") this.hrefs.push(new RouterPath(match.href,resources,fn));
        else for(var i=0,h; h = match.href[i]; ++i) this.hrefs.push(new RouterPath(h,resources,fn));
    }

    this.manageDOM(document);

    if (this.resourcesOn[resources] == undefined) {
        this.resourcesOn[resources] = true;
        Resolver("document").on("change", resources, this, this._onResources);
        var map = Resolver("document")(resources);

        // available flag on resource listening
        for(var n in map) {
            Resolver("document").reference(resources + "." + n).trigger("change");
        }
    }
};

Router.prototype.manageDOM = function(doc) {
    var anchors = doc.documentElement.getElementsByTagName("A"); //doc.anchors
    var origin = window.location.protocol + "//" + window.location.hostname;
    if (window.location.port) origin += ":" + window.location.port;

    for(var i=0, a; a = anchors[i]; ++i) {
        var ahref = a.href;
        if (ahref.indexOf(origin) == 0) ahref = ahref.substring(origin.length);
        if (ahref.indexOf(this.root) == 0) ahref = ahref.substring(this.root.length);

        for(var j=0,href; href = this.hrefs[j]; ++j) if (a.href) href.registerEl(a,ahref);
    }
};

Router.prototype._onResources = function(ev) {
    var router = ev.data;

    for(var j=0,path; path = router.hrefs[j]; ++j) if (path.href == ev.symbol) {
        path.updateEls(ev.base[ ev.symbol ]);
    }
};

Router.prototype.onAnchorClick = function(href,attributes) {
    var origin = window.location.protocol + "//" + window.location.hostname;
    if (window.location.port) origin += ":" + window.location.port;
    if (href.indexOf(origin) == 0) href = href.substring(origin.length);
    if (href.indexOf(this.root) == 0) href = href.substring(this.root.length);

    //TODO other tags to link audio
    //TODO perhaps support prefetch
    if (this.player && attributes['rel'] && attributes['rel'].value == "audio" && (href.indexOf('.mp3')>=0 || href.indexOf('.m4a')>=0 || href.indexOf('.mp4')>=0 || href.indexOf('.wav')>=0)) {
        this.player.setSrc(href);
        //TODO alt src depending on browser support
        this.player.play();
        return false;
    }

    for(var i=0,path; path = this.hrefs[i]; ++i) {
        if (href.indexOf(path.href) == 0) {
            try {
                var prevent = path.fn(href,"open");
                if (prevent == false) return false;
            } catch(ex) {
                //TODO cmd failed
                debugger;
            }
        }
    }
};

Router.prototype.requireHash = function(el,config) {
    StatefulResolver(el,true);
    this.hashDriven.push(el,config);
    this._hideIfNotHash(el,config);
};

Router.prototype.setHash = function(name) {
    location.hash = "#" + name;
    this.hashchange();
};

Router.prototype.hashchange = function(ev) {
    for(var i=0,l=this.hashDriven.length; i<l; i+=2) {
        var el = this.hashDriven[i], config = this.hashDriven[i+1];
        this._hideIfNotHash(el,config);
    }
    this.hashCall(location.hash);
};

Router.prototype._hideIfNotHash = function(el,config) {
    var id = el.id, hash = location.hash.replace("#","");
    if (typeof config["require-hash"] == "string") id = config["require-hash"];
    el.stateful.set("state.hidden", id !== hash);
};

Router.prototype.linkPlayButtons = function() {
    if (window['mejs']) {
        //TODO review raw mediaelement hook

        var mediaelement = window['mejs'].$("#page-audio").mediaelementplayer({
            audioWidth:  100,
            features: ['playpause','progress']
        });
        if (mediaelement.length) {
            var mep = document.getElementById(mediaelement.data().mediaelementplayer.id);
            mep.className += " page-audio";
            this.player = mediaelement[0].player;

            //TODO config
        }
    }
};

Router.prototype.hashCall = function(hash) {

    if (hash) {
        for(var i=0,path; path = this.hrefs[i]; ++i) {
            if (hash.indexOf(path.href) == 1) {
                try {
                    var prevent = path.fn(hash.substring(1),"load");
                    if (prevent == false) return false;
                } catch(ex) {
                    //TODO cmd failed
                    debugger;
                }
            }
        }
    }
};

// by default clear additional data
Router.prototype.clearHash = function(clearAll) {
    if (clearAll === false) {
        var hash = location.hash.split("=")[0].split("&")[0];
        location.hash = hash;
    } else if (typeof clearAll == "string") {
        location.hash = clearAll
    }
    else {
        location.hash = "";
        if (window.history) history.pushState('', document.title, window.location.pathname);
    }
}

addEventListeners(document.documentElement,{
    "click": function(ev) {
        ev = MutableEvent(ev).withActionInfo();
        var router = essentialRef("router");
        if (ev.commandElement && ev.commandElement.href) {
            var stateful = StatefulResolver(ev.commandElement);
            if (stateful("state.disabled")) {
                ev.preventDefault();
                return;
            }
            if (false == router.onAnchorClick(ev.commandElement.href, ev.commandElement.attributes)) ev.preventDefault();
        }
    }

    //TODO submit event for form submits
});

//TODO rethink and move to EssentialJS
Resolver("document").elementsWithConfig = function() {
    var els = document.querySelectorAll("[data-role]"),
        config = document.essential.config;
    // els = [].concat(els);

    //TODO change when appliedConfig is mixed in
    for(var n in config) {
        //TODO better lookup of element
        var el = document.getElementById(n);
        if (el) els[els.length] = el; // NodeList doesn't have push
    }

    return els;
};

Resolver("document").on("change","readyState",function(ev) {
    if (ev.value == "complete") {

        // link play buttons to mediaelement audio player
        document.essential.router.linkPlayButtons();

        // Handle elements that require hash
        var els = Resolver("document").elementsWithConfig();
        for(var i=0,el; el = els[i]; ++i) {
            var config = Resolver.config(el);
            if (config["require-hash"]) document.essential.router.requireHash(el,config);
        }

        var router = document.essential.router,
            hash = location.hash;

        router.hashCall(hash);
    }
});

essentialRef.declare("router",new Router());

// document.essential.router.sitemap({});
