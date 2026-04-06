;(function () {
  let e = document.createElement(`link`).relList
  if (e && e.supports && e.supports(`modulepreload`)) return
  for (let e of document.querySelectorAll(`link[rel="modulepreload"]`)) n(e)
  new MutationObserver((e) => {
    for (let t of e)
      if (t.type === `childList`) for (let e of t.addedNodes) e.tagName === `LINK` && e.rel === `modulepreload` && n(e)
  }).observe(document, { childList: !0, subtree: !0 })
  function t(e) {
    let t = {}
    return (
      e.integrity && (t.integrity = e.integrity),
      e.referrerPolicy && (t.referrerPolicy = e.referrerPolicy),
      e.crossOrigin === `use-credentials`
        ? (t.credentials = `include`)
        : e.crossOrigin === `anonymous`
          ? (t.credentials = `omit`)
          : (t.credentials = `same-origin`),
      t
    )
  }
  function n(e) {
    if (e.ep) return
    e.ep = !0
    let n = t(e)
    fetch(e.href, n)
  }
})()
var e = class extends HTMLElement {
    constructor(...e) {
      ;(super(...e), (this.abort = new AbortController()))
    }
    #e = void 0
    static {
      this.tagName = void 0
    }
    configureAria() {}
    onConnect() {}
    onDisconnect() {}
    set shadowMode(e) {
      this.#e = e
    }
    get shadowMode() {
      return this.#e
    }
    connectedCallback() {
      this.configureAria()
      let e = this.render()
      ;(e !== this && (this.#e ? this.attachShadow({ mode: this.#e }).appendChild(e) : this.appendChild(e)),
        this.onConnect())
    }
    disconnectedCallback() {
      ;(this.onDisconnect(), this.abort.abort())
    }
    attributeChangedCallback(e, t, n) {}
    destroy() {
      this.remove()
    }
  },
  t = Math.min,
  n = Math.max,
  r = Math.round,
  i = Math.floor,
  a = (e) => ({ x: e, y: e }),
  o = { left: `right`, right: `left`, bottom: `top`, top: `bottom` }
function s(e, t) {
  return typeof e == `function` ? e(t) : e
}
function c(e) {
  return e.split(`-`)[0]
}
function l(e) {
  return e.split(`-`)[1]
}
function u(e) {
  return e === `x` ? `y` : `x`
}
function d(e) {
  return e === `y` ? `height` : `width`
}
function f(e) {
  let t = e[0]
  return t === `t` || t === `b` ? `y` : `x`
}
function p(e) {
  return u(f(e))
}
function m(e, t, n) {
  n === void 0 && (n = !1)
  let r = l(e),
    i = p(e),
    a = d(i),
    o = i === `x` ? (r === (n ? `end` : `start`) ? `right` : `left`) : r === `start` ? `bottom` : `top`
  return (t.reference[a] > t.floating[a] && (o = C(o)), [o, C(o)])
}
function h(e) {
  let t = C(e)
  return [g(e), t, g(t)]
}
function g(e) {
  return e.includes(`start`) ? e.replace(`start`, `end`) : e.replace(`end`, `start`)
}
var _ = [`left`, `right`],
  v = [`right`, `left`],
  y = [`top`, `bottom`],
  b = [`bottom`, `top`]
function x(e, t, n) {
  switch (e) {
    case `top`:
    case `bottom`:
      return n ? (t ? v : _) : t ? _ : v
    case `left`:
    case `right`:
      return t ? y : b
    default:
      return []
  }
}
function S(e, t, n, r) {
  let i = l(e),
    a = x(c(e), n === `start`, r)
  return (i && ((a = a.map((e) => e + `-` + i)), t && (a = a.concat(a.map(g)))), a)
}
function C(e) {
  let t = c(e)
  return o[t] + e.slice(t.length)
}
function w(e) {
  return { top: 0, right: 0, bottom: 0, left: 0, ...e }
}
function ee(e) {
  return typeof e == `number` ? { top: e, right: e, bottom: e, left: e } : w(e)
}
function T(e) {
  let { x: t, y: n, width: r, height: i } = e
  return { width: r, height: i, top: n, left: t, right: t + r, bottom: n + i, x: t, y: n }
}
function E(e, t, n) {
  let { reference: r, floating: i } = e,
    a = f(t),
    o = p(t),
    s = d(o),
    u = c(t),
    m = a === `y`,
    h = r.x + r.width / 2 - i.width / 2,
    g = r.y + r.height / 2 - i.height / 2,
    _ = r[s] / 2 - i[s] / 2,
    v
  switch (u) {
    case `top`:
      v = { x: h, y: r.y - i.height }
      break
    case `bottom`:
      v = { x: h, y: r.y + r.height }
      break
    case `right`:
      v = { x: r.x + r.width, y: g }
      break
    case `left`:
      v = { x: r.x - i.width, y: g }
      break
    default:
      v = { x: r.x, y: r.y }
  }
  switch (l(t)) {
    case `start`:
      v[o] -= _ * (n && m ? -1 : 1)
      break
    case `end`:
      v[o] += _ * (n && m ? -1 : 1)
      break
  }
  return v
}
async function D(e, t) {
  t === void 0 && (t = {})
  let { x: n, y: r, platform: i, rects: a, elements: o, strategy: c } = e,
    {
      boundary: l = `clippingAncestors`,
      rootBoundary: u = `viewport`,
      elementContext: d = `floating`,
      altBoundary: f = !1,
      padding: p = 0,
    } = s(t, e),
    m = ee(p),
    h = o[f ? (d === `floating` ? `reference` : `floating`) : d],
    g = T(
      await i.getClippingRect({
        element:
          ((await (i.isElement == null ? void 0 : i.isElement(h))) ?? !0)
            ? h
            : h.contextElement || (await (i.getDocumentElement == null ? void 0 : i.getDocumentElement(o.floating))),
        boundary: l,
        rootBoundary: u,
        strategy: c,
      }),
    ),
    _ = d === `floating` ? { x: n, y: r, width: a.floating.width, height: a.floating.height } : a.reference,
    v = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(o.floating)),
    y = ((await (i.isElement == null ? void 0 : i.isElement(v))) &&
      (await (i.getScale == null ? void 0 : i.getScale(v)))) || { x: 1, y: 1 },
    b = T(
      i.convertOffsetParentRelativeRectToViewportRelativeRect
        ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
            elements: o,
            rect: _,
            offsetParent: v,
            strategy: c,
          })
        : _,
    )
  return {
    top: (g.top - b.top + m.top) / y.y,
    bottom: (b.bottom - g.bottom + m.bottom) / y.y,
    left: (g.left - b.left + m.left) / y.x,
    right: (b.right - g.right + m.right) / y.x,
  }
}
var O = 50,
  k = async (e, t, n) => {
    let { placement: r = `bottom`, strategy: i = `absolute`, middleware: a = [], platform: o } = n,
      s = o.detectOverflow ? o : { ...o, detectOverflow: D },
      c = await (o.isRTL == null ? void 0 : o.isRTL(t)),
      l = await o.getElementRects({ reference: e, floating: t, strategy: i }),
      { x: u, y: d } = E(l, r, c),
      f = r,
      p = 0,
      m = {}
    for (let n = 0; n < a.length; n++) {
      let h = a[n]
      if (!h) continue
      let { name: g, fn: _ } = h,
        {
          x: v,
          y,
          data: b,
          reset: x,
        } = await _({
          x: u,
          y: d,
          initialPlacement: r,
          placement: f,
          strategy: i,
          middlewareData: m,
          rects: l,
          platform: s,
          elements: { reference: e, floating: t },
        })
      ;((u = v ?? u),
        (d = y ?? d),
        (m[g] = { ...m[g], ...b }),
        x &&
          p < O &&
          (p++,
          typeof x == `object` &&
            (x.placement && (f = x.placement),
            x.rects &&
              (l = x.rects === !0 ? await o.getElementRects({ reference: e, floating: t, strategy: i }) : x.rects),
            ({ x: u, y: d } = E(l, f, c))),
          (n = -1)))
    }
    return { x: u, y: d, placement: f, strategy: i, middlewareData: m }
  },
  A = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        name: `flip`,
        options: e,
        async fn(t) {
          var n
          let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: l, elements: u } = t,
            {
              mainAxis: d = !0,
              crossAxis: p = !0,
              fallbackPlacements: g,
              fallbackStrategy: _ = `bestFit`,
              fallbackAxisSideDirection: v = `none`,
              flipAlignment: y = !0,
              ...b
            } = s(e, t)
          if ((n = i.arrow) != null && n.alignmentOffset) return {}
          let x = c(r),
            w = f(o),
            ee = c(o) === o,
            T = await (l.isRTL == null ? void 0 : l.isRTL(u.floating)),
            E = g || (ee || !y ? [C(o)] : h(o)),
            D = v !== `none`
          !g && D && E.push(...S(o, y, v, T))
          let O = [o, ...E],
            k = await l.detectOverflow(t, b),
            A = [],
            j = i.flip?.overflows || []
          if ((d && A.push(k[x]), p)) {
            let e = m(r, a, T)
            A.push(k[e[0]], k[e[1]])
          }
          if (((j = [...j, { placement: r, overflows: A }]), !A.every((e) => e <= 0))) {
            let e = (i.flip?.index || 0) + 1,
              t = O[e]
            if (
              t &&
              (!(p === `alignment` && w !== f(t)) || j.every((e) => (f(e.placement) === w ? e.overflows[0] > 0 : !0)))
            )
              return { data: { index: e, overflows: j }, reset: { placement: t } }
            let n = j.filter((e) => e.overflows[0] <= 0).sort((e, t) => e.overflows[1] - t.overflows[1])[0]?.placement
            if (!n)
              switch (_) {
                case `bestFit`: {
                  let e = j
                    .filter((e) => {
                      if (D) {
                        let t = f(e.placement)
                        return t === w || t === `y`
                      }
                      return !0
                    })
                    .map((e) => [e.placement, e.overflows.filter((e) => e > 0).reduce((e, t) => e + t, 0)])
                    .sort((e, t) => e[1] - t[1])[0]?.[0]
                  e && (n = e)
                  break
                }
                case `initialPlacement`:
                  n = o
                  break
              }
            if (r !== n) return { reset: { placement: n } }
          }
          return {}
        },
      }
    )
  },
  j = new Set([`left`, `top`])
