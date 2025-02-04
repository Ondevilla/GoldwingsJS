/*
 * defiant.js.js [v2.0.4]
 * http://www.defiantjs.com 
 * Copyright (c) 2013-2018, Hakan Bilgin <hbi@longscript.com> 
 * Licensed under the GNU AGPLv3 License
 */
if (function (e, t) {
        var n = {
            init: function () {
                return this
            },
            work_handler: function (e) {
                var t = Array.prototype.slice.call(e.data, 1),
                    n = e.data[0],
                    r = tree[n].apply(tree, t);
                postMessage([n, r])
            },
            setup: function (t) {
                var r = e.URL || e.webkitURL,
                    a = "var tree = {" + this.parse(t).join(",") + "};",
                    s = new Blob([a + 'self.addEventListener("message", ' + this.work_handler.toString() + ", false);"], {
                        type: "text/javascript"
                    }),
                    o = new Worker(r.createObjectURL(s));
                return o.onmessage = function (e) {
                    var t = Array.prototype.slice.call(e.data, 1),
                        r = e.data[0];
                    n.observer.emit("x10:" + r, t)
                }, o
            },
            call_handler: function (e, t) {
                return function () {
                    var r = Array.prototype.slice.call(arguments, 0, -1),
                        a = arguments[arguments.length - 1];
                    r.unshift(e), n.observer.on("x10:" + e, function (e) {
                        a(e.detail[0])
                    }), t.postMessage(r)
                }
            },
            compile: function (e) {
                var t, n = this.setup("function" == typeof e ? {
                        func: e
                    } : e),
                    r = {};
                if ("function" == typeof e) return r.func = this.call_handler("func", n), r.func;
                for (t in e) r[t] = this.call_handler(t, n);
                return r
            },
            parse: function (e, n) {
                var r, a, s, o = [];
                for (r in e)
                    if (s = e[r], null !== s)
                        if (s !== t) {
                            switch (s.constructor) {
                                case Date:
                                    a = "new Date(" + s.valueOf() + ")";
                                    break;
                                case Object:
                                    a = "{" + this.parse(s).join(",") + "}";
                                    break;
                                case Array:
                                    a = "[" + this.parse(s, !0).join(",") + "]";
                                    break;
                                case String:
                                    a = '"' + s.replace(/"/g, '\\"') + '"';
                                    break;
                                case RegExp:
                                case Function:
                                    a = s.toString();
                                    break;
                                default:
                                    a = s
                            }
                            n ? o.push(a) : o.push(r + ":" + a)
                        } else o.push(r + ":undefined");
                else o.push(r + ":null");
                return o
            },
            observer: function () {
                var e = {};
                return {
                    on: function (t, n) {
                        e[t] || (e[t] = []), e[t].unshift(n)
                    },
                    off: function (t, n) {
                        if (e[t]) {
                            var r = e[t].indexOf(n);
                            e[t].splice(r, 1)
                        }
                    },
                    emit: function (t, n) {
                        if (e[t])
                            for (var r = {
                                    type: t,
                                    detail: n,
                                    isCanceled: !1,
                                    cancelBubble: function () {
                                        this.isCanceled = !0
                                    }
                                }, a = e[t].length; a--;) {
                                if (r.isCanceled) return;
                                e[t][a](r)
                            }
                    }
                }
            }()
        };
        "undefined" == typeof module ? e.x10 = n.init() : module.exports = n.init()
    }(this), function (e, t, n) {
        "use strict";
        var r = {
            is_ie: /(msie|trident)/i.test(navigator.userAgent),
            is_safari: /safari/i.test(navigator.userAgent),
            env: "production",
            xml_decl: '<?xml version="1.0" encoding="utf-8"?>',
            namespace: 'xmlns:d="defiant-namespace"',
            tabsize: 4,
            render_xml: function (e, t) {
                var n = new XSLTProcessor,
                    r = document.createElement("span"),
                    a = '//xsl:template[@name="' + e + '"]',
                    s = this.node.selectSingleNode(this.xsl_template, a);
                return s = this.node.selectSingleNode(this.xsl_template, a), s.setAttribute("match", "/"), n.importStylesheet(this.xsl_template), r.appendChild(n.transformToFragment(t, document)), s.removeAttribute("match"), r.innerHTML
            },
            render: function (e, t) {
                var n, r, a, s, o = new XSLTProcessor,
                    i = document.createElement("span"),
                    l = {
                        match: "/"
                    };
                switch (typeof e) {
                    case "object":
                        this.extend(l, e), l.data || (l.data = t);
                        break;
                    case "string":
                        l.template = e, l.data = t;
                        break;
                    default:
                        throw "error"
                }
                if (l.data = JSON.toXML(l.data), n = '//xsl:template[@name="' + l.template + '"]', this.xsl_template || this.gatherTemplates(), l.sorter && (s = this.node.selectSingleNode(this.xsl_template, n + "//xsl:for-each//xsl:sort"), s && (l.sorter.order && s.setAttribute("order", l.sorter.order), l.sorter.select && s.setAttribute("select", l.sorter.select), s.setAttribute("data-type", l.sorter.type || "text"))), a = this.node.selectSingleNode(this.xsl_template, n), a.setAttribute("match", l.match), o.importStylesheet(this.xsl_template), i.appendChild(o.transformToFragment(l.data, document)), a.removeAttribute("match"), this.is_safari) {
                    r = i.getElementsByTagName("script");
                    for (var c = 0, u = r.length; c < u; c++) r[c].defer = !0
                }
                return i.innerHTML
            },
            gatherTemplates: function () {
                for (var e = document.getElementsByTagName("script"), t = "", n = 0, r = e.length; n < r; n++) "defiant/xsl-template" === e[n].type && (t += e[n].innerHTML);
                this.xsl_template = this.xmlFromString('<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xlink="http://www.w3.org/1999/xlink" ' + this.namespace + ">" + t.replace(/defiant:(\w+)/g, "$1") + "</xsl:stylesheet>")
            },
            getSnapshot: function (e, t) {
                return JSON.toXML(e, t || !0)
            },
            xmlFromString: function (t) {
                var n, r;
                return t = t.replace(/>\s{1,}</g, "><"), null === t.trim().match(/<\?xml/) && (t = this.xml_decl + t), "ActiveXObject" in e ? (r = new ActiveXObject("Msxml2.DOMDocument"), r.loadXML(t), r.setProperty("SelectionNamespaces", this.namespace), t.indexOf("xsl:stylesheet") === -1 && r.setProperty("SelectionLanguage", "XPath")) : (n = new DOMParser, r = n.parseFromString(t, "text/xml")), r
            },
            extend: function (e, t) {
                for (var n in t) e[n] && "object" == typeof t[n] ? this.extend(e[n], t[n]) : e[n] = t[n];
                return e
            },
            node: {}
        };
        e.Defiant = t.exports = r
    }("undefined" != typeof window ? window : {}, "undefined" != typeof module ? module : {}), "undefined" == typeof XSLTProcessor) {
    var XSLTProcessor = function () {};
    XSLTProcessor.prototype = {
        importStylesheet: function (e) {
            this.xsldoc = e
        },
        transformToFragment: function (e, t) {
            var n = e.transformNode(this.xsldoc),
                r = document.createElement("span");
            return r.innerHTML = n, r
        }
    }
} else if ("function" != typeof XSLTProcessor && !XSLTProcessor) throw "XSLTProcessor transformNode not implemented";
String.prototype.fill || (String.prototype.fill = function (e, t) {
    var n = this;
    for (t = t || " "; n.length < e; n += t);
    return n
}), String.prototype.trim || (String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/gm, "")
}), String.prototype.xTransform || (String.prototype.xTransform = function () {
    var e = this;
    return this.indexOf("translate(") === -1 && (e = this.replace(/contains\(([^,]+),([^\\)]+)\)/g, function (e, t, n) {
        var r = "abcdefghijklmnopqrstuvwxyz";
        return "contains(translate(" + t + ', "' + r.toUpperCase() + '", "' + r + '"),' + n.toLowerCase() + ")"
    })), e.toString()
}), "undefined" == typeof JSON && (window.JSON = {
    parse: function (sJSON) {
        return eval("(" + sJSON + ")")
    },
    stringify: function (e) {
        if (e instanceof Object) {
            var t = "";
            if (e.constructor === Array) {
                for (var n = 0; n < e.length; t += this.stringify(e[n]) + ",", n++);
                return "[" + t.substr(0, t.length - 1) + "]"
            }
            if (e.toString !== Object.prototype.toString) return '"' + e.toString().replace(/"/g, "\\$&") + '"';
            for (var r in e) t += '"' + r.replace(/"/g, "\\$&") + '":' + this.stringify(e[r]) + ",";
            return "{" + t.substr(0, t.length - 1) + "}"
        }
        return "string" == typeof e ? '"' + e.replace(/"/g, "\\$&") + '"' : String(e)
    }
}), JSON.toXML || (JSON.toXML = function (e, t) {
    "use strict";
    var n, r, a, s = {
        map: [],
        rx_validate_name: /^(?!xml)[a-z_][\w\d.:]*$/i,
        rx_node: /<(.+?)( .*?)>/,
        rx_constructor: /<(.+?)( d:contr=".*?")>/,
        rx_namespace: / xmlns\:d="defiant\-namespace"/,
        rx_data: /(<.+?>)(.*?)(<\/d:data>)/i,
        rx_function: /function (\w+)/i,
        namespace: 'xmlns:d="defiant-namespace"',
        to_xml_str: function (e) {
            return {
                str: this.hash_to_xml(null, e),
                map: this.map
            }
        },
        hash_to_xml: function (e, t, n) {
            var r, a, s, o, i, l, c, u, d, m = t.constructor === Array,
                h = this,
                p = [],
                f = [],
                g = function (t, r) {
                    if (a = r[t], null !== a && void 0 !== a && "NaN" !== a.toString() || (a = null), o = "@" === t.slice(0, 1), i = n ? e : t, i == +i && r.constructor !== Object && (i = "d:item"), null === a ? (l = null, c = !1) : (l = a.constructor, c = l.toString().match(h.rx_function)[1]), o) f.push(i.slice(1) + '="' + h.escape_xml(a) + '"'), "String" !== c && f.push("d:" + i.slice(1) + '="' + c + '"');
                    else if (null === a) p.push(h.scalar_to_xml(i, a));
                    else switch (l) {
                        case Function:
                            throw "JSON data should not contain functions. Please check your structure.";
                        case Object:
                            p.push(h.hash_to_xml(i, a));
                            break;
                        case Array:
                            if (t === i) {
                                if (s = a.constructor === Array)
                                    for (u = a.length; u--;) null !== a[u] && a[u] && a[u].constructor !== Array || (s = !0), s || a[u].constructor !== Object || (s = !0);
                                p.push(h.scalar_to_xml(i, a, s));
                                break
                            }
                        case String:
                            if ("string" == typeof a && (a = a.toString().replace(/\&/g, "&amp;").replace(/\r|\n/g, "&#13;")), "#text" === i) {
                                h.map.push(r), f.push('d:mi="' + h.map.length + '"'), f.push('d:constr="' + c + '"'), p.push(h.escape_xml(a));
                                break
                            }
                        case Number:
                        case Boolean:
                            if ("#text" === i && "String" !== c) {
                                h.map.push(r), f.push('d:mi="' + h.map.length + '"'), f.push('d:constr="' + c + '"'), p.push(h.escape_xml(a));
                                break
                            }
                            p.push(h.scalar_to_xml(i, a))
                    }
                };
            if (t.constructor === Array)
                for (u = 0, d = t.length; u < d; u++) g(u.toString(), t);
            else
                for (r in t) g(r, t);
            return e || (e = "d:data", f.push(this.namespace), m && f.push('d:constr="Array"')), null === e.match(this.rx_validate_name) && (f.push('d:name="' + e + '"'), e = "d:name"), n ? p.join("") : (this.map.push(t), f.push('d:mi="' + this.map.length + '"'), "<" + e + (f.length ? " " + f.join(" ") : "") + (p.length ? ">" + p.join("") + "</" + e + ">" : "/>"))
        },
        scalar_to_xml: function (e, t, n) {
            var r, a, s, o = "";
            if (null === e.match(this.rx_validate_name) && (o += ' d:name="' + e + '"', e = "d:name", n = !1), null !== t && "NaN" !== t.toString() || (t = null), null === t) return "<" + e + ' d:constr="null"/>';
            if (1 === t.length && t.constructor === Array && !t[0]) return "<" + e + ' d:constr="null" d:type="ArrayItem"/>';
            if (1 === t.length && t[0].constructor === Object) {
                r = this.hash_to_xml(!1, t[0]);
                var i = r.match(this.rx_node),
                    l = r.match(this.rx_constructor);
                return i = null !== i ? i[2].replace(this.rx_namespace, "").replace(/>/, "").replace(/"\/$/, '"') : "", l = null !== l ? l[2] : "", r = r.match(this.rx_data), r = null !== r ? r[2] : "", "<" + e + i + " " + l + ' d:type="ArrayItem">' + r + "</" + e + ">"
            }
            return 0 === t.length && t.constructor === Array ? "<" + e + ' d:constr="Array"/>' : n ? this.hash_to_xml(e, t, !0) : (a = t.constructor, s = a.toString().match(this.rx_function)[1], r = a === Array ? this.hash_to_xml("d:item", t, !0) : this.escape_xml(t), o += ' d:constr="' + s + '"', this.map.push(t), o += ' d:mi="' + this.map.length + '"', "#text" === e ? this.escape_xml(t) : "<" + e + o + ">" + r + "</" + e + ">")
        },
        escape_xml: function (e) {
            return String(e).replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/&nbsp;/g, "&#160;")
        }
    };
    switch (typeof t) {
        case "function":
            return a = x10.compile(s), void a.to_xml_str(e, function (n) {
                t({
                    doc: Defiant.xmlFromString(n.str),
                    src: e,
                    map: n.map
                })
            });
        case "boolean":
            return n = s.to_xml_str.call(s, e), {
                doc: Defiant.xmlFromString(n.str),
                src: e,
                map: n.map
            };
        default:
            return n = s.to_xml_str.call(s, e), r = Defiant.xmlFromString(n.str), this.search.map = n.map, r
    }
}), JSON.search || (JSON.search = function (e, t, n) {
    "use strict";
    var r, a, s = e.doc && e.doc.nodeType,
        o = s ? e.doc : JSON.toXML(e),
        i = s ? e.map : this.search.map,
        l = s ? e.src : e,
        c = Defiant.node[n ? "selectSingleNode" : "selectNodes"](o, t.xTransform()),
        u = [];
    for (n && (c = [c]), a = c.length; a--;) switch (c[a].nodeType) {
        case 2:
        case 3:
            u.unshift(c[a].nodeValue);
            break;
        default:
            r = +c[a].getAttribute("d:mi"), u.unshift(i[r - 1])
    }
    return "development" === Defiant.env && (this.trace = JSON.mtrace(l, u, c)), u
}), JSON.mtrace || (JSON.mtrace = function (e, t, n) {
    "use strict";
    for (var r, a, s, o, i, l = window, c = JSON.stringify, u = c(e, null, "\t").replace(/\t/g, ""), d = [], m = 0, h = n.length, p = !!h && n[m].ownerDocument.documentElement, f = (this.search.map, 0); m < h; m++) {
        switch (n[m].nodeType) {
            case 2:
                a = n[m].ownerElement ? n[m].ownerElement.getAttribute("d:" + n[m].nodeName) : "String", r = '"@' + n[m].nodeName + '": ' + l[a](t[m]), s = u.indexOf(r), i = 0;
                break;
            case 3:
                a = n[m].parentNode.getAttribute("d:constr"), r = l[a](t[m]), r = '"' + n[m].parentNode.nodeName + '": ' + ("Number" === r ? r : '"' + r + '"'), s = u.indexOf(r), i = 0;
                break;
            default:
                if (n[m] === p) continue;
                "String" === n[m].getAttribute("d:constr") || "Number" === n[m].getAttribute("d:constr") ? (a = n[m].getAttribute("d:constr"), r = l[a](t[m]), s = u.indexOf(r, f), r = '"' + n[m].nodeName + '": ' + ("Number" === a ? r : '"' + r + '"'), i = 0, f = s + 1) : (r = c(t[m], null, "\t").replace(/\t/g, ""), s = u.indexOf(r), i = r.match(/\n/g).length)
        }
        o = u.substring(0, s).match(/\n/g).length + 1, d.push([o, i])
    }
    return d
}), Defiant.node.selectNodes = function (e, t) {
    if (e.evaluate) {
        for (var n = e.createNSResolver(e.documentElement), r = e.evaluate(t, e, n, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null), a = [], s = 0, o = r.snapshotLength; s < o; s++) a.push(r.snapshotItem(s));
        return a
    }
    return e.selectNodes(t)
}, Defiant.node.selectSingleNode = function (e, t) {
    if (e.evaluate) {
        var n = this.selectNodes(e, t);
        return n.length > 0 ? n[0] : null
    }
    return e.selectSingleNode(t)
}, Defiant.node.prettyPrint = function (e) {
    var t, n, r = Defiant,
        a = r.tabsize,
        s = r.xml_decl.toLowerCase();
    r.is_ie ? n = e.xml : (t = new XMLSerializer, n = t.serializeToString(e)), "development" !== r.env && (n = n.replace(/ \w+\:d=".*?"| d\:\w+=".*?"/g, ""));
    for (var o, i, l = n.trim().replace(/(>)\s*(<)(\/*)/g, "$1\n$2$3"), c = l.split("\n"), u = -1, d = 0, m = c.length; d < m; d++) 0 === d && c[d].toLowerCase() === s || (o = null !== c[d].match(/<[A-Za-z_\:]+.*?>/g), i = null !== c[d].match(/<\/[\w\:]+>/g), null !== c[d].match(/<.*?\/>/g) && (o = i = !0), o && u++, c[d] = String().fill(u, "\t") + c[d], o && i && u--, !o && i && u--);
    return c.join("\n").replace(/\t/g, String().fill(a, " "))
}, Defiant.node.toJSON = function (e, t) {
    "use strict";
    var n = function (e) {
            var t, r, a, s, o, i, l, c, u, d, m = {},
                h = window;
            switch (e.nodeType) {
                case 1:
                    for (o = e.getAttribute("d:constr"), "Array" === o ? m = [] : "String" === o && "" === e.textContent && (m = ""), t = e.attributes, c = 0, u = t.length; c < u; c++) d = t.item(c), null === d.nodeName.match(/\:d|d\:/g) && (o = e.getAttribute("d:" + d.nodeName), i = o && "undefined" !== o ? "null" === d.nodeValue ? null : h[o]("false" === d.nodeValue ? "" : d.nodeValue) : d.nodeValue, m["@" + d.nodeName] = i);
                    break;
                case 3:
                    r = e.parentNode.getAttribute("d:type"), i = r ? h[r]("false" === e.nodeValue ? "" : e.nodeValue) : e.nodeValue, m = i
            }
            if (e.hasChildNodes())
                for (c = 0, u = e.childNodes.length; c < u; c++)
                    if (a = e.childNodes.item(c), s = a.nodeName, t = e.attributes, "d:name" === s && (s = a.getAttribute("d:name")), "#text" === s) o = e.getAttribute("d:constr"), "undefined" === o && (o = void 0), l = a.textContent || a.text, i = "Boolean" === o && "false" === l ? "" : l, o || t.length ? o && 1 === u ? m = h[o](i) : e.hasChildNodes() && t.length < 3 ? m = o ? h[o](i) : i : m[s] = o ? h[o](i) : i : m = i;
                    else {
                        if ("null" === a.getAttribute("d:constr")) {
                            m[s] && m[s].push ? m[s].push(null) : "ArrayItem" === a.getAttribute("d:type") ? m[s] = [m[s]] : m[s] = null;
                            continue
                        }
                        if (m[s]) {
                            m[s].push ? m[s].push(n(a)) : m[s] = [m[s], n(a)];
                            continue
                        }
                        switch (o = a.getAttribute("d:constr")) {
                            case "null":
                                m.push ? m.push(null) : m[s] = null;
                                break;
                            case "Array":
                                a.parentNode.firstChild === a && "Array" === o && "d:item" !== s ? "d:item" === s || "Array" === o ? (i = n(a), m[s] = i.length ? [i] : i) : m[s] = n(a) : m.push ? m.push(n(a)) : m[s] = n(a);
                                break;
                            case "String":
                            case "Number":
                            case "Boolean":
                                l = a.textContent || a.text, i = "Boolean" === o && "false" === l ? "" : l, m.push ? m.push(h[o](i)) : m[s] = n(a);
                                break;
                            default:
                                m.push ? m.push(n(a)) : m[s] = n(a)
                        }
                    } return 1 === e.nodeType && "ArrayItem" === e.getAttribute("d:type") && (m = [m]), m
        },
        r = 9 === e.nodeType ? e.documentElement : e,
        a = n(r),
        s = a[r.nodeName];
    return r === r.ownerDocument.documentElement && s && s.constructor === Array && (a = s), t && "true" === t.toString() && (t = "\t"), t ? JSON.stringify(a, null, t) : a
}, "undefined" != typeof jQuery && ! function (e) {
    "use strict";
    e.fn.defiant = function (e, t) {
        return this.html(Defiant.render(e, t)), this
    }
}(jQuery);