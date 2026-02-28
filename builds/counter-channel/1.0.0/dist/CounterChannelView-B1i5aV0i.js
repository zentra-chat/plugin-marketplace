typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
let He = !1, gn = !1;
function wn() {
  He = !0;
}
wn();
const bn = 1, mn = 2, yn = 16, En = 2, T = Symbol(), xn = "http://www.w3.org/1999/xhtml", nt = !1;
var Ft = Array.isArray, kn = Array.prototype.indexOf, ge = Array.prototype.includes, ct = Array.from, Ot = Object.defineProperty, Je = Object.getOwnPropertyDescriptor, Tn = Object.getOwnPropertyDescriptors, Sn = Object.prototype, An = Array.prototype, It = Object.getPrototypeOf;
const Be = () => {
};
function Cn(e) {
  return e();
}
function rt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Pt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const S = 2, Ie = 4, we = 8, $t = 1 << 24, ie = 16, V = 32, me = 64, Mn = 128, L = 512, x = 1024, A = 2048, B = 4096, F = 8192, ee = 16384, ye = 32768, Re = 65536, xt = 1 << 17, Rn = 1 << 18, Ke = 1 << 19, Lt = 1 << 20, Q = 1 << 25, ae = 65536, it = 1 << 21, vt = 1 << 22, te = 1 << 23, Ae = Symbol("$state"), se = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Nn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Dn(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function Fn(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function On() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function In(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Pn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function $n() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Ln() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Un() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Ut(e) {
  return e === this.v;
}
function qn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function qt(e) {
  return !qn(e, this.v);
}
let k = null;
function Ve(e) {
  k = e;
}
function jn(e, t = !1, n) {
  k = {
    p: k,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: He && !t ? { s: null, u: null, $: [] } : null
  };
}
function Bn(e) {
  var t = (
    /** @type {ComponentContext} */
    k
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      en(r);
  }
  return t.i = !0, k = t.p, /** @type {T} */
  {};
}
function Pe() {
  return !He || k !== null && k.l === null;
}
let _e = [];
function Vn() {
  var e = _e;
  _e = [], rt(e);
}
function ft(e) {
  if (_e.length === 0) {
    var t = _e;
    queueMicrotask(() => {
      t === _e && Vn();
    });
  }
  _e.push(e);
}
function zn(e) {
  var t = p;
  if (t === null)
    return h.f |= te, e;
  if ((t.f & ye) === 0 && (t.f & Ie) === 0)
    throw e;
  ze(e, t);
}
function ze(e, t) {
  for (; t !== null; ) {
    if ((t.f & Mn) !== 0) {
      if ((t.f & ye) === 0)
        throw e;
      try {
        t.b.error(e);
        return;
      } catch (n) {
        e = n;
      }
    }
    t = t.parent;
  }
  throw e;
}
const Hn = -7169;
function E(e, t) {
  e.f = e.f & Hn | t;
}
function dt(e) {
  (e.f & L) !== 0 || e.deps === null ? E(e, x) : E(e, B);
}
function jt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & S) === 0 || (t.f & ae) === 0 || (t.f ^= ae, jt(
        /** @type {Derived} */
        t.deps
      ));
}
function Kn(e, t, n) {
  (e.f & A) !== 0 ? t.add(e) : (e.f & B) !== 0 && n.add(e), jt(e.deps), E(e, x);
}
const $e = /* @__PURE__ */ new Set();
let b = null, q = null, P = [], ht = null, be = null;
class Ye {
  /**
   * The current values of any sources that are updated in this batch
   * They keys of this map are identical to `this.#previous`
   * @type {Map<Source, any>}
   */
  current = /* @__PURE__ */ new Map();
  /**
   * The values of any sources that are updated in this batch _before_ those updates took place.
   * They keys of this map are identical to `this.#current`
   * @type {Map<Source, any>}
   */
  previous = /* @__PURE__ */ new Map();
  /**
   * When the batch is committed (and the DOM is updated), we need to remove old branches
   * and append new ones by calling the functions added inside (if/each/key/etc) blocks
   * @type {Set<(batch: Batch) => void>}
   */
  #t = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #n = /* @__PURE__ */ new Set();
  /**
   * The number of async effects that are currently in flight
   */
  #e = 0;
  /**
   * The number of async effects that are currently in flight, _not_ inside a pending boundary
   */
  #r = 0;
  /**
   * A deferred that resolves when the batch is committed, used with `settled()`
   * TODO replace with Promise.withResolvers once supported widely enough
   * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
   */
  #l = null;
  /**
   * Deferred effects (which run after async work has completed) that are DIRTY
   * @type {Set<Effect>}
   */
  #s = /* @__PURE__ */ new Set();
  /**
   * Deferred effects that are MAYBE_DIRTY
   * @type {Set<Effect>}
   */
  #i = /* @__PURE__ */ new Set();
  /**
   * A map of branches that still exist, but will be destroyed when this batch
   * is committed — we skip over these during `process`.
   * The value contains child effects that were dirty/maybe_dirty before being reset,
   * so they can be rescheduled if the branch survives.
   * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
   */
  #f = /* @__PURE__ */ new Map();
  is_fork = !1;
  #u = !1;
  #o() {
    return this.is_fork || this.#r > 0;
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(t) {
    this.#f.has(t) || this.#f.set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var n = this.#f.get(t);
    if (n) {
      this.#f.delete(t);
      for (var r of n.d)
        E(r, A), W(r);
      for (r of n.m)
        E(r, B), W(r);
    }
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(t) {
    P = [], this.apply();
    var n = be = [], r = [];
    for (const i of t)
      this.#a(i, n, r);
    if (be = null, this.#o()) {
      this.#c(r), this.#c(n);
      for (const [i, f] of this.#f)
        zt(i, f);
    } else {
      b = null;
      for (const i of this.#t) i(this);
      this.#t.clear(), this.#e === 0 && this.#v(), kt(r), kt(n), this.#s.clear(), this.#i.clear(), this.#l?.resolve();
    }
    q = null;
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #a(t, n, r) {
    t.f ^= x;
    for (var i = t.first; i !== null; ) {
      var f = i.f, o = (f & (V | me)) !== 0, l = o && (f & x) !== 0, s = l || (f & F) !== 0 || this.#f.has(i);
      if (!s && i.fn !== null) {
        o ? i.f ^= x : (f & Ie) !== 0 ? n.push(i) : Ee(i) && ((f & ie) !== 0 && this.#i.add(i), ve(i));
        var u = i.first;
        if (u !== null) {
          i = u;
          continue;
        }
      }
      for (; i !== null; ) {
        var v = i.next;
        if (v !== null) {
          i = v;
          break;
        }
        i = i.parent;
      }
    }
  }
  /**
   * @param {Effect[]} effects
   */
  #c(t) {
    for (var n = 0; n < t.length; n += 1)
      Kn(t[n], this.#s, this.#i);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, n) {
    n !== T && !this.previous.has(t) && this.previous.set(t, n), (t.f & te) === 0 && (this.current.set(t, t.v), q?.set(t, t.v));
  }
  activate() {
    b = this, this.apply();
  }
  deactivate() {
    b === this && (b = null, q = null);
  }
  flush() {
    if (P.length > 0)
      b = this, Yn();
    else if (this.#e === 0 && !this.is_fork) {
      for (const t of this.#t) t(this);
      this.#t.clear(), this.#v(), this.#l?.resolve();
    }
    this.deactivate();
  }
  discard() {
    for (const t of this.#n) t(this);
    this.#n.clear();
  }
  #v() {
    if ($e.size > 1) {
      this.previous.clear();
      var t = b, n = q, r = !0;
      for (const f of $e) {
        if (f === this) {
          r = !1;
          continue;
        }
        const o = [];
        for (const [s, u] of this.current) {
          if (f.current.has(s))
            if (r && u !== f.current.get(s))
              f.current.set(s, u);
            else
              continue;
          o.push(s);
        }
        if (o.length === 0)
          continue;
        const l = [...f.current.keys()].filter((s) => !this.current.has(s));
        if (l.length > 0) {
          var i = P;
          P = [];
          const s = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
          for (const v of o)
            Bt(v, l, s, u);
          if (P.length > 0) {
            b = f, f.apply();
            for (const v of P)
              f.#a(v, [], []);
            f.deactivate();
          }
          P = i;
        }
      }
      b = t, q = n;
    }
    this.#f.clear(), $e.delete(this);
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    this.#e += 1, t && (this.#r += 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(t) {
    this.#e -= 1, t && (this.#r -= 1), !this.#u && (this.#u = !0, ft(() => {
      this.#u = !1, this.#o() ? P.length > 0 && this.flush() : this.revive();
    }));
  }
  revive() {
    for (const t of this.#s)
      this.#i.delete(t), E(t, A), W(t);
    for (const t of this.#i)
      E(t, B), W(t);
    this.flush();
  }
  /** @param {(batch: Batch) => void} fn */
  oncommit(t) {
    this.#t.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#n.add(t);
  }
  settled() {
    return (this.#l ??= Pt()).promise;
  }
  static ensure() {
    if (b === null) {
      const t = b = new Ye();
      $e.add(b), ft(() => {
        b === t && t.flush();
      });
    }
    return b;
  }
  apply() {
  }
}
function Yn() {
  var e = null;
  try {
    for (var t = 0; P.length > 0; ) {
      var n = Ye.ensure();
      if (t++ > 1e3) {
        var r, i;
        Wn();
      }
      n.process(P), ne.clear();
    }
  } finally {
    P = [], ht = null, be = null;
  }
}
function Wn() {
  try {
    Pn();
  } catch (e) {
    ze(e, ht);
  }
}
let Y = null;
function kt(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (ee | F)) === 0 && Ee(r) && (Y = /* @__PURE__ */ new Set(), ve(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && fn(r), Y?.size > 0)) {
        ne.clear();
        for (const i of Y) {
          if ((i.f & (ee | F)) !== 0) continue;
          const f = [i];
          let o = i.parent;
          for (; o !== null; )
            Y.has(o) && (Y.delete(o), f.push(o)), o = o.parent;
          for (let l = f.length - 1; l >= 0; l--) {
            const s = f[l];
            (s.f & (ee | F)) === 0 && ve(s);
          }
        }
        Y.clear();
      }
    }
    Y = null;
  }
}
function Bt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const f = i.f;
      (f & S) !== 0 ? Bt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (f & (vt | ie)) !== 0 && (f & A) === 0 && Vt(i, t, r) && (E(i, A), W(
        /** @type {Effect} */
        i
      ));
    }
}
function Vt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ge.call(t, i))
        return !0;
      if ((i.f & S) !== 0 && Vt(
        /** @type {Derived} */
        i,
        t,
        n
      ))
        return n.set(
          /** @type {Derived} */
          i,
          !0
        ), !0;
    }
  return n.set(e, !1), !1;
}
function W(e) {
  var t = ht = e, n = t.b;
  if (n?.is_pending && (e.f & (Ie | we | $t)) !== 0 && (e.f & ye) === 0) {
    n.defer_effect(e);
    return;
  }
  for (; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (be !== null && t === p && (e.f & we) === 0)
      return;
    if ((r & (me | V)) !== 0) {
      if ((r & x) === 0)
        return;
      t.f ^= x;
    }
  }
  P.push(t);
}
function zt(e, t) {
  if (!((e.f & V) !== 0 && (e.f & x) !== 0)) {
    (e.f & A) !== 0 ? t.d.push(e) : (e.f & B) !== 0 && t.m.push(e), E(e, x);
    for (var n = e.first; n !== null; )
      zt(n, t), n = n.next;
  }
}
function Zn(e, t, n, r) {
  const i = Pe() ? _t : Ht;
  var f = e.filter((c) => !c.settled);
  if (n.length === 0 && f.length === 0) {
    r(t.map(i));
    return;
  }
  var o = (
    /** @type {Effect} */
    p
  ), l = Gn(), s = f.length === 1 ? f[0].promise : f.length > 1 ? Promise.all(f.map((c) => c.promise)) : null;
  function u(c) {
    l();
    try {
      r(c);
    } catch (d) {
      (o.f & ee) === 0 && ze(d, o);
    }
    lt();
  }
  if (n.length === 0) {
    s.then(() => u(t.map(i)));
    return;
  }
  function v() {
    l(), Promise.all(n.map((c) => /* @__PURE__ */ Jn(c))).then((c) => u([...t.map(i), ...c])).catch((c) => ze(c, o));
  }
  s ? s.then(v) : v();
}
function Gn() {
  var e = p, t = h, n = k, r = b;
  return function(f = !0) {
    re(e), K(t), Ve(n), f && r?.activate();
  };
}
function lt(e = !0) {
  re(null), K(null), Ve(null), e && b?.deactivate();
}
function Xn() {
  var e = (
    /** @type {Boundary} */
    /** @type {Effect} */
    p.b
  ), t = (
    /** @type {Batch} */
    b
  ), n = e.is_rendered();
  return e.update_pending_count(1), t.increment(n), () => {
    e.update_pending_count(-1), t.decrement(n);
  };
}
// @__NO_SIDE_EFFECTS__
function _t(e) {
  var t = S | A, n = h !== null && (h.f & S) !== 0 ? (
    /** @type {Derived} */
    h
  ) : null;
  return p !== null && (p.f |= Ke), {
    ctx: k,
    deps: null,
    effects: null,
    equals: Ut,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      T
    ),
    wv: 0,
    parent: n ?? p,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Jn(e, t, n) {
  /** @type {Effect | null} */
  p === null && Nn();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), f = Ne(
    /** @type {V} */
    T
  ), o = !h, l = /* @__PURE__ */ new Map();
  return cr(() => {
    var s = Pt();
    i = s.promise;
    try {
      Promise.resolve(e()).then(s.resolve, s.reject).finally(lt);
    } catch (d) {
      s.reject(d), lt();
    }
    var u = (
      /** @type {Batch} */
      b
    );
    if (o) {
      var v = Xn();
      l.get(u)?.reject(se), l.delete(u), l.set(u, s);
    }
    const c = (d, _ = void 0) => {
      if (u.activate(), _)
        _ !== se && (f.f |= te, De(f, _));
      else {
        (f.f & te) !== 0 && (f.f ^= te), De(f, d);
        for (const [a, g] of l) {
          if (l.delete(a), a === u) break;
          g.reject(se);
        }
      }
      v && v();
    };
    s.promise.then(c, (d) => c(null, d || "unknown"));
  }), wt(() => {
    for (const s of l.values())
      s.reject(se);
  }), new Promise((s) => {
    function u(v) {
      function c() {
        v === i ? s(f) : u(i);
      }
      v.then(c, c);
    }
    u(i);
  });
}
// @__NO_SIDE_EFFECTS__
function Ht(e) {
  const t = /* @__PURE__ */ _t(e);
  return t.equals = qt, t;
}
function Qn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      Z(
        /** @type {Effect} */
        t[n]
      );
  }
}
function er(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & S) === 0)
      return (t.f & ee) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function pt(e) {
  var t, n = p;
  re(er(e));
  try {
    e.f &= ~ae, Qn(e), t = cn(e);
  } finally {
    re(n);
  }
  return t;
}
function Kt(e) {
  var t = pt(e);
  if (!e.equals(t) && (e.wv = on(), (!b?.is_fork || e.deps === null) && (e.v = t, e.deps === null))) {
    E(e, x);
    return;
  }
  ce || (q !== null ? (Qt() || b?.is_fork) && q.set(e, t) : dt(e));
}
function tr(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(se), t.teardown = Be, t.ac = null, Oe(t, 0), bt(t));
}
function Yt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ve(t);
}
let st = /* @__PURE__ */ new Set();
const ne = /* @__PURE__ */ new Map();
let Wt = !1;
function Ne(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Ut,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function X(e, t) {
  const n = Ne(e);
  return _r(n), n;
}
// @__NO_SIDE_EFFECTS__
function Ce(e, t = !1, n = !0) {
  const r = Ne(e);
  return t || (r.equals = qt), He && n && k !== null && k.l !== null && (k.l.s ??= []).push(r), r;
}
function $(e, t, n = !1) {
  h !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!j || (h.f & xt) !== 0) && Pe() && (h.f & (S | ie | vt | xt)) !== 0 && (U === null || !ge.call(U, e)) && Un();
  let r = n ? Te(t) : t;
  return De(e, r);
}
function De(e, t) {
  if (!e.equals(t)) {
    var n = e.v;
    ce ? ne.set(e, t) : ne.set(e, n), e.v = t;
    var r = Ye.ensure();
    if (r.capture(e, n), (e.f & S) !== 0) {
      const i = (
        /** @type {Derived} */
        e
      );
      (e.f & A) !== 0 && pt(i), dt(i);
    }
    e.wv = on(), Zt(e, A), Pe() && p !== null && (p.f & x) !== 0 && (p.f & (V | me)) === 0 && (I === null ? pr([e]) : I.push(e)), !r.is_fork && st.size > 0 && !Wt && nr();
  }
  return t;
}
function nr() {
  Wt = !1;
  for (const e of st)
    (e.f & x) !== 0 && E(e, B), Ee(e) && ve(e);
  st.clear();
}
function Qe(e) {
  $(e, e.v + 1);
}
function Zt(e, t) {
  var n = e.reactions;
  if (n !== null)
    for (var r = Pe(), i = n.length, f = 0; f < i; f++) {
      var o = n[f], l = o.f;
      if (!(!r && o === p)) {
        var s = (l & A) === 0;
        if (s && E(o, t), (l & S) !== 0) {
          var u = (
            /** @type {Derived} */
            o
          );
          q?.delete(u), (l & ae) === 0 && (l & L && (o.f |= ae), Zt(u, B));
        } else s && ((l & ie) !== 0 && Y !== null && Y.add(
          /** @type {Effect} */
          o
        ), W(
          /** @type {Effect} */
          o
        ));
      }
    }
}
function Te(e) {
  if (typeof e != "object" || e === null || Ae in e)
    return e;
  const t = It(e);
  if (t !== Sn && t !== An)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Ft(e), i = /* @__PURE__ */ X(0), f = oe, o = (l) => {
    if (oe === f)
      return l();
    var s = h, u = oe;
    K(null), Mt(f);
    var v = l();
    return K(s), Mt(u), v;
  };
  return r && n.set("length", /* @__PURE__ */ X(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(l, s, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && $n();
        var v = n.get(s);
        return v === void 0 ? o(() => {
          var c = /* @__PURE__ */ X(u.value);
          return n.set(s, c), c;
        }) : $(v, u.value, !0), !0;
      },
      deleteProperty(l, s) {
        var u = n.get(s);
        if (u === void 0) {
          if (s in l) {
            const v = o(() => /* @__PURE__ */ X(T));
            n.set(s, v), Qe(i);
          }
        } else
          $(u, T), Qe(i);
        return !0;
      },
      get(l, s, u) {
        if (s === Ae)
          return e;
        var v = n.get(s), c = s in l;
        if (v === void 0 && (!c || Je(l, s)?.writable) && (v = o(() => {
          var _ = Te(c ? l[s] : T), a = /* @__PURE__ */ X(_);
          return a;
        }), n.set(s, v)), v !== void 0) {
          var d = m(v);
          return d === T ? void 0 : d;
        }
        return Reflect.get(l, s, u);
      },
      getOwnPropertyDescriptor(l, s) {
        var u = Reflect.getOwnPropertyDescriptor(l, s);
        if (u && "value" in u) {
          var v = n.get(s);
          v && (u.value = m(v));
        } else if (u === void 0) {
          var c = n.get(s), d = c?.v;
          if (c !== void 0 && d !== T)
            return {
              enumerable: !0,
              configurable: !0,
              value: d,
              writable: !0
            };
        }
        return u;
      },
      has(l, s) {
        if (s === Ae)
          return !0;
        var u = n.get(s), v = u !== void 0 && u.v !== T || Reflect.has(l, s);
        if (u !== void 0 || p !== null && (!v || Je(l, s)?.writable)) {
          u === void 0 && (u = o(() => {
            var d = v ? Te(l[s]) : T, _ = /* @__PURE__ */ X(d);
            return _;
          }), n.set(s, u));
          var c = m(u);
          if (c === T)
            return !1;
        }
        return v;
      },
      set(l, s, u, v) {
        var c = n.get(s), d = s in l;
        if (r && s === "length")
          for (var _ = u; _ < /** @type {Source<number>} */
          c.v; _ += 1) {
            var a = n.get(_ + "");
            a !== void 0 ? $(a, T) : _ in l && (a = o(() => /* @__PURE__ */ X(T)), n.set(_ + "", a));
          }
        if (c === void 0)
          (!d || Je(l, s)?.writable) && (c = o(() => /* @__PURE__ */ X(void 0)), $(c, Te(u)), n.set(s, c));
        else {
          d = c.v !== T;
          var g = o(() => Te(u));
          $(c, g);
        }
        var w = Reflect.getOwnPropertyDescriptor(l, s);
        if (w?.set && w.set.call(v, u), !d) {
          if (r && typeof s == "string") {
            var C = (
              /** @type {Source<number>} */
              n.get("length")
            ), y = Number(s);
            Number.isInteger(y) && y >= C.v && $(C, y + 1);
          }
          Qe(i);
        }
        return !0;
      },
      ownKeys(l) {
        m(i);
        var s = Reflect.ownKeys(l).filter((c) => {
          var d = n.get(c);
          return d === void 0 || d.v !== T;
        });
        for (var [u, v] of n)
          v.v !== T && !(u in l) && s.push(u);
        return s;
      },
      setPrototypeOf() {
        Ln();
      }
    }
  );
}
var rr, ir, fr;
function Me(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Gt(e) {
  return (
    /** @type {TemplateNode | null} */
    ir.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function We(e) {
  return (
    /** @type {TemplateNode | null} */
    fr.call(e)
  );
}
function he(e, t) {
  return /* @__PURE__ */ Gt(e);
}
function Le(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ We(r);
  return r;
}
function lr(e) {
  e.textContent = "";
}
function Xt() {
  return !1;
}
function sr(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(xn, e, void 0)
  );
}
function gt(e) {
  var t = h, n = p;
  K(null), re(null);
  try {
    return e();
  } finally {
    K(t), re(n);
  }
}
function Jt(e) {
  p === null && (h === null && In(), On()), ce && Fn();
}
function ur(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function fe(e, t) {
  var n = p;
  n !== null && (n.f & F) !== 0 && (e |= F);
  var r = {
    ctx: k,
    deps: null,
    nodes: null,
    f: e | A | L,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: n,
    b: n && n.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null
  }, i = r;
  if ((e & Ie) !== 0)
    be !== null ? be.push(r) : W(r);
  else if (t !== null) {
    try {
      ve(r);
    } catch (o) {
      throw Z(r), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & Ke) === 0 && (i = i.first, (e & ie) !== 0 && (e & Re) !== 0 && i !== null && (i.f |= Re));
  }
  if (i !== null && (i.parent = n, n !== null && ur(i, n), h !== null && (h.f & S) !== 0 && (e & me) === 0)) {
    var f = (
      /** @type {Derived} */
      h
    );
    (f.effects ??= []).push(i);
  }
  return r;
}
function Qt() {
  return h !== null && !j;
}
function wt(e) {
  const t = fe(we, null);
  return E(t, x), t.teardown = e, t;
}
function Tt(e) {
  Jt();
  var t = (
    /** @type {Effect} */
    p.f
  ), n = !h && (t & V) !== 0 && (t & ye) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      k
    );
    (r.e ??= []).push(e);
  } else
    return en(e);
}
function en(e) {
  return fe(Ie | Lt, e);
}
function or(e) {
  return Jt(), fe(we | Lt, e);
}
function St(e, t) {
  var n = (
    /** @type {ComponentContextLegacy} */
    k
  ), r = { effect: null, ran: !1, deps: e };
  n.l.$.push(r), r.effect = tn(() => {
    e(), !r.ran && (r.ran = !0, pe(t));
  });
}
function ar() {
  var e = (
    /** @type {ComponentContextLegacy} */
    k
  );
  tn(() => {
    for (var t of e.l.$) {
      t.deps();
      var n = t.effect;
      (n.f & x) !== 0 && n.deps !== null && E(n, B), Ee(n) && ve(n), t.ran = !1;
    }
  });
}
function cr(e) {
  return fe(vt | Ke, e);
}
function tn(e, t = 0) {
  return fe(we | t, e);
}
function At(e, t = [], n = [], r = []) {
  Zn(r, t, n, (i) => {
    fe(we, () => e(...i.map(m)));
  });
}
function nn(e, t = 0) {
  var n = fe(ie | t, e);
  return n;
}
function Fe(e) {
  return fe(V | Ke, e);
}
function rn(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ce, r = h;
    Ct(!0), K(null);
    try {
      t.call(null);
    } finally {
      Ct(n), K(r);
    }
  }
}
function bt(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && gt(() => {
      i.abort(se);
    });
    var r = n.next;
    (n.f & me) !== 0 ? n.parent = null : Z(n, t), n = r;
  }
}
function vr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & V) === 0 && Z(t), t = n;
  }
}
function Z(e, t = !0) {
  var n = !1;
  (t || (e.f & Rn) !== 0) && e.nodes !== null && e.nodes.end !== null && (dr(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), bt(e, t && !n), Oe(e, 0), E(e, ee);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const f of r)
      f.stop();
  rn(e);
  var i = e.parent;
  i !== null && i.first !== null && fn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function dr(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ We(e);
    e.remove(), e = n;
  }
}
function fn(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function mt(e, t, n = !0) {
  var r = [];
  ln(e, r, !0);
  var i = () => {
    n && Z(e), t && t();
  }, f = r.length;
  if (f > 0) {
    var o = () => --f || i();
    for (var l of r)
      l.out(o);
  } else
    i();
}
function ln(e, t, n) {
  if ((e.f & F) === 0) {
    e.f ^= F;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const l of r)
        (l.is_global || n) && t.push(l);
    for (var i = e.first; i !== null; ) {
      var f = i.next, o = (i.f & Re) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & V) !== 0 && (e.f & ie) !== 0;
      ln(i, t, o ? n : !1), i = f;
    }
  }
}
function yt(e) {
  sn(e, !0);
}
function sn(e, t) {
  if ((e.f & F) !== 0) {
    e.f ^= F, (e.f & x) === 0 && (E(e, A), W(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & Re) !== 0 || (n.f & V) !== 0;
      sn(n, i ? t : !1), n = r;
    }
    var f = e.nodes && e.nodes.t;
    if (f !== null)
      for (const o of f)
        (o.is_global || t) && o.in();
  }
}
function hr(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ We(n);
      t.append(n), n = i;
    }
}
let je = !1, ce = !1;
function Ct(e) {
  ce = e;
}
let h = null, j = !1;
function K(e) {
  h = e;
}
let p = null;
function re(e) {
  p = e;
}
let U = null;
function _r(e) {
  h !== null && (U === null ? U = [e] : U.push(e));
}
let R = null, D = 0, I = null;
function pr(e) {
  I = e;
}
let un = 1, ue = 0, oe = ue;
function Mt(e) {
  oe = e;
}
function on() {
  return ++un;
}
function Ee(e) {
  var t = e.f;
  if ((t & A) !== 0)
    return !0;
  if (t & S && (e.f &= ~ae), (t & B) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var f = n[i];
      if (Ee(
        /** @type {Derived} */
        f
      ) && Kt(
        /** @type {Derived} */
        f
      ), f.wv > e.wv)
        return !0;
    }
    (t & L) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    q === null && E(e, x);
  }
  return !1;
}
function an(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(U !== null && ge.call(U, e)))
    for (var i = 0; i < r.length; i++) {
      var f = r[i];
      (f.f & S) !== 0 ? an(
        /** @type {Derived} */
        f,
        t,
        !1
      ) : t === f && (n ? E(f, A) : (f.f & x) !== 0 && E(f, B), W(
        /** @type {Effect} */
        f
      ));
    }
}
function cn(e) {
  var t = R, n = D, r = I, i = h, f = U, o = k, l = j, s = oe, u = e.f;
  R = /** @type {null | Value[]} */
  null, D = 0, I = null, h = (u & (V | me)) === 0 ? e : null, U = null, Ve(e.ctx), j = !1, oe = ++ue, e.ac !== null && (gt(() => {
    e.ac.abort(se);
  }), e.ac = null);
  try {
    e.f |= it;
    var v = (
      /** @type {Function} */
      e.fn
    ), c = v();
    e.f |= ye;
    var d = e.deps, _ = b?.is_fork;
    if (R !== null) {
      var a;
      if (_ || Oe(e, D), d !== null && D > 0)
        for (d.length = D + R.length, a = 0; a < R.length; a++)
          d[D + a] = R[a];
      else
        e.deps = d = R;
      if (Qt() && (e.f & L) !== 0)
        for (a = D; a < d.length; a++)
          (d[a].reactions ??= []).push(e);
    } else !_ && d !== null && D < d.length && (Oe(e, D), d.length = D);
    if (Pe() && I !== null && !j && d !== null && (e.f & (S | B | A)) === 0)
      for (a = 0; a < /** @type {Source[]} */
      I.length; a++)
        an(
          I[a],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (ue++, i.deps !== null)
        for (let g = 0; g < n; g += 1)
          i.deps[g].rv = ue;
      if (t !== null)
        for (const g of t)
          g.rv = ue;
      I !== null && (r === null ? r = I : r.push(.../** @type {Source[]} */
      I));
    }
    return (e.f & te) !== 0 && (e.f ^= te), c;
  } catch (g) {
    return zn(g);
  } finally {
    e.f ^= it, R = t, D = n, I = r, h = i, U = f, Ve(o), j = l, oe = s;
  }
}
function gr(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = kn.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & S) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (R === null || !ge.call(R, t))) {
    var f = (
      /** @type {Derived} */
      t
    );
    (f.f & L) !== 0 && (f.f ^= L, f.f &= ~ae), dt(f), tr(f), Oe(f, 0);
  }
}
function Oe(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      gr(e, n[r]);
}
function ve(e) {
  var t = e.f;
  if ((t & ee) === 0) {
    E(e, x);
    var n = p, r = je;
    p = e, je = !0;
    try {
      (t & (ie | $t)) !== 0 ? vr(e) : bt(e), rn(e);
      var i = cn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = un;
      var f;
      nt && gn && (e.f & A) !== 0 && e.deps;
    } finally {
      je = r, p = n;
    }
  }
}
function m(e) {
  var t = e.f, n = (t & S) !== 0;
  if (h !== null && !j) {
    var r = p !== null && (p.f & ee) !== 0;
    if (!r && (U === null || !ge.call(U, e))) {
      var i = h.deps;
      if ((h.f & it) !== 0)
        e.rv < ue && (e.rv = ue, R === null && i !== null && i[D] === e ? D++ : R === null ? R = [e] : R.push(e));
      else {
        (h.deps ??= []).push(e);
        var f = e.reactions;
        f === null ? e.reactions = [h] : ge.call(f, h) || f.push(h);
      }
    }
  }
  if (ce && ne.has(e))
    return ne.get(e);
  if (n) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (ce) {
      var l = o.v;
      return ((o.f & x) === 0 && o.reactions !== null || dn(o)) && (l = pt(o)), ne.set(o, l), l;
    }
    var s = (o.f & L) === 0 && !j && h !== null && (je || (h.f & L) !== 0), u = (o.f & ye) === 0;
    Ee(o) && (s && (o.f |= L), Kt(o)), s && !u && (Yt(o), vn(o));
  }
  if (q?.has(e))
    return q.get(e);
  if ((e.f & te) !== 0)
    throw e.v;
  return e.v;
}
function vn(e) {
  if (e.f |= L, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & S) !== 0 && (t.f & L) === 0 && (Yt(
        /** @type {Derived} */
        t
      ), vn(
        /** @type {Derived} */
        t
      ));
}
function dn(e) {
  if (e.v === T) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (ne.has(t) || (t.f & S) !== 0 && dn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function pe(e) {
  var t = j;
  try {
    return j = !0, e();
  } finally {
    j = t;
  }
}
function wr(e) {
  if (!(typeof e != "object" || !e || e instanceof EventTarget)) {
    if (Ae in e)
      ut(e);
    else if (!Array.isArray(e))
      for (let t in e) {
        const n = e[t];
        typeof n == "object" && n && Ae in n && ut(n);
      }
  }
}
function ut(e, t = /* @__PURE__ */ new Set()) {
  if (typeof e == "object" && e !== null && // We don't want to traverse DOM elements
  !(e instanceof EventTarget) && !t.has(e)) {
    t.add(e), e instanceof Date && e.getTime();
    for (let r in e)
      try {
        ut(e[r], t);
      } catch {
      }
    const n = It(e);
    if (n !== Object.prototype && n !== Array.prototype && n !== Map.prototype && n !== Set.prototype && n !== Date.prototype) {
      const r = Tn(n);
      for (let i in r) {
        const f = r[i].get;
        if (f)
          try {
            f.call(e);
          } catch {
          }
      }
    }
  }
}
const Ue = Symbol("events");
function br(e, t, n, r = {}) {
  function i(f) {
    if (r.capture || yr.call(t, f), !f.cancelBubble)
      return gt(() => n?.call(this, f));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? ft(() => {
    t.addEventListener(e, i, r);
  }) : t.addEventListener(e, i, r), i;
}
function mr(e, t, n, r, i) {
  var f = { capture: r, passive: i }, o = br(e, t, n, f);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && wt(() => {
    t.removeEventListener(e, o, f);
  });
}
let Rt = null;
function yr(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], f = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  Rt = e;
  var o = 0, l = Rt === e && e[Ue];
  if (l) {
    var s = i.indexOf(l);
    if (s !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Ue] = t;
      return;
    }
    var u = i.indexOf(t);
    if (u === -1)
      return;
    s <= u && (o = s);
  }
  if (f = /** @type {Element} */
  i[o] || e.target, f !== t) {
    Ot(e, "currentTarget", {
      configurable: !0,
      get() {
        return f || n;
      }
    });
    var v = h, c = p;
    K(null), re(null);
    try {
      for (var d, _ = []; f !== null; ) {
        var a = f.assignedSlot || f.parentNode || /** @type {any} */
        f.host || null;
        try {
          var g = f[Ue]?.[r];
          g != null && (!/** @type {any} */
          f.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === f) && g.call(f, e);
        } catch (w) {
          d ? _.push(w) : d = w;
        }
        if (e.cancelBubble || a === t || a === null)
          break;
        f = a;
      }
      if (d) {
        for (let w of _)
          queueMicrotask(() => {
            throw w;
          });
        throw d;
      }
    } finally {
      e[Ue] = t, delete e.currentTarget, K(v), re(c);
    }
  }
}
const Er = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function xr(e) {
  return (
    /** @type {string} */
    Er?.createHTML(e) ?? e
  );
}
function kr(e) {
  var t = sr("template");
  return t.innerHTML = xr(e.replaceAll("<!>", "<!---->")), t.content;
}
function Tr(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Ze(e, t) {
  var n = (t & En) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = kr(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Gt(r));
    var f = (
      /** @type {TemplateNode} */
      n || rr ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Tr(f, f), f;
  };
}
function qe(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function et(e, t) {
  var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
  n !== (e.__t ??= e.nodeValue) && (e.__t = n, e.nodeValue = `${n}`);
}
class Sr {
  /** @type {TemplateNode} */
  anchor;
  /** @type {Map<Batch, Key>} */
  #t = /* @__PURE__ */ new Map();
  /**
   * Map of keys to effects that are currently rendered in the DOM.
   * These effects are visible and actively part of the document tree.
   * Example:
   * ```
   * {#if condition}
   * 	foo
   * {:else}
   * 	bar
   * {/if}
   * ```
   * Can result in the entries `true->Effect` and `false->Effect`
   * @type {Map<Key, Effect>}
   */
  #n = /* @__PURE__ */ new Map();
  /**
   * Similar to #onscreen with respect to the keys, but contains branches that are not yet
   * in the DOM, because their insertion is deferred.
   * @type {Map<Key, Branch>}
   */
  #e = /* @__PURE__ */ new Map();
  /**
   * Keys of effects that are currently outroing
   * @type {Set<Key>}
   */
  #r = /* @__PURE__ */ new Set();
  /**
   * Whether to pause (i.e. outro) on change, or destroy immediately.
   * This is necessary for `<svelte:element>`
   */
  #l = !0;
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, n = !0) {
    this.anchor = t, this.#l = n;
  }
  /**
   * @param {Batch} batch
   */
  #s = (t) => {
    if (this.#t.has(t)) {
      var n = (
        /** @type {Key} */
        this.#t.get(t)
      ), r = this.#n.get(n);
      if (r)
        yt(r), this.#r.delete(n);
      else {
        var i = this.#e.get(n);
        i && (this.#n.set(n, i.effect), this.#e.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [f, o] of this.#t) {
        if (this.#t.delete(f), f === t)
          break;
        const l = this.#e.get(o);
        l && (Z(l.effect), this.#e.delete(o));
      }
      for (const [f, o] of this.#n) {
        if (f === n || this.#r.has(f)) continue;
        const l = () => {
          if (Array.from(this.#t.values()).includes(f)) {
            var u = document.createDocumentFragment();
            hr(o, u), u.append(Me()), this.#e.set(f, { effect: o, fragment: u });
          } else
            Z(o);
          this.#r.delete(f), this.#n.delete(f);
        };
        this.#l || !r ? (this.#r.add(f), mt(o, l, !1)) : l();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #i = (t) => {
    this.#t.delete(t);
    const n = Array.from(this.#t.values());
    for (const [r, i] of this.#e)
      n.includes(r) || (Z(i.effect), this.#e.delete(r));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      b
    ), i = Xt();
    if (n && !this.#n.has(t) && !this.#e.has(t))
      if (i) {
        var f = document.createDocumentFragment(), o = Me();
        f.append(o), this.#e.set(t, {
          effect: Fe(() => n(o)),
          fragment: f
        });
      } else
        this.#n.set(
          t,
          Fe(() => n(this.anchor))
        );
    if (this.#t.set(r, t), i) {
      for (const [l, s] of this.#n)
        l === t ? r.unskip_effect(s) : r.skip_effect(s);
      for (const [l, s] of this.#e)
        l === t ? r.unskip_effect(s.effect) : r.skip_effect(s.effect);
      r.oncommit(this.#s), r.ondiscard(this.#i);
    } else
      this.#s(r);
  }
}
function Ar(e, t, n = !1) {
  var r = new Sr(e), i = n ? Re : 0;
  function f(o, l) {
    r.ensure(o, l);
  }
  nn(() => {
    var o = !1;
    t((l, s = 0) => {
      o = !0, f(s, l);
    }), o || f(!1, null);
  }, i);
}
function Cr(e, t, n) {
  for (var r = [], i = t.length, f, o = t.length, l = 0; l < i; l++) {
    let c = t[l];
    mt(
      c,
      () => {
        if (f) {
          if (f.pending.delete(c), f.done.add(c), f.pending.size === 0) {
            var d = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            ot(ct(f.done)), d.delete(f), d.size === 0 && (e.outrogroups = null);
          }
        } else
          o -= 1;
      },
      !1
    );
  }
  if (o === 0) {
    var s = r.length === 0 && n !== null;
    if (s) {
      var u = (
        /** @type {Element} */
        n
      ), v = (
        /** @type {Element} */
        u.parentNode
      );
      lr(v), v.append(u), e.items.clear();
    }
    ot(t, !s);
  } else
    f = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(f);
}
function ot(e, t = !0) {
  for (var n = 0; n < e.length; n++)
    Z(e[n], t);
}
var Nt;
function Mr(e, t, n, r, i, f = null) {
  var o = e, l = /* @__PURE__ */ new Map();
  {
    var s = (
      /** @type {Element} */
      e
    );
    o = s.appendChild(Me());
  }
  var u = null, v = /* @__PURE__ */ Ht(() => {
    var w = n();
    return Ft(w) ? w : w == null ? [] : ct(w);
  }), c, d = !0;
  function _() {
    g.fallback = u, Rr(g, c, o, t, r), u !== null && (c.length === 0 ? (u.f & Q) === 0 ? yt(u) : (u.f ^= Q, Se(u, null, o)) : mt(u, () => {
      u = null;
    }));
  }
  var a = nn(() => {
    c = /** @type {V[]} */
    m(v);
    for (var w = c.length, C = /* @__PURE__ */ new Set(), y = (
      /** @type {Batch} */
      b
    ), le = Xt(), M = 0; M < w; M += 1) {
      var z = c[M], G = r(z, M), N = d ? null : l.get(G);
      N ? (N.v && De(N.v, z), N.i && De(N.i, M), le && y.unskip_effect(N.e)) : (N = Nr(
        l,
        d ? o : Nt ??= Me(),
        z,
        G,
        M,
        i,
        t,
        n
      ), d || (N.e.f |= Q), l.set(G, N)), C.add(G);
    }
    if (w === 0 && f && !u && (d ? u = Fe(() => f(o)) : (u = Fe(() => f(Nt ??= Me())), u.f |= Q)), w > C.size && Dn(), !d)
      if (le) {
        for (const [H, Ge] of l)
          C.has(H) || y.skip_effect(Ge.e);
        y.oncommit(_), y.ondiscard(() => {
        });
      } else
        _();
    m(v);
  }), g = { effect: a, items: l, outrogroups: null, fallback: u };
  d = !1;
}
function ke(e) {
  for (; e !== null && (e.f & V) === 0; )
    e = e.next;
  return e;
}
function Rr(e, t, n, r, i) {
  var f = t.length, o = e.items, l = ke(e.effect.first), s, u = null, v = [], c = [], d, _, a, g;
  for (g = 0; g < f; g += 1) {
    if (d = t[g], _ = i(d, g), a = /** @type {EachItem} */
    o.get(_).e, e.outrogroups !== null)
      for (const H of e.outrogroups)
        H.pending.delete(a), H.done.delete(a);
    if ((a.f & Q) !== 0)
      if (a.f ^= Q, a === l)
        Se(a, null, n);
      else {
        var w = u ? u.next : l;
        a === e.effect.last && (e.effect.last = a.prev), a.prev && (a.prev.next = a.next), a.next && (a.next.prev = a.prev), J(e, u, a), J(e, a, w), Se(a, w, n), u = a, v = [], c = [], l = ke(u.next);
        continue;
      }
    if ((a.f & F) !== 0 && yt(a), a !== l) {
      if (s !== void 0 && s.has(a)) {
        if (v.length < c.length) {
          var C = c[0], y;
          u = C.prev;
          var le = v[0], M = v[v.length - 1];
          for (y = 0; y < v.length; y += 1)
            Se(v[y], C, n);
          for (y = 0; y < c.length; y += 1)
            s.delete(c[y]);
          J(e, le.prev, M.next), J(e, u, le), J(e, M, C), l = C, u = M, g -= 1, v = [], c = [];
        } else
          s.delete(a), Se(a, l, n), J(e, a.prev, a.next), J(e, a, u === null ? e.effect.first : u.next), J(e, u, a), u = a;
        continue;
      }
      for (v = [], c = []; l !== null && l !== a; )
        (s ??= /* @__PURE__ */ new Set()).add(l), c.push(l), l = ke(l.next);
      if (l === null)
        continue;
    }
    (a.f & Q) === 0 && v.push(a), u = a, l = ke(a.next);
  }
  if (e.outrogroups !== null) {
    for (const H of e.outrogroups)
      H.pending.size === 0 && (ot(ct(H.done)), e.outrogroups?.delete(H));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (l !== null || s !== void 0) {
    var z = [];
    if (s !== void 0)
      for (a of s)
        (a.f & F) === 0 && z.push(a);
    for (; l !== null; )
      (l.f & F) === 0 && l !== e.fallback && z.push(l), l = ke(l.next);
    var G = z.length;
    if (G > 0) {
      var N = f === 0 ? n : null;
      Cr(e, z, N);
    }
  }
}
function Nr(e, t, n, r, i, f, o, l) {
  var s = (o & bn) !== 0 ? (o & yn) === 0 ? /* @__PURE__ */ Ce(n, !1, !1) : Ne(n) : null, u = (o & mn) !== 0 ? Ne(i) : null;
  return {
    v: s,
    i: u,
    e: Fe(() => (f(t, s ?? n, u ?? i, l), () => {
      e.delete(r);
    }))
  };
}
function Se(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, f = t && (t.f & Q) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ We(r)
      );
      if (f.before(r), r === i)
        return;
      r = o;
    }
}
function J(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function Dr(e = !1) {
  const t = (
    /** @type {ComponentContextLegacy} */
    k
  ), n = t.l.u;
  if (!n) return;
  let r = () => wr(t.s);
  if (e) {
    let i = 0, f = (
      /** @type {Record<string, any>} */
      {}
    );
    const o = /* @__PURE__ */ _t(() => {
      let l = !1;
      const s = t.s;
      for (const u in s)
        s[u] !== f[u] && (f[u] = s[u], l = !0);
      return l && i++, i;
    });
    r = () => m(o);
  }
  n.b.length && or(() => {
    Dt(t, r), rt(n.b);
  }), Tt(() => {
    const i = pe(() => n.m.map(Cn));
    return () => {
      for (const f of i)
        typeof f == "function" && f();
    };
  }), n.a.length && Tt(() => {
    Dt(t, r), rt(n.a);
  });
}
function Dt(e, t) {
  if (e.l.s)
    for (const n of e.l.s) m(n);
  t();
}
function hn(e, t, n) {
  if (e == null)
    return t(void 0), Be;
  const r = pe(
    () => e.subscribe(
      t,
      // @ts-expect-error
      n
    )
  );
  return r.unsubscribe ? () => r.unsubscribe() : r;
}
function Fr(e) {
  let t;
  return hn(e, (n) => t = n)(), t;
}
let at = Symbol();
function tt(e, t, n) {
  const r = n[t] ??= {
    store: null,
    source: /* @__PURE__ */ Ce(void 0),
    unsubscribe: Be
  };
  if (r.store !== e && !(at in n))
    if (r.unsubscribe(), r.store = e ?? null, e == null)
      r.source.v = void 0, r.unsubscribe = Be;
    else {
      var i = !0;
      r.unsubscribe = hn(e, (f) => {
        i ? r.source.v = f : $(r.source, f);
      }), i = !1;
    }
  return e && at in n ? Fr(e) : m(r.source);
}
function Or() {
  const e = {};
  function t() {
    wt(() => {
      for (var n in e)
        e[n].unsubscribe();
      Ot(e, at, {
        enumerable: !1,
        value: !0
      });
    });
  }
  return [e, t];
}
function Ir() {
  if (!(typeof window > "u"))
    return window.ZentraSDK || window.ZentraPluginAPI;
}
function Pr() {
  const e = Ir();
  if (!e)
    throw new Error("Zentra SDK is not available. Plugins must run inside the Zentra app runtime.");
  return e;
}
function $r(e, t) {
  return (e || []).filter((n) => (n.content || "").startsWith(t)).length;
}
var Lr = /* @__PURE__ */ Ze('<p class="text-sm text-text-muted">No increments yet.</p>'), Ur = /* @__PURE__ */ Ze('<li class="text-sm text-text-secondary border border-border rounded px-3 py-2"> </li>'), qr = /* @__PURE__ */ Ze('<ul class="space-y-2"></ul>'), jr = /* @__PURE__ */ Ze('<div class="flex-1 flex flex-col min-h-0 p-6 gap-6 overflow-y-auto"><div class="rounded-xl border border-border bg-surface p-6 text-center"><p class="text-sm text-text-muted mb-2">Shared Counter</p> <p class="text-5xl font-bold text-text-primary"> </p> <p class="text-xs text-text-muted mt-2">Every click sends a channel message, so all viewers stay in sync.</p> <button type="button" class="mt-5 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"> </button></div> <div class="rounded-xl border border-border bg-surface p-4"><p class="text-sm font-semibold text-text-primary mb-3">Recent increments</p> <!></div></div>');
function Vr(e, t) {
  jn(t, !1);
  const n = () => tt(c, "$activeChannelMessages", f), r = () => tt(v, "$activeChannel", f), i = () => tt(d, "$currentUserId", f), [f, o] = Or(), l = /* @__PURE__ */ Ce(), s = /* @__PURE__ */ Ce(), u = Pr(), { activeChannel: v, activeChannelMessages: c, currentUserId: d } = u.stores, _ = "[[counter:+1]]";
  let a = /* @__PURE__ */ Ce(!1);
  async function g() {
    if (!(m(a) || !r()?.id)) {
      $(a, !0);
      try {
        const O = `${_} user=${i() || "unknown"} ts=${Date.now()}`, de = await u.api.sendMessage(r().id, { content: O });
        u.ui.addMessage(r().id, de);
      } catch (O) {
        console.error("Failed to increment counter:", O), u.ui.addToast({ type: "error", message: "Could not increment counter" });
      } finally {
        $(a, !1);
      }
    }
  }
  St(() => n(), () => {
    $(l, $r(n() || [], _));
  }), St(() => n(), () => {
    $(s, (n() || []).filter((O) => (O.content || "").startsWith(_)).slice(-5).reverse());
  }), ar(), Dr();
  var w = jr(), C = he(w), y = Le(he(C), 2), le = he(y), M = Le(y, 4), z = he(M), G = Le(C, 2), N = Le(he(G), 2);
  {
    var H = (O) => {
      var de = Lr();
      qe(O, de);
    }, Ge = (O) => {
      var de = qr();
      Mr(de, 5, () => m(s), (Xe) => Xe.id, (Xe, xe) => {
        var Et = Ur(), _n = he(Et);
        At(
          (pn) => et(_n, `${m(xe), pe(() => m(xe).author?.displayName || m(xe).author?.username || "Unknown user") ?? ""} incremented at ${pn ?? ""}`),
          [
            () => (m(xe), pe(() => new Date(m(xe).createdAt).toLocaleTimeString()))
          ]
        ), qe(Xe, Et);
      }), qe(O, de);
    };
    Ar(N, (O) => {
      m(s), pe(() => m(s).length === 0) ? O(H) : O(Ge, !1);
    });
  }
  At(() => {
    et(le, m(l)), M.disabled = m(a), et(z, m(a) ? "Sending..." : "Click to +1");
  }), mr("click", M, g), qe(e, w), Bn(), o();
}
export {
  Vr as default
};
//# sourceMappingURL=CounterChannelView-B1i5aV0i.js.map
