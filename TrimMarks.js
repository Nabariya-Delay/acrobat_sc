/*
 * JapaneseTrimMarks.js - Adobe Acrobat Pro folder-level JavaScript
 * Version 2.4 / 2026-11-11
 *
 * Usage:
 *   1. Put this file in Acrobat's user JavaScripts folder.
 *   2. Restart Acrobat completely.
 *   3. Open a PDF and choose File > \u65e5\u672c\u5f0f\u30c8\u30f3\u30dc\u3092\u8ffd\u52a0...
 *   4. Alternatively, run JPM.run() in Acrobat's JS console.
 *
 * IMPORTANT:
 *   Standard mode edits the open PDF: work on a COPY of the original.
 *   Two-up mode creates a 450 x 317 mm PDF at actual size, with a 6 mm gutter.
 *   Rotated pages and non-standard UserUnit pages are deliberately rejected.
 *   If the PDF already has annotations, fields or links, created trim marks
 *   remain printable annotations rather than flattening those other objects.
 *   That case requires "Document and Markups" when printing.
 */

var JPM = {
    version: "2.4",
    pt: function (mm) { return mm * 72 / 25.4; },
    mm: function (pt) { return pt * 25.4 / 72; },

    parseMM: function (value) {
        var number = Number(String(value).replace(/\s/g, ""));
        return isFinite(number) && number > 0 ? number : NaN;
    },

    dialog: function (defaultTrimW, defaultTrimH) {
        var data = null;
        var presetSizes = {
            "Original PDF": [defaultTrimW, defaultTrimH],
            "A4 (210 x 297)": [210, 297],
            "A4 Landscape (297 x 210)": [297, 210],
            "A5 (148 x 210)": [148, 210],
            "A3 (297 x 420)": [297, 420],
            "B5 JIS (182 x 257)": [182, 257],
            "B4 JIS (257 x 364)": [257, 364],
            "Postcard (100 x 148)": [100, 148],
            "Business card (91 x 55)": [91, 55]
        };
        var descriptor = {
            initialize: function (dialog) {
                var a4 = presetSizes["A4 (210 x 297)"];
                dialog.load({
                    "paw1": "225", "pah1": "317",
                    "trw1": String(a4[0]),
                    "trh1": String(a4[1]),
                    "bld1": "3",
                    "rept": false,
                    "up2p": false,
                    "prst": {
                        "Original PDF": -1,
                        "A4 (210 x 297)": +2,
                        "A4 Landscape (297 x 210)": -3,
                        "A5 (148 x 210)": -4,
                        "A3 (297 x 420)": -5,
                        "B5 JIS (182 x 257)": -6,
                        "B4 JIS (257 x 364)": -7,
                        "Postcard (100 x 148)": -8,
                        "Business card (91 x 55)": -9,
                        "Custom (manual)": -10
                    }
                });
            },
            prst: function (dialog) {
                var selected = dialog.store().prst;
                if (!selected) return;
                for (var label in selected) {
                    if (selected[label] > 0 && presetSizes[label]) {
                        dialog.load({
                            "trw1": String(presetSizes[label][0]),
                            "trh1": String(presetSizes[label][1])
                        });
                        break;
                    }
                }
            },
            rept: function (dialog) {
                if (dialog.store().rept) dialog.load({"up2p": false});
            },
            up2p: function (dialog) {
                if (dialog.store().up2p) {
                    dialog.load({
                        "paw1": "450", "pah1": "317", "rept": false
                    });
                }
            },
            commit: function (dialog) { data = dialog.store(); },
            description: {
                name: "\u65e5\u672c\u5f0f\u30c8\u30f3\u30dc\u306e\u8a2d\u5b9a\uff08\u5358\u4f4d\uff1amm\uff09",
                align_children: "align_left",
                elements: [
                    {
                        type: "cluster", name: "\u7528\u7d19\u30b5\u30a4\u30ba\uff08MediaBox\uff09",
                        align_children: "align_left",
                        elements: [
                            { type: "view", align_children: "align_row", elements: [
                                { type: "static_text", name: "\u5e45", width: 95 },
                                { type: "edit_text", item_id: "paw1", width: 90, height: 22 }
                            ]},
                            { type: "view", align_children: "align_row", elements: [
                                { type: "static_text", name: "\u9ad8\u3055", width: 95 },
                                { type: "edit_text", item_id: "pah1", width: 90, height: 22 }
                            ]}
                        ]
                    },
                    {
                        type: "cluster", name: "\u4ed5\u4e0a\u304c\u308a\u30b5\u30a4\u30ba\uff08TrimBox\uff09",
                        align_children: "align_left",
                        elements: [
                            { type: "view", align_children: "align_row", elements: [
                                { type: "static_text", name: "\u5b9a\u578b\u30b5\u30a4\u30ba", width: 95 },
                                { type: "popup", item_id: "prst", width: 210 }
                            ]},
                            { type: "view", align_children: "align_row", elements: [
                                { type: "static_text", name: "\u5e45", width: 95 },
                                { type: "edit_text", item_id: "trw1", width: 90, height: 22 }
                            ]},
                            { type: "view", align_children: "align_row", elements: [
                                { type: "static_text", name: "\u9ad8\u3055", width: 95 },
                                { type: "edit_text", item_id: "trh1", width: 90, height: 22 }
                            ]}
                        ]
                    },
                    { type: "view", align_children: "align_row", elements: [
                        { type: "static_text", name: "\u30c8\u30f3\u30dc\u9593\u9694\uff083mm\uff09", width: 95 },
                        { type: "edit_text", item_id: "bld1", width: 90, height: 22 }
                    ]},
                    { type: "check_box", item_id: "rept",
                        name: "\u30ea\u30d4\u30fc\u30c8\uff1a\u5404\u30da\u30fc\u30b8\u3092\u3082\u3046\uff11\u679a\u8907\u88fd" },
                    { type: "static_text",
                        name: "\u203b \u30ea\u30d4\u30fc\u30c8\u6642\u306f\u540c\u3058PDF\u304c2\u30da\u30fc\u30b8\u9023\u7d9a\u3057\u307e\u3059\u3002",
                        char_width: 45 },
                    { type: "check_box", item_id: "up2p",
                        name: "450\u00d7317mm\u306e1\u30da\u30fc\u30b8\u306b\u539f\u5bf8\u30672\u9762\u4ed8\u3051\uff08\u30c9\u30d66mm\uff09" },
                    { type: "static_text",
                        name: "\u203b 2\u9762\u4ed8\u3051\u6642\u306e\u30c8\u30f3\u30dc\u9593\u9694\u306f3mm\u56fa\u5b9a\u3067\u3059\u3002",
                        char_width: 45 },
                    { type: "static_text", name: "\u65e2\u5b58\u306e\u539f\u7a3f\u306f\u62e1\u5927\u30fb\u7e2e\u5c0f\u3055\u308c\u307e\u305b\u3093\u3002", char_width: 38 },
                    { type: "ok_cancel", ok_name: "\u5b9f\u884c", cancel_name: "\u30ad\u30e3\u30f3\u30bb\u30eb" }
                ]
            }
        };
        if (app.execDialog(descriptor) !== "ok" || data === null) return null;
        return {
            paperW: this.parseMM(data.paw1),
            paperH: this.parseMM(data.pah1),
            trimW: this.parseMM(data.trw1),
            trimH: this.parseMM(data.trh1),
            bleed: this.parseMM(data.bld1),
            repeat: !!data.rept,
            twoUp: !!data.up2p
        };
    },

    addLine: function (doc, page, fromX, fromY, toX, toY, id, width) {
        return doc.addAnnot({
            type: "Line",
            page: page,
            name: "JPM_" + page + "_" + id,
            author: "JapaneseTrimMarks",
            contents: "Japanese trim mark",
            points: [[fromX, fromY], [toX, toY]],
            strokeColor: color.black,
            width: width || 0.25,
            opacity: 1,
            print: true
        });
    },

    drawMarks: function (doc, page, trim, paper, bleed, len, idBase) {
        var left = trim[0], top = trim[1], right = trim[2], bottom = trim[3];
        var x, y, sx, sy, i = idBase || 0;
        var base = idBase || 0;
        var self = this;

        // Each corner has two L shapes with a shared outside end.
        // Their elbows are at (trimX + sx * bleed, trimY) and
        // (trimX, trimY + sy * bleed), respectively.
        // Hence the ACTUAL trim X is the inward vertical mark, and the
        // second vertical mark sits 3mm OUTSIDE the finished page.
        // The original source page is not narrowed by the crop marks.
        for (sx = -1; sx <= 1; sx += 2) {
            x = (sx < 0) ? left : right;
            for (sy = -1; sy <= 1; sy += 2) {
                y = (sy < 0) ? bottom : top;

                // First L: x is OUTSIDE the trim boundary by bleed.
                self.addLine(doc, page,
                    x + sx * (bleed + len), y,
                    x + sx * bleed, y, i++);
                self.addLine(doc, page,
                    x + sx * bleed, y + sy * (bleed + len),
                    x + sx * bleed, y, i++);

                // Second L: x is the EXACT trim boundary. Its horizontal
                // counterpart is offset outward in Y by the bleed spacing.
                self.addLine(doc, page,
                    x + sx * (bleed + len), y + sy * bleed,
                    x, y + sy * bleed, i++);
                self.addLine(doc, page,
                    x, y + sy * (bleed + len),
                    x, y + sy * bleed, i++);
            }
        }

        // Center marks: keep BOTH strokes completely outside the 3mm
        // bleed zone. The nearest part is 0.5mm beyond that zone.
        // Limit the outer leg so it also stays within the paper.
        var cx = (left + right) / 2;
        var cy = (top + bottom) / 2;
        var longHalf = this.pt(6.5);
        var inside = this.pt(1);
        var offset = bleed + this.pt(1.5);
        var desiredOutside = this.pt(2.5);
        var edgeSafety = this.pt(0.25);
        var topOutside = Math.min(desiredOutside, paper[1] - top - offset - edgeSafety);
        var bottomOutside = Math.min(desiredOutside, bottom - paper[3] - offset - edgeSafety);
        var leftOutside = Math.min(desiredOutside, left - paper[0] - offset - edgeSafety);
        var rightOutside = Math.min(desiredOutside, paper[2] - right - offset - edgeSafety);

        this.addLine(doc, page, cx - longHalf, top + offset,
            cx + longHalf, top + offset, base + 16);
        this.addLine(doc, page, cx, top + offset - inside,
            cx, top + offset + topOutside, base + 17);
        this.addLine(doc, page, cx - longHalf, bottom - offset,
            cx + longHalf, bottom - offset, base + 18);
        this.addLine(doc, page, cx, bottom - offset + inside,
            cx, bottom - offset - bottomOutside, base + 19);
        this.addLine(doc, page, left - offset, cy - longHalf,
            left - offset, cy + longHalf, base + 20);
        this.addLine(doc, page, left - offset + inside, cy,
            left - offset - leftOutside, cy, base + 21);
        this.addLine(doc, page, right + offset, cy - longHalf,
            right + offset, cy + longHalf, base + 22);
        this.addLine(doc, page, right + offset - inside, cy,
            right + offset + rightOutside, cy, base + 23);
    },

    drawTwoUpMarks: function (doc, page, pw, ph, tw, th, bleed) {
        var cx = pw / 2, cy = ph / 2;
        var trimLeft = cx - bleed - tw;
        var trimRight = cx + bleed + tw;
        var reach = this.pt(12);
        var halfBar = this.pt(12.7);
        var barOffset = this.pt(3.5);
        var innerLeg = this.pt(2.1);
        var outerLeg = this.pt(6.35);
        var id = 0, self = this;
        function line(x1, y1, x2, y2) {
            self.addLine(doc, page, x1, y1, x2, y2, id++, 0.3);
        }

        // Draw the four outside corners and the two side center marks.
        for (var sx = -1; sx <= 1; sx += 2) {
            var edgeX = sx < 0 ? 0 : pw;
            var x = sx < 0 ? trimLeft : trimRight;
            var bx = x + sx * bleed;
            var endX = x + sx * Math.min(reach, Math.abs(edgeX - x));
            var sideOffset = Math.min(barOffset, Math.abs(edgeX - bx) / 2);
            var sideX = bx + sx * sideOffset;
            line(sideX, cy - halfBar, sideX, cy + halfBar);
            line(sideX - sx * Math.min(innerLeg, sideOffset * 0.6), cy,
                sideX + sx * Math.min(outerLeg, Math.abs(edgeX - sideX)), cy);
            for (var sy = -1; sy <= 1; sy += 2) {
                var edgeY = sy < 0 ? 0 : ph;
                var y = cy + sy * th / 2;
                var by = y + sy * bleed;
                var endY = y + sy * Math.min(reach, Math.abs(edgeY - y));
                line(endX, y, bx, y);
                line(bx, y, bx, endY);
                line(endX, by, x, by);
                line(x, by, x, endY);
            }
        }

        // One horizontal bar and three vertical strokes on each end.
        // The outer strokes are the two cuts; the middle is the bleed seam.
        for (var sy = -1; sy <= 1; sy += 2) {
            var edge = sy < 0 ? 0 : ph;
            var bleedY = cy + sy * (th / 2 + bleed);
            var offset = Math.min(barOffset, Math.abs(edge - bleedY) / 2);
            var barY = bleedY + sy * offset;
            var innerY = barY - sy * Math.min(innerLeg, offset * 0.6);
            var outerY = barY + sy * Math.min(outerLeg, Math.abs(edge - barY));
            line(cx - halfBar, barY, cx + halfBar, barY);
            line(cx - bleed, innerY, cx - bleed, outerY);
            line(cx, innerY, cx, outerY);
            line(cx + bleed, innerY, cx + bleed, outerY);
        }
    },

    runTwoUp: function (source, s) {
        var paperW = 450, paperH = 317;
        var bleedMM = 3, minimumMargin = bleedMM + 3;
        var gutterMM = 2 * bleedMM;
        if (!isFinite(s.paperW) || !isFinite(s.paperH) ||
            !isFinite(s.trimW) || !isFinite(s.trimH) || s.trimW <= 0 || s.trimH <= 0 ||
            Math.abs(s.paperW - paperW) > 0.01 || Math.abs(s.paperH - paperH) > 0.01 ||
            (paperW - 2 * s.trimW - gutterMM) / 2 < minimumMargin ||
            (paperH - s.trimH) / 2 < minimumMargin) {
            app.alert("2\u9762\u4ed8\u3051\u306f\u7528\u7d19450\u00d7317mm\u3001\u4e2d\u592e\u306e\u30c9\u30d66mm\u56fa\u5b9a\u3067\u3059\u3002\n\u4ed5\u4e0a\u304c\u308a\u304b\u3089\u7528\u7d19\u306e\u5916\u7e01\u307e\u3067\u3001\u4e0a\u4e0b\u5de6\u53f3\u306b\u54046mm\u4ee5\u4e0a\u306e\u4f59\u767d\u304c\u5fc5\u8981\u3067\u3059\u3002");
            return;
        }
        if (s.repeat) {
            app.alert("\u300c\u30da\u30fc\u30b8\u8907\u88fd\u300d\u3068\u300c1\u30da\u30fc\u30b82\u9762\u4ed8\u3051\u300d\u306f\u540c\u6642\u306b\u9078\u3079\u307e\u305b\u3093\u3002");
            return;
        }
        if (typeof source.path !== "string" || !/\.pdf$/i.test(source.path) ||
            source.dirty === true) {
            app.alert("2\u9762\u4ed8\u3051\u306e\u524d\u306b\u3001\u5143PDF\u3092\u4fdd\u5b58\u3057\u3066\u304f\u3060\u3055\u3044\u3002");
            return;
        }
        if (typeof this.composeTwoUpPages !== "function" ||
            typeof this.prepareTwoUp !== "function" || typeof this.chooseTwoUpOutput !== "function" ||
            typeof this.releaseTwoUpSource !== "function" || typeof this.saveTwoUpOutput !== "function") {
            app.alert("2\u9762\u4ed8\u3051\u6a5f\u80fd\u3092\u521d\u671f\u5316\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f\u3002\n" + (this.composeTwoUpError || ""));
            return;
        }

        var pw = this.pt(paperW), ph = this.pt(paperH);
        var tw = this.pt(s.trimW), th = this.pt(s.trimH), bp = this.pt(bleedMM);
        var tolerance = this.pt(0.5);
        var pages = [], normalizeSource = false, hasAnnotations = source.numFields > 0;
        for (var p = 0; p < source.numPages; p++) {
            if (source.getPageRotation(p) !== 0 ||
                (typeof source.getUserUnitSize === "function" &&
                 Math.abs(source.getUserUnitSize(p) - 1) > 0.0001)) {
                app.alert("\u30da\u30fc\u30b8 " + (p + 1) + " \u306f\u56de\u8ee2\u307e\u305f\u306f\u7279\u6b8a\u306aUserUnit\u3092\u4f7f\u3063\u3066\u3044\u307e\u3059\u3002");
                return;
            }
            var crop = source.getPageBox("Crop", p);
            var media = source.getPageBox("Media", p);
            var trim = source.getPageBox("Trim", p);
            var w = crop[2] - crop[0], h = crop[1] - crop[3];
            var isMarkedSheet = Math.abs(w - this.pt(225)) <= tolerance &&
                                Math.abs(h - this.pt(317)) <= tolerance;
            var trimMatches = Math.abs(trim[2] - trim[0] - tw) <= tolerance &&
                              Math.abs(trim[1] - trim[3] - th) <= tolerance;
            if (isMarkedSheet ? !trimMatches :
                (w < tw - tolerance || h < th - tolerance ||
                 w > tw + 2 * bp + tolerance || h > th + 2 * bp + tolerance)) {
                app.alert("\u30da\u30fc\u30b8 " + (p + 1) + " \u306e\u30b5\u30a4\u30ba\u307e\u305f\u306fTrimBox\u304c\u3001\u6307\u5b9a\u306e\u4ed5\u4e0a\u304c\u308a " +
                    s.trimW + "\u00d7" + s.trimH + "mm \u3068\u4e00\u81f4\u3057\u307e\u305b\u3093\u3002\n216\u00d7303mm\uff08\u5857\u308a\u8db3\u3057\u8fbc\u307f\uff09\u306e\u5834\u5408\u306f\u3001\u4ed5\u4e0a\u304c\u308a\u306bA4\uff08210\u00d7297mm\uff09\u3092\u9078\u3093\u3067\u304f\u3060\u3055\u3044\u3002");
                return;
            }

            // Center on the source TrimBox when supplied; otherwise use
            // the center of the artwork. Keep at most 3 mm of bleed per side.
            var trimCenter = trimMatches ? trim : crop;
            var cx = (trimCenter[0] + trimCenter[2]) / 2;
            var cy = (trimCenter[1] + trimCenter[3]) / 2;
            if (cx - tw / 2 < crop[0] - tolerance || cx + tw / 2 > crop[2] + tolerance ||
                cy - th / 2 < crop[3] - tolerance || cy + th / 2 > crop[1] + tolerance) {
                app.alert("\u30da\u30fc\u30b8 " + (p + 1) + " \u306e\u4ed5\u4e0a\u304c\u308a\u304c\u8868\u793a\u7bc4\u56f2\u304b\u3089\u306f\u307f\u51fa\u3057\u3066\u3044\u307e\u3059\u3002");
                return;
            }
            // The old 0.25 pt marks can straddle the bleed edge. Inset
            // the clip by half a stroke on previously marked sheets.
            var keepBleed = bp - (isMarkedSheet ? 0.13 : 0);
            var clip = [
                Math.max(crop[0], cx - tw / 2 - keepBleed),
                Math.min(crop[1], cy + th / 2 + keepBleed),
                Math.min(crop[2], cx + tw / 2 + keepBleed),
                Math.max(crop[3], cy - th / 2 - keepBleed)
            ];
            // Acrobat can use ArtBox or TrimBox as the watermark's
            // bounding box, even when CropBox already includes bleed.
            var boxes = [crop, media, trim, source.getPageBox("Art", p),
                source.getPageBox("Bleed", p)];
            for (var b = 0; b < boxes.length && !normalizeSource; b++) {
                for (var i = 0; i < 4; i++) {
                    if (Math.abs(clip[i] - boxes[b][i]) > 0.001) {
                        normalizeSource = true;
                        break;
                    }
                }
            }
            pages.push({
                clip: clip,
                dx: (clip[0] + clip[2]) / 2 - cx,
                dy: (clip[1] + clip[3]) / 2 - cy
            });
            var annots = source.getAnnots({nPage: p});
            if (annots && annots.length) hasAnnotations = true;
        }

        if (app.alert("450\u00d7317mm\u306e\u65b0\u898fPDF\u306b\u540c\u3058\u539f\u7a3f\u3092\u5de6\u53f3\u306b100%\u3067\u914d\u7f6e\u3057\u3001\u4e2d\u592e\u306e\u30c9\u30d6\u30926mm\u306b\u3057\u307e\u3059\u3002\n" +
            "\u5143PDF " + source.numPages + " \u30da\u30fc\u30b8 \u2192 \u51fa\u529bPDF " + source.numPages + " \u30da\u30fc\u30b8\uff08\u5404\u30da\u30fc\u30b82\u9762\uff09\u3002\n" +
            (hasAnnotations ? "\u203b \u6ce8\u91c8\u30fb\u30d5\u30a9\u30fc\u30e0\u306f\u8ee2\u5199\u3055\u308c\u307e\u305b\u3093\u3002\n" : "") +
            "\u7d9a\u884c\u3057\u307e\u3059\u304b\uff1f", 2, 2) !== 4) return;

        if (this.twoUpJob) {
            app.alert("2\u9762\u4ed8\u3051\u3092\u51e6\u7406\u4e2d\u3067\u3059\u3002\u5b8c\u4e86\u5f8c\u306b\u5b9f\u884c\u3057\u3066\u304f\u3060\u3055\u3044\u3002");
            return;
        }

        var importDoc = null;
        try {
            var destination = this.chooseTwoUpOutput(source.path);
            if (!destination) return;
            // Open the written copy as a new document. On macOS, the
            // watermark importer can reuse the old source page's bounds
            // if it runs before Acrobat has returned to its event loop.
            if (normalizeSource) importDoc = this.prepareTwoUp(source, pages);
            this.twoUpJob = {
                importDoc: importDoc,
                path: importDoc ? importDoc.path : source.path,
                destination: destination,
                pages: pages, pw: pw, ph: ph, tw: tw, th: th, bp: bp
            };
            this.twoUpTimer = app.setTimeOut("JPM.finishTwoUp()", 150);
        } catch (error) {
            this.twoUpJob = null;
            if (importDoc) this.releaseTwoUpSource(importDoc);
            this.reportTwoUpError(error);
        }
    },

    finishTwoUp: function () {
        var job = this.twoUpJob;
        if (!job) return;
        var out = null;
        try {
            out = this.composeTwoUpPages(job.path, job.pages, job.pw, job.ph, job.tw / 2 + job.bp);
            for (var p = 0; p < out.numPages; p++) {
                this.drawTwoUpMarks(out, p, job.pw, job.ph, job.tw, job.th, job.bp);
            }
            out.flattenPages();
            this.saveTwoUpOutput(out, job.destination);
        } catch (error) {
            this.reportTwoUpError(error);
        } finally {
            if (job.importDoc) this.releaseTwoUpSource(job.importDoc);
            this.twoUpJob = null;
            this.twoUpTimer = null;
        }
    },

    reportTwoUpError: function (error) {
        console.println("[JPM] 2-up ERROR: " + error);
        app.alert("2\u9762\u4ed8\u3051PDF\u306e\u51e6\u7406\u306b\u5931\u6557\u3057\u307e\u3057\u305f\u3002\n" + error);
    },

    run: function (doc) {
        if (!doc || typeof doc.getPageBox !== "function") {
            var openDocs = app.activeDocs;
            doc = (openDocs && openDocs.length) ? openDocs[0] : null;
        }
        if (!doc) {
            app.alert("\u5148\u306bAcrobat Pro\u3067PDF\u3092\u958b\u3044\u3066\u304f\u3060\u3055\u3044\u3002");
            return;
        }

        try {
            var firstCrop = doc.getPageBox("Crop", 0);
            var defaultBox = firstCrop;
            var firstCropW = firstCrop[2] - firstCrop[0];
            var firstCropH = firstCrop[1] - firstCrop[3];
            if (Math.abs(this.mm(firstCropW) - 225) < 0.5 &&
                Math.abs(this.mm(firstCropH) - 317) < 0.5) {
                // If this is a 225 x 317 marked sheet, suggest its actual
                // finished size rather than treating the sheet as the trim.
                var candidateTrim = doc.getPageBox("Trim", 0);
                if (candidateTrim[2] - candidateTrim[0] < firstCropW - this.pt(2) &&
                    candidateTrim[1] - candidateTrim[3] < firstCropH - this.pt(2)) {
                    defaultBox = candidateTrim;
                }
            }
            var settings = this.dialog(
                Math.round(this.mm(defaultBox[2] - defaultBox[0]) * 100) / 100,
                Math.round(this.mm(defaultBox[1] - defaultBox[3]) * 100) / 100
            );
            if (!settings) return;

            var s = settings, bleed = s.bleed, lenMM = 3;
            if (s.twoUp) {
                this.runTwoUp(doc, s);
                return;
            }
            var sides = [(s.paperW - s.trimW) / 2, (s.paperH - s.trimH) / 2];
            if (!isFinite(s.paperW) || !isFinite(s.paperH) ||
                !isFinite(s.trimW) || !isFinite(s.trimH) || !isFinite(bleed) ||
                sides[0] < bleed + lenMM || sides[1] < bleed + lenMM) {
                app.alert("\u6570\u5024\u3092\u78ba\u8a8d\u3057\u3066\u304f\u3060\u3055\u3044\u3002\u7528\u7d19\u306e\u5e45\u30fb\u9ad8\u3055\u306f\u3001\u4ed5\u4e0a\u304c\u308a\uff0b\u5de6\u53f3\uff08\u4e0a\u4e0b\uff09\u5404 " +
                    (bleed + lenMM) + "mm \u4ee5\u4e0a\u5fc5\u8981\u3067\u3059\u3002");
                return;
            }

            var p, current, oldMarkups = false;
            for (p = 0; p < doc.numPages; p++) {
                if (doc.getPageRotation(p) !== 0 ||
                    (typeof doc.getUserUnitSize === "function" &&
                     Math.abs(doc.getUserUnitSize(p) - 1) > 0.0001)) {
                    app.alert("\u30da\u30fc\u30b8 " + (p + 1) +
                        " \u306f\u56de\u8ee2\u307e\u305f\u306f\u7279\u6b8a\u306aUserUnit\u3092\u4f7f\u7528\u3057\u3066\u3044\u307e\u3059\u3002\u5b89\u5168\u306e\u305f\u3081\u4e2d\u6b62\u3057\u307e\u3059\u3002");
                    return;
                }
                current = doc.getPageBox("Crop", p);
                if (current[2] - current[0] > this.pt(s.paperW) + 0.01 ||
                    current[1] - current[3] > this.pt(s.paperH) + 0.01) {
                    app.alert("\u30da\u30fc\u30b8 " + (p + 1) +
                        " \u306f\u6307\u5b9a\u3057\u305f\u7528\u7d19\u3088\u308a\u5927\u304d\u3044\u305f\u3081\u4e2d\u6b62\u3057\u307e\u3057\u305f\u3002\u539f\u7a3f\u306f\u81ea\u52d5\u7e2e\u5c0f\u3055\u308c\u307e\u305b\u3093\u3002");
                    return;
                }
                var existing = doc.getAnnots({nPage: p});
                if (existing && existing.length) oldMarkups = true;
                var existingLinks = doc.getLinks(p, current);
                if (existingLinks && existingLinks.length) oldMarkups = true;
                if (existing) {
                    for (var n = 0; n < existing.length; n++) {
                        if (existing[n].name && existing[n].name.indexOf("JPM_") === 0) {
                            app.alert("\u3059\u3067\u306b\u65e5\u672c\u5f0f\u30c8\u30f3\u30dc\u304c\u3042\u308b\u30da\u30fc\u30b8\u304c\u3042\u308a\u307e\u3059\u3002\u91cd\u8907\u3092\u9632\u3050\u305f\u3081\u4e2d\u6b62\u3057\u307e\u3059\u3002");
                            return;
                        }
                    }
                }
            }
            if (doc.numFields > 0) oldMarkups = true;

            if (s.repeat) {
                if (typeof doc.path !== "string" || !/\.pdf$/i.test(doc.path) ||
                    doc.dirty === true) {
                    app.alert("\u30ea\u30d4\u30fc\u30c8\u3092\u4f7f\u3046\u5834\u5408\u306f\u3001\u5148\u306bPDF\u3092\u4fdd\u5b58\u3057\u3066\u304b\u3089\u5b9f\u884c\u3057\u3066\u304f\u3060\u3055\u3044\u3002");
                    return;
                }
                if (typeof JPM.duplicateSavedPage !== "function") {
                    app.alert("\u30da\u30fc\u30b8\u8907\u88fd\u6a5f\u80fd\u3092\u521d\u671f\u5316\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f\u3002\n" +
                        (JPM.duplicateError || ""));
                    return;
                }
            }

            if (app.alert(
                "\u5168 " + doc.numPages + " \u30da\u30fc\u30b8\u306b\u65e5\u672c\u5f0f\u30c8\u30f3\u30dc\u3092\u8ffd\u52a0\u3057\u307e\u3059\u3002\n" +
                "\u7528\u7d19 " + s.paperW + "\u00d7" + s.paperH + "mm / \u4ed5\u4e0a\u304c\u308a " +
                s.trimW + "\u00d7" + s.trimH + "mm\n" +
                (s.repeat ? "\u30ea\u30d4\u30fc\u30c8\uff1a\u5404\u30da\u30fc\u30b8\u3092\u8907\u88fd\u3057\u3001\u5408\u8a08 " + (doc.numPages * 2) + " \u30da\u30fc\u30b8\u306b\u3057\u307e\u3059\u3002\n" : "") +
                "\u65e2\u5b58\u306e\u5185\u5bb9\u306f\u62e1\u5927\u30fb\u7e2e\u5c0f\u3057\u307e\u305b\u3093\u3002\u30b3\u30d4\u30fc\u3057\u305fPDF\u3067\u5b9f\u884c\u3057\u3066\u304f\u3060\u3055\u3044\u3002\u7d9a\u884c\u3057\u307e\u3059\u304b\uff1f",
                2, 2) !== 4) return;

            if (s.repeat) {
                var sourcePath = doc.path;
                var sourceCount = doc.numPages;
                // Work backwards so each inserted copy follows its original.
                // Copy BEFORE adding crop marks; both pages then receive
                // identical boxes/marks in the normal processing loop.
                for (p = sourceCount - 1; p >= 0; p--) {
                    try {
                        JPM.duplicateSavedPage(doc, sourcePath, p);
                    } catch (copyError) {
                        app.alert("\u30ea\u30d4\u30fc\u30c8\u306e\u8907\u88fd\u306b\u5931\u6557\u3057\u307e\u3057\u305f\u3002\n" +
                            copyError + "\n\u4e00\u90e8\u306e\u30da\u30fc\u30b8\u304c\u5897\u3048\u3066\u3044\u308b\u5834\u5408\u306f\u3001\u4fdd\u5b58\u305b\u305a\u306bPDF\u3092\u9589\u3058\u3066\u304f\u3060\u3055\u3044\u3002");
                        return;
                    }
                }
            }

            var pw = this.pt(s.paperW), ph = this.pt(s.paperH);
            var tw = this.pt(s.trimW), th = this.pt(s.trimH);
            var bp = this.pt(bleed);
            var markLength = this.pt(lenMM);
            for (p = 0; p < doc.numPages; p++) {
                current = doc.getPageBox("Crop", p);
                var cx = (current[0] + current[2]) / 2;
                var cy = (current[1] + current[3]) / 2;
                var paper = [cx - pw / 2, cy + ph / 2, cx + pw / 2, cy - ph / 2];
                var trim = [cx - tw / 2, cy + th / 2, cx + tw / 2, cy - th / 2];
                var bleedBox = [trim[0] - bp, trim[1] + bp, trim[2] + bp, trim[3] - bp];
                doc.setPageBoxes({cBox: "Media", nStart: p, nEnd: p, rBox: paper});
                doc.setPageBoxes({cBox: "Crop", nStart: p, nEnd: p, rBox: paper});
                doc.setPageBoxes({cBox: "Trim", nStart: p, nEnd: p, rBox: trim});
                doc.setPageBoxes({cBox: "Bleed", nStart: p, nEnd: p, rBox: bleedBox});
                this.drawMarks(doc, p, trim, paper, bp, markLength);
            }

            if (!oldMarkups) {
                // Flattening puts the marks into real PDF page content so
                // normal "document only" printing includes them.
                doc.flattenPages();
                app.alert("\u30c8\u30f3\u30dc\u3092\u8ffd\u52a0\u3057\u3001\u30da\u30fc\u30b8\u5185\u5bb9\u306b\u7d71\u5408\u3057\u307e\u3057\u305f\u3002\u5225\u540d\u3067\u4fdd\u5b58\u3057\u3066\u304f\u3060\u3055\u3044\u3002");
            } else {
                // Flattening would also destroy existing links/comments/fields.
                app.alert("\u30c8\u30f3\u30dc\u3092\u8ffd\u52a0\u3057\u307e\u3057\u305f\u3002\u65e2\u5b58\u306e\u30ea\u30f3\u30af\u30fb\u30d5\u30a9\u30fc\u30e0\u30fb\u6ce8\u91c8\u3092\u4fdd\u8b77\u3059\u308b\u305f\u3081\u3001" +
                    "\u30c8\u30f3\u30dc\u306f\u6ce8\u91c8\u306e\u307e\u307e\u3067\u3059\u3002\u5370\u5237\u6642\u306f\u300e\u6587\u66f8\u3068\u6ce8\u91c8\u300f\u3092\u9078\u3093\u3067\u304f\u3060\u3055\u3044\u3002\u5225\u540d\u3067\u4fdd\u5b58\u3057\u3066\u304f\u3060\u3055\u3044\u3002");
            }
        } catch (e) {
            console.println("[JPM] ERROR: " + e);
            app.alert("\u65e5\u672c\u5f0f\u30c8\u30f3\u30dc\u306e\u51e6\u7406\u4e2d\u306b\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f\u3002\n" + e +
                "\n\u5909\u66f4\u304c\u4e00\u90e8\u9069\u7528\u3055\u308c\u3066\u3044\u308b\u5834\u5408\u304c\u3042\u308a\u307e\u3059\u3002\u5143\u30d5\u30a1\u30a4\u30eb\u3092\u4e0a\u66f8\u304d\u3057\u306a\u3044\u3067\u304f\u3060\u3055\u3044\u3002");
        }
    }
};

