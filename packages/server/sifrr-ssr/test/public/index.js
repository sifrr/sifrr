(function () {
  'use strict';

  var commonjsGlobal =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof window !== 'undefined'
        ? window
        : typeof global !== 'undefined'
          ? global
          : typeof self !== 'undefined'
            ? self
            : {};

  (function () {
    var n;
    function aa(a) {
      var b = 0;
      return function () {
        return b < a.length
          ? {
              done: !1,
              value: a[b++]
            }
          : {
              done: !0
            };
      };
    }
    function ba(a) {
      var b = 'undefined' != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
      return b
        ? b.call(a)
        : {
            next: aa(a)
          };
    }
    function ca(a) {
      for (var b, c = []; !(b = a.next()).done; ) {
        c.push(b.value);
      }
      return c;
    }
    var da =
      'undefined' != typeof window && window === this
        ? this
        : 'undefined' != typeof commonjsGlobal && null != commonjsGlobal
          ? commonjsGlobal
          : this;
    function p(a, b) {
      return {
        index: a,
        o: [],
        u: b
      };
    }
    function ea(a, b, c, d) {
      var e = 0,
        f = 0,
        g = 0,
        h = 0,
        m = Math.min(b - e, d - f);
      if (0 == e && 0 == f)
        a: {
          for (g = 0; g < m; g++) {
            if (a[g] !== c[g]) break a;
          }
          g = m;
        }
      if (b == a.length && d == c.length) {
        h = a.length;
        for (var k = c.length, l = 0; l < m - g && fa(a[--h], c[--k]); ) {
          l++;
        }
        h = l;
      }
      e += g;
      f += g;
      b -= h;
      d -= h;
      if (0 == b - e && 0 == d - f) return [];
      if (e == b) {
        for (b = p(e, 0); f < d; ) {
          b.o.push(c[f++]);
        }
        return [b];
      }
      if (f == d) return [p(e, b - e)];
      m = e;
      g = f;
      d = d - g + 1;
      h = b - m + 1;
      b = Array(d);
      for (k = 0; k < d; k++) {
        (b[k] = Array(h)), (b[k][0] = k);
      }
      for (k = 0; k < h; k++) {
        b[0][k] = k;
      }
      for (k = 1; k < d; k++) {
        for (l = 1; l < h; l++) {
          if (a[m + l - 1] === c[g + k - 1]) b[k][l] = b[k - 1][l - 1];
          else {
            var q = b[k - 1][l] + 1,
              D = b[k][l - 1] + 1;
            b[k][l] = q < D ? q : D;
          }
        }
      }
      m = b.length - 1;
      g = b[0].length - 1;
      d = b[m][g];
      for (a = []; 0 < m || 0 < g; ) {
        0 == m
          ? (a.push(2), g--)
          : 0 == g
            ? (a.push(3), m--)
            : ((h = b[m - 1][g - 1]),
              (k = b[m - 1][g]),
              (l = b[m][g - 1]),
              (q = k < l ? (k < h ? k : h) : l < h ? l : h),
              q == h
                ? (h == d ? a.push(0) : (a.push(1), (d = h)), m--, g--)
                : q == k
                  ? (a.push(3), m--, (d = k))
                  : (a.push(2), g--, (d = l)));
      }
      a.reverse();
      b = void 0;
      m = [];
      for (g = 0; g < a.length; g++) {
        switch (a[g]) {
          case 0:
            b && (m.push(b), (b = void 0));
            e++;
            f++;
            break;
          case 1:
            b || (b = p(e, 0));
            b.u++;
            e++;
            b.o.push(c[f]);
            f++;
            break;
          case 2:
            b || (b = p(e, 0));
            b.u++;
            e++;
            break;
          case 3:
            b || (b = p(e, 0)), b.o.push(c[f]), f++;
        }
      }
      b && m.push(b);
      return m;
    }
    function fa(a, b) {
      return a === b;
    }
    function ha() {}
    ha.prototype.toJSON = function () {
      return {};
    };
    function r(a) {
      a.__shady || (a.__shady = new ha());
      return a.__shady;
    }
    function t(a) {
      return a && a.__shady;
    }
    var u = window.ShadyDOM || {};
    u.T = !(!Element.prototype.attachShadow || !Node.prototype.getRootNode);
    var ia = Object.getOwnPropertyDescriptor(Node.prototype, 'firstChild');
    u.c = !!(ia && ia.configurable && ia.get);
    u.D = u.force || !u.T;
    u.g = u.noPatch || !1;
    u.G = u.preferPerformance;
    u.F = 'on-demand' === u.g;
    u.L = navigator.userAgent.match('Trident');
    function v(a) {
      return (a = t(a)) && void 0 !== a.firstChild;
    }
    function w(a) {
      return a instanceof ShadowRoot;
    }
    function ja(a) {
      return (a = (a = t(a)) && a.root) && ka(a);
    }
    var x = Element.prototype,
      la =
        x.matches ||
        x.matchesSelector ||
        x.mozMatchesSelector ||
        x.msMatchesSelector ||
        x.oMatchesSelector ||
        x.webkitMatchesSelector,
      ma = document.createTextNode(''),
      na = 0,
      oa = [];
    new MutationObserver(function () {
      for (; oa.length; ) {
        try {
          oa.shift()();
        } catch (a) {
          throw ((ma.textContent = na++), a);
        }
      }
    }).observe(ma, {
      characterData: !0
    });
    function pa(a) {
      oa.push(a);
      ma.textContent = na++;
    }
    var qa = !!document.contains;
    function ra(a, b) {
      for (; b; ) {
        if (b == a) return !0;
        b = b.__shady_parentNode;
      }
      return !1;
    }
    function y(a) {
      for (var b = a.length - 1; 0 <= b; b--) {
        var c = a[b],
          d = c.getAttribute('id') || c.getAttribute('name');
        d && 'length' !== d && isNaN(d) && (a[d] = c);
      }
      a.item = function (e) {
        return a[e];
      };
      a.namedItem = function (e) {
        if ('length' !== e && isNaN(e) && a[e]) return a[e];
        for (var f = ba(a), g = f.next(); !g.done; g = f.next()) {
          if (((g = g.value), (g.getAttribute('id') || g.getAttribute('name')) == e)) return g;
        }
        return null;
      };
      return a;
    }
    function sa(a) {
      var b = [];
      for (a = a.__shady_native_firstChild; a; a = a.__shady_native_nextSibling) {
        b.push(a);
      }
      return b;
    }
    function ta(a) {
      var b = [];
      for (a = a.__shady_firstChild; a; a = a.__shady_nextSibling) {
        b.push(a);
      }
      return b;
    }
    function ua(a, b, c) {
      c.configurable = !0;
      if (c.value) a[b] = c.value;
      else
        try {
          Object.defineProperty(a, b, c);
        } catch (d) {}
    }
    function z(a, b, c, d) {
      c = void 0 === c ? '' : c;
      for (var e in b) {
        (d && 0 <= d.indexOf(e)) || ua(a, c + e, b[e]);
      }
    }
    function va(a, b) {
      for (var c in b) {
        c in a && ua(a, c, b[c]);
      }
    }
    function A(a) {
      var b = {};
      Object.getOwnPropertyNames(a).forEach(function (c) {
        b[c] = Object.getOwnPropertyDescriptor(a, c);
      });
      return b;
    }
    var B = [],
      wa;
    function xa(a) {
      wa || ((wa = !0), pa(C));
      B.push(a);
    }
    function C() {
      wa = !1;
      for (var a = !!B.length; B.length; ) {
        B.shift()();
      }
      return a;
    }
    C.list = B;
    var ya = A({
        get childNodes() {
          return this.__shady_childNodes;
        },
        get firstChild() {
          return this.__shady_firstChild;
        },
        get lastChild() {
          return this.__shady_lastChild;
        },
        get childElementCount() {
          return this.__shady_childElementCount;
        },
        get children() {
          return this.__shady_children;
        },
        get firstElementChild() {
          return this.__shady_firstElementChild;
        },
        get lastElementChild() {
          return this.__shady_lastElementChild;
        },
        get shadowRoot() {
          return this.__shady_shadowRoot;
        }
      }),
      za = A({
        get textContent() {
          return this.__shady_textContent;
        },
        set textContent(a) {
          this.__shady_textContent = a;
        },
        get innerHTML() {
          return this.__shady_innerHTML;
        },
        set innerHTML(a) {
          return (this.__shady_innerHTML = a);
        }
      }),
      Aa = A({
        get parentElement() {
          return this.__shady_parentElement;
        },
        get parentNode() {
          return this.__shady_parentNode;
        },
        get nextSibling() {
          return this.__shady_nextSibling;
        },
        get previousSibling() {
          return this.__shady_previousSibling;
        },
        get nextElementSibling() {
          return this.__shady_nextElementSibling;
        },
        get previousElementSibling() {
          return this.__shady_previousElementSibling;
        },
        get className() {
          return this.__shady_className;
        },
        set className(a) {
          return (this.__shady_className = a);
        }
      });
    function Ba(a) {
      for (var b in a) {
        var c = a[b];
        c && (c.enumerable = !1);
      }
    }
    Ba(ya);
    Ba(za);
    Ba(Aa);
    var Ca = u.c || !0 === u.g,
      Da = Ca
        ? function () {}
        : function (a) {
            var b = r(a);
            b.N || ((b.N = !0), va(a, Aa));
          },
      Fa = Ca
        ? function () {}
        : function (a) {
            var b = r(a);
            b.M || ((b.M = !0), va(a, ya), (window.customElements && !u.g) || va(a, za));
          };
    var E = '__eventWrappers' + Date.now(),
      Ga = (function () {
        var a = Object.getOwnPropertyDescriptor(Event.prototype, 'composed');
        return a
          ? function (b) {
              return a.get.call(b);
            }
          : null;
      })(),
      Ha = (function () {
        function a() {}
        var b = !1,
          c = {
            get capture() {
              b = !0;
              return !1;
            }
          };
        window.addEventListener('test', a, c);
        window.removeEventListener('test', a, c);
        return b;
      })();
    function Ia(a) {
      if (a && 'object' === typeof a) {
        var b = !!a.capture;
        var c = !!a.once;
        var d = !!a.passive;
        var e = a.i;
      } else (b = !!a), (d = c = !1);
      return {
        K: e,
        capture: b,
        once: c,
        passive: d,
        J: Ha ? a : b
      };
    }
    var Ja = {
        blur: !0,
        focus: !0,
        focusin: !0,
        focusout: !0,
        click: !0,
        dblclick: !0,
        mousedown: !0,
        mouseenter: !0,
        mouseleave: !0,
        mousemove: !0,
        mouseout: !0,
        mouseover: !0,
        mouseup: !0,
        wheel: !0,
        beforeinput: !0,
        input: !0,
        keydown: !0,
        keyup: !0,
        compositionstart: !0,
        compositionupdate: !0,
        compositionend: !0,
        touchstart: !0,
        touchend: !0,
        touchmove: !0,
        touchcancel: !0,
        pointerover: !0,
        pointerenter: !0,
        pointerdown: !0,
        pointermove: !0,
        pointerup: !0,
        pointercancel: !0,
        pointerout: !0,
        pointerleave: !0,
        gotpointercapture: !0,
        lostpointercapture: !0,
        dragstart: !0,
        drag: !0,
        dragenter: !0,
        dragleave: !0,
        dragover: !0,
        drop: !0,
        dragend: !0,
        DOMActivate: !0,
        DOMFocusIn: !0,
        DOMFocusOut: !0,
        keypress: !0
      },
      Ka = {
        DOMAttrModified: !0,
        DOMAttributeNameChanged: !0,
        DOMCharacterDataModified: !0,
        DOMElementNameChanged: !0,
        DOMNodeInserted: !0,
        DOMNodeInsertedIntoDocument: !0,
        DOMNodeRemoved: !0,
        DOMNodeRemovedFromDocument: !0,
        DOMSubtreeModified: !0
      };
    function La(a) {
      return a instanceof Node ? a.__shady_getRootNode() : a;
    }
    function F(a, b) {
      var c = [],
        d = a;
      for (a = La(a); d; ) {
        c.push(d),
          d.__shady_assignedSlot
            ? (d = d.__shady_assignedSlot)
            : d.nodeType === Node.DOCUMENT_FRAGMENT_NODE && d.host && (b || d !== a)
              ? (d = d.host)
              : (d = d.__shady_parentNode);
      }
      c[c.length - 1] === document && c.push(window);
      return c;
    }
    function Ma(a) {
      a.__composedPath || (a.__composedPath = F(a.target, !0));
      return a.__composedPath;
    }
    function Na(a, b) {
      if (!w) return a;
      a = F(a, !0);
      for (var c = 0, d, e = void 0, f, g = void 0; c < b.length; c++) {
        if (((d = b[c]), (f = La(d)), f !== e && ((g = a.indexOf(f)), (e = f)), !w(f) || -1 < g))
          return d;
      }
    }
    function Oa(a) {
      function b(c, d) {
        c = new a(c, d);
        c.__composed = d && !!d.composed;
        return c;
      }
      b.__proto__ = a;
      b.prototype = a.prototype;
      return b;
    }
    var Pa = {
      focus: !0,
      blur: !0
    };
    function Qa(a) {
      return a.__target !== a.target || a.__relatedTarget !== a.relatedTarget;
    }
    function Ra(a, b, c) {
      if ((c = b.__handlers && b.__handlers[a.type] && b.__handlers[a.type][c]))
        for (
          var d = 0, e;
          (e = c[d]) &&
          (!Qa(a) || a.target !== a.relatedTarget) &&
          (e.call(b, a), !a.__immediatePropagationStopped);
          d++
        ) {}
    }
    function Sa(a) {
      var b = a.composedPath();
      Object.defineProperty(a, 'currentTarget', {
        get: function () {
          return d;
        },
        configurable: !0
      });
      for (var c = b.length - 1; 0 <= c; c--) {
        var d = b[c];
        Ra(a, d, 'capture');
        if (a.A) return;
      }
      Object.defineProperty(a, 'eventPhase', {
        get: function () {
          return Event.AT_TARGET;
        }
      });
      var e;
      for (c = 0; c < b.length; c++) {
        d = b[c];
        var f = t(d);
        f = f && f.root;
        if (0 === c || (f && f === e))
          if ((Ra(a, d, 'bubble'), d !== window && (e = d.__shady_getRootNode()), a.A)) break;
      }
    }
    function Ta(a, b, c, d, e, f) {
      for (var g = 0; g < a.length; g++) {
        var h = a[g],
          m = h.type,
          k = h.capture,
          l = h.once,
          q = h.passive;
        if (b === h.node && c === m && d === k && e === l && f === q) return g;
      }
      return -1;
    }
    function Ua(a) {
      C();
      return this.__shady_native_dispatchEvent(a);
    }
    function Va(a, b, c) {
      var d = Ia(c),
        e = d.capture,
        f = d.once,
        g = d.passive,
        h = d.K;
      d = d.J;
      if (b) {
        var m = typeof b;
        if ('function' === m || 'object' === m)
          if ('object' !== m || (b.handleEvent && 'function' === typeof b.handleEvent)) {
            if (Ka[a]) return this.__shady_native_addEventListener(a, b, d);
            var k = h || this;
            if ((h = b[E])) {
              if (-1 < Ta(h, k, a, e, f, g)) return;
            } else b[E] = [];
            h = function (l) {
              f && this.__shady_removeEventListener(a, b, c);
              l.__target || Wa(l);
              if (k !== this) {
                var q = Object.getOwnPropertyDescriptor(l, 'currentTarget');
                Object.defineProperty(l, 'currentTarget', {
                  get: function () {
                    return k;
                  },
                  configurable: !0
                });
              }
              l.__previousCurrentTarget = l.currentTarget;
              if ((!w(k) && 'slot' !== k.localName) || -1 != l.composedPath().indexOf(k))
                if (l.composed || -1 < l.composedPath().indexOf(k))
                  if (Qa(l) && l.target === l.relatedTarget)
                    l.eventPhase === Event.BUBBLING_PHASE && l.stopImmediatePropagation();
                  else if (
                    l.eventPhase === Event.CAPTURING_PHASE ||
                    l.bubbles ||
                    l.target === k ||
                    k instanceof Window
                  ) {
                    var D = 'function' === m ? b.call(k, l) : b.handleEvent && b.handleEvent(l);
                    k !== this &&
                      (q
                        ? (Object.defineProperty(l, 'currentTarget', q), (q = null))
                        : delete l.currentTarget);
                    return D;
                  }
            };
            b[E].push({
              node: k,
              type: a,
              capture: e,
              once: f,
              passive: g,
              V: h
            });
            Pa[a]
              ? ((this.__handlers = this.__handlers || {}),
                (this.__handlers[a] = this.__handlers[a] || {
                  capture: [],
                  bubble: []
                }),
                this.__handlers[a][e ? 'capture' : 'bubble'].push(h))
              : this.__shady_native_addEventListener(a, h, d);
          }
      }
    }
    function Xa(a, b, c) {
      if (b) {
        var d = Ia(c);
        c = d.capture;
        var e = d.once,
          f = d.passive,
          g = d.K;
        d = d.J;
        if (Ka[a]) return this.__shady_native_removeEventListener(a, b, d);
        var h = g || this;
        g = void 0;
        var m = null;
        try {
          m = b[E];
        } catch (k) {}
        m &&
          ((e = Ta(m, h, a, c, e, f)),
          -1 < e && ((g = m.splice(e, 1)[0].V), m.length || (b[E] = void 0)));
        this.__shady_native_removeEventListener(a, g || b, d);
        g &&
          Pa[a] &&
          this.__handlers &&
          this.__handlers[a] &&
          ((a = this.__handlers[a][c ? 'capture' : 'bubble']),
          (b = a.indexOf(g)),
          -1 < b && a.splice(b, 1));
      }
    }
    function Ya() {
      for (var a in Pa) {
        window.__shady_native_addEventListener(
          a,
          function (b) {
            b.__target || (Wa(b), Sa(b));
          },
          !0
        );
      }
    }
    var Za = A({
      get composed() {
        void 0 === this.__composed &&
          (Ga
            ? (this.__composed = 'focusin' === this.type || 'focusout' === this.type || Ga(this))
            : !1 !== this.isTrusted && (this.__composed = Ja[this.type]));
        return this.__composed || !1;
      },
      composedPath: function () {
        this.__composedPath || (this.__composedPath = F(this.__target, this.composed));
        return this.__composedPath;
      },
      get target() {
        return Na(this.currentTarget || this.__previousCurrentTarget, this.composedPath());
      },
      get relatedTarget() {
        if (!this.__relatedTarget) return null;
        this.__relatedTargetComposedPath ||
          (this.__relatedTargetComposedPath = F(this.__relatedTarget, !0));
        return Na(
          this.currentTarget || this.__previousCurrentTarget,
          this.__relatedTargetComposedPath
        );
      },
      stopPropagation: function () {
        Event.prototype.stopPropagation.call(this);
        this.A = !0;
      },
      stopImmediatePropagation: function () {
        Event.prototype.stopImmediatePropagation.call(this);
        this.A = this.__immediatePropagationStopped = !0;
      }
    });
    function Wa(a) {
      a.__target = a.target;
      a.__relatedTarget = a.relatedTarget;
      if (u.c) {
        var b = Object.getPrototypeOf(a);
        if (!b.hasOwnProperty('__shady_patchedProto')) {
          var c = Object.create(b);
          c.__shady_sourceProto = b;
          z(c, Za);
          b.__shady_patchedProto = c;
        }
        a.__proto__ = b.__shady_patchedProto;
      } else z(a, Za);
    }
    var $a = Oa(Event),
      ab = Oa(CustomEvent),
      bb = Oa(MouseEvent);
    function cb() {
      if (!Ga && Object.getOwnPropertyDescriptor(Event.prototype, 'isTrusted')) {
        var a = function () {
          var b = new MouseEvent('click', {
            bubbles: !0,
            cancelable: !0,
            composed: !0
          });
          this.__shady_dispatchEvent(b);
        };
        Element.prototype.click
          ? (Element.prototype.click = a)
          : HTMLElement.prototype.click && (HTMLElement.prototype.click = a);
      }
    }
    var db = Object.getOwnPropertyNames(Document.prototype).filter(function (a) {
      return 'on' === a.substring(0, 2);
    });
    var eb = A({
      dispatchEvent: Ua,
      addEventListener: Va,
      removeEventListener: Xa
    });
    var fb = window.document,
      gb = u.G,
      hb = Object.getOwnPropertyDescriptor(Node.prototype, 'isConnected'),
      ib = hb && hb.get;
    function jb(a) {
      for (var b; (b = a.__shady_firstChild); ) {
        a.__shady_removeChild(b);
      }
    }
    function kb(a) {
      var b = t(a);
      if (b && void 0 !== b.w)
        for (b = a.__shady_firstChild; b; b = b.__shady_nextSibling) {
          kb(b);
        }
      if ((a = t(a))) a.w = void 0;
    }
    function lb(a) {
      var b = a;
      a &&
        'slot' === a.localName &&
        (b = (b = (b = t(a)) && b.l) && b.length ? b[0] : lb(a.__shady_nextSibling));
      return b;
    }
    function mb(a, b, c) {
      if ((a = (a = t(a)) && a.m)) {
        if (b)
          if (b.nodeType === Node.DOCUMENT_FRAGMENT_NODE)
            for (var d = 0, e = b.childNodes.length; d < e; d++) {
              a.addedNodes.push(b.childNodes[d]);
            }
          else a.addedNodes.push(b);
        c && a.removedNodes.push(c);
        nb(a);
      }
    }
    var K = A({
      get parentNode() {
        var a = t(this);
        a = a && a.parentNode;
        return void 0 !== a ? a : this.__shady_native_parentNode;
      },
      get firstChild() {
        var a = t(this);
        a = a && a.firstChild;
        return void 0 !== a ? a : this.__shady_native_firstChild;
      },
      get lastChild() {
        var a = t(this);
        a = a && a.lastChild;
        return void 0 !== a ? a : this.__shady_native_lastChild;
      },
      get nextSibling() {
        var a = t(this);
        a = a && a.nextSibling;
        return void 0 !== a ? a : this.__shady_native_nextSibling;
      },
      get previousSibling() {
        var a = t(this);
        a = a && a.previousSibling;
        return void 0 !== a ? a : this.__shady_native_previousSibling;
      },
      get childNodes() {
        if (v(this)) {
          var a = t(this);
          if (!a.childNodes) {
            a.childNodes = [];
            for (var b = this.__shady_firstChild; b; b = b.__shady_nextSibling) {
              a.childNodes.push(b);
            }
          }
          var c = a.childNodes;
        } else c = this.__shady_native_childNodes;
        c.item = function (d) {
          return c[d];
        };
        return c;
      },
      get parentElement() {
        var a = t(this);
        (a = a && a.parentNode) && a.nodeType !== Node.ELEMENT_NODE && (a = null);
        return void 0 !== a ? a : this.__shady_native_parentElement;
      },
      get isConnected() {
        if (ib && ib.call(this)) return !0;
        if (this.nodeType == Node.DOCUMENT_FRAGMENT_NODE) return !1;
        var a = this.ownerDocument;
        if (qa) {
          if (a.__shady_native_contains(this)) return !0;
        } else if (a.documentElement && a.documentElement.__shady_native_contains(this)) return !0;
        for (a = this; a && !(a instanceof Document); ) {
          a = a.__shady_parentNode || (w(a) ? a.host : void 0);
        }
        return !!(a && a instanceof Document);
      },
      get textContent() {
        if (v(this)) {
          for (var a = [], b = this.__shady_firstChild; b; b = b.__shady_nextSibling) {
            b.nodeType !== Node.COMMENT_NODE && a.push(b.__shady_textContent);
          }
          return a.join('');
        }
        return this.__shady_native_textContent;
      },
      set textContent(a) {
        if ('undefined' === typeof a || null === a) a = '';
        switch (this.nodeType) {
          case Node.ELEMENT_NODE:
          case Node.DOCUMENT_FRAGMENT_NODE:
            if (!v(this) && u.c) {
              var b = this.__shady_firstChild;
              (b != this.__shady_lastChild || (b && b.nodeType != Node.TEXT_NODE)) && jb(this);
              this.__shady_native_textContent = a;
            } else
              jb(this),
                (0 < a.length || this.nodeType === Node.ELEMENT_NODE) &&
                  this.__shady_insertBefore(document.createTextNode(a));
            break;
          default:
            this.nodeValue = a;
        }
      },
      insertBefore: function (a, b) {
        if (this.ownerDocument !== fb && a.ownerDocument !== fb)
          return this.__shady_native_insertBefore(a, b), a;
        if (a === this)
          throw Error(
            "Failed to execute 'appendChild' on 'Node': The new child element contains the parent."
          );
        if (b) {
          var c = t(b);
          c = c && c.parentNode;
          if (
            (void 0 !== c && c !== this) ||
            (void 0 === c && b.__shady_native_parentNode !== this)
          )
            throw Error(
              "Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node."
            );
        }
        if (b === a) return a;
        mb(this, a);
        var d = [],
          e = (c = G(this)) ? c.host.localName : H(this),
          f = a.__shady_parentNode;
        if (f) {
          var g = H(a);
          var h = !!c || !G(a) || (gb && void 0 !== this.__noInsertionPoint);
          f.__shady_removeChild(a, h);
        }
        f = !0;
        var m =
            (!gb || (void 0 === a.__noInsertionPoint && void 0 === this.__noInsertionPoint)) &&
            !ob(a, e),
          k = c && !a.__noInsertionPoint && (!gb || a.nodeType === Node.DOCUMENT_FRAGMENT_NODE);
        if (k || m)
          m && (g = g || H(a)),
            pb(a, function (l) {
              k && 'slot' === l.localName && d.push(l);
              if (m) {
                var q = g;
                I() && (q && qb(l, q), (q = I()) && q.scopeNode(l, e));
              }
            });
        d.length && (rb(c), c.f.push.apply(c.f, d instanceof Array ? d : ca(ba(d))), J(c));
        v(this) &&
          (sb(a, this, b), (c = t(this)), ja(this) ? (J(c.root), (f = !1)) : c.root && (f = !1));
        f
          ? ((c = w(this) ? this.host : this),
            b
              ? ((b = lb(b)), c.__shady_native_insertBefore(a, b))
              : c.__shady_native_appendChild(a))
          : a.ownerDocument !== this.ownerDocument && this.ownerDocument.adoptNode(a);
        return a;
      },
      appendChild: function (a) {
        if (this != a || !w(a)) return this.__shady_insertBefore(a);
      },
      removeChild: function (a, b) {
        b = void 0 === b ? !1 : b;
        if (this.ownerDocument !== fb) return this.__shady_native_removeChild(a);
        if (a.__shady_parentNode !== this)
          throw Error('The node to be removed is not a child of this node: ' + a);
        mb(this, null, a);
        var c = G(a),
          d = c && tb(c, a),
          e = t(this);
        if (v(this) && (ub(a, this), ja(this))) {
          J(e.root);
          var f = !0;
        }
        if (I() && !b && c && a.nodeType !== Node.TEXT_NODE) {
          var g = H(a);
          pb(a, function (h) {
            qb(h, g);
          });
        }
        kb(a);
        c && ((b = this && 'slot' === this.localName) && (f = !0), (d || b) && J(c));
        f ||
          ((f = w(this) ? this.host : this),
          ((!e.root && 'slot' !== a.localName) || f === a.__shady_native_parentNode) &&
            f.__shady_native_removeChild(a));
        return a;
      },
      replaceChild: function (a, b) {
        this.__shady_insertBefore(a, b);
        this.__shady_removeChild(b);
        return a;
      },
      cloneNode: function (a) {
        if ('template' == this.localName) return this.__shady_native_cloneNode(a);
        var b = this.__shady_native_cloneNode(!1);
        if (a && b.nodeType !== Node.ATTRIBUTE_NODE) {
          a = this.__shady_firstChild;
          for (var c; a; a = a.__shady_nextSibling) {
            (c = a.__shady_cloneNode(!0)), b.__shady_appendChild(c);
          }
        }
        return b;
      },
      getRootNode: function (a) {
        if (this && this.nodeType) {
          var b = r(this),
            c = b.w;
          void 0 === c &&
            (w(this)
              ? ((c = this), (b.w = c))
              : ((c = (c = this.__shady_parentNode) ? c.__shady_getRootNode(a) : this),
                document.documentElement.__shady_native_contains(this) && (b.w = c)));
          return c;
        }
      },
      contains: function (a) {
        return ra(this, a);
      }
    });
    var M = A({
      get assignedSlot() {
        var a = this.__shady_parentNode;
        (a = a && a.__shady_shadowRoot) && L(a);
        return ((a = t(this)) && a.assignedSlot) || null;
      }
    });
    function vb(a, b, c) {
      var d = [];
      wb(a, b, c, d);
      return d;
    }
    function wb(a, b, c, d) {
      for (a = a.__shady_firstChild; a; a = a.__shady_nextSibling) {
        var e;
        if ((e = a.nodeType === Node.ELEMENT_NODE)) {
          e = a;
          var f = b,
            g = c,
            h = d,
            m = f(e);
          m && h.push(e);
          g && g(m) ? (e = m) : (wb(e, f, g, h), (e = void 0));
        }
        if (e) break;
      }
    }
    var N = A({
        get firstElementChild() {
          var a = t(this);
          if (a && void 0 !== a.firstChild) {
            for (a = this.__shady_firstChild; a && a.nodeType !== Node.ELEMENT_NODE; ) {
              a = a.__shady_nextSibling;
            }
            return a;
          }
          return this.__shady_native_firstElementChild;
        },
        get lastElementChild() {
          var a = t(this);
          if (a && void 0 !== a.lastChild) {
            for (a = this.__shady_lastChild; a && a.nodeType !== Node.ELEMENT_NODE; ) {
              a = a.__shady_previousSibling;
            }
            return a;
          }
          return this.__shady_native_lastElementChild;
        },
        get children() {
          return v(this)
            ? y(
                Array.prototype.filter.call(ta(this), function (a) {
                  return a.nodeType === Node.ELEMENT_NODE;
                })
              )
            : this.__shady_native_children;
        },
        get childElementCount() {
          var a = this.__shady_children;
          return a ? a.length : 0;
        }
      }),
      xb = A({
        querySelector: function (a) {
          return (
            vb(
              this,
              function (b) {
                return la.call(b, a);
              },
              function (b) {
                return !!b;
              }
            )[0] || null
          );
        },
        querySelectorAll: function (a, b) {
          if (b) {
            b = Array.prototype.slice.call(this.__shady_native_querySelectorAll(a));
            var c = this.__shady_getRootNode();
            return y(
              b.filter(function (d) {
                return d.__shady_getRootNode() == c;
              })
            );
          }
          return y(
            vb(this, function (d) {
              return la.call(d, a);
            })
          );
        }
      }),
      yb = u.G && !u.g ? Object.assign({}, N) : N;
    Object.assign(N, xb);
    var zb = null;
    function I() {
      zb || (zb = window.ShadyCSS && window.ShadyCSS.ScopingShim);
      return zb || null;
    }
    function Ab(a, b, c) {
      var d = I();
      return d && 'class' === b ? (d.setElementClass(a, c), !0) : !1;
    }
    function qb(a, b) {
      var c = I();
      c && c.unscopeNode(a, b);
    }
    function ob(a, b) {
      var c = I();
      if (!c) return !0;
      if (a.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        c = !0;
        for (a = a.__shady_firstChild; a; a = a.__shady_nextSibling) {
          c = c && ob(a, b);
        }
        return c;
      }
      return a.nodeType !== Node.ELEMENT_NODE ? !0 : c.currentScopeForNode(a) === b;
    }
    function H(a) {
      if (a.nodeType !== Node.ELEMENT_NODE) return '';
      var b = I();
      return b ? b.currentScopeForNode(a) : '';
    }
    function pb(a, b) {
      if (a)
        for (
          a.nodeType === Node.ELEMENT_NODE && b(a), a = a.__shady_firstChild;
          a;
          a = a.__shady_nextSibling
        ) {
          a.nodeType === Node.ELEMENT_NODE && pb(a, b);
        }
    }
    var Bb = window.document;
    function Cb(a, b) {
      if ('slot' === b) (a = a.__shady_parentNode), ja(a) && J(t(a).root);
      else if ('slot' === a.localName && 'name' === b && (b = G(a))) {
        if (b.a) {
          O(b);
          var c = a.O,
            d = Db(a);
          if (d !== c) {
            c = b.b[c];
            var e = c.indexOf(a);
            0 <= e && c.splice(e, 1);
            c = b.b[d] || (b.b[d] = []);
            c.push(a);
            1 < c.length && (b.b[d] = Eb(c));
          }
        }
        J(b);
      }
    }
    var Fb = A({
        get previousElementSibling() {
          var a = t(this);
          if (a && void 0 !== a.previousSibling) {
            for (a = this.__shady_previousSibling; a && a.nodeType !== Node.ELEMENT_NODE; ) {
              a = a.__shady_previousSibling;
            }
            return a;
          }
          return this.__shady_native_previousElementSibling;
        },
        get nextElementSibling() {
          var a = t(this);
          if (a && void 0 !== a.nextSibling) {
            for (a = this.__shady_nextSibling; a && a.nodeType !== Node.ELEMENT_NODE; ) {
              a = a.__shady_nextSibling;
            }
            return a;
          }
          return this.__shady_native_nextElementSibling;
        },
        get slot() {
          return this.getAttribute('slot');
        },
        set slot(a) {
          this.__shady_setAttribute('slot', a);
        },
        get className() {
          return this.getAttribute('class') || '';
        },
        set className(a) {
          this.__shady_setAttribute('class', a);
        },
        setAttribute: function (a, b) {
          this.ownerDocument !== Bb
            ? this.__shady_native_setAttribute(a, b)
            : Ab(this, a, b) || (this.__shady_native_setAttribute(a, b), Cb(this, a));
        },
        removeAttribute: function (a) {
          this.ownerDocument !== Bb
            ? this.__shady_native_removeAttribute(a)
            : Ab(this, a, '')
              ? '' === this.getAttribute(a) && this.__shady_native_removeAttribute(a)
              : (this.__shady_native_removeAttribute(a), Cb(this, a));
        }
      }),
      Ib = A({
        attachShadow: function (a) {
          if (!this) throw Error('Must provide a host.');
          if (!a) throw Error('Not enough arguments.');
          if (a.shadyUpgradeFragment && !u.L) {
            var b = a.shadyUpgradeFragment;
            b.__proto__ = ShadowRoot.prototype;
            Gb(b, this, a);
            P(b, b);
            a = b.__noInsertionPoint ? null : b.querySelectorAll('slot');
            b.__noInsertionPoint = void 0;
            if (a && a.length) {
              var c = b;
              rb(c);
              c.f.push.apply(c.f, a instanceof Array ? a : ca(ba(a)));
              J(b);
            }
            b.host.__shady_native_appendChild(b);
          } else b = new Q(Hb, this, a);
          return (this.__CE_shadowRoot = b);
        },
        get shadowRoot() {
          var a = t(this);
          return (a && a.U) || null;
        }
      });
    Object.assign(Fb, Ib);
    var Jb = /[&\u00A0"]/g,
      Kb = /[&\u00A0<>]/g;
    function Lb(a) {
      switch (a) {
        case '&':
          return '&amp;';
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '"':
          return '&quot;';
        case '\u00a0':
          return '&nbsp;';
      }
    }
    function Mb(a) {
      for (var b = {}, c = 0; c < a.length; c++) {
        b[a[c]] = !0;
      }
      return b;
    }
    var Nb = Mb(
        'area base br col command embed hr img input keygen link meta param source track wbr'.split(
          ' '
        )
      ),
      Ob = Mb('style script xmp iframe noembed noframes plaintext noscript'.split(' '));
    function Pb(a, b) {
      'template' === a.localName && (a = a.content);
      for (
        var c = '', d = b ? b(a) : a.childNodes, e = 0, f = d.length, g = void 0;
        e < f && (g = d[e]);
        e++
      ) {
        a: {
          var h = g;
          var m = a,
            k = b;
          switch (h.nodeType) {
            case Node.ELEMENT_NODE:
              m = h.localName;
              for (var l = '<' + m, q = h.attributes, D = 0, Ea; (Ea = q[D]); D++) {
                l += ' ' + Ea.name + '="' + Ea.value.replace(Jb, Lb) + '"';
              }
              l += '>';
              h = Nb[m] ? l : l + Pb(h, k) + '</' + m + '>';
              break a;
            case Node.TEXT_NODE:
              h = h.data;
              h = m && Ob[m.localName] ? h : h.replace(Kb, Lb);
              break a;
            case Node.COMMENT_NODE:
              h = '\x3c!--' + h.data + '--\x3e';
              break a;
            default:
              throw (window.console.error(h), Error('not implemented'));
          }
        }
        c += h;
      }
      return c;
    }
    var Qb = document.implementation.createHTMLDocument('inert'),
      Rb = A({
        get innerHTML() {
          return v(this)
            ? Pb('template' === this.localName ? this.content : this, ta)
            : this.__shady_native_innerHTML;
        },
        set innerHTML(a) {
          if ('template' === this.localName) this.__shady_native_innerHTML = a;
          else {
            jb(this);
            var b = this.localName || 'div';
            b =
              this.namespaceURI && this.namespaceURI !== Qb.namespaceURI
                ? Qb.createElementNS(this.namespaceURI, b)
                : Qb.createElement(b);
            for (
              u.c ? (b.__shady_native_innerHTML = a) : (b.innerHTML = a);
              (a = b.__shady_firstChild);

            ) {
              this.__shady_insertBefore(a);
            }
          }
        }
      });
    var Sb = A({
      blur: function () {
        var a = t(this);
        (a = (a = a && a.root) && a.activeElement) ? a.__shady_blur() : this.__shady_native_blur();
      }
    });
    u.G ||
      db.forEach(function (a) {
        Sb[a] = {
          set: function (b) {
            var c = r(this),
              d = a.substring(2);
            c.h || (c.h = {});
            c.h[a] && this.removeEventListener(d, c.h[a]);
            this.__shady_addEventListener(d, b);
            c.h[a] = b;
          },
          get: function () {
            var b = t(this);
            return b && b.h && b.h[a];
          },
          configurable: !0
        };
      });
    var Tb = A({
      assignedNodes: function (a) {
        if ('slot' === this.localName) {
          var b = this.__shady_getRootNode();
          b && w(b) && L(b);
          return (b = t(this)) ? (a && a.flatten ? b.l : b.assignedNodes) || [] : [];
        }
      },
      addEventListener: function (a, b, c) {
        if ('slot' !== this.localName || 'slotchange' === a) Va.call(this, a, b, c);
        else {
          'object' !== typeof c &&
            (c = {
              capture: !!c
            });
          var d = this.__shady_parentNode;
          if (!d) throw Error('ShadyDOM cannot attach event to slot unless it has a `parentNode`');
          c.i = this;
          d.__shady_addEventListener(a, b, c);
        }
      },
      removeEventListener: function (a, b, c) {
        if ('slot' !== this.localName || 'slotchange' === a) Xa.call(this, a, b, c);
        else {
          'object' !== typeof c &&
            (c = {
              capture: !!c
            });
          var d = this.__shady_parentNode;
          if (!d) throw Error('ShadyDOM cannot attach event to slot unless it has a `parentNode`');
          c.i = this;
          d.__shady_removeEventListener(a, b, c);
        }
      }
    });
    var Ub = A({
      getElementById: function (a) {
        return '' === a
          ? null
          : vb(
              this,
              function (b) {
                return b.id == a;
              },
              function (b) {
                return !!b;
              }
            )[0] || null;
      }
    });
    var Vb = A({
      get activeElement() {
        var a = u.c ? document.__shady_native_activeElement : document.activeElement;
        if (!a || !a.nodeType) return null;
        var b = !!w(this);
        if (!(this === document || (b && this.host !== a && this.host.__shady_native_contains(a))))
          return null;
        for (b = G(a); b && b !== this; ) {
          (a = b.host), (b = G(a));
        }
        return this === document ? (b ? null : a) : b === this ? a : null;
      }
    });
    var Wb = window.document,
      Xb = A({
        importNode: function (a, b) {
          if (a.ownerDocument !== Wb || 'template' === a.localName)
            return this.__shady_native_importNode(a, b);
          var c = this.__shady_native_importNode(a, !1);
          if (b)
            for (a = a.__shady_firstChild; a; a = a.__shady_nextSibling) {
              (b = this.__shady_importNode(a, !0)), c.__shady_appendChild(b);
            }
          return c;
        }
      });
    var Yb = A({
      dispatchEvent: Ua,
      addEventListener: Va.bind(window),
      removeEventListener: Xa.bind(window)
    });
    var R = {};
    Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'parentElement') &&
      (R.parentElement = K.parentElement);
    Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'contains') && (R.contains = K.contains);
    Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'children') && (R.children = N.children);
    Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'innerHTML') &&
      (R.innerHTML = Rb.innerHTML);
    Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'className') &&
      (R.className = Fb.className);
    var S = {
        EventTarget: [eb],
        Node: [K, window.EventTarget ? null : eb],
        Text: [M],
        Comment: [M],
        CDATASection: [M],
        ProcessingInstruction: [M],
        Element: [
          Fb,
          N,
          M,
          !u.c || 'innerHTML' in Element.prototype ? Rb : null,
          window.HTMLSlotElement ? null : Tb
        ],
        HTMLElement: [Sb, R],
        HTMLSlotElement: [Tb],
        DocumentFragment: [yb, Ub],
        Document: [Xb, yb, Ub, Vb],
        Window: [Yb]
      },
      Zb = u.c ? null : ['innerHTML', 'textContent'];
    function T(a, b, c, d) {
      b.forEach(function (e) {
        return a && e && z(a, e, c, d);
      });
    }
    function $b(a) {
      var b = a ? null : Zb,
        c;
      for (c in S) {
        T(window[c] && window[c].prototype, S[c], a, b);
      }
    }
    ['Text', 'Comment', 'CDATASection', 'ProcessingInstruction'].forEach(function (a) {
      var b = window[a],
        c = Object.create(b.prototype);
      c.__shady_protoIsPatched = !0;
      T(c, S.EventTarget);
      T(c, S.Node);
      S[a] && T(c, S[a]);
      b.prototype.__shady_patchedProto = c;
    });
    function ac(a) {
      a.__shady_protoIsPatched = !0;
      T(a, S.EventTarget);
      T(a, S.Node);
      T(a, S.Element);
      T(a, S.HTMLElement);
      T(a, S.HTMLSlotElement);
      return a;
    }
    var bc = u.F,
      cc = u.c;
    function dc(a, b) {
      if (bc && !a.__shady_protoIsPatched && !w(a)) {
        var c = Object.getPrototypeOf(a),
          d = c.hasOwnProperty('__shady_patchedProto') && c.__shady_patchedProto;
        d || ((d = Object.create(c)), ac(d), (c.__shady_patchedProto = d));
        Object.setPrototypeOf(a, d);
      }
      cc || (1 === b ? Da(a) : 2 === b && Fa(a));
    }
    function ec(a, b, c, d) {
      dc(a, 1);
      d = d || null;
      var e = r(a),
        f = d ? r(d) : null;
      e.previousSibling = d ? f.previousSibling : b.__shady_lastChild;
      if ((f = t(e.previousSibling))) f.nextSibling = a;
      if ((f = t((e.nextSibling = d)))) f.previousSibling = a;
      e.parentNode = b;
      d
        ? d === c.firstChild && (c.firstChild = a)
        : ((c.lastChild = a), c.firstChild || (c.firstChild = a));
      c.childNodes = null;
    }
    function sb(a, b, c) {
      dc(b, 2);
      var d = r(b);
      void 0 !== d.firstChild && (d.childNodes = null);
      if (a.nodeType === Node.DOCUMENT_FRAGMENT_NODE)
        for (a = a.__shady_native_firstChild; a; a = a.__shady_native_nextSibling) {
          ec(a, b, d, c);
        }
      else ec(a, b, d, c);
    }
    function ub(a, b) {
      var c = r(a);
      b = r(b);
      a === b.firstChild && (b.firstChild = c.nextSibling);
      a === b.lastChild && (b.lastChild = c.previousSibling);
      a = c.previousSibling;
      var d = c.nextSibling;
      a && (r(a).nextSibling = d);
      d && (r(d).previousSibling = a);
      c.parentNode = c.previousSibling = c.nextSibling = void 0;
      void 0 !== b.childNodes && (b.childNodes = null);
    }
    function P(a, b) {
      var c = r(a);
      if (b || void 0 === c.firstChild) {
        c.childNodes = null;
        var d = (c.firstChild = a.__shady_native_firstChild);
        c.lastChild = a.__shady_native_lastChild;
        dc(a, 2);
        c = d;
        for (d = void 0; c; c = c.__shady_native_nextSibling) {
          var e = r(c);
          e.parentNode = b || a;
          e.nextSibling = c.__shady_native_nextSibling;
          e.previousSibling = d || null;
          d = c;
          dc(c, 1);
        }
      }
    }
    var fc = A({
      addEventListener: function (a, b, c) {
        'object' !== typeof c &&
          (c = {
            capture: !!c
          });
        c.i = c.i || this;
        this.host.__shady_addEventListener(a, b, c);
      },
      removeEventListener: function (a, b, c) {
        'object' !== typeof c &&
          (c = {
            capture: !!c
          });
        c.i = c.i || this;
        this.host.__shady_removeEventListener(a, b, c);
      }
    });
    function gc(a, b) {
      z(a, fc, b);
      z(a, Vb, b);
      z(a, Rb, b);
      z(a, N, b);
      u.g && !b ? (z(a, K, b), z(a, Ub, b)) : u.c || (z(a, Aa), z(a, ya), z(a, za));
    }
    var Hb = {},
      U = u.deferConnectionCallbacks && 'loading' === document.readyState,
      hc;
    function ic(a) {
      var b = [];
      do {
        b.unshift(a);
      } while ((a = a.__shady_parentNode));
      return b;
    }
    function Q(a, b, c) {
      if (a !== Hb) throw new TypeError('Illegal constructor');
      this.a = null;
      Gb(this, b, c);
    }
    function Gb(a, b, c) {
      a.host = b;
      a.mode = c && c.mode;
      P(a.host);
      b = r(a.host);
      b.root = a;
      b.U = 'closed' !== a.mode ? a : null;
      b = r(a);
      b.firstChild = b.lastChild = b.parentNode = b.nextSibling = b.previousSibling = null;
      if (u.preferPerformance)
        for (; (b = a.host.__shady_native_firstChild); ) {
          a.host.__shady_native_removeChild(b);
        }
      else J(a);
    }
    function J(a) {
      a.j ||
        ((a.j = !0),
        xa(function () {
          return L(a);
        }));
    }
    function L(a) {
      var b;
      if ((b = a.j)) {
        for (var c; a; ) {
          a: {
            a.j && (c = a), (b = a);
            a = b.host.__shady_getRootNode();
            if (w(a) && (b = t(b.host)) && 0 < b.s) break a;
            a = void 0;
          }
        }
        b = c;
      }
      (c = b) && c._renderSelf();
    }
    Q.prototype._renderSelf = function () {
      var a = U;
      U = !0;
      this.j = !1;
      if (this.a) {
        O(this);
        for (var b = 0, c; b < this.a.length; b++) {
          c = this.a[b];
          var d = t(c),
            e = d.assignedNodes;
          d.assignedNodes = [];
          d.l = [];
          if ((d.I = e))
            for (d = 0; d < e.length; d++) {
              var f = t(e[d]);
              f.B = f.assignedSlot;
              f.assignedSlot === c && (f.assignedSlot = null);
            }
        }
        for (b = this.host.__shady_firstChild; b; b = b.__shady_nextSibling) {
          jc(this, b);
        }
        for (b = 0; b < this.a.length; b++) {
          c = this.a[b];
          e = t(c);
          if (!e.assignedNodes.length)
            for (d = c.__shady_firstChild; d; d = d.__shady_nextSibling) {
              jc(this, d, c);
            }
          (d = (d = t(c.__shady_parentNode)) && d.root) && (ka(d) || d.j) && d._renderSelf();
          kc(this, e.l, e.assignedNodes);
          if ((d = e.I)) {
            for (f = 0; f < d.length; f++) {
              t(d[f]).B = null;
            }
            e.I = null;
            d.length > e.assignedNodes.length && (e.C = !0);
          }
          e.C && ((e.C = !1), lc(this, c));
        }
        c = this.a;
        b = [];
        for (e = 0; e < c.length; e++) {
          (d = c[e].__shady_parentNode), ((f = t(d)) && f.root) || !(0 > b.indexOf(d)) || b.push(d);
        }
        for (c = 0; c < b.length; c++) {
          f = b[c];
          e = f === this ? this.host : f;
          d = [];
          for (f = f.__shady_firstChild; f; f = f.__shady_nextSibling) {
            if ('slot' == f.localName)
              for (var g = t(f).l, h = 0; h < g.length; h++) {
                d.push(g[h]);
              }
            else d.push(f);
          }
          f = sa(e);
          g = ea(d, d.length, f, f.length);
          for (var m = (h = 0), k = void 0; h < g.length && (k = g[h]); h++) {
            for (var l = 0, q = void 0; l < k.o.length && (q = k.o[l]); l++) {
              q.__shady_native_parentNode === e && e.__shady_native_removeChild(q),
                f.splice(k.index + m, 1);
            }
            m -= k.u;
          }
          m = 0;
          for (k = void 0; m < g.length && (k = g[m]); m++) {
            for (h = f[k.index], l = k.index; l < k.index + k.u; l++) {
              (q = d[l]), e.__shady_native_insertBefore(q, h), f.splice(l, 0, q);
            }
          }
        }
      }
      if (!u.preferPerformance && !this.H)
        for (b = this.host.__shady_firstChild; b; b = b.__shady_nextSibling) {
          (c = t(b)),
            b.__shady_native_parentNode !== this.host ||
              ('slot' !== b.localName && c.assignedSlot) ||
              this.host.__shady_native_removeChild(b);
        }
      this.H = !0;
      U = a;
      hc && hc();
    };
    function jc(a, b, c) {
      var d = r(b),
        e = d.B;
      d.B = null;
      c || (c = (a = a.b[b.__shady_slot || '__catchall']) && a[0]);
      c ? (r(c).assignedNodes.push(b), (d.assignedSlot = c)) : (d.assignedSlot = void 0);
      e !== d.assignedSlot && d.assignedSlot && (r(d.assignedSlot).C = !0);
    }
    function kc(a, b, c) {
      for (var d = 0, e = void 0; d < c.length && (e = c[d]); d++) {
        if ('slot' == e.localName) {
          var f = t(e).assignedNodes;
          f && f.length && kc(a, b, f);
        } else b.push(c[d]);
      }
    }
    function lc(a, b) {
      b.__shady_native_dispatchEvent(new Event('slotchange'));
      b = t(b);
      b.assignedSlot && lc(a, b.assignedSlot);
    }
    function rb(a) {
      a.f = a.f || [];
      a.a = a.a || [];
      a.b = a.b || {};
    }
    function O(a) {
      if (a.f && a.f.length) {
        for (var b = a.f, c, d = 0; d < b.length; d++) {
          var e = b[d];
          P(e);
          var f = e.__shady_parentNode;
          P(f);
          f = t(f);
          f.s = (f.s || 0) + 1;
          f = Db(e);
          a.b[f] ? ((c = c || {}), (c[f] = !0), a.b[f].push(e)) : (a.b[f] = [e]);
          a.a.push(e);
        }
        if (c)
          for (var g in c) {
            a.b[g] = Eb(a.b[g]);
          }
        a.f = [];
      }
    }
    function Db(a) {
      var b = a.name || a.getAttribute('name') || '__catchall';
      return (a.O = b);
    }
    function Eb(a) {
      return a.sort(function (b, c) {
        b = ic(b);
        for (var d = ic(c), e = 0; e < b.length; e++) {
          c = b[e];
          var f = d[e];
          if (c !== f) return (b = ta(c.__shady_parentNode)), b.indexOf(c) - b.indexOf(f);
        }
      });
    }
    function tb(a, b) {
      if (a.a) {
        O(a);
        var c = a.b,
          d;
        for (d in c) {
          for (var e = c[d], f = 0; f < e.length; f++) {
            var g = e[f];
            if (ra(b, g)) {
              e.splice(f, 1);
              var h = a.a.indexOf(g);
              0 <= h && (a.a.splice(h, 1), (h = t(g.__shady_parentNode)) && h.s && h.s--);
              f--;
              g = t(g);
              if ((h = g.l))
                for (var m = 0; m < h.length; m++) {
                  var k = h[m],
                    l = k.__shady_native_parentNode;
                  l && l.__shady_native_removeChild(k);
                }
              g.l = [];
              g.assignedNodes = [];
              h = !0;
            }
          }
        }
        return h;
      }
    }
    function ka(a) {
      O(a);
      return !(!a.a || !a.a.length);
    }
    (function (a) {
      a.__proto__ = DocumentFragment.prototype;
      gc(a, '__shady_');
      gc(a);
      Object.defineProperties(a, {
        nodeType: {
          value: Node.DOCUMENT_FRAGMENT_NODE,
          configurable: !0
        },
        nodeName: {
          value: '#document-fragment',
          configurable: !0
        },
        nodeValue: {
          value: null,
          configurable: !0
        }
      });
      ['localName', 'namespaceURI', 'prefix'].forEach(function (b) {
        Object.defineProperty(a, b, {
          value: void 0,
          configurable: !0
        });
      });
      ['ownerDocument', 'baseURI', 'isConnected'].forEach(function (b) {
        Object.defineProperty(a, b, {
          get: function () {
            return this.host[b];
          },
          configurable: !0
        });
      });
    })(Q.prototype);
    if (window.customElements && u.D && !u.preferPerformance) {
      var mc = new Map();
      hc = function () {
        var a = [];
        mc.forEach(function (d, e) {
          a.push([e, d]);
        });
        mc.clear();
        for (var b = 0; b < a.length; b++) {
          var c = a[b][0];
          a[b][1] ? c.__shadydom_connectedCallback() : c.__shadydom_disconnectedCallback();
        }
      };
      U &&
        document.addEventListener(
          'readystatechange',
          function () {
            U = !1;
            hc();
          },
          {
            once: !0
          }
        );
      var nc = function (a, b, c) {
          var d = 0,
            e = '__isConnected' + d++;
          if (b || c)
            (a.prototype.connectedCallback = a.prototype.__shadydom_connectedCallback =
              function () {
                U ? mc.set(this, !0) : this[e] || ((this[e] = !0), b && b.call(this));
              }),
              (a.prototype.disconnectedCallback = a.prototype.__shadydom_disconnectedCallback =
                function () {
                  U
                    ? this.isConnected || mc.set(this, !1)
                    : this[e] && ((this[e] = !1), c && c.call(this));
                });
          return a;
        },
        oc = window.customElements.define,
        pc = function (a, b) {
          var c = b.prototype.connectedCallback,
            d = b.prototype.disconnectedCallback;
          oc.call(window.customElements, a, nc(b, c, d));
          b.prototype.connectedCallback = c;
          b.prototype.disconnectedCallback = d;
        };
      window.customElements.define = pc;
      Object.defineProperty(window.CustomElementRegistry.prototype, 'define', {
        value: pc,
        configurable: !0
      });
    }
    function G(a) {
      a = a.__shady_getRootNode();
      if (w(a)) return a;
    }
    function qc() {
      this.a = !1;
      this.addedNodes = [];
      this.removedNodes = [];
      this.v = new Set();
    }
    function nb(a) {
      a.a ||
        ((a.a = !0),
        pa(function () {
          a.flush();
        }));
    }
    qc.prototype.flush = function () {
      if (this.a) {
        this.a = !1;
        var a = this.takeRecords();
        a.length &&
          this.v.forEach(function (b) {
            b(a);
          });
      }
    };
    qc.prototype.takeRecords = function () {
      if (this.addedNodes.length || this.removedNodes.length) {
        var a = [
          {
            addedNodes: this.addedNodes,
            removedNodes: this.removedNodes
          }
        ];
        this.addedNodes = [];
        this.removedNodes = [];
        return a;
      }
      return [];
    };
    function rc(a, b) {
      var c = r(a);
      c.m || (c.m = new qc());
      c.m.v.add(b);
      var d = c.m;
      return {
        P: b,
        S: d,
        R: a,
        takeRecords: function () {
          return d.takeRecords();
        }
      };
    }
    function sc(a) {
      var b = a && a.S;
      b && (b.v.delete(a.P), b.v.size || (r(a.R).m = null));
    }
    function tc(a, b) {
      var c = b.getRootNode();
      return a
        .map(function (d) {
          var e = c === d.target.getRootNode();
          if (e && d.addedNodes) {
            if (
              ((e = Array.from(d.addedNodes).filter(function (f) {
                return c === f.getRootNode();
              })),
              e.length)
            )
              return (
                (d = Object.create(d)),
                Object.defineProperty(d, 'addedNodes', {
                  value: e,
                  configurable: !0
                }),
                d
              );
          } else if (e) return d;
        })
        .filter(function (d) {
          return d;
        });
    }
    var uc = u.c,
      vc = {
        querySelector: function (a) {
          return this.__shady_native_querySelector(a);
        },
        querySelectorAll: function (a) {
          return this.__shady_native_querySelectorAll(a);
        }
      },
      wc = {};
    function xc(a) {
      wc[a] = function (b) {
        return b['__shady_native_' + a];
      };
    }
    function V(a, b) {
      z(a, b, '__shady_native_');
      for (var c in b) {
        xc(c);
      }
    }
    function W(a, b) {
      b = void 0 === b ? [] : b;
      for (var c = 0; c < b.length; c++) {
        var d = b[c],
          e = Object.getOwnPropertyDescriptor(a, d);
        e &&
          (Object.defineProperty(a, '__shady_native_' + d, e),
          e.value ? vc[d] || (vc[d] = e.value) : xc(d));
      }
    }
    var X = document.createTreeWalker(document, NodeFilter.SHOW_ALL, null, !1),
      Y = document.createTreeWalker(document, NodeFilter.SHOW_ELEMENT, null, !1),
      yc = document.implementation.createHTMLDocument('inert');
    function zc(a) {
      for (var b; (b = a.__shady_native_firstChild); ) {
        a.__shady_native_removeChild(b);
      }
    }
    var Ac = ['firstElementChild', 'lastElementChild', 'children', 'childElementCount'],
      Bc = ['querySelector', 'querySelectorAll'];
    function Cc() {
      var a = ['dispatchEvent', 'addEventListener', 'removeEventListener'];
      window.EventTarget
        ? W(window.EventTarget.prototype, a)
        : (W(Node.prototype, a), W(Window.prototype, a));
      uc
        ? W(
            Node.prototype,
            'parentNode firstChild lastChild previousSibling nextSibling childNodes parentElement textContent'.split(
              ' '
            )
          )
        : V(Node.prototype, {
            parentNode: {
              get: function () {
                X.currentNode = this;
                return X.parentNode();
              }
            },
            firstChild: {
              get: function () {
                X.currentNode = this;
                return X.firstChild();
              }
            },
            lastChild: {
              get: function () {
                X.currentNode = this;
                return X.lastChild();
              }
            },
            previousSibling: {
              get: function () {
                X.currentNode = this;
                return X.previousSibling();
              }
            },
            nextSibling: {
              get: function () {
                X.currentNode = this;
                return X.nextSibling();
              }
            },
            childNodes: {
              get: function () {
                var b = [];
                X.currentNode = this;
                for (var c = X.firstChild(); c; ) {
                  b.push(c), (c = X.nextSibling());
                }
                return b;
              }
            },
            parentElement: {
              get: function () {
                Y.currentNode = this;
                return Y.parentNode();
              }
            },
            textContent: {
              get: function () {
                switch (this.nodeType) {
                  case Node.ELEMENT_NODE:
                  case Node.DOCUMENT_FRAGMENT_NODE:
                    for (
                      var b = document.createTreeWalker(this, NodeFilter.SHOW_TEXT, null, !1),
                        c = '',
                        d;
                      (d = b.nextNode());

                    ) {
                      c += d.nodeValue;
                    }
                    return c;
                  default:
                    return this.nodeValue;
                }
              },
              set: function (b) {
                if ('undefined' === typeof b || null === b) b = '';
                switch (this.nodeType) {
                  case Node.ELEMENT_NODE:
                  case Node.DOCUMENT_FRAGMENT_NODE:
                    zc(this);
                    (0 < b.length || this.nodeType === Node.ELEMENT_NODE) &&
                      this.__shady_native_insertBefore(document.createTextNode(b), void 0);
                    break;
                  default:
                    this.nodeValue = b;
                }
              }
            }
          });
      W(
        Node.prototype,
        'appendChild insertBefore removeChild replaceChild cloneNode contains'.split(' ')
      );
      W(HTMLElement.prototype, ['parentElement', 'contains']);
      a = {
        firstElementChild: {
          get: function () {
            Y.currentNode = this;
            return Y.firstChild();
          }
        },
        lastElementChild: {
          get: function () {
            Y.currentNode = this;
            return Y.lastChild();
          }
        },
        children: {
          get: function () {
            var b = [];
            Y.currentNode = this;
            for (var c = Y.firstChild(); c; ) {
              b.push(c), (c = Y.nextSibling());
            }
            return y(b);
          }
        },
        childElementCount: {
          get: function () {
            return this.children ? this.children.length : 0;
          }
        }
      };
      uc
        ? (W(Element.prototype, Ac),
          W(Element.prototype, [
            'previousElementSibling',
            'nextElementSibling',
            'innerHTML',
            'className'
          ]),
          W(HTMLElement.prototype, ['children', 'innerHTML', 'className']))
        : (V(Element.prototype, a),
          V(Element.prototype, {
            previousElementSibling: {
              get: function () {
                Y.currentNode = this;
                return Y.previousSibling();
              }
            },
            nextElementSibling: {
              get: function () {
                Y.currentNode = this;
                return Y.nextSibling();
              }
            },
            innerHTML: {
              get: function () {
                return Pb(this, sa);
              },
              set: function (b) {
                var c = 'template' === this.localName ? this.content : this;
                zc(c);
                var d = this.localName || 'div';
                d =
                  this.namespaceURI && this.namespaceURI !== yc.namespaceURI
                    ? yc.createElementNS(this.namespaceURI, d)
                    : yc.createElement(d);
                d.innerHTML = b;
                for (
                  b = 'template' === this.localName ? d.content : d;
                  (d = b.__shady_native_firstChild);

                ) {
                  c.__shady_native_insertBefore(d, void 0);
                }
              }
            },
            className: {
              get: function () {
                return this.getAttribute('class') || '';
              },
              set: function (b) {
                this.setAttribute('class', b);
              }
            }
          }));
      W(
        Element.prototype,
        'setAttribute getAttribute hasAttribute removeAttribute focus blur'.split(' ')
      );
      W(Element.prototype, Bc);
      W(HTMLElement.prototype, ['focus', 'blur']);
      window.HTMLTemplateElement && W(window.HTMLTemplateElement.prototype, ['innerHTML']);
      uc ? W(DocumentFragment.prototype, Ac) : V(DocumentFragment.prototype, a);
      W(DocumentFragment.prototype, Bc);
      uc
        ? (W(Document.prototype, Ac), W(Document.prototype, ['activeElement']))
        : V(Document.prototype, a);
      W(Document.prototype, ['importNode', 'getElementById']);
      W(Document.prototype, Bc);
    }
    function Z(a) {
      this.node = a;
    }
    n = Z.prototype;
    n.addEventListener = function (a, b, c) {
      return this.node.__shady_addEventListener(a, b, c);
    };
    n.removeEventListener = function (a, b, c) {
      return this.node.__shady_removeEventListener(a, b, c);
    };
    n.appendChild = function (a) {
      return this.node.__shady_appendChild(a);
    };
    n.insertBefore = function (a, b) {
      return this.node.__shady_insertBefore(a, b);
    };
    n.removeChild = function (a) {
      return this.node.__shady_removeChild(a);
    };
    n.replaceChild = function (a, b) {
      return this.node.__shady_replaceChild(a, b);
    };
    n.cloneNode = function (a) {
      return this.node.__shady_cloneNode(a);
    };
    n.getRootNode = function (a) {
      return this.node.__shady_getRootNode(a);
    };
    n.contains = function (a) {
      return this.node.__shady_contains(a);
    };
    n.dispatchEvent = function (a) {
      return this.node.__shady_dispatchEvent(a);
    };
    n.setAttribute = function (a, b) {
      this.node.__shady_setAttribute(a, b);
    };
    n.getAttribute = function (a) {
      return this.node.__shady_native_getAttribute(a);
    };
    n.removeAttribute = function (a) {
      this.node.__shady_removeAttribute(a);
    };
    n.attachShadow = function (a) {
      return this.node.__shady_attachShadow(a);
    };
    n.focus = function () {
      this.node.__shady_native_focus();
    };
    n.blur = function () {
      this.node.__shady_blur();
    };
    n.importNode = function (a, b) {
      if (this.node.nodeType === Node.DOCUMENT_NODE) return this.node.__shady_importNode(a, b);
    };
    n.getElementById = function (a) {
      if (this.node.nodeType === Node.DOCUMENT_NODE) return this.node.__shady_getElementById(a);
    };
    n.querySelector = function (a) {
      return this.node.__shady_querySelector(a);
    };
    n.querySelectorAll = function (a, b) {
      return this.node.__shady_querySelectorAll(a, b);
    };
    n.assignedNodes = function (a) {
      if ('slot' === this.node.localName) return this.node.__shady_assignedNodes(a);
    };
    da.Object.defineProperties(Z.prototype, {
      activeElement: {
        configurable: !0,
        enumerable: !0,
        get: function () {
          if (w(this.node) || this.node.nodeType === Node.DOCUMENT_NODE)
            return this.node.__shady_activeElement;
        }
      },
      _activeElement: {
        configurable: !0,
        enumerable: !0,
        get: function () {
          return this.activeElement;
        }
      },
      host: {
        configurable: !0,
        enumerable: !0,
        get: function () {
          if (w(this.node)) return this.node.host;
        }
      },
      parentNode: {
        configurable: !0,
        enumerable: !0,
        get: function () {
          return this.node.__shady_parentNode;
        }
      },
      firstChild: {
        configurable: !0,
        enumerable: !0,
        get: function () {
          return this.node.__shady_firstChild;
        }
      },
      lastChild: {
        configurable: !0,
        enumerable: !0,
        get: function () {
          return this.node.__shady_lastChild;
        }
      },
      nextSibling: {
        configurable: !0,
        enumerable: !0,
        get: function () {
          return this.node.__shady_nextSibling;
        }
      },
      previousSibling: {
        configurable: !0,
        enumerable: !0,
        get: function () {
          return this.node.__shady_previousSibling;
        }
      },
      childNodes: {
        configurable: !0,
        enumerable: !0,
        get: function () {
          return this.node.__shady_childNodes;
        }
      },
      parentElement: {
        configurable: !0,
        enumerable: !0,
        get: function () {
          return this.node.__shady_parentElement;
        }
      },
      firstElementChild: {
        configurable: !0,
        enumerable: !0,
        get: function () {
          return this.node.__shady_firstElementChild;
        }
      },
      lastElementChild: {
        configurable: !0,
        enumerable: !0,
        get: function () {
          return this.node.__shady_lastElementChild;
        }
      },
      nextElementSibling: {
        configurable: !0,
        enumerable: !0,
        get: function () {
          return this.node.__shady_nextElementSibling;
        }
      },
      previousElementSibling: {
        configurable: !0,
        enumerable: !0,
        get: function () {
          return this.node.__shady_previousElementSibling;
        }
      },
      children: {
        configurable: !0,
        enumerable: !0,
        get: function () {
          return this.node.__shady_children;
        }
      },
      childElementCount: {
        configurable: !0,
        enumerable: !0,
        get: function () {
          return this.node.__shady_childElementCount;
        }
      },
      shadowRoot: {
        configurable: !0,
        enumerable: !0,
        get: function () {
          return this.node.__shady_shadowRoot;
        }
      },
      assignedSlot: {
        configurable: !0,
        enumerable: !0,
        get: function () {
          return this.node.__shady_assignedSlot;
        }
      },
      isConnected: {
        configurable: !0,
        enumerable: !0,
        get: function () {
          return this.node.__shady_isConnected;
        }
      },
      innerHTML: {
        configurable: !0,
        enumerable: !0,
        get: function () {
          return this.node.__shady_innerHTML;
        },
        set: function (a) {
          this.node.__shady_innerHTML = a;
        }
      },
      textContent: {
        configurable: !0,
        enumerable: !0,
        get: function () {
          return this.node.__shady_textContent;
        },
        set: function (a) {
          this.node.__shady_textContent = a;
        }
      },
      slot: {
        configurable: !0,
        enumerable: !0,
        get: function () {
          return this.node.__shady_slot;
        },
        set: function (a) {
          this.node.__shady_slot = a;
        }
      },
      className: {
        configurable: !0,
        enumerable: !0,
        get: function () {
          return this.node.__shady_className;
        },
        set: function (a) {
          return (this.node.__shady_className = a);
        }
      }
    });
    db.forEach(function (a) {
      Object.defineProperty(Z.prototype, a, {
        get: function () {
          return this.node['__shady_' + a];
        },
        set: function (b) {
          this.node['__shady_' + a] = b;
        },
        configurable: !0
      });
    });
    var Dc = new WeakMap();
    function Ec(a) {
      if (w(a) || a instanceof Z) return a;
      var b = Dc.get(a);
      b || ((b = new Z(a)), Dc.set(a, b));
      return b;
    }
    if (u.D) {
      var Fc = u.c
        ? function (a) {
            return a;
          }
        : function (a) {
            Fa(a);
            Da(a);
            return a;
          };
      window.ShadyDOM = {
        inUse: u.D,
        patch: Fc,
        isShadyRoot: w,
        enqueue: xa,
        flush: C,
        flushInitial: function (a) {
          !a.H && a.j && L(a);
        },
        settings: u,
        filterMutations: tc,
        observeChildren: rc,
        unobserveChildren: sc,
        deferConnectionCallbacks: u.deferConnectionCallbacks,
        preferPerformance: u.preferPerformance,
        handlesDynamicScoping: !0,
        wrap: u.g ? Ec : Fc,
        wrapIfNeeded:
          !0 === u.g
            ? Ec
            : function (a) {
                return a;
              },
        Wrapper: Z,
        composedPath: Ma,
        noPatch: u.g,
        patchOnDemand: u.F,
        nativeMethods: vc,
        nativeTree: wc,
        patchElementProto: ac
      };
      Cc();
      $b('__shady_');
      Object.defineProperty(document, '_activeElement', Vb.activeElement);
      z(Window.prototype, Yb, '__shady_');
      u.g ? u.F && z(Element.prototype, Ib) : ($b(), cb());
      Ya();
      window.Event = $a;
      window.CustomEvent = ab;
      window.MouseEvent = bb;
      window.ShadowRoot = Q;
    }
  }).call(commonjsGlobal);

  window.Sifrr.Dom.setup();
  window.Sifrr.Dom.load('sifrr-test', '/elements/sifrr/test.js');
  window.Sifrr.Dom.load('sifrr-nosr', '/elements/sifrr/nosr.js');
})();
//# sourceMappingURL=index.js.map
