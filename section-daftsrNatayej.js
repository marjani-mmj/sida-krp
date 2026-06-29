// section-daftsrNatayej.js
(function() {
    'use strict';

    var lastTop = 0, lastBottom = 0, lastRight = 0, lastWidth = 1060;

    function initStoredValues() {
        var cards = document.querySelectorAll('.ng-scope[ng-repeat="rowItem in model.ksarnamehs"]');
        if (cards.length > 0) {
            lastRight = parseInt(window.getComputedStyle(cards[0]).marginRight) || 0;
            lastWidth = parseInt(window.getComputedStyle(cards[0]).width) || 1060;
        }
        updateDisplays();
    }

    function updateDisplays() {
        var dt = document.getElementById('topHeightDisp'); if (dt) dt.textContent = lastTop;
        var db = document.getElementById('bottomHeightDisp'); if (db) db.textContent = lastBottom;
        var dr = document.getElementById('rightHeightDisp'); if (dr) dr.textContent = lastRight;
        var dw = document.getElementById('widthDisp'); if (dw) dw.textContent = lastWidth;
    }

    function ensureSpacersExist() {
        if (document.querySelector('.custom-spacer-top')) return;
        var allCards = document.querySelectorAll('.container > .ng-scope[ng-repeat="rowItem in model.ksarnamehs"]');
        var evenCards = Array.from(allCards).filter(function(card, index) { return index % 2 === 0; });
        evenCards.forEach(function(card) {
            var topSpacer = document.createElement('div'); topSpacer.className = 'custom-spacer custom-spacer-top'; topSpacer.style.height = '0px';
            card.parentNode.insertBefore(topSpacer, card);
            var bottomSpacer = document.createElement('div'); bottomSpacer.className = 'custom-spacer custom-spacer-bottom'; bottomSpacer.style.height = '0px';
            card.parentNode.insertBefore(bottomSpacer, card.nextSibling);
        });
    }

    function adjustSpacing(selector, amount, display) {
        var spacers = document.querySelectorAll(selector);
        var newHeight = 0;
        spacers.forEach(function(spacer) {
            var cur = parseInt(spacer.style.height) || 0;
            newHeight = Math.max(0, cur + amount);
            spacer.style.height = newHeight + 'px';
        });
        if (spacers.length > 0) {
            if (selector === '.custom-spacer-top') lastTop = newHeight;
            else if (selector === '.custom-spacer-bottom') lastBottom = newHeight;
            if (display) display.textContent = newHeight;
        }
    }

    function adjustRightMargin(amount) {
        var blocks = document.querySelectorAll('.ng-scope[ng-repeat="rowItem in model.ksarnamehs"]');
        var newVal = 0;
        blocks.forEach(function(block) {
            var cur = parseInt(window.getComputedStyle(block).marginRight) || 0;
            newVal = cur + amount;
            block.style.setProperty('margin-right', newVal + 'px', 'important');
        });
        lastRight = newVal;
        var display = document.getElementById('rightHeightDisp');
        if (display) display.textContent = newVal;
    }

    // تنظیم پهنا (width) و بازنشانی max-width
    function adjustWidth(amount) {
        var blocks = document.querySelectorAll('.ng-scope[ng-repeat="rowItem in model.ksarnamehs"]');
        var newVal = lastWidth;
        blocks.forEach(function(block) {
            var cur = parseInt(window.getComputedStyle(block).width) || lastWidth;
            newVal = cur + amount;
            // محدوده مجاز: حداقل 500px و حداکثر 2000px
            if (newVal < 500) newVal = 500;
            if (newVal > 2000) newVal = 2000;
            block.style.setProperty('width', newVal + 'px', 'important');
            // بازنشانی max-width برای جلوگیری از توقف افزایش
            block.style.setProperty('max-width', newVal + 'px', 'important');
        });
        lastWidth = newVal;
        var display = document.getElementById('widthDisp');
        if (display) display.textContent = newVal;
    }

    function applyStored() {
        ensureSpacersExist();
        document.querySelectorAll('.custom-spacer-top').forEach(function(s) { s.style.height = lastTop + 'px'; });
        document.querySelectorAll('.custom-spacer-bottom').forEach(function(s) { s.style.height = lastBottom + 'px'; });
        document.querySelectorAll('.ng-scope[ng-repeat="rowItem in model.ksarnamehs"]').forEach(function(card) {
            card.style.setProperty('margin-right', lastRight + 'px', 'important');
            card.style.setProperty('width', lastWidth + 'px', 'important');
            card.style.setProperty('max-width', lastWidth + 'px', 'important');
        });
        updateDisplays();
    }

    function emptyFontHandler() {}

    initStoredValues();

    window.registerSection('daftsrNatayej', {
        spacing: {
            // بالا
            increaseTop: function(d) { ensureSpacersExist(); adjustSpacing('.custom-spacer-top', 1, d.topHeight); },
            decreaseTop: function(d) { ensureSpacersExist(); adjustSpacing('.custom-spacer-top', -1, d.topHeight); },
            increaseTopCoarse: function(d) { ensureSpacersExist(); adjustSpacing('.custom-spacer-top', 5, d.topHeight); },
            decreaseTopCoarse: function(d) { ensureSpacersExist(); adjustSpacing('.custom-spacer-top', -5, d.topHeight); },
            // پایین
            increaseBottom: function(d) { ensureSpacersExist(); adjustSpacing('.custom-spacer-bottom', 1, d.bottomHeight); },
            decreaseBottom: function(d) { ensureSpacersExist(); adjustSpacing('.custom-spacer-bottom', -1, d.bottomHeight); },
            increaseBottomCoarse: function(d) { ensureSpacersExist(); adjustSpacing('.custom-spacer-bottom', 5, d.bottomHeight); },
            decreaseBottomCoarse: function(d) { ensureSpacersExist(); adjustSpacing('.custom-spacer-bottom', -5, d.bottomHeight); },
            // راست
            increaseRight: function(d) { adjustRightMargin(1); },
            decreaseRight: function(d) { adjustRightMargin(-1); },
            increaseRightCoarse: function(d) { adjustRightMargin(5); },
            decreaseRightCoarse: function(d) { adjustRightMargin(-5); },
            // پهنا (با بازنشانی max-width)
            increaseWidth: function(d) { adjustWidth(1); },
            decreaseWidth: function(d) { adjustWidth(-1); },
            increaseWidthCoarse: function(d) { adjustWidth(5); },
            decreaseWidthCoarse: function(d) { adjustWidth(-5); },

            applyStored: applyStored
        },
        fonts: {
            increaseFontSizeTopMarklabel: emptyFontHandler,
            decreaseFontSizeTopMarklabel: emptyFontHandler,
            increaseFontSizeTopInfomark: emptyFontHandler,
            decreaseFontSizeTopInfomark: emptyFontHandler,
            increaseFontSizeMiddle: emptyFontHandler,
            decreaseFontSizeMiddle: emptyFontHandler,
            increaseFontSizeBottomMarklabel: emptyFontHandler,
            decreaseFontSizeBottomMarklabel: emptyFontHandler,
            increaseFontSizeBottomInfomark: emptyFontHandler,
            decreaseFontSizeBottomInfomark: emptyFontHandler
        }
    });
})();
