// section-reportTosifi.js
(function() {
    'use strict';

    /* ---------- متغیرهای داخلی ---------- */
    var lastTop = 0, lastBottom = 0, lastRight = 0, lastWidth = 1090;
    var zoomLevel = 100;                 // درصد zoom
    var colWidths = [10, 25, 20, 10, 20, 15]; // پیش‌فرض (جمع = 100)

    /* ---------- مقداردهی اولیه ---------- */
    function initStoredValues() {
        var cards = document.querySelectorAll('[ng-repeat="rowItem in dataItems"]');
        if (cards.length > 0) {
            var firstCard = cards[0];
            lastRight = parseInt(window.getComputedStyle(firstCard).marginRight) || 0;
            lastWidth = parseInt(window.getComputedStyle(firstCard).width) || 1090;
            lastTop = parseInt(window.getComputedStyle(firstCard).marginTop) || 0;
        }
        initColumnWidths();
        updateDisplays();
    }

    function initColumnWidths() {
        var cards = document.querySelectorAll('[ng-repeat="rowItem in dataItems"]');
        if (cards.length === 0) return;
        // اولین جدول دارای thead با ۶ ستون
        var table = cards[0].querySelector('table.table-bordered:has(thead tr th:nth-child(6))');
        if (!table) return;
        var ths = table.querySelectorAll('thead tr th');
        if (ths.length !== 6) return;
        var totalWidth = table.offsetWidth;
        var widths = [];
        for (var i = 0; i < 6; i++) {
            var w = ths[i].offsetWidth;
            widths.push(Math.round((w / totalWidth) * 100));
        }
        // تنظیم مجدد برای جمع ۱۰۰
        var sum = widths.reduce(function(a, b) { return a + b; }, 0);
        if (sum !== 100) {
            // توزیع خطا در آخرین ستون
            var diff = 100 - sum;
            widths[5] += diff;
        }
        colWidths = widths;
    }

    function updateDisplays() {
        var dt = document.getElementById('reportTosifi-topHeightDisp');
        if (dt) dt.textContent = lastTop;
        var db = document.getElementById('reportTosifi-bottomHeightDisp');
        if (db) db.textContent = lastBottom;
        var dr = document.getElementById('reportTosifi-rightHeightDisp');
        if (dr) dr.textContent = lastRight;
        var dw = document.getElementById('reportTosifi-widthDisp');
        if (dw) dw.textContent = lastWidth;
        // به‌روزرسانی نمایشگر zoom
        var dz = document.getElementById('reportTosifi-zoomDisp');
        if (dz) dz.textContent = zoomLevel + '%';
    }

    /* ---------- مدیریت حاشیه‌ها (بالا margin-top) ---------- */
    function ensureBottomSpacersExist() {
        if (document.querySelector('.reportTosifi-spacer-bottom')) return;
        var cards = document.querySelectorAll('[ng-repeat="rowItem in dataItems"]');
        cards.forEach(function(card) {
            var bottomSpacer = document.createElement('div');
            bottomSpacer.className = 'reportTosifi-spacer reportTosifi-spacer-bottom';
            bottomSpacer.style.height = '0px';
            card.parentNode.insertBefore(bottomSpacer, card.nextSibling);
        });
    }

    function adjustTopMargin(amount) {
        var blocks = document.querySelectorAll('[ng-repeat="rowItem in dataItems"]');
        var newVal = 0;
        blocks.forEach(function(block) {
            var cur = parseInt(window.getComputedStyle(block).marginTop) || 0;
            newVal = Math.max(0, cur + amount);
            block.style.setProperty('margin-top', newVal + 'px', 'important');
        });
        lastTop = newVal;
        var display = document.getElementById('reportTosifi-topHeightDisp');
        if (display) display.textContent = newVal;
    }

    function adjustBottomSpacing(amount) {
        ensureBottomSpacersExist();
        var spacers = document.querySelectorAll('.reportTosifi-spacer-bottom');
        var newHeight = 0;
        spacers.forEach(function(spacer) {
            var cur = parseInt(spacer.style.height) || 0;
            newHeight = Math.max(0, cur + amount);
            spacer.style.height = newHeight + 'px';
        });
        if (spacers.length > 0) {
            lastBottom = newHeight;
            var display = document.getElementById('reportTosifi-bottomHeightDisp');
            if (display) display.textContent = newHeight;
        }
    }

    function adjustRightMargin(amount) {
        var blocks = document.querySelectorAll('[ng-repeat="rowItem in dataItems"]');
        var newVal = 0;
        blocks.forEach(function(block) {
            var cur = parseInt(window.getComputedStyle(block).marginRight) || 0;
            newVal = cur + amount;
            block.style.setProperty('margin-right', newVal + 'px', 'important');
        });
        lastRight = newVal;
        var display = document.getElementById('reportTosifi-rightHeightDisp');
        if (display) display.textContent = newVal;
    }

    function adjustWidth(amount) {
        var blocks = document.querySelectorAll('[ng-repeat="rowItem in dataItems"]');
        var newVal = lastWidth;
        blocks.forEach(function(block) {
            var cur = parseInt(window.getComputedStyle(block).width) || lastWidth;
            newVal = cur + amount;
            if (newVal < 500) newVal = 500;
            if (newVal > 2000) newVal = 2000;
            block.style.setProperty('width', newVal + 'px', 'important');
            block.style.setProperty('max-width', newVal + 'px', 'important');
        });
        lastWidth = newVal;
        var display = document.getElementById('reportTosifi-widthDisp');
        if (display) display.textContent = newVal;
    }

    function applyStored() {
        var cards = document.querySelectorAll('[ng-repeat="rowItem in dataItems"]');
        cards.forEach(function(card) {
            card.style.setProperty('margin-top', lastTop + 'px', 'important');
            card.style.setProperty('margin-right', lastRight + 'px', 'important');
            card.style.setProperty('width', lastWidth + 'px', 'important');
            card.style.setProperty('max-width', lastWidth + 'px', 'important');
        });
        ensureBottomSpacersExist();
        document.querySelectorAll('.reportTosifi-spacer-bottom').forEach(function(s) {
            s.style.height = lastBottom + 'px';
        });
        applyZoom();
        applyColumnWidths();
        updateDisplays();
    }

    /* ---------- بزرگ‌نمایی (Zoom) ---------- */
    function applyZoom() {
        var cards = document.querySelectorAll('[ng-repeat="rowItem in dataItems"]');
        var zoomValue = zoomLevel / 100;
        cards.forEach(function(card) {
            card.style.zoom = zoomValue;   // خاصیت zoom مرورگر
        });
    }

    /* ---------- پهنای ستون‌ها ---------- */
    function applyColumnWidths() {
        var cards = document.querySelectorAll('[ng-repeat="rowItem in dataItems"]');
        cards.forEach(function(card) {
            var table = card.querySelector('table.table-bordered:has(thead tr th:nth-child(6))');
            if (!table) return;
            // ایجاد یا به‌روزرسانی colgroup
            var colgroup = table.querySelector('colgroup.custom-colgroup');
            if (!colgroup) {
                colgroup = document.createElement('colgroup');
                colgroup.className = 'custom-colgroup';
                for (var i = 0; i < 6; i++) {
                    var col = document.createElement('col');
                    colgroup.appendChild(col);
                }
                table.insertBefore(colgroup, table.firstChild);
            }
            var cols = colgroup.querySelectorAll('col');
            for (var j = 0; j < 6; j++) {
                cols[j].style.width = colWidths[j] + '%';
            }
            // اطمینان از fixed layout
            table.style.tableLayout = 'fixed';
            table.style.width = '100%';
        });
    }

    function getColumnWidths() {
        return colWidths.slice(); // کپی
    }

    function setColumnWidth(index, value) {
        if (index < 0 || index > 5) return;
        var newVal = Math.max(1, Math.min(90, parseInt(value) || 1)); // حداقل 1%
        colWidths[index] = newVal;
        applyColumnWidths();
        // به‌روزرسانی نمایشگر جمع در پنل
        var totalEl = document.getElementById('reportTosifi-colTotal');
        if (totalEl) {
            var sum = colWidths.reduce(function(a,b){return a+b;},0);
            totalEl.textContent = sum + '%';
            totalEl.style.color = sum === 100 ? '#2b8a3e' : '#c92a2a';
        }
    }

    /* ---------- ثبت در رجیستری ---------- */
    function emptyFontHandler() {}

    initStoredValues();

    window.registerSection('reportTosifi', {
        spacing: {
            increaseTop: function(d) { adjustTopMargin(1); },
            decreaseTop: function(d) { adjustTopMargin(-1); },
            increaseTopCoarse: function(d) { adjustTopMargin(5); },
            decreaseTopCoarse: function(d) { adjustTopMargin(-5); },
            increaseBottom: function(d) { adjustBottomSpacing(1); },
            decreaseBottom: function(d) { adjustBottomSpacing(-1); },
            increaseBottomCoarse: function(d) { adjustBottomSpacing(5); },
            decreaseBottomCoarse: function(d) { adjustBottomSpacing(-5); },
            increaseRight: function(d) { adjustRightMargin(1); },
            decreaseRight: function(d) { adjustRightMargin(-1); },
            increaseRightCoarse: function(d) { adjustRightMargin(5); },
            decreaseRightCoarse: function(d) { adjustRightMargin(-5); },
            increaseWidth: function(d) { adjustWidth(1); },
            decreaseWidth: function(d) { adjustWidth(-1); },
            increaseWidthCoarse: function(d) { adjustWidth(5); },
            decreaseWidthCoarse: function(d) { adjustWidth(-5); },
            applyStored: applyStored
        },
        fonts: { /* خالی */ },
        zoom: {
            get: function() { return zoomLevel; },
            set: function(val) {
                zoomLevel = Math.max(50, Math.min(150, val));
                applyZoom();
                updateDisplays();
            },
            apply: applyZoom
        },
        column: {
            getWidths: getColumnWidths,
            setWidth: setColumnWidth,
            apply: applyColumnWidths,
            getSum: function() { return colWidths.reduce(function(a,b){return a+b;},0); }
        }
    });
})();
