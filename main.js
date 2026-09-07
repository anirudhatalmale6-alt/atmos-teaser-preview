/* =============================================================
   Beta registry landing page — behaviour
   -------------------------------------------------------------
   EVERYTHING YOU NEED TO EDIT IS IN THE CONFIG BLOCK BELOW.
   Nothing under it needs touching for normal changes.
   ============================================================= */

var CONFIG = {

  /* -----------------------------------------------------------
     1. COUNTDOWN
     Set the real launch moment in ISO 8601 form.
     The "Z" means UTC — for a local time use an offset instead,
     e.g. "2026-10-15T18:00:00+01:00".
     Set to "" (empty string) to hide the countdown entirely.
     ----------------------------------------------------------- */
  launchISO: "2026-10-15T18:00:00Z",   // <-- PLACEHOLDER DATE

  /* -----------------------------------------------------------
     2. TRAILER
     provider : "youtube" | "vimeo" | "file"
     id       : YouTube video id  (youtu.be/XXXXXXXXXXX  -> XXXXXXXXXXX)
                Vimeo numeric id  (vimeo.com/123456789   -> 123456789)
                or, for "file", a path such as "teaser.mp4"
     Leave id as "" and the poster stays as a placeholder.
     ----------------------------------------------------------- */
  trailer: { provider: "youtube", id: "" },

  /* -----------------------------------------------------------
     3. MAILCHIMP
     postUrl: your list's form action, copied from Mailchimp
       (Audience -> Signup forms -> Embedded form -> the <form action="...">)
       It looks like:
       https://YOURACCOUNT.us21.list-manage.com/subscribe/post?u=abc123&id=def456
     Leave "" and the form stays inert (preview mode).
     Full step-by-step is in README.md.
     ----------------------------------------------------------- */
  mailchimp: { postUrl: "" },

  /* -----------------------------------------------------------
     4. MESSAGES shown after the form is submitted
     ----------------------------------------------------------- */
  msg: {
    success:  "You're on the registry. Watch your inbox — check spam once, just in case.",
    already:  "That address is already on the list. You're covered.",
    invalid:  "That doesn't look like an email address.",
    error:    "Something went wrong on our side. Try again in a moment.",
    preview:  "Preview mode — nothing was sent or stored. Add your Mailchimp URL in main.js to make this live.",
    sending:  "Filing…"
  }
};