async function te(e, t) {
  let { placement: n, platform: r, elements: i } = e,
    a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)),
    o = c(n),
    u = l(n),
    d = f(n) === `y`,
    p = j.has(o) ? -1 : 1,
    m = a && d ? -1 : 1,
    h = s(t, e),
    {
      mainAxis: g,
      crossAxis: _,
      alignmentAxis: v,
    } = typeof h == `number`
      ? { mainAxis: h, crossAxis: 0, alignmentAxis: null }
      : { mainAxis: h.mainAxis || 0, crossAxis: h.crossAxis || 0, alignmentAxis: h.alignmentAxis }
  return (
    u && typeof v == `number` && (_ = u === `end` ? v * -1 : v),
    d ? { x: _ * m, y: g * p } : { x: g * p, y: _ * m }
  )
}
var ne = function (e) {
    return (
      e === void 0 && (e = 0),
      {
        name: `offset`,
        options: e,
        async fn(t) {
          var n
          let { x: r, y: i, placement: a, middlewareData: o } = t,
            s = await te(t, e)
          return a === o.offset?.placement && (n = o.arrow) != null && n.alignmentOffset
            ? {}
            : { x: r + s.x, y: i + s.y, data: { ...s, placement: a } }
        },
      }
    )
  },
  re = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        name: `size`,
        options: e,
        async fn(r) {
          var i, a
          let { placement: o, rects: u, platform: d, elements: p } = r,
            { apply: m = () => {}, ...h } = s(e, r),
            g = await d.detectOverflow(r, h),
            _ = c(o),
            v = l(o),
            y = f(o) === `y`,
            { width: b, height: x } = u.floating,
            S,
            C
          _ === `top` || _ === `bottom`
            ? ((S = _),
              (C =
                v === ((await (d.isRTL == null ? void 0 : d.isRTL(p.floating))) ? `start` : `end`) ? `left` : `right`))
            : ((C = _), (S = v === `end` ? `top` : `bottom`))
          let w = x - g.top - g.bottom,
            ee = b - g.left - g.right,
            T = t(x - g[S], w),
            E = t(b - g[C], ee),
            D = !r.middlewareData.shift,
            O = T,
            k = E
          if (
            ((i = r.middlewareData.shift) != null && i.enabled.x && (k = ee),
            (a = r.middlewareData.shift) != null && a.enabled.y && (O = w),
            D && !v)
          ) {
            let e = n(g.left, 0),
              t = n(g.right, 0),
              r = n(g.top, 0),
              i = n(g.bottom, 0)
            y
              ? (k = b - 2 * (e !== 0 || t !== 0 ? e + t : n(g.left, g.right)))
              : (O = x - 2 * (r !== 0 || i !== 0 ? r + i : n(g.top, g.bottom)))
          }
          await m({ ...r, availableWidth: k, availableHeight: O })
          let A = await d.getDimensions(p.floating)
          return b !== A.width || x !== A.height ? { reset: { rects: !0 } } : {}
        },
      }
    )
  }
function ie() {
  return typeof window < `u`
}
function M(e) {
  return ae(e) ? (e.nodeName || ``).toLowerCase() : `#document`
}
function N(e) {
  var t
  return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window
}
function P(e) {
  return ((ae(e) ? e.ownerDocument : e.document) || window.document)?.documentElement
}
function ae(e) {
  return ie() ? e instanceof Node || e instanceof N(e).Node : !1
}
function F(e) {
  return ie() ? e instanceof Element || e instanceof N(e).Element : !1
}
function I(e) {
  return ie() ? e instanceof HTMLElement || e instanceof N(e).HTMLElement : !1
}
function oe(e) {
  return !ie() || typeof ShadowRoot > `u` ? !1 : e instanceof ShadowRoot || e instanceof N(e).ShadowRoot
}
function L(e) {
  let { overflow: t, overflowX: n, overflowY: r, display: i } = B(e)
  return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== `inline` && i !== `contents`
}
function se(e) {
  return /^(table|td|th)$/.test(M(e))
}
function ce(e) {
  try {
    if (e.matches(`:popover-open`)) return !0
  } catch {}
  try {
    return e.matches(`:modal`)
  } catch {
    return !1
  }
}
var le = /transform|translate|scale|rotate|perspective|filter/,
  ue = /paint|layout|strict|content/,
  R = (e) => !!e && e !== `none`,
  de
