/* ===== Shared text-based PDF engine (jsPDF) for A2Z generators =====
   Produces a clean, centered, selectable-text document — no image capture,
   so output is crisp and properly laid out regardless of the page state.    */
(function () {
  "use strict";

  function ready() { return !!(window.jspdf && window.jspdf.jsPDF); }

  function num(v) {
    if (v == null) return 0;
    var c = String(v).replace(/[^0-9.\-]/g, "");
    c = c.replace(/(?!^)-/g, "").replace(/(\..*)\./g, "$1");
    var n = parseFloat(c);
    return isNaN(n) ? 0 : n;
  }
  function money(v) {
    var n = num(v), neg = n < 0;
    n = Math.abs(Math.round(n));
    var s = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return (neg ? "-$" : "$") + s;
  }
  function txt(v, dash) { v = (v == null ? "" : String(v)).trim(); return v ? v : (dash || "—"); }

  var NAVY = [22, 35, 107], INK = [31, 39, 51], MUTE = [90, 100, 114], LINE = [214, 221, 234];

  function createDoc() {
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({ unit: "pt", format: "letter", compress: true });
    var PW = doc.internal.pageSize.getWidth();   // 612
    var PH = doc.internal.pageSize.getHeight();  // 792
    var M = 54, CW = PW - M * 2, y = M;

    function font(style, size, color) {
      doc.setFont("helvetica", style); doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
    }
    function ensure(h) { if (y + h > PH - M - 26) { doc.addPage(); y = M; } }

    var api = {
      title: function (t, sub) {
        font("bold", 18, NAVY); doc.text(String(t), PW / 2, y + 6, { align: "center" }); y += 26;
        if (sub) { font("normal", 9.5, MUTE);
          var l = doc.splitTextToSize(String(sub), CW - 40);
          doc.text(l, PW / 2, y, { align: "center", lineHeightFactor: 1.3 }); y += l.length * 11 + 2; }
        return api;
      },
      meta: function (t) {
        font("normal", 9, MUTE); doc.text(String(t), PW / 2, y + 2, { align: "center" }); y += 10;
        doc.setDrawColor(NAVY[0], NAVY[1], NAVY[2]); doc.setLineWidth(1.4); doc.line(M, y, PW - M, y); y += 16;
        return api;
      },
      section: function (t) {
        ensure(34); y += 8;
        font("bold", 11.5, NAVY); doc.text(String(t), M, y + 9); y += 13;
        doc.setDrawColor(LINE[0], LINE[1], LINE[2]); doc.setLineWidth(1); doc.line(M, y, PW - M, y); y += 12;
        return api;
      },
      field: function (label, value) {
        value = (value == null || value === "") ? "—" : String(value);
        var labelW = CW * 0.34, valW = CW * 0.62, valX = M + CW * 0.38;
        font("bold", 8.5, MUTE); var ll = doc.splitTextToSize(String(label).toUpperCase(), labelW);
        font("normal", 10.5, INK); var vl = doc.splitTextToSize(value, valW);
        var h = Math.max(ll.length, vl.length) * 13 + 6; ensure(h);
        font("bold", 8.5, MUTE); doc.text(ll, M, y + 9, { lineHeightFactor: 1.35 });
        font("normal", 10.5, INK); doc.text(vl, valX, y + 9, { lineHeightFactor: 1.3 });
        y += h; return api;
      },
      lineItem: function (label, value, opts) {
        opts = opts || {}; ensure(17);
        font(opts.bold ? "bold" : "normal", 10.5, opts.bold ? NAVY : INK);
        doc.text(String(label), M, y + 9);
        doc.text(String(value), PW - M, y + 9, { align: "right" });
        y += 4;
        doc.setDrawColor(opts.bold ? NAVY[0] : LINE[0], opts.bold ? NAVY[1] : LINE[1], opts.bold ? NAVY[2] : LINE[2]);
        doc.setLineWidth(opts.bold ? 1.1 : 0.6); doc.line(M, y, PW - M, y);
        y += 11; return api;
      },
      paragraph: function (label, text) {
        if (label) { ensure(15); font("bold", 8.5, MUTE); doc.text(String(label).toUpperCase(), M, y + 9); y += 14; }
        font("normal", 10.5, INK);
        var clean = (text != null && String(text).trim()) ? String(text) : "—";
        var lines = doc.splitTextToSize(clean, CW);
        for (var i = 0; i < lines.length; i++) { ensure(13); doc.text(lines[i], M, y + 9); y += 13; }
        y += 8; return api;
      },
      heading: function (t) {                 // sub-heading inside a section (used by bylaws articles)
        ensure(20); y += 4; font("bold", 10.5, NAVY); doc.text(String(t), M, y + 9); y += 16; return api;
      },
      spacer: function (h) { y += (h || 8); return api; },
      finalize: function (footerText) {
        var pages = doc.internal.getNumberOfPages();
        for (var p = 1; p <= pages; p++) {
          doc.setPage(p);
          doc.setDrawColor(LINE[0], LINE[1], LINE[2]); doc.setLineWidth(0.6); doc.line(M, PH - 32, PW - M, PH - 32);
          font("normal", 7.5, MUTE);
          if (footerText) doc.text(String(footerText), M, PH - 20, { maxWidth: CW - 70 });
          doc.text("Page " + p + " of " + pages, PW - M, PH - 20, { align: "right" });
        }
        return api;
      },
      save: function (fn) { doc.save(fn); return api; },
      blob: function () { return doc.output("blob"); },
      print: function () { doc.autoPrint(); var u = doc.output("bloburl"); window.open(u, "_blank"); return api; },
      raw: function () { return doc; }
    };
    return api;
  }

  window.PDFKit = { ready: ready, createDoc: createDoc, num: num, money: money, txt: txt };
})();
