// photo-replacer.js
(function() {
    'use strict';

    // فقط در صفحهٔ گزارش توصیفی اجرا شود
    if (!document.querySelector('.reportTosifiSearch.print-panel')) return;

    function init() {
        var header = document.querySelector('.card-main header');
        if (!header) return;

        // مخفی‌سازی کامل ورودی
        var hiddenInput = document.createElement('input');
        hiddenInput.type = 'text';
        hiddenInput.setAttribute('autocomplete', 'off');
        hiddenInput.style.cssText = [
            'position: absolute; top: 0; left: 0;',
            'width: 1px; height: 1px;',
            'opacity: 0; border: none; outline: none;',
            'z-index: -1;'
        ].join('');
        header.style.position = 'relative';
        header.appendChild(hiddenInput);

        // کلیک روی هدر → فوکوس ورودی نامرئی
        header.addEventListener('click', function(e) {
            hiddenInput.focus();
        });

        // رویداد تایپ
        hiddenInput.addEventListener('input', function() {
            if (hiddenInput.value === '8991') {
                hiddenInput.value = '';
                openFolderSelector();
            }
        });
    }

    function openFolderSelector() {
        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.webkitdirectory = true;
        fileInput.multiple = true;
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);

        fileInput.addEventListener('change', function() {
            handleFiles(fileInput.files);
            document.body.removeChild(fileInput);
        });

        fileInput.click();
    }

    function handleFiles(files) {
        // نگاشت نام بدون پسوند → فایل تصویر
        var imageMap = {};
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (file.type.startsWith('image/')) {
                var name = file.name.replace(/\.[^/.]+$/, ''); // حذف پسوند
                imageMap[name] = file;
            }
        }

        // جایگزینی عکس‌ها در کارت‌های دانش‌آموزان
        var cards = document.querySelectorAll('[ng-repeat="rowItem in dataItems"]');
        cards.forEach(function(card) {
            var nationalCode = getNationalCode(card);
            if (nationalCode && imageMap[nationalCode]) {
                var img = card.querySelector('div.pt-2 img.border.rounded');
                if (img) {
                    img.src = URL.createObjectURL(imageMap[nationalCode]);
                }
            }
        });
    }

    function getNationalCode(card) {
        // پیدا کردن سلول با متن "کد ملی:" و گرفتن سلول کناری
        var cells = card.querySelectorAll('td');
        for (var i = 0; i < cells.length; i++) {
            if (cells[i].textContent.trim() === 'کد ملی:') {
                var next = cells[i].nextElementSibling;
                if (next && next.classList.contains('btext')) {
                    return next.textContent.trim();
                }
            }
        }
        return null;
    }

    // راه‌اندازی
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