/* =============================================================
   ↓↓↓ implementation — you shouldn't need to edit below here ↓↓↓
   ============================================================= */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };

  /* ---- progressive enhancement flag ---------------------- */
  document.documentElement.classList.remove("no-js");

  /* ---- footer year --------------------------------------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- sticky header shadow ------------------------------ */
  var head = $("#siteHead");
  var onScroll = function () {
    if (head) head.classList.toggle("is-stuck", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- reveal on scroll ---------------------------------- */
  var reveals = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
  }

  /* =========================================================
     COUNTDOWN
     ========================================================= */
  (function countdown() {
    var box  = $("#countdown");
    var note = $("#cdNote");
    if (!box) return;

    var target = CONFIG.launchISO ? new Date(CONFIG.launchISO) : null;

    // no date, or an unparseable one -> don't show a fake clock
    if (!target || isNaN(target.getTime())) {
      box.style.display = "none";
      if (note) note.textContent = "Countdown hidden — set CONFIG.launchISO in main.js to switch it on.";
      return;
    }

    var cells = { d: $("#cdD"), h: $("#cdH"), m: $("#cdM"), s: $("#cdS") };
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };

    var tick = function () {
      var left = target.getTime() - Date.now();

      // past the date: say so rather than sitting on 00 00 00 00
      if (left <= 0) {
        box.style.display = "none";
        if (note) note.textContent = "The countdown date has passed — update CONFIG.launchISO in main.js.";
        clearInterval(timer);
        return;
      }
      var s = Math.floor(left / 1000);
      cells.d.textContent = pad(Math.floor(s / 86400));
      cells.h.textContent = pad(Math.floor(s / 3600) % 24);
      cells.m.textContent = pad(Math.floor(s / 60) % 60);
      cells.s.textContent = pad(s % 60);
    };

    tick();
    var timer = setInterval(tick, 1000);
  })();

  /* =========================================================
     TRAILER — click to load, so nothing downloads until asked
     ========================================================= */
  (function trailer() {
    var btn = $("#playBtn");
    if (!btn) return;

    btn.addEventListener("click", function () {
      var t = CONFIG.trailer || {};
      if (!t.id) {
        var lbl = $(".player__label em", btn);
        if (lbl) lbl.textContent = "no video set yet — add it in main.js → CONFIG.trailer";
        return;
      }

      var node;
      if (t.provider === "file") {
        node = document.createElement("video");
        node.src = t.id;
        node.controls = true;
        node.autoplay = true;
        node.setAttribute("playsinline", "");
        node.style.width = "100%";
        node.style.borderRadius = "3px";
      } else {
        var src = t.provider === "vimeo"
          ? "https://player.vimeo.com/video/" + encodeURIComponent(t.id) + "?autoplay=1"
          : "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(t.id) + "?autoplay=1&rel=0";
        node = document.createElement("iframe");
        node.src = src;
        node.title = "Teaser trailer";
        node.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture";
        node.allowFullscreen = true;
      }
      btn.parentNode.replaceChild(node, btn);
    });
  })();

  /* =========================================================
     OPT-IN FORM
     ========================================================= */
  (function optin() {
    var form = $("#optin");
    if (!form) return;

    var field = $("#email");
    var btn   = $("#submitBtn");
    var msg   = $("#formMsg");
    var label = $(".btn__label", btn);
    var idle  = label ? label.textContent : "Request access";
    var busy  = false;

    var say = function (text, bad) {
      msg.textContent = text;
      msg.classList.toggle("is-bad", !!bad);
    };

    var looksLikeEmail = function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    };

    var done = function (text, bad, keepValue) {
      busy = false;
      if (label) label.textContent = idle;
      btn.disabled = false;
      say(text, bad);
      if (!bad && !keepValue) field.value = "";
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (busy) return;

      var value = (field.value || "").trim();
      field.classList.remove("is-bad");

      if (!looksLikeEmail(value)) {
        field.classList.add("is-bad");
        field.focus();
        say(CONFIG.msg.invalid, true);
        return;
      }

      // ---- preview mode: no URL configured, so send nothing ----
      if (!CONFIG.mailchimp.postUrl) {
        say(CONFIG.msg.preview, false);
        return;
      }

      busy = true;
      btn.disabled = true;
      if (label) label.textContent = CONFIG.msg.sending;
      say("");

      // ---- Mailchimp JSONP: subscribes without leaving the page ----
      var cb  = "mcb_" + Date.now();
      var url = CONFIG.mailchimp.postUrl
                  .replace("/post?", "/post-json?")
                  .replace("/post-json?", "/post-json?")
              + "&EMAIL=" + encodeURIComponent(value)
              + "&c=" + cb;

      var script = document.createElement("script");
      var cleanup = function () {
        try { delete window[cb]; } catch (err) { window[cb] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
      };

      var guard = setTimeout(function () { cleanup(); done(CONFIG.msg.error, true, true); }, 12000);

      window[cb] = function (res) {
        clearTimeout(guard);
        cleanup();
        if (res && res.result === "success") { done(CONFIG.msg.success, false); return; }
        var text = (res && res.msg) || "";
        if (/already subscribed/i.test(text)) { done(CONFIG.msg.already, false); return; }
        // Mailchimp prefixes its messages with "0 - "; strip that for readability
        done(text ? text.replace(/^\d+\s*-\s*/, "") : CONFIG.msg.error, true, true);
      };

      script.onerror = function () { clearTimeout(guard); cleanup(); done(CONFIG.msg.error, true, true); };
      script.src = url;
      document.body.appendChild(script);
    });

    field.addEventListener("input", function () {
      field.classList.remove("is-bad");
      if (msg.classList.contains("is-bad")) say("");
    });
  })();

})();