// File-based insertion requires a privileged context. This trusted wrapper
// must be initialized when Acrobat first loads the folder-level script.
JPM.duplicateSavedPage = null;
JPM.duplicateError = "";
try {
    JPM.duplicateSavedPage = app.trustedFunction(function (doc, path, page) {
        app.beginPriv();
        try {
            doc.insertPages({nPage: page, cPath: path, nStart: page, nEnd: page});
        } finally {
            app.endPriv();
        }
    });
} catch (jpmCopyError) {
    JPM.duplicateError = String(jpmCopyError);
}

// Two-up uses an explicitly named output and a separate import document.
JPM.twoUpJob = null;
JPM.twoUpTimer = null;
JPM.chooseTwoUpOutput = null;
JPM.prepareTwoUp = null;
JPM.releaseTwoUpSource = null;
JPM.composeTwoUpPages = null;
JPM.saveTwoUpOutput = null;
JPM.composeTwoUpError = "";
try {
    JPM.chooseTwoUpOutput = app.trustedFunction(function (sourcePath) {
        app.beginPriv();
        try {
            var file = sourcePath.slice(sourcePath.lastIndexOf("/") + 1);
            var choice = app.browseForDoc({
                bSave: true, cFilenameInit: file.replace(/\.pdf$/i, "") + "_2up.pdf"
            });
            if (!choice) return null;
            var path = choice.cPath;
            if (!/\.pdf$/i.test(path)) path += ".pdf";
            if (path.toLowerCase() === sourcePath.toLowerCase()) {
                throw new Error("\u5143PDF\u3068\u7570\u306a\u308b\u540d\u524d\u3067\u4fdd\u5b58\u3057\u3066\u304f\u3060\u3055\u3044\u3002");
            }
            return path;
        } finally {
            app.endPriv();
        }
    });

    JPM.prepareTwoUp = app.trustedFunction(function (source, pages) {
        app.beginPriv();
        var copy = null;
        try {
            var token = new Date().getTime() + "-" + Math.random().toString(36).slice(2);
            var path = app.getPath("user", "temp").replace(/\/$/, "") +
                "/JPM-two-up-" + token + ".pdf";
            copy = source.extractPages();
            // Remove the original finish/artwork boxes so the importer
            // has only the bleed-inclusive CropBox to fall back to.
            copy.setPageBoxes({cBox: "Art"});
            copy.setPageBoxes({cBox: "Trim"});
            copy.setPageBoxes({cBox: "Bleed"});
            for (var p = 0; p < pages.length; p++) {
                copy.setPageBoxes({cBox: "Crop", nStart: p, nEnd: p, rBox: pages[p].clip});
                var clip = copy.getPageBox("Crop", p);
                copy.setPageBoxes({cBox: "Media", nStart: p, nEnd: p, rBox: clip});
            }
            // Save a separate file, then open that file through Acrobat.
            // bCopy keeps the extracted document at its original path.
            copy.saveAs({cPath: path, bCopy: true, bPromptToOverwrite: true});
            copy.closeDoc(true);
            copy = null;
            var imported = app.openDoc({cPath: path, bHidden: true});
            if (!imported) throw new Error("\u5857\u308a\u8db3\u3057\u3092\u542b\u3080\u4f5c\u696d\u7528PDF\u3092\u958b\u3051\u307e\u305b\u3093\u3067\u3057\u305f\u3002");
            return imported;
        } finally {
            try {
                if (copy) copy.closeDoc(true);
            } finally {
                app.endPriv();
            }
        }
    });

    JPM.releaseTwoUpSource = app.trustedFunction(function (doc) {
        app.beginPriv();
        try {
            var path = doc.path;
            doc.closeDoc(true);
            // Clear the artwork from the temporary file when Acrobat
            // has released its file handle.
            var blank = app.newDoc(72, 72);
            try {
                blank.saveAs({cPath: path, bCopy: true, bPromptToOverwrite: false});
            } finally {
                blank.closeDoc(true);
            }
        } catch (error) {
            console.println("[JPM] Could not clear temporary PDF: " + error);
        } finally {
            app.endPriv();
        }
    });

    JPM.composeTwoUpPages = app.trustedFunction(function (path, pages, pw, ph, offset) {
        app.beginPriv();
        var out = null;
        try {
            out = app.newDoc(pw, ph);
            var sheet = [0, ph, pw, 0];
            for (var page = 0; page < pages.length; page++) {
                if (page > 0) out.newPage(page, pw, ph);
                out.setPageBoxes({cBox: "Media", nStart: page, nEnd: page, rBox: sheet});
                out.setPageBoxes({cBox: "Crop", nStart: page, nEnd: page, rBox: sheet});
                for (var side = -1; side <= 1; side += 2) {
                    out.addWatermarkFromFile({
                        cDIPath: path,
                        nSourcePage: page,
                        nStart: page,
                        nEnd: page,
                        nHorizAlign: app.constants.align.center,
                        nVertAlign: app.constants.align.center,
                        nHorizValue: side * offset + pages[page].dx,
                        nVertValue: pages[page].dy,
                        bPercentage: false,
                        nScale: 1,
                        nRotation: 0,
                        nOpacity: 1,
                        bOnTop: true,
                        bOnScreen: true,
                        bOnPrint: true
                    });
                }
            }
            return out;
        } catch (error) {
            if (out) out.closeDoc(true);
            throw error;
        } finally {
            app.endPriv();
        }
    });

    JPM.saveTwoUpOutput = app.trustedFunction(function (doc, path) {
        app.beginPriv();
        try {
            doc.saveAs({cPath: path, bPromptToOverwrite: true});
        } finally {
            app.endPriv();
        }
    });
} catch (jpmTwoUpInitError) {
    JPM.composeTwoUpError = String(jpmTwoUpInitError);
}

// Registration runs once, when Acrobat starts and loads folder-level scripts.
JPM.menuLocation = "not registered";
JPM.menuError = "";
var JPM_menuItem = {
    cName: "JPM_AddJapaneseTrimMarks",
    cUser: "\u65e5\u672c\u5f0f\u30c8\u30f3\u30dc\u3092\u8ffd\u52a0...",
    cParent: "File",
    cExec: "JPM.run(event.target);",
    nPos: 0
};
try {
    app.addMenuItem(JPM_menuItem);
    JPM.menuLocation = "File";
} catch (jpmFileError) {
    JPM.menuError = "File: " + jpmFileError;
    try {
        JPM_menuItem.cParent = "Edit";
        app.addMenuItem(JPM_menuItem);
        JPM.menuLocation = "Edit";
    } catch (jpmEditError) {
        JPM.menuError += " / Edit: " + jpmEditError;
    }
}
console.println("[JPM] v" + JPM.version + ", menu=" + JPM.menuLocation +
                (JPM.menuError ? ", note=" + JPM.menuError : ""));