function fe(e) {
  let t = F(e) ? B(e) : e
  return (
    R(t.transform) ||
    R(t.translate) ||
    R(t.scale) ||
    R(t.rotate) ||
    R(t.perspective) ||
    (!me() && (R(t.backdropFilter) || R(t.filter))) ||
    le.test(t.willChange || ``) ||
    ue.test(t.contain || ``)
  )
}
function pe(e) {
  let t = V(e)
  for (; I(t) && !z(t); ) {
    if (fe(t)) return t
    if (ce(t)) return null
    t = V(t)
  }
  return null
}
function me() {
  return ((de ??= typeof CSS < `u` && CSS.supports && CSS.supports(`-webkit-backdrop-filter`, `none`)), de)
}
function z(e) {
  return /^(html|body|#document)$/.test(M(e))
}
function B(e) {
  return N(e).getComputedStyle(e)
}
function he(e) {
  return F(e) ? { scrollLeft: e.scrollLeft, scrollTop: e.scrollTop } : { scrollLeft: e.scrollX, scrollTop: e.scrollY }
}
function V(e) {
  if (M(e) === `html`) return e
  let t = e.assignedSlot || e.parentNode || (oe(e) && e.host) || P(e)
  return oe(t) ? t.host : t
}
function ge(e) {
  let t = V(e)
  return z(t) ? (e.ownerDocument ? e.ownerDocument.body : e.body) : I(t) && L(t) ? t : ge(t)
}
function H(e, t, n) {
  ;(t === void 0 && (t = []), n === void 0 && (n = !0))
  let r = ge(e),
    i = r === e.ownerDocument?.body,
    a = N(r)
  if (i) {
    let e = _e(a)
    return t.concat(a, a.visualViewport || [], L(r) ? r : [], e && n ? H(e) : [])
  } else return t.concat(r, H(r, [], n))
}
function _e(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null
}
function ve(e) {
  let t = B(e),
    n = parseFloat(t.width) || 0,
    i = parseFloat(t.height) || 0,
    a = I(e),
    o = a ? e.offsetWidth : n,
    s = a ? e.offsetHeight : i,
    c = r(n) !== o || r(i) !== s
  return (c && ((n = o), (i = s)), { width: n, height: i, $: c })
}
function ye(e) {
  return F(e) ? e : e.contextElement
}
function U(e) {
  let t = ye(e)
  if (!I(t)) return a(1)
  let n = t.getBoundingClientRect(),
    { width: i, height: o, $: s } = ve(t),
    c = (s ? r(n.width) : n.width) / i,
    l = (s ? r(n.height) : n.height) / o
  return ((!c || !Number.isFinite(c)) && (c = 1), (!l || !Number.isFinite(l)) && (l = 1), { x: c, y: l })
}
var be = a(0)
function xe(e) {
  let t = N(e)
  return !me() || !t.visualViewport ? be : { x: t.visualViewport.offsetLeft, y: t.visualViewport.offsetTop }
}
function Se(e, t, n) {
  return (t === void 0 && (t = !1), !n || (t && n !== N(e)) ? !1 : t)
}
function W(e, t, n, r) {
  ;(t === void 0 && (t = !1), n === void 0 && (n = !1))
  let i = e.getBoundingClientRect(),
    o = ye(e),
    s = a(1)
  t && (r ? F(r) && (s = U(r)) : (s = U(e)))
  let c = Se(o, n, r) ? xe(o) : a(0),
    l = (i.left + c.x) / s.x,
    u = (i.top + c.y) / s.y,
    d = i.width / s.x,
    f = i.height / s.y
  if (o) {
    let e = N(o),
      t = r && F(r) ? N(r) : r,
      n = e,
      i = _e(n)
    for (; i && r && t !== n; ) {
      let e = U(i),
        t = i.getBoundingClientRect(),
        r = B(i),
        a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x,
        o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y
      ;((l *= e.x), (u *= e.y), (d *= e.x), (f *= e.y), (l += a), (u += o), (n = N(i)), (i = _e(n)))
    }
  }
  return T({ width: d, height: f, x: l, y: u })
}
function G(e, t) {
  let n = he(e).scrollLeft
  return t ? t.left + n : W(P(e)).left + n
}
function Ce(e, t) {
  let n = e.getBoundingClientRect()
  return { x: n.left + t.scrollLeft - G(e, n), y: n.top + t.scrollTop }
}
function we(e) {
  let { elements: t, rect: n, offsetParent: r, strategy: i } = e,
    o = i === `fixed`,
    s = P(r),
    c = t ? ce(t.floating) : !1
  if (r === s || (c && o)) return n
  let l = { scrollLeft: 0, scrollTop: 0 },
    u = a(1),
    d = a(0),
    f = I(r)
  if ((f || (!f && !o)) && ((M(r) !== `body` || L(s)) && (l = he(r)), f)) {
    let e = W(r)
    ;((u = U(r)), (d.x = e.x + r.clientLeft), (d.y = e.y + r.clientTop))
  }
  let p = s && !f && !o ? Ce(s, l) : a(0)
  return {
    width: n.width * u.x,
    height: n.height * u.y,
    x: n.x * u.x - l.scrollLeft * u.x + d.x + p.x,
    y: n.y * u.y - l.scrollTop * u.y + d.y + p.y,
  }
}
function Te(e) {
  return Array.from(e.getClientRects())
}
function Ee(e) {
  let t = P(e),
    r = he(e),
    i = e.ownerDocument.body,
    a = n(t.scrollWidth, t.clientWidth, i.scrollWidth, i.clientWidth),
    o = n(t.scrollHeight, t.clientHeight, i.scrollHeight, i.clientHeight),
    s = -r.scrollLeft + G(e),
    c = -r.scrollTop
  return (B(i).direction === `rtl` && (s += n(t.clientWidth, i.clientWidth) - a), { width: a, height: o, x: s, y: c })
}
var De = 25
function Oe(e, t) {
  let n = N(e),
    r = P(e),
    i = n.visualViewport,
    a = r.clientWidth,
    o = r.clientHeight,
    s = 0,
    c = 0
  if (i) {
    ;((a = i.width), (o = i.height))
    let e = me()
    ;(!e || (e && t === `fixed`)) && ((s = i.offsetLeft), (c = i.offsetTop))
  }
  let l = G(r)
  if (l <= 0) {
    let e = r.ownerDocument,
      t = e.body,
      n = getComputedStyle(t),
      i = (e.compatMode === `CSS1Compat` && parseFloat(n.marginLeft) + parseFloat(n.marginRight)) || 0,
      o = Math.abs(r.clientWidth - t.clientWidth - i)
    o <= De && (a -= o)
  } else l <= De && (a += l)
  return { width: a, height: o, x: s, y: c }
}
function ke(e, t) {
  let n = W(e, !0, t === `fixed`),
    r = n.top + e.clientTop,
    i = n.left + e.clientLeft,
    o = I(e) ? U(e) : a(1)
  return { width: e.clientWidth * o.x, height: e.clientHeight * o.y, x: i * o.x, y: r * o.y }
}
function Ae(e, t, n) {
  let r
  if (t === `viewport`) r = Oe(e, n)
  else if (t === `document`) r = Ee(P(e))
  else if (F(t)) r = ke(t, n)
  else {
    let n = xe(e)
    r = { x: t.x - n.x, y: t.y - n.y, width: t.width, height: t.height }
  }
  return T(r)
}
function je(e, t) {
  let n = V(e)
  return n === t || !F(n) || z(n) ? !1 : B(n).position === `fixed` || je(n, t)
}
function Me(e, t) {
  let n = t.get(e)
  if (n) return n
  let r = H(e, [], !1).filter((e) => F(e) && M(e) !== `body`),
    i = null,
    a = B(e).position === `fixed`,
    o = a ? V(e) : e
  for (; F(o) && !z(o); ) {
    let t = B(o),
      n = fe(o)
    ;(!n && t.position === `fixed` && (i = null),
      (
        a
          ? !n && !i
          : (!n && t.position === `static` && i && (i.position === `absolute` || i.position === `fixed`)) ||
            (L(o) && !n && je(e, o))
      )
        ? (r = r.filter((e) => e !== o))
        : (i = t),
      (o = V(o)))
  }
  return (t.set(e, r), r)
}
function Ne(e) {
  let { element: r, boundary: i, rootBoundary: a, strategy: o } = e,
    s = [...(i === `clippingAncestors` ? (ce(r) ? [] : Me(r, this._c)) : [].concat(i)), a],
    c = Ae(r, s[0], o),
    l = c.top,
    u = c.right,
    d = c.bottom,
    f = c.left
  for (let e = 1; e < s.length; e++) {
    let i = Ae(r, s[e], o)
    ;((l = n(i.top, l)), (u = t(i.right, u)), (d = t(i.bottom, d)), (f = n(i.left, f)))
  }
  return { width: u - f, height: d - l, x: f, y: l }
}
function Pe(e) {
  let { width: t, height: n } = ve(e)
  return { width: t, height: n }
}
function Fe(e, t, n) {
  let r = I(t),
    i = P(t),
    o = n === `fixed`,
    s = W(e, !0, o, t),
    c = { scrollLeft: 0, scrollTop: 0 },
    l = a(0)
  function u() {
    l.x = G(i)
  }
  if (r || (!r && !o))
    if (((M(t) !== `body` || L(i)) && (c = he(t)), r)) {
      let e = W(t, !0, o, t)
      ;((l.x = e.x + t.clientLeft), (l.y = e.y + t.clientTop))
    } else i && u()
  o && !r && i && u()
  let d = i && !r && !o ? Ce(i, c) : a(0)
  return { x: s.left + c.scrollLeft - l.x - d.x, y: s.top + c.scrollTop - l.y - d.y, width: s.width, height: s.height }
}
function Ie(e) {
  return B(e).position === `static`
}
function Le(e, t) {
  if (!I(e) || B(e).position === `fixed`) return null
  if (t) return t(e)
  let n = e.offsetParent
  return (P(e) === n && (n = n.ownerDocument.body), n)
}
function Re(e, t) {
  let n = N(e)
  if (ce(e)) return n
  if (!I(e)) {
    let t = V(e)
    for (; t && !z(t); ) {
      if (F(t) && !Ie(t)) return t
      t = V(t)
    }
    return n
  }
  let r = Le(e, t)
  for (; r && se(r) && Ie(r); ) r = Le(r, t)
  return r && z(r) && Ie(r) && !fe(r) ? n : r || pe(e) || n
}
var ze = async function (e) {
  let t = this.getOffsetParent || Re,
    n = this.getDimensions,
    r = await n(e.floating)
  return {
    reference: Fe(e.reference, await t(e.floating), e.strategy),
    floating: { x: 0, y: 0, width: r.width, height: r.height },
  }
}
function Be(e) {
  return B(e).direction === `rtl`
}
var Ve = {
  convertOffsetParentRelativeRectToViewportRelativeRect: we,
  getDocumentElement: P,
  getClippingRect: Ne,
  getOffsetParent: Re,
  getElementRects: ze,
  getClientRects: Te,
  getDimensions: Pe,
  getScale: U,
  isElement: F,
  isRTL: Be,
}
function He(e, t) {
  return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height
}
function Ue(e, r) {
  let a = null,
    o,
    s = P(e)
  function c() {
    var e
    ;(clearTimeout(o), (e = a) == null || e.disconnect(), (a = null))
  }
  function l(u, d) {
    ;(u === void 0 && (u = !1), d === void 0 && (d = 1), c())
    let f = e.getBoundingClientRect(),
      { left: p, top: m, width: h, height: g } = f
    if ((u || r(), !h || !g)) return
    let _ = i(m),
      v = i(s.clientWidth - (p + h)),
      y = i(s.clientHeight - (m + g)),
      b = i(p),
      x = { rootMargin: -_ + `px ` + -v + `px ` + -y + `px ` + -b + `px`, threshold: n(0, t(1, d)) || 1 },
      S = !0
    function C(t) {
      let n = t[0].intersectionRatio
      if (n !== d) {
        if (!S) return l()
        n
          ? l(!1, n)
          : (o = setTimeout(() => {
              l(!1, 1e-7)
            }, 1e3))
      }
      ;(n === 1 && !He(f, e.getBoundingClientRect()) && l(), (S = !1))
    }
    try {
      a = new IntersectionObserver(C, { ...x, root: s.ownerDocument })
    } catch {
      a = new IntersectionObserver(C, x)
    }
    a.observe(e)
  }
  return (l(!0), c)
}
function We(e, t, n, r) {
  r === void 0 && (r = {})
  let {
      ancestorScroll: i = !0,
      ancestorResize: a = !0,
      elementResize: o = typeof ResizeObserver == `function`,
      layoutShift: s = typeof IntersectionObserver == `function`,
      animationFrame: c = !1,
    } = r,
    l = ye(e),
    u = i || a ? [...(l ? H(l) : []), ...(t ? H(t) : [])] : []
  u.forEach((e) => {
    ;(i && e.addEventListener(`scroll`, n, { passive: !0 }), a && e.addEventListener(`resize`, n))
  })
  let d = l && s ? Ue(l, n) : null,
    f = -1,
    p = null
  o &&
    ((p = new ResizeObserver((e) => {
      let [r] = e
      ;(r &&
        r.target === l &&
        p &&
        t &&
        (p.unobserve(t),
        cancelAnimationFrame(f),
        (f = requestAnimationFrame(() => {
          var e
          ;(e = p) == null || e.observe(t)
        }))),
        n())
    })),
    l && !c && p.observe(l),
    t && p.observe(t))
  let m,
    h = c ? W(e) : null
  c && g()
  function g() {
    let t = W(e)
    ;(h && !He(h, t) && n(), (h = t), (m = requestAnimationFrame(g)))
  }
  return (
    n(),
    () => {
      var e
      ;(u.forEach((e) => {
        ;(i && e.removeEventListener(`scroll`, n), a && e.removeEventListener(`resize`, n))
      }),
        d?.(),
        (e = p) == null || e.disconnect(),
        (p = null),
        c && cancelAnimationFrame(m))
    }
  )
}
var Ge = ne,
  Ke = A,
  qe = re,
  Je = (e, t, n) => {
    let r = new Map(),
      i = { platform: Ve, ...n },
      a = { ...i.platform, _c: r }
    return k(e, t, { ...i, platform: a })
  }
function K(e, t, ...n) {
  let r = typeof e == `string` ? document.createElement(e) : e
  if (t)
    for (let [e, n] of Object.entries(t))
      n == null ||
        n === !1 ||
        (e.startsWith(`on`) && typeof n == `function`
          ? r.addEventListener(e.slice(2).toLowerCase(), n)
          : n === !0
            ? r.setAttribute(e, ``)
            : r.setAttribute(e, String(n)))
  for (let e of n)
    e == null ||
      e === !1 ||
      r.appendChild(typeof e == `string` || typeof e == `number` ? document.createTextNode(String(e)) : e)
  return r
}
var q = class t extends e {
  static {
    this.tagName = `ss-menu`
  }
  static {
    this.listClassName = `ss-menu-list`
  }
  static {
    this.listboxId = `ss-menu-listbox`
  }
  #e
  #t = null
  #n = null
  #r = K(`div`, { class: `ss-menu-empty`, role: `status`, hidden: !0 }, `No results found`)
  #i = K(`div`, { class: `ss-menu-loading`, role: `status`, "aria-live": `polite`, hidden: !0 }, `Loading...`)
  constructor(e) {
    ;(super(),
      (this.show = () => {
        this.hasAttribute(`open`) || (this.setAttribute(`open`, ``), this.#a(), this.#s())
      }),
      (this.hide = () => {
        if (!this.hasAttribute(`open`)) return
        ;(this.removeAttribute(`data-keyboard-nav`), this.#o(), this.#c(), this.setAttribute(`closing`, ``))
        let e = !1,
          t = () => {
            e || ((e = !0), this.removeAttribute(`open`), this.removeAttribute(`closing`))
          }
        ;(this.addEventListener(`animationend`, t, { once: !0 }), setTimeout(t, 200))
      }),
      (this.#e = e),
      e.id && (this.id = e.id))
  }
  get loading() {
    return !this.#i.hidden
  }
  set loading(e) {
    this.#i.hidden = !e
  }
  get empty() {
    return !this.#r.hidden
  }
  set empty(e) {
    this.#r.hidden = !e
  }
  get isOpen() {
    return this.hasAttribute(`open`)
  }
  handleKeydown(e) {
    this.#e.closeOnEscape !== !1 && e.key === `Escape` && (e.preventDefault(), this.#e.onClose())
  }
  configureAria() {
    ;((this.id = this.id || t.listboxId),
      this.setAttribute(`role`, `listbox`),
      this.setAttribute(`aria-label`, `Search results`))
  }
  render() {
    return (this.classList.add(t.listClassName), this.append(this.#i, this.#r), this)
  }
  onDisconnect() {
    ;(this.#o(), this.#c())
  }
  #a() {
    let { anchor: e, maxHeight: t = 360, offset: n = 4, placement: r = `bottom-start`, matchWidth: i = !0 } = this.#e
    this.#t = We(e, this, () => {
      Je(e, this, {
        placement: r,
        strategy: `fixed`,
        middleware: [
          Ge(n),
          Ke({ fallbackPlacements: [r.startsWith(`bottom`) ? `top-start` : `bottom-start`] }),
          qe({
            apply: ({ availableHeight: e, rects: n }) => {
              let r = { maxHeight: typeof t == `number` ? `${Math.min(t, e)}px` : t }
              ;(i && (r.width = `${n.reference.width}px`), Object.assign(this.style, r))
            },
          }),
        ],
      }).then(({ x: e, y: t, placement: n }) => {
        ;(Object.assign(this.style, { left: `${e}px`, top: `${t}px` }),
          this.setAttribute(`placement`, n.startsWith(`top`) ? `above` : `below`))
      })
    })
  }
  #o() {
    ;(this.#t?.(), (this.#t = null))
  }
  #s() {
    this.#e.closeOnClickOutside !== !1 &&
      ((this.#n = new AbortController()), document.addEventListener(`pointerdown`, this.#l, { signal: this.#n.signal }))
  }
  #c() {
    ;(this.#n?.abort(), (this.#n = null))
  }
  #l = (e) => {
    let { anchor: t, onClose: n } = this.#e,
      r = e.composedPath()
    !r.includes(this) && !r.includes(t) && n()
  }
}
function Ye(e, ...t) {
  let n = e === HTMLElement || e.prototype instanceof HTMLElement,
    r = n ? e : HTMLElement
  return (n ? t : [e, ...t]).reduce((e, t) => t(e), r)
}
function Xe(e) {
  class t extends e {
    get disabled() {
      return this.hasAttribute(`disabled`)
    }
    set disabled(e) {
      e ? this.setAttribute(`disabled`, ``) : this.removeAttribute(`disabled`)
    }
    attributeChangedCallback(e, t, n) {
      ;(super.attributeChangedCallback?.(e, t, n),
        e === `disabled` && this.setAttribute(`aria-disabled`, String(n !== null)))
    }
  }
  let n = e.observedAttributes ?? []
  return (
    Object.defineProperty(t, `observedAttributes`, {
      get() {
        return [...n, `disabled`]
      },
    }),
    t
  )
}
function Ze(e) {
  class t extends e {
    static {
      this.formAssociated = !0
    }
    #e
    constructor(...e) {
      ;(super(...e), (this.#e = this.attachInternals()))
    }
    get form() {
      return this.#e.form
    }
    get validity() {
      return this.#e.validity
    }
    get validationMessage() {
      return this.#e.validationMessage
    }
    get willValidate() {
      return this.#e.willValidate
    }
    setFormValue(e) {
      this.#e.setFormValue(e)
    }
    setValidity(e, t) {
      let n = this.shadowRoot?.querySelector(`input`) ?? void 0
      this.#e.setValidity(e, t, n)
    }
  }
  return t
}
function Qe(e, t) {
  let n
  return (...r) => {
    ;(clearTimeout(n), (n = setTimeout(() => e(...r), t)))
  }
}
var $e = {
    xmlns: `http://www.w3.org/2000/svg`,
    width: 24,
    height: 24,
    viewBox: `0 0 24 24`,
    fill: `none`,
    stroke: `currentColor`,
    "stroke-width": 2,
    "stroke-linecap": `round`,
    "stroke-linejoin": `round`,
  },
  et = ([e, t, n]) => {
    let r = document.createElementNS(`http://www.w3.org/2000/svg`, e)
    return (
      Object.keys(t).forEach((e) => {
        r.setAttribute(e, String(t[e]))
      }),
      n?.length &&
        n.forEach((e) => {
          let t = et(e)
          r.appendChild(t)
        }),
      r
    )
  },
  tt = (e, t = {}) => et([`svg`, { ...$e, ...t }, e]),
  nt = [[`path`, { d: `M20 6 9 17l-5-5` }]],
  rt = [
    [`path`, { d: `M18 6 6 18` }],
    [`path`, { d: `m6 6 12 12` }],
  ]
function J(e, t = 16) {
  return tt(e, { width: t, height: t })
}
var it = Ye(e, Xe, Ze),
  at = class e extends it {
    static {
      this.tagName = `ss-input`
    }
    static {
      this.clearClassName = `ss-input-clear`
    }
    static {
      this.hasValueClass = `has-value`
    }
    static get observedAttributes() {
      return [`placeholder`, `clearable`, `debounce`, `maxlength`, `disabled`]
    }
    #e
    #t
    #n
    #r
    #i
    #a
    #o
    #s
    #c
    #l
    #u = null
    #d = null
    constructor({ name: t, menuId: n, onInput: r, onBlur: i, onFocus: a, onClear: o, onRemoveChip: s }) {
      ;(super(),
        (this.#a = t),
        (this.#l = n ?? q.listboxId),
        (this.#e = r),
        (this.#n = i),
        (this.#r = a),
        (this.#t = o),
        (this.#i = s),
        (this.#s = K(`button`, { type: `button`, class: e.clearClassName, "aria-label": `Clear` }, J(rt, 16))),
        (this.#c = K(`div`, { class: `ss-input-chips` })))
    }
    attributeChangedCallback(e, t, n) {
      ;(super.attributeChangedCallback?.(e, t, n),
        e === `placeholder` && this.#o
          ? (this.#o.placeholder = n ?? ``)
          : e === `clearable` && this.#o
            ? this.#v(n !== null && n !== `false`)
            : e === `maxlength` && this.#o
              ? n === null
                ? this.#o.removeAttribute(`maxlength`)
                : (this.#o.maxLength = parseInt(n))
              : e === `debounce` && ((this.#u = null), (this.#d = null)))
    }
    #f = (e) => {
      let t = e.currentTarget
      this.#_(t.value.length > 0)
      let n = this.getAttribute(`debounce`)
      if (n !== null) {
        let r = parseInt(n, 10)
        ;((this.#u === null || this.#d !== r) &&
          ((this.#u = Qe((e, t) => {
            this.#e?.(e, t)
          }, r)),
          (this.#d = r)),
          this.#u(t.value, e))
      } else ((this.#u = null), (this.#d = null), this.#e?.(t.value, e))
    }
    #p = (e) => {
      let t = e.currentTarget
      ;(this.#_(t.value.length > 0), this.#n?.(t.value, e))
    }
    #m = (e) => {
      let t = e.currentTarget
      ;(this.#_(t.value.length > 0), this.#r?.(t.value, e))
    }
    #h = () => {
      ;((this.#o.value = ``), this.#_(!1), this.#t?.(), this.#e?.(``, null), this.#o.focus())
    }
    #g = (e) => {
      if (e.key === `Backspace` && this.#o.value === ``) {
        let e = this.#c.querySelectorAll(`[data-value]`),
          t = e[e.length - 1]
        t?.dataset.value && this.#i?.(t.dataset.value)
      }
    }
    #_(t) {
      let n = this.#c?.children.length > 0
      this.classList.toggle(e.hasValueClass, t || n)
    }
    #v(e) {
      this.#s.hidden = !e
    }
    getMenuId() {
      return this.#l
    }
    configureAria() {
      ;(this.setAttribute(`aria-controls`, this.#l),
        this.setAttribute(`aria-autocomplete`, `list`),
        this.setAttribute(`aria-expanded`, `false`),
        this.setAttribute(`autocomplete`, `off`))
    }
    get inputElement() {
      return this.#o
    }
    updateChips(e) {
      let t = e.map((e) => {
        let t = K(
          `button`,
          {
            type: `button`,
            class: `ss-input-chip-remove`,
            "aria-label": `Remove ${e.label}`,
            onClick: () => this.#i?.(e.value),
          },
          J(rt, 12),
        )
        return K(
          `span`,
          { class: `ss-input-chip`, "data-value": e.value },
          K(`span`, { class: `ss-input-chip-label` }, e.label),
          t,
        )
      })
      ;(this.#c.replaceChildren(...t),
        this.classList.toggle(`has-chips`, e.length > 0),
        this.#_(this.#o?.value.length > 0))
    }
    setMultiValue(e) {
      this.setFormValue(e)
    }
    render() {
      let e = this.getAttribute(`placeholder`) ?? ``,
        t = this.getAttribute(`clearable`),
        n = t !== null && t !== `false`,
        r = this.getAttribute(`maxlength`)
      this.#o = K(`input`, {
        type: `text`,
        role: `combobox`,
        "aria-expanded": `false`,
        "aria-autocomplete": `list`,
        "aria-controls": this.#l,
        "aria-activedescendant": ``,
        placeholder: e,
        autocomplete: `off`,
        name: this.#a,
        maxlength: r ?? void 0,
      })
      let i = { signal: this.abort.signal }
      return (
        this.#o.addEventListener(`input`, this.#f, i),
        this.#o.addEventListener(`blur`, this.#p, i),
        this.#o.addEventListener(`focus`, this.#m, i),
        this.#o.addEventListener(`keydown`, this.#g, i),
        this.#s.addEventListener(`click`, this.#h, i),
        (this.#s.hidden = !n),
        this.append(this.#c, this.#o, this.#s),
        this
      )
    }
  }
function ot(e) {
  class t extends e {
    get active() {
      return this.hasAttribute(`active`)
    }
    set active(e) {
      e ? this.setAttribute(`active`, ``) : this.removeAttribute(`active`)
    }
    attributeChangedCallback(e, t, n) {
      ;(super.attributeChangedCallback?.(e, t, n),
        e === `active` && this.setAttribute(`aria-selected`, String(n !== null)))
    }
  }
  let n = e.observedAttributes ?? []
  return (
    Object.defineProperty(t, `observedAttributes`, {
      get() {
        return [...n, `active`]
      },
    }),
    t
  )
}
var st = Ye(e, Xe, ot),
  Y = class e extends st {
    static {
      this.tagName = `ss-search-result-item`
    }
    static #e = 0
    #t
    #n
    get selected() {
      return this.hasAttribute(`selected`)
    }
    set selected(e) {
      e ? this.setAttribute(`selected`, ``) : this.removeAttribute(`selected`)
    }
    constructor({ result: e, selected: t, onSelect: n }) {
      ;(super(), (this.#t = e), (this.#n = n), e.disabled && (this.disabled = !0), t && (this.selected = !0))
    }
    get value() {
      return this.#t.value
    }
    update(e) {
      ;((this.#t = e), (this.disabled = e.disabled ?? !1))
    }
    configureAria() {
      ;(this.setAttribute(`role`, `option`), this.setAttribute(`tabindex`, `-1`))
    }
    onConnect() {
      ;((this.id = this.id || `ss-result-item-${e.#e++}`),
        this.configureAria(),
        this.addEventListener(`click`, this.#r))
    }
    #r = (e) => {
      this.disabled || this.#n?.(this.#t.value, this.#t, e)
    }
    render() {
      return this
    }
  }
function ct(e, t) {
  let n = document.createDocumentFragment()
  if (!t.trim()) return (n.appendChild(document.createTextNode(e)), n)
  let r = t.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`),
    i = e.split(RegExp(`(${r})`, `gi`))
  for (let e = 0; e < i.length; e++)
    if (e % 2 == 1) {
      let t = document.createElement(`mark`)
      ;((t.className = `ss-highlight`), (t.textContent = i[e]), n.appendChild(t))
    } else n.appendChild(document.createTextNode(i[e]))
  return n
}
function lt(e) {
  let t = new Map(),
    n = []
  for (let r of e)
    if (r.group) {
      let e = t.get(r.group)
      e ? e.push(r) : t.set(r.group, [r])
    } else n.push(r)
  let r = []
  for (let [e, n] of t) r.push({ label: e, options: n })
  return (n.length > 0 && r.push({ label: ``, options: n }), r)
}
function ut(e) {
  return e.length > 0 && `options` in e[0]
}
var dt = class t extends e {
    static {
      this.tagName = `ss-search-result-list`
    }
    static {
      this.className = `ss-result-list`
    }
    static #e = 0
    #t
    #n = null
    #r = new Set()
    #i = !0
    set resultItemRenderer(e) {
      this.#n = e
    }
    get resultItemRenderer() {
      return this.#n
    }
    set highlightMatches(e) {
      this.#i = e
    }
    get highlightMatches() {
      return this.#i
    }
    setSelectedValues(e) {
      this.#r = new Set(e)
      for (let e of this.querySelectorAll(Y.tagName)) {
        let t = this.#r.has(e.value)
        e.selected = t
        let n = e.querySelector(`svg[data-ss-check]`)
        if (t && !n) {
          let t = J(nt, 14)
          ;(t.setAttribute(`data-ss-check`, ``), e.appendChild(t))
        } else !t && n && n.remove()
      }
    }
    constructor({ onSelect: e }) {
      ;(super(), (this.#t = e))
    }
    update(e, t) {
      this.replaceChildren()
      let n = ut(e) ? e : e.some((e) => e.group) ? lt(e) : null
      if (n) for (let e of n) this.#a(e, t)
      else for (let n of e) this.appendChild(this.#s(n, t))
    }
    render() {
      return (this.classList.add(t.className), this)
    }
    #a(e, n) {
      if (e.label) {
        let r = `ss-group-${t.#e++}`,
          i = []
        ;(e.icon && i.push(J(e.icon, 14)), i.push(e.label))
        let a = K(`div`, { class: `ss-result-group-label`, id: r, role: `presentation` }, ...i),
          o = K(`div`, { role: `group`, "aria-labelledby": r, class: `ss-result-group` })
        for (let t of e.options) o.appendChild(this.#s(t, n))
        ;(this.appendChild(a), this.appendChild(o))
      } else for (let t of e.options) this.appendChild(this.#s(t, n))
    }
    #o(e, t) {
      if (this.#n) {
        let n = this.#n(e, t)
        return typeof n == `string` ? document.createTextNode(n) : n
      }
      return this.#i ? ct(e.label, t) : document.createTextNode(e.label)
    }
    #s(e, t) {
      let n = new Y({ result: e, onSelect: this.#t, selected: this.#r.has(e.value) }),
        r = this.#o(e, t),
        i = document.createElement(`span`)
      i.appendChild(typeof r == `string` ? document.createTextNode(r) : r)
      let a = []
      if ((e.icon && a.push(J(e.icon, 16)), a.push(i), this.#r.has(e.value))) {
        let e = J(nt, 14)
        ;(e.setAttribute(`data-ss-check`, ``), a.push(e))
      }
      return (n.replaceChildren(...a), n)
    }
  },
  ft = class {
    #e = new Map()
    #t
    #n
    constructor(e = 50, t = 6e4) {
      ;((this.#t = e), (this.#n = t))
    }
    get(e) {
      let t = this.#e.get(e)
      if (t) {
        if (Date.now() - t.timestamp > this.#n) {
          this.#e.delete(e)
          return
        }
        return t.results
      }
    }
    set(e, t) {
      if (this.#e.size >= this.#t) {
        let e = this.#e.keys().next().value
        e !== void 0 && this.#e.delete(e)
      }
      this.#e.set(e, { results: t, timestamp: Date.now() })
    }
    clear() {
      this.#e.clear()
    }
  },
  pt = { bubbles: !0, composed: !0, cancelable: !1 }
function X(e, t, n, r) {
  let i = r ? { ...pt, ...r } : pt
  return e.dispatchEvent(new CustomEvent(t, { ...i, detail: n }))
}
var Z = {
    FILTER_CHANGE: `ss-filter-change`,
    INPUT_CHANGE: `ss-input-change`,
    INPUT_FOCUS: `ss-input-focus`,
    INPUT_BLUR: `ss-input-blur`,
    MENU_CLOSE: `ss-menu-close`,
    MENU_OPEN: `ss-menu-open`,
    MENU_SELECT: `ss-menu-select`,
    MULTISELECT_CHANGE: `ss-multiselect-change`,
    MENU_HOVER: `ss-menu-hover`,
    MENU_BLUR: `ss-menu-blur`,
    MENU_KEYDOWN: `ss-menu-keydown`,
    MENU_KEYUP: `ss-menu-keyup`,
    MENU_KEYPRESS: `ss-menu-keypress`,
    LOAD_ERROR: `ss-load-error`,
    THEME_CHANGE: `ss-theme-change`,
  },
  mt = {
    boolAttrs: [
      `clearable`,
      `disabled`,
      `multiselect`,
      `filterMultiple`,
      `closeMenuOnBlur`,
      `closeMenuOnSelect`,
      `openMenuOnFocus`,
      `openMenuOnInput`,
      `menuMatchWidth`,
      `closeOnEscape`,
      `closeOnClickOutside`,
    ],
    intAttrs: [`menuMinHeight`, `menuMaxHeight`, `menuOffset`, `debounce`, `maxResults`, `minChars`, `maxChars`],
    objectAttrs: [`filters`, `options`],
  },
  ht = {
    placeholder: `Search`,
    debounce: 300,
    name: `search`,
    id: void 0,
    filters: [],
    filterMultiple: !1,
    clearable: !0,
    multiselect: !1,
    options: [],
    fetchDataOn: `input`,
    datasource: ``,
    disabled: !1,
    theme: `auto`,
    closeMenuOnBlur: !1,
    closeMenuOnSelect: !0,
    openMenuOnFocus: !0,
    openMenuOnLoadResults: !0,
    openMenuOnInput: !0,
    menuMinHeight: 100,
    minChars: void 0,
    maxChars: void 0,
    menuMaxHeight: 360,
    menuOffset: 4,
    menuPlacement: `bottom-start`,
    menuMatchWidth: !0,
    maxResults: void 0,
    closeOnEscape: !0,
    closeOnClickOutside: !0,
    highlightMatches: !0,
  }
function gt(e) {
  let t = new Map()
  for (let n of e) {
    let e = t.get(n.field)
    e ? e.push(n.value) : t.set(n.field, [n.value])
  }
  return t
}
function _t(e, t) {
  return e == null ? !1 : Array.isArray(e) ? e.some((e) => t.includes(String(e))) : t.includes(String(e))
}
function vt(e, t) {
  let n = [`q=${e}`],
    r = gt(t)
  for (let [e, t] of r)
    t.length === 1
      ? n.push(`${encodeURIComponent(e)}=${encodeURIComponent(t[0])}`)
      : t.forEach((t, r) => n.push(`${encodeURIComponent(e)}[${r}]=${encodeURIComponent(t)}`))
  return n.join(`&`)
}
function yt(e) {
  return class extends e {
    #e = null
    #t = (e) => e
    #n = null
    #r = null
    #i = new ft()
    #a = null
    #o = []
    set dataAdapter(e) {
      this.#e = e
    }
    get dataAdapter() {
      return this.#e
    }
    set transformResponse(e) {
      this.#t = e
    }
    get transformResponse() {
      return this.#t
    }
    set resultItemRenderer(e) {
      this.#n = e
    }
    get resultItemRenderer() {
      return this.#n
    }
    set filterOption(e) {
      this.#r = e
    }
    get filterOption() {
      return this.#r
    }
    set options(e) {
      ;((this.#o = e), this.#i.clear())
      let t = this
      if (t.menuInstance?.isOpen) {
        let e = t.getInputEl?.()?.value ?? ``
        t.loadData?.(e)
      }
    }
    get options() {
      return this.#o
    }
    get hasOptions() {
      return this.#o.length > 0
    }
    clearCache() {
      this.#i.clear()
    }
    async loadData(e, t = []) {
      ;(this.#a?.abort(), (this.#a = new AbortController()))
      let n = this.#a.signal,
        r = vt(e, t),
        i = this,
        a = this.#i.get(r)
      if (a) {
        i.loadResults?.(a, e)
        return
      }
      let o = this.#e !== null,
        s = i.getAttrs?.()?.datasource ?? ``
      if (!(!o && !s && !this.hasOptions)) {
        i.setLoading?.(!0)
        try {
          let a
          if (
            (o
              ? ((a = await this.#e({ searchTerm: e, ...t }, n)), (this.#o = a))
              : s
                ? ((a = await this.#s(s, r, n)), (this.#o = a))
                : (a = this.#c(e, t)),
            n.aborted)
          )
            return
          ;(this.#i.set(r, a), i.loadResults?.(a, e))
        } catch (e) {
          if (e.name === `AbortError`) return
          ;(X(this, Z.LOAD_ERROR, { error: e, requestQuery: r }), i.setLoading?.(!1))
        }
      }
    }
    async #s(e, t, n) {
      let r = e.includes(`{{q}}`) ? e.replace(`{{q}}`, t) : `${e}${e.includes(`?`) ? `&` : `?`}${t}`,
        i = await (await fetch(r, { signal: n })).json()
      return this.#t(i, t)
    }
    #c(e, t) {
      let n = (e) => {
          if (t.length === 0) return !0
          let n = e.metadata
          if (!n) return !1
          let r = gt(t)
          for (let [e, t] of r) if (!_t(n[e], t)) return !1
          return !0
        },
        r = e.toLowerCase(),
        i = (e) => !r || e.label.toLowerCase().includes(r) || e.description?.toLowerCase().includes(r),
        a = this.#r ? (n) => this.#r(n, e, t) : (e) => n(e) && i(e)
      return ut(this.#o)
        ? this.#o.map((e) => ({ ...e, options: e.options.filter(a) })).filter((e) => e.options.length > 0)
        : this.#o.filter(a)
    }
  }
}
function bt(e) {
  class t extends e {
    #e = -1
    get activeIndex() {
      return this.#e
    }
    resetActiveIndex() {
      if (this.#e >= 0) {
        let e = this.getNavigableItems()
        ;((this.#e = -1), this.onActiveIndexChanged(-1, e))
      } else this.#e = -1
    }
    getNavigableItems() {
      return []
    }
    handleKeyboardNav(e) {
      let t = this.getNavigableItems()
      if (t.length) {
        switch (e.key) {
          case `ArrowDown`:
            ;(e.preventDefault(), (this.#e = Math.min(this.#e + 1, t.length - 1)))
            break
          case `ArrowUp`:
            ;(e.preventDefault(), (this.#e = this.#e <= 0 ? t.length - 1 : this.#e - 1))
            break
          case `Home`:
            ;(e.preventDefault(), (this.#e = 0))
            break
          case `End`:
            ;(e.preventDefault(), (this.#e = t.length - 1))
            break
          default:
            return
        }
        this.onActiveIndexChanged(this.#e, t)
      }
    }
    onActiveIndexChanged(e, t) {}
  }
  return t
}
var xt = Ye(e, ot),
  Q = class e extends xt {
    static {
      this.tagName = `ss-filter-option`
    }
    static {
      this.className = `ss-filter-option`
    }
    static get observedAttributes() {
      return [`label`, `value`, `type`, `active`]
    }
    #e
    #t
    #n
    constructor({ label: t, value: n, field: r, metadata: i, onChange: a, renderFn: o }) {
      ;(super(),
        (this.#e = a),
        (this.#t = i),
        (this.#n = o),
        this.setAttribute(`label`, t),
        this.setAttribute(`value`, n),
        this.setAttribute(`field`, r),
        (this.id = `filter-option-${n}`),
        this.classList.add(e.className))
    }
    get metadata() {
      return this.#t
    }
    set renderFn(e) {
      ;((this.#n = e), this.#r())
    }
    attributeChangedCallback(e, t, n) {
      ;(super.attributeChangedCallback(e, t, n),
        e === `label` ? this.#r() : e === `value` && (this.id = `filter-option-${n}`))
    }
    #r() {
      let e = {
        label: this.getAttribute(`label`) ?? ``,
        value: this.getAttribute(`value`) ?? ``,
        field: this.getAttribute(`field`) ?? ``,
        metadata: this.#t,
      }
      if (this.#n) {
        let t = this.#n(e)
        this.replaceChildren(typeof t == `string` ? document.createTextNode(t) : t)
      } else this.textContent = e.label
    }
    configureAria() {
      ;(this.setAttribute(`role`, `option`), this.setAttribute(`tabindex`, `-1`))
    }
    onConnect() {
      this.addEventListener(`click`, this.#i, { signal: this.abort.signal })
    }
    #i = (e) => {
      this.#e(e)
    }
    render() {
      return (this.#r(), this)
    }
  },
  St = class t extends e {
    static {
      this.tagName = `ss-filter-options`
    }
    static {
      this.className = `ss-filter-options`
    }
    #e
    #t = []
    #n = []
    #r
    #i
    constructor({ options: e, onChange: t, renderFn: n, multiple: r }) {
      ;(super(), (this.#e = n), (this.#i = t), (this.#r = r ?? !0), this.update(e))
    }
    get multiple() {
      return this.#r
    }
    set multiple(e) {
      if (((this.#r = e), this.setAttribute(`aria-multiselectable`, String(e)), !e && this.#t.length > 1)) {
        let e = this.#t[this.#t.length - 1]
        this.#t = [e]
        for (let t of this.querySelectorAll(Q.tagName)) t.active = t.getAttribute(`value`) === e
      }
    }
    #a = (e) => {
      let t = e.currentTarget,
        n = t.getAttribute(`value`) ?? ``
      if (this.#r)
        this.#t.includes(n)
          ? ((this.#t = this.#t.filter((e) => e !== n)), (t.active = !1))
          : (this.#t.push(n), (t.active = !0))
      else {
        let e = this.#t.includes(n)
        for (let e of this.querySelectorAll(Q.tagName)) e.active = !1
        e ? (this.#t = []) : ((this.#t = [n]), (t.active = !0))
      }
      this.#i(new CustomEvent(`change`, { detail: { selected: this.#t } }))
    }
    set renderFn(e) {
      ;((this.#e = e), this.update(this.#n))
    }
    getActiveFilters() {
      return this.#n.filter((e) => this.#t.includes(e.value)).map((e) => ({ field: e.field, value: e.value }))
    }
    update(e) {
      ;((this.#n = e),
        this.replaceChildren(
          ...e.map((e) => {
            let t = new Q({ ...e, onChange: this.#a, renderFn: this.#e })
            return ((t.active = this.#t.includes(e.value)), t)
          }),
        ))
    }
    configureAria() {
      ;(this.setAttribute(`role`, `group`),
        this.setAttribute(`aria-label`, `Filters`),
        this.setAttribute(`aria-multiselectable`, String(this.#r)))
    }
    render() {
      return (this.classList.add(t.className), this)
    }
  },
  Ct = `
  ss-input {
    display: flex;
    align-items: center;
    position: relative;
    width: 100%;
  }

  ss-input input {
    width: 100%;
    height: var(--ss-input-height, 48px);
    padding: 0 36px 0 12px;
    border: 1px solid var(--ss-border);
    border-radius: var(--ss-radius);
    background: var(--ss-bg);
    color: var(--ss-text);
    font-family: var(--ss-font-family);
    font-size: var(--ss-font-size);
    outline: none;
    box-sizing: border-box;
    transition: border-color var(--ss-transition);
  }

  ss-input input:focus {
    border-color: var(--ss-accent);
    box-shadow: 0 0 0 3px var(--ss-accent-ring);
  }

  .ss-input-clear {
    position: absolute;
    right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--ss-text-secondary);
    cursor: pointer;
    touch-action: manipulation;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--ss-transition), background-color var(--ss-transition);
  }

  .ss-input-clear:hover {
    background: var(--ss-hover);
    color: var(--ss-text);
  }

  ss-input.has-value .ss-input-clear {
    opacity: 1;
    pointer-events: auto;
  }

  ss-input.has-chips {
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    padding: 6px 36px 6px 8px;
    border: 1px solid var(--ss-border);
    border-radius: var(--ss-radius);
    background: var(--ss-bg);
    min-height: var(--ss-input-height, 48px);
    box-sizing: border-box;
    cursor: text;
    transition: border-color var(--ss-transition), box-shadow var(--ss-transition);
  }

  ss-input.has-chips:focus-within {
    border-color: var(--ss-accent);
    box-shadow: 0 0 0 3px var(--ss-accent-ring);
  }

  ss-input.has-chips input {
    border: none;
    background: transparent;
    box-shadow: none;
    height: auto;
    min-height: 32px;
    flex: 1;
    min-width: 60px;
    width: auto;
    padding: 0 4px;
  }

  ss-input.has-chips input:focus {
    border-color: transparent;
    box-shadow: none;
  }

  .ss-input-chips {
    display: contents;
  }

  .ss-input-chips:empty {
    display: none;
  }

  .ss-input-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 4px 2px 8px;
    background: var(--ss-chip-active-bg, #3b82f6);
    color: var(--ss-chip-active-color, #fff);
    border-radius: 999px;
    font-size: var(--ss-font-size);
    line-height: 1.4;
    white-space: nowrap;
    max-width: 200px;
  }

  .ss-input-chip-label {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ss-input-chip-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    color: inherit;
    cursor: pointer;
    touch-action: manipulation;
    flex-shrink: 0;
    transition: background-color var(--ss-transition);
  }

  .ss-input-chip-remove:hover {
    background: rgba(255, 255, 255, 0.35);
  }
`,
  wt = `
  ss-menu {
    display: none;
    position: fixed;
    z-index: 1000;
    box-sizing: border-box;
    background: var(--ss-bg, #ffffff);
    border: 1px solid var(--ss-border, #e2e8f0);
    border-radius: var(--ss-radius, 8px);
    box-shadow: var(--ss-shadow, 0 4px 16px rgba(0, 0, 0, 0.12));
    overflow: hidden;
    flex-direction: column;
    font-family: var(--ss-font-family, system-ui, sans-serif);
    font-size: var(--ss-font-size, 15px);
  }

  ss-menu[open] {
    display: flex;
    animation: ss-menu-in var(--ss-transition, 150ms ease);
  }

  ss-menu[open][closing] {
    animation: ss-menu-out var(--ss-transition, 150ms ease) forwards;
  }

  ss-menu[placement="above"] {
    border-radius: var(--ss-radius, 8px) var(--ss-radius, 8px) 4px 4px;
  }

  ss-menu[placement="below"] {
    border-radius: 4px 4px var(--ss-radius, 8px) var(--ss-radius, 8px);
  }

  @keyframes ss-menu-in {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes ss-menu-out {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-4px);
    }
  }

  ss-menu[placement="above"] {
    animation-name: ss-menu-in-above;
  }

  ss-menu[placement="above"][closing] {
    animation-name: ss-menu-out-above;
  }

  @keyframes ss-menu-in-above {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes ss-menu-out-above {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(4px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    ss-menu[open],
    ss-menu[open][closing] {
      animation: none;
    }
  }

  .ss-menu-list {
    overflow-y: auto;
    flex: 1;
    min-height: 0;
    touch-action: pan-y;
    -webkit-overflow-scrolling: touch;
  }

  .ss-menu-empty,
  .ss-menu-loading {
    padding: 12px 16px;
    color: var(--ss-muted, #64748b);
    font-size: var(--ss-font-size, 15px);
    text-align: center;
  }
`,
  Tt = (e) => `
  .ss-result-list {
    padding: 8px;
    min-height: ${typeof e.minHeight == `number` ? `${e.minHeight}px` : e.minHeight};
  }
`,
  Et = `
  .ss-filter-options {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 6px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--ss-border, #e2e8f0);
  }
`,
  Dt = `
  .ss-filter-option {
    display: inline-flex;
    align-items: center;
    padding: 2px 10px;
    border-radius: 999px;
    border: 1px solid var(--ss-border, #e2e8f0);
    background: var(--ss-chip-bg, #f8fafc);
    color: var(--ss-chip-color, #475569);
    font-size: 0.8125rem;
    cursor: pointer;
    user-select: none;
    touch-action: manipulation;
    transition: background 0.1s, color 0.1s, border-color 0.1s;
  }

  .ss-filter-option[active] {
    background: var(--ss-chip-active-bg, #3b82f6);
    border-color: var(--ss-chip-active-bg, #3b82f6);
    color: var(--ss-chip-active-color, #fff);
  }

  .ss-filter-option:hover:not([active]) {
    background: var(--ss-chip-hover-bg, #f1f5f9);
    border-color: var(--ss-chip-hover-border, #cbd5e1);
  }

  [data-keyboard-nav] .ss-filter-option:hover:not([active]) {
    background: var(--ss-chip-bg, #f8fafc);
    border-color: var(--ss-border, #e2e8f0);
  }
`,
  Ot = `
  ss-search-result-list {
    display: block;
    padding: var(--ss-result-list-padding, 4px);
    margin: 0;
  }


  .ss-result-group {
    display: block;
  }

  .ss-result-group-label {
    padding: var(--ss-group-label-padding, 8px 12px 4px);
    font-size: var(--ss-group-label-font-size, 11px);
    font-weight: var(--ss-group-label-font-weight, 600);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--ss-text-secondary);
    user-select: none;
  }

  .ss-result-group + .ss-result-group-label {
    margin-top: 4px;
    border-top: 1px solid var(--ss-border);
    padding-top: 12px;
  }
`,
  kt = `
  ss-search-result-item {
    display: block;
    padding: var(--ss-result-padding, 8px 12px);
    border-radius: var(--ss-result-radius, calc(var(--ss-radius, 8px) - 4px));
    color: var(--ss-text);
    font-family: var(--ss-font-family);
    font-size: var(--ss-font-size);
    line-height: 1.4;
    cursor: pointer;
    user-select: none;
    touch-action: manipulation;
    transition:
      background-color var(--ss-transition),
      color var(--ss-transition);
  }


  ss-search-result-item:hover:not([disabled]) {
    background: var(--ss-hover);
  }

  [data-keyboard-nav] ss-search-result-item:hover:not([active]) {
    background: transparent;
  }


  ss-search-result-item[active] {
    background: var(--ss-active);
    color: var(--ss-text);
    outline: none;
  }


  ss-search-result-item[disabled] {
    opacity: var(--ss-result-disabled-opacity, 0.45);
    cursor: not-allowed;
    pointer-events: none;
  }

  ss-search-result-item[selected] {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  ss-search-result-item[selected] svg[data-ss-check] {
    margin-left: auto;
    flex-shrink: 0;
    color: var(--ss-chip-active-bg, #3b82f6);
  }

  ss-search-result-item svg {
    flex-shrink: 0;
    vertical-align: middle;
  }


  ss-search-result-item:focus-visible {
    outline: 2px solid var(--ss-accent);
    outline-offset: -2px;
  }


  ss-search-result-item mark.ss-highlight {
    background: var(--ss-mark-bg);
    color: var(--ss-mark-text);
    border-radius: 2px;
    padding: 0;
  }


  @media (prefers-reduced-motion: reduce) {
    ss-search-result-item {
      transition: none;
    }
  }
`,
  At = `
    --ss-bg: #1e2433;
    --ss-border: #2d3748;
    --ss-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 4px 10px -5px rgba(0, 0, 0, 0.3);

    --ss-text: #f1f5f9;
    --ss-text-secondary: #94a3b8;

    --ss-accent: #60a5fa;
    --ss-accent-ring: rgba(96, 165, 250, 0.2);

    --ss-hover: #2d3748;
    --ss-active: #1e3a5f;

    --ss-chip-bg: #2d3748;
    --ss-chip-text: #94a3b8;
    --ss-chip-color: #94a3b8;
    --ss-chip-hover-bg: #374151;
    --ss-chip-hover-border: #4b5563;

    --ss-mark-bg: #92400e;
    --ss-mark-text: #fef3c7;

    --ss-muted: #94a3b8;
`,
  jt = `
  :host {
    /* Surfaces */
    --ss-bg: #ffffff;
    --ss-border: #e2e8f0;
    --ss-radius: 8px;
    --ss-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 10px -5px rgba(0, 0, 0, 0.04);

    /* Text */
    --ss-text: #1a202c;
    --ss-text-secondary: #718096;
    --ss-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    --ss-font-size: 15px;

    /* Brand accent */
    --ss-accent: #2563eb;
    --ss-accent-ring: rgba(37, 99, 235, 0.2);

    /* States */
    --ss-hover: #e2e8f0;
    --ss-active: #dbeafe;

    /* Chips */
    --ss-chip-bg: #f1f5f9;
    --ss-chip-text: #64748b;
    --ss-chip-color: #475569;
    --ss-chip-active-bg: #3b82f6;
    --ss-chip-active-color: #ffffff;
    --ss-chip-hover-bg: #f1f5f9;
    --ss-chip-hover-border: #cbd5e1;

    /* Highlight */
    --ss-mark-bg: #fef9c3;
    --ss-mark-text: inherit;

    /* Muted text */
    --ss-muted: #64748b;

    /* Input */
    --ss-input-height: 48px;

    /* Transition */
    --ss-transition: 150ms ease;

    /* Result list layout */
    --ss-result-list-padding: 4px;
    --ss-result-padding: 8px 12px;
    --ss-result-radius: calc(var(--ss-radius, 8px) - 4px);
    --ss-result-disabled-opacity: 0.45;

    /* Group labels */
    --ss-group-label-padding: 8px 12px 4px;
    --ss-group-label-font-size: 11px;
    --ss-group-label-font-weight: 600;
  }

  :host([theme='dark']) {
    ${At}
  }

  @media (prefers-color-scheme: dark) {
    :host(:not([theme='light']):not([theme='dark'])) {
      ${At}
    }
  }
`,
  Mt = `
  :host {
    display: block;
    position: relative;
  }
`,
  Nt = (e) =>
    [jt, Mt, Ct, wt, Et, Dt, Ot, kt, ...e].map((e) => {
      let t = new CSSStyleSheet()
      return (t.replaceSync(e), t)
    })
function Pt(e) {
  return class extends e {
    constructor(...e) {
      ;(super(...e),
        (this.handleMenuOpen = () => {
          ;(this.menuInstance.show(), this.getInputEl?.().setAttribute(`aria-expanded`, `true`))
        }),
        (this.handleMenuClose = () => {
          this.menuInstance.hide()
          let e = this,
            t = e.getInputEl?.()
          ;(t?.setAttribute(`aria-expanded`, `false`),
            this.contains(document.activeElement) && t?.focus(),
            e.resetActiveIndex?.())
        }),
        (this.handleInput = (e, t) => {
          if (this.hasAttribute(`disabled`)) return
          let n = this.getAttrs()
          if ((X(this, Z.INPUT_CHANGE, { value: e, sourceEvent: t }), !(e.length >= (n.minChars ?? 0)))) {
            this.menuInstance.hide()
            return
          }
          if (n.fetchDataOn === `input` || n.fetchDataOn === `input-focus`) {
            let t = this.getActiveFilters()
            this.loadData(e, t)
          }
          String(e || ``).trim().length > 0 && n.openMenuOnInput && this.menuInstance.show()
        }),
        (this.handleInputBlur = (e, t) => {
          this.hasAttribute(`disabled`) ||
            (X(this, Z.INPUT_BLUR, { value: e, sourceEvent: t }),
            this.getAttrs().closeMenuOnBlur &&
              requestAnimationFrame(() => {
                let e = this.getInputEl?.()
                !this.menuInstance.contains(document.activeElement) &&
                  document.activeElement !== e &&
                  (this.menuInstance.hide(), this.resetActiveIndex?.())
              }))
        }),
        (this.handleInputFocus = (e, t) => {
          if (this.hasAttribute(`disabled`)) return
          X(this, Z.INPUT_FOCUS, { value: e, sourceEvent: t })
          let n = this.getAttrs(),
            r = e.length >= (n.minChars ?? 0)
          if (r && (n.fetchDataOn === `focus` || n.fetchDataOn === `input-focus`)) {
            let t = this.getActiveFilters()
            this.loadData(e, t)
          }
          r && String(e || ``).trim().length > 0 && n.openMenuOnFocus && this.menuInstance.show()
        }),
        (this.handleClear = () => {
          this.handleMenuClose()
        }),
        (this.handleSelect = (e, t, n) => {
          X(this, Z.MENU_SELECT, { value: e, result: t, sourceEvent: n })
          let r = this.getInputEl?.()
          ;(r && (r.value = t.label), this.handleMenuClose())
        }),
        (this.handleInputKeydown = (e) => {
          if (!this.menuInstance.isOpen) return
          let t = this
          switch (e.key) {
            case `ArrowDown`:
            case `ArrowUp`:
            case `Home`:
            case `End`:
              ;(t.handleKeyboardNav(e), this.menuInstance.setAttribute(`data-keyboard-nav`, ``))
              break
            case `Enter`:
              ;(e.preventDefault(), t.getNavigableItems()[t.activeIndex]?.click())
              break
            case `Tab`:
              this.handleMenuClose()
              break
            case `Escape`:
              ;(e.preventDefault(), this.handleMenuClose())
              break
          }
        }),
        (this.handleFilterChange = (e) => {
          let t = this.getActiveFilters()
          X(this, Z.FILTER_CHANGE, { filters: t })
          let n = this.getInputEl().value
          this.loadData(n, t)
        }),
        (this.handlePointerMoveOnMenu = () => {
          this.menuInstance.removeAttribute(`data-keyboard-nav`)
        }))
    }
  }
}
function Ft(e) {
  return e.replace(/-([a-z])/g, (e, t) => t.toUpperCase())
}
function It(e, t) {
  if (ut(e)) {
    let n = t,
      r = []
    for (let t of e) {
      if (n <= 0) break
      let e = t.options.slice(0, n)
      ;(r.push({ ...t, options: e }), (n -= e.length))
    }
    return r
  }
  return e.slice(0, t)
}
var Lt = Ye(e, Xe, yt, Pt, bt),
  Rt = class e extends Lt {
    static {
      this.tagName = `smart-search`
    }
    static {
      this.className = `ss-smart-search`
    }
    static #e = 0
    constructor() {
      ;(super(),
        (this.handleSelect = (e, t, n) => {
          let { multiselect: r } = this.getAttrs()
          if (r) {
            this.#o.some((t) => t.value === e) ? this.#f(e, n) : this.#d(t, n)
            return
          }
          X(this, Z.MENU_SELECT, { value: e, result: t, sourceEvent: n })
          let i = this.getInputEl()
          ;((i.value = t.label), this.handleMenuClose())
        }),
        (this.handleClear = () => {
          let { multiselect: e } = this.getAttrs()
          ;(e && this.#p(), this.handleMenuClose())
        }),
        (this.shadowMode = `open`))
    }
    static get observedAttributes() {
      return Object.keys(ht)
    }
    #t = `ss-menu-listbox-${++e.#e}`
    #n
    #r
    #i = null
    #a
    #o = []
    get selectedItems() {
      return [...this.#o]
    }
    configureAria() {
      this.setAttribute(`aria-label`, `Smart Search`)
    }
    getInputEl() {
      return this.#n.inputElement
    }
    #s() {
      let { placeholder: e, debounce: t, name: n, clearable: r, maxChars: i } = this.getAttrs()
      ;((this.#n = new at({
        name: n ?? `search`,
        menuId: this.#t,
        onInput: this.handleInput,
        onBlur: this.handleInputBlur,
        onFocus: this.handleInputFocus,
        onClear: this.handleClear,
        onRemoveChip: this.#f,
      })),
        e && this.#n.setAttribute(`placeholder`, e),
        t !== void 0 && this.#n.setAttribute(`debounce`, String(t)),
        i !== void 0 && this.#n.setAttribute(`maxlength`, String(i)),
        this.#n.setAttribute(`clearable`, r ? `true` : ``))
    }
    #c() {
      let {
        menuMaxHeight: e,
        menuOffset: t,
        menuPlacement: n,
        menuMatchWidth: r,
        closeOnEscape: i,
        closeOnClickOutside: a,
        filters: o,
        filterMultiple: s,
      } = this.getAttrs()
      if (
        ((this.menuInstance = new q({
          anchor: this.#n,
          onClose: this.handleMenuClose,
          id: this.#t,
          maxHeight: e,
          offset: t,
          placement: n,
          matchWidth: r,
          closeOnEscape: i,
          closeOnClickOutside: a,
        })),
        !this.#r)
      )
        throw Error(`SearchResultList not configured`)
      ;(o?.length &&
        ((this.#i = new St({ options: o, onChange: this.handleFilterChange, multiple: s })),
        this.menuInstance.appendChild(this.#i)),
        this.menuInstance.appendChild(this.#r))
    }
    getAttrs() {
      return Object.keys(ht).reduce((e, t) => {
        let n = Ft(t),
          r = this.getAttribute(n),
          i,
          a = ht[n]
        return (
          (i = mt.boolAttrs.includes(n)
            ? r === null
              ? a
              : r !== `true`
            : mt.intAttrs.includes(n)
              ? r
                ? parseInt(r)
                : a
              : mt.objectAttrs.includes(n)
                ? r === null
                  ? a
                  : JSON.parse(r || `{}`)
                : (r ?? a)),
          { ...e, [n]: i }
        )
      }, {})
    }
    setLoading(e) {
      this.menuInstance.loading = e
    }
    loadResults(e, t) {
      let { openMenuOnLoadResults: n, maxResults: r } = this.getAttrs(),
        i = r ? It(e, r) : e
      ;(this.#r.update(i, t), this.#o.length > 0 && this.#r.setSelectedValues(this.#o.map((e) => e.value)))
      let a = ut(i) ? i.reduce((e, t) => e + t.options.length, 0) : i.length
      ;((this.menuInstance.empty = a === 0),
        (this.menuInstance.loading = !1),
        n && a > 0 && this.menuInstance.show(),
        this.#u(a === 0 ? `No results found` : `${a} result${a === 1 ? `` : `s`} available`))
    }
    #l() {
      this.#a = K(`div`, {
        style: `position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;`,
        "aria-live": `polite`,
        "aria-atomic": `true`,
      })
    }
    #u(e) {
      ;((this.#a.textContent = ``),
        requestAnimationFrame(() => {
          this.#a.textContent = e
        }))
    }
    set resultItemRenderer(e) {
      ;((super.resultItemRenderer = e), this.#r && (this.#r.resultItemRenderer = e))
    }
    get resultItemRenderer() {
      return super.resultItemRenderer
    }
    set highlightMatches(e) {
      this.#r && (this.#r.highlightMatches = e)
    }
    get highlightMatches() {
      return this.#r?.highlightMatches ?? !0
    }
    set filterItemRenderer(e) {
      this.#i && (this.#i.renderFn = e ?? void 0)
    }
    getActiveFilters() {
      return this.#i?.getActiveFilters() ?? []
    }
    #d = (e, t) => {
      ;(this.#o.push(e), this.#m(t))
    }
    #f = (e, t) => {
      ;((this.#o = this.#o.filter((t) => t.value !== e)), this.#m(t))
    }
    #p = () => {
      ;((this.#o = []), this.#m())
    }
    #m(e) {
      ;(this.#n.updateChips(this.#o),
        this.#r.setSelectedValues(this.#o.map((e) => e.value)),
        this.#n.setMultiValue(this.#o.length > 0 ? JSON.stringify(this.#o.map((e) => e.value)) : null))
      let t = e ?? new Event(`ss-multiselect-sync`, { bubbles: !1, composed: !1 })
      X(this, Z.MULTISELECT_CHANGE, { items: [...this.#o], sourceEvent: t })
    }
    getNavigableItems() {
      return Array.from(this.menuInstance.querySelectorAll(`${dt.tagName} ${Y.tagName}:not([disabled])`))
    }
    onActiveIndexChanged(e, t) {
      for (let e of t) e.active = !1
      let n = t[e],
        r = this.getInputEl()
      n
        ? ((n.active = !0), r.setAttribute(`aria-activedescendant`, n.id), n.scrollIntoView({ block: `nearest` }))
        : r.setAttribute(`aria-activedescendant`, ``)
    }
    onDisconnect() {
      ;(this.#r.remove(), this.#a.remove())
    }
    render() {
      return (
        this.#s(),
        (this.#r = new dt({ onSelect: this.handleSelect })),
        this.#c(),
        this.#l(),
        K(`div`, { class: e.className }, this.#n, this.menuInstance, this.#a)
      )
    }
    onConnect() {
      let e = this.getAttribute(`menu-min-height`) ?? ht.menuMinHeight
      this.shadowRoot.adoptedStyleSheets = Nt([Tt({ minHeight: e })])
      let t = { signal: this.abort.signal }
      ;(this.addEventListener(Z.MENU_CLOSE, this.handleMenuClose, t),
        this.addEventListener(Z.MENU_OPEN, this.handleMenuOpen, t),
        this.#n.inputElement.addEventListener(`keydown`, this.handleInputKeydown, t),
        this.menuInstance.addEventListener(`pointermove`, this.handlePointerMoveOnMenu, t))
      let n = this.getAttrs()
      ;(n.options?.length && (this.options = n.options),
        (this.#r.highlightMatches = this.getAttribute(`highlight-matches`) !== `false`))
    }
    attributeChangedCallback(e, t, n) {
      if ((super.attributeChangedCallback(e, t, n), e === `theme`)) {
        X(this, Z.THEME_CHANGE, { theme: n ?? `auto` })
        return
      }
      if (
        (e === `placeholder` && this.#n && this.#n.setAttribute(`placeholder`, n ?? ``),
        e === `max-chars` &&
          this.#n &&
          (n === null ? this.#n.removeAttribute(`maxlength`) : this.#n.setAttribute(`maxlength`, n)),
        e === `options` && (this.options = n ? JSON.parse(n) : []),
        e === `datasource` && this.clearCache(),
        e === `filters` && this.menuInstance)
      ) {
        let e = n ? JSON.parse(n) : []
        if (this.#i) this.#i.update(e)
        else if (e.length) {
          let { filterMultiple: t } = this.getAttrs()
          ;((this.#i = new St({ options: e, onChange: this.handleFilterChange, multiple: t })),
            this.menuInstance.insertBefore(this.#i, this.#r))
        }
      }
      if (e === `filter-multiple` && this.#i) {
        let { filterMultiple: e } = this.getAttrs()
        this.#i.multiple = e ?? !0
      }
      e === `highlight-matches` && this.#r && (this.#r.highlightMatches = n !== `false`)
    }
  }
;(customElements.define(at.tagName, at),
  customElements.define(q.tagName, q),
  customElements.define(dt.tagName, dt),
  customElements.define(Y.tagName, Y),
  customElements.define(Q.tagName, Q),
  customElements.define(St.tagName, St),
  customElements.define(Rt.tagName, Rt))
function $(e) {
  let { products: t } = e
  return t.map((e) => ({
    value: String(e.id),
    label: e.title,
    description: `$${e.price.toFixed(2)} · ${e.category}`,
    group: e.category,
    metadata: { price: e.price, thumbnail: e.thumbnail, category: e.category },
  }))
}
function zt() {
  let e = document.getElementById(`demo-basic`)
  e && (e.transformResponse = $)
}
function Bt() {
  let e = document.getElementById(`demo-filters`)
  e &&
    ((e.transformResponse = $),
    e.setAttribute(
      `filters`,
      JSON.stringify([
        { field: `category`, value: `smartphones`, label: `Smartphones` },
        { field: `category`, value: `laptops`, label: `Laptops` },
        { field: `category`, value: `beauty`, label: `Beauty` },
        { field: `category`, value: `fragrances`, label: `Fragrances` },
      ]),
    ))
}
function Vt() {
  let e = document.getElementById(`demo-dark`)
  e && (e.transformResponse = $)
}
function Ht() {
  let e = document.getElementById(`demo-custom`)
  e &&
    ((e.transformResponse = $),
    (e.resultItemRenderer = (e, t) => {
      let n = e.metadata,
        r = document.createElement(`div`)
      r.style.cssText = `display:flex;gap:12px;align-items:center;width:100%;padding:2px 0`
      let i = document.createElement(`img`)
      ;((i.src = n.thumbnail),
        (i.alt = e.label),
        (i.width = 44),
        (i.height = 44),
        (i.style.cssText = `border-radius:6px;object-fit:cover;flex-shrink:0;background:var(--ss-hover)`))
      let a = document.createElement(`div`)
      a.style.cssText = `display:flex;flex-direction:column;gap:2px;min-width:0`
      let o = document.createElement(`span`)
      ;((o.textContent = e.label),
        (o.style.cssText = `font-weight:500;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis`))
      let s = document.createElement(`span`)
      s.style.cssText = `font-size:12px;color:var(--ss-text-secondary);display:flex;gap:8px`
      let c = document.createElement(`span`)
      ;((c.textContent = `$${n.price.toFixed(2)}`), (c.style.cssText = `color:var(--ss-accent);font-weight:600`))
      let l = document.createElement(`span`)
      return (
        (l.textContent = n.category),
        (l.style.textTransform = `capitalize`),
        s.append(c, l),
        a.append(o, s),
        r.append(i, a),
        r
      )
    }))
}
function Ut() {
  let e = document.getElementById(`demo-multiselect`),
    t = document.getElementById(`demo-multiselect-selected`)
  if (!e || !t) return
  let n = t
  function r(e) {
    n.replaceChildren()
    for (let t of e) {
      let e = document.createElement(`div`)
      ;((e.className = `multiselect-selected-line`), (e.textContent = t.label), n.append(e))
    }
  }
  ;(e.addEventListener(Z.MULTISELECT_CHANGE, (e) => {
    let { items: t } = e.detail
    r(t)
  }),
    (e.transformResponse = $),
    r(e.selectedItems))
}
function Wt() {
  let e = [
    { value: `js`, label: `JavaScript`, description: `Dynamic web scripting`, group: `Frontend` },
    { value: `ts`, label: `TypeScript`, description: `Typed superset of JS`, group: `Frontend` },
    { value: `react`, label: `React`, description: `UI component library`, group: `Frontend` },
    { value: `vue`, label: `Vue`, description: `Progressive JS framework`, group: `Frontend` },
    { value: `go`, label: `Go`, description: `Compiled systems language`, group: `Backend` },
    { value: `rust`, label: `Rust`, description: `Memory-safe systems lang`, group: `Backend` },
    { value: `python`, label: `Python`, description: `General-purpose language`, group: `Backend` },
  ]
  for (let t of [`demo-brand-violet`, `demo-brand-emerald`, `demo-brand-rose`]) {
    let n = document.getElementById(t)
    n && (n.options = e)
  }
}
function Gt() {
  let e = document.getElementById(`demo-events`),
    t = document.getElementById(`event-log`)
  if (!(!e || !t)) {
    e.transformResponse = $
    for (let n of [
      `ss-input-change`,
      `ss-menu-select`,
      `ss-filter-change`,
      `ss-menu-open`,
      `ss-menu-close`,
      `ss-load-error`,
    ])
      e.addEventListener(n, (e) => {
        let r = e.detail,
          i = document.createElement(`div`)
        i.className = `log-entry`
        let a = document.createElement(`span`)
        ;((a.className = `log-tag`), (a.textContent = n))
        let o = document.createElement(`span`)
        for (
          o.className = `log-body`,
            o.textContent = r ? JSON.stringify(r).slice(0, 120) : `(no detail)`,
            i.append(a, o),
            t.prepend(i);
          t.children.length > 8;
        )
          t.removeChild(t.lastChild)
      })
  }
}
window.addEventListener(`load`, () => {
  ;(zt(), Bt(), Vt(), Wt(), Ht(), Ut(), Gt())
})
