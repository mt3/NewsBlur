if (typeof NEWSBLUR == 'undefined') NEWSBLUR = {};
if (typeof NEWSBLUR.Globals == 'undefined') NEWSBLUR.Globals = {};

/* ============================= */
/* = Core NewsBlur Javascript = */
/* ============================= */

NEWSBLUR.log = function(msg) {
    try {
        if (typeof o == "object")
        {
            var new_m = [];
            for (var i=0; i < msg.length; i++) {
                if (i!=0) new_m.push(msg[i]);
            }
            console.debug(msg[0], new_m);
        }
        else
        {
            console.log(msg);  
        }      
    } catch(e) {
        console = 
        { 
            log: function() {} 
        };
    }
};

(function($) {

    $.fn.extend({
        
        isScrollVisible: function($elem) {
            var docViewTop = 0; // $(this).scrollTop();
            var docViewBottom = docViewTop + $(this).height();
            var docOffset = $(this).offset().top;

            var elemTop = $elem.offset().top - docOffset;
            var elemBottom = elemTop + $elem.outerHeight();

            // NEWSBLUR.log(['isScrollVisible', docViewTop, docViewBottom, docOffset, elemTop, elemBottom]);
            
            return ((elemTop >= docViewTop) && (elemBottom <= docViewBottom));
        }
        
    });
    
    $.extend({

        deepCopy: function(obj) {
            var type = $.typeOf(obj);
            switch (type) {
                case 'object':
                    var o = {};
                    for (key in obj) {
                        o[key] = $.deepCopy(obj[key]);
                    };
                    return o;
                case 'array':
                    var a = [];
                    for (var i = 0; i < obj.length; i++) {
                        a.push($.deepCopy(obj[i]));
                    }
                    return a;
                default:
                    return obj;
            };
        },

        typeOf: function(value) {
            var s = typeof value;
            if (s == 'object') {
                if (value) {
                    if (typeof value.length == 'number' &&
                        !(value.propertyIsEnumerable('length')) &&
                        typeof value.splice == 'function') {
                            s = 'array';
                    }
                } else {
                    s = 'null';
                }
            }
            return s;
        },

        targetIs: function(e, opts, callback){
            if(!e || !opts){ return false; }
            // defaults
            // (want to make this explicit, since it's a little weird)
            opts = {
                childOf: opts.childOf || null,
                tagSelector: opts.tagSelector || null,
                cancelBubbling: opts.cancelBubbling || false
            };
            var target = e.target;
            var $t = $(target);
            var $p = null;
            var fails = false;
            if(opts.childOf){
                $p = $t.parents(opts.childOf).eq(0);
                if(!$p[0]){
                    fails = true;
                }
            }
            if(opts.tagSelector){
                var ts = opts.tagSelector;
                if(!$t.is(ts)){
                    if(opts.cancelBubbling){
                        fails = true;
                    }else{
                        $tp = $t.parents(ts).eq(0);
                        if(!$tp[0]){
                            fails = true;
                        }else{
                            // we are going to assume dev
                            // wants the $elem we bubbled to
                            $t = $tp;
                        }
                    }
                };
            }
            if(fails){
                return false;
            }else{
                if(callback && typeof callback == 'function'){
                    callback($t, $p);
                }
                return true;
            }
        },
        
        entity: function(str) {
            var e = document.createElement('div');
            
            e.innerHTML = String(str);
            
            return e.innerHTML;
        },

        make: function(){
            var $elem, text, children, type, name, props;
            var args = arguments;
            var tagname = args[0];
            
            // Second argument can be TextNode or Attributes
            // $.make('div', 'inner text') || $.make('div', { className: 'etc' })
            if (args[1]) {
                if (typeof args[1] == 'string') {
                    text = args[1];
                } else if (typeof args[1] == 'object' && args[1].push) {
                    children = args[1];
                } else {
                    props = args[1];
                }
            }
            
            // Third argument can be TextNode or an array of additional $.make
            if (args[2]) {
                if (typeof args[2] == 'string') {
                    text = args[2];
                } else if (typeof args[1] == 'object' && args[2].push) {
                    children = args[2];
                }
            }
            
            if (tagname == 'text' && text) {
                return document.createTextNode(text);
            } else {
                $elem = $(document.createElement(tagname));
                if (props) {
                    for (var propname in props) {
                        if (props.hasOwnProperty(propname)) {
                            if ($elem.is(':input') && propname == 'value') {
                                $elem.val(props[propname]);
                            } else {
                                $elem.attr(propname, props[propname]);
                            }
                        }
                    }
                }
                if (children) {
                    for (var i = 0; i < children.length; i++) {
                        if (children[i]) {
                            $elem.append(children[i]);
                        }
                    }
                }
                if (text) {
                    $elem.html(text);
                }
                return $elem;
            }
        },
        
        rescope: function(func, thisArg){
            return function(a, b, c, d, e, f){
                func.call(thisArg, this, a, b, c, d, e, f);
            };
        },
                
        closest: function(value, array) {
            var offset = 0;
            var index = 0;
            var closest = Math.abs(array[index] - value);
            for (var i in array) {
                var next_value = array[i] - value;
                if (next_value <= offset && Math.abs(next_value) < closest) {
                    index = parseInt(i, 10);
                    closest = Math.abs(array[index] - value);
                } else if (next_value > offset) {
                    // NEWSBLUR.log(['Not Closest', index, next_value, value, closest]);
                    return index;
                }
            }
            return index;
        }

    });
})(jQuery);

// ------- IE Debug -------- //

(function($) {
    var _$ied;
    $.extend({
        iedebug: function(msg){
            if(!_$ied){
                _$ied = $.make('div', [
                    $.make('ol')
                ]).css({
                    'position': 'absolute',
                    'top': 10,
                    'left': 10,
                    'zIndex': 20000,
                    'border': '1px solid #000',
                    'padding': '10px',
                    'backgroundColor': '#fff',
                    'fontFamily': 'arial,helvetica,sans-serif',
                    'fontSize': '11px'
                });
                $('body').append(_$ied);
                _$ied.draggable();
            }
            _$ied.find('ol').append($.make('li', msg).css({
                'borderBottom': '1px solid #999999'
            }));
        }
    });
})(jQuery);