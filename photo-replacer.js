// photo-replacer.js
(function() {
    'use strict';

    // فقط در صفحهٔ گزارش توصیفی فعال می‌شود
    if (!document.querySelector('.reportTosifiSearch.print-panel')) return;

    /* ---------- استایل‌های کمینه و زیبا ---------- */
    function injectStyles() {
        if (document.getElementById('photo-replacer-styles')) return;
        var style = document.createElement('style');
        style.id = 'photo-replacer-styles';
        style.textContent = `
            .pr-floating-btn {
                position: fixed; bottom: 140px; right: 30px; z-index: 9999999;
                background: white; border-radius: 50px; box-shadow: 0 8px 20px rgba(0,0,0,0.3);
                padding: 12px 22px; font-family: Tahoma, sans-serif; font-size: 14px;
                font-weight: bold; color: #333; cursor: pointer;
                display: flex; align-items: center; gap: 8px;
                transition: transform 0.2s, background 0.2s;
                user-select: none; border: none;
            }
            .pr-floating-btn:hover { transform: scale(1.03); background: #f0f0f0; }
            .pr-floating-btn:active { transform: scale(0.97); }
            .pr-status {
                position: fixed; bottom: 200px; right: 30px; z-index: 9999999;
                background: rgba(255,255,255,0.95); border-radius: 8px;
                padding: 10px 15px; font-family: Tahoma, sans-serif; font-size: 13px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                color: #333; transition: opacity 0.3s;
            }
        `;
        document.head.appendChild(style);
    }

    /* ---------- خواندن فایل به Data URL ---------- */
    function readFileAsDataURL(file) {
        return new Promise(function(resolve, reject) {
            var reader = new FileReader();
            reader.onload = function() { resolve(reader.result); };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /* ---------- استخراج کد ملی از کارت ---------- */
    function getNationalCode(card) {
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

    /* ---------- رابط کاربری جدید ---------- */
    function initUI() {
        injectStyles();

        // دکمهٔ اصلی
        var btn = document.createElement('button');
        btn.className = 'pr-floating-btn';
        btn.innerHTML = '📁 انتخاب پوشه عکس‌ها';
        btn.style.display = 'none';
        document.body.appendChild(btn);

        // وضعیت
        var statusDiv = document.createElement('div');
        statusDiv.className = 'pr-status';
        statusDiv.style.display = 'none';
        document.body.appendChild(statusDiv);

        var selectedFiles = [];
        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.webkitdirectory = true;
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);

        // نمایش / مخفی‌سازی دکمه با کد 8991
        function showButton() {
            btn.style.display = 'flex';
            statusDiv.style.display = 'none';
            selectedFiles = [];
            btn.innerHTML = '📁 انتخاب پوشه عکس‌ها';
            btn.disabled = false;
        }

        function hideButton() {
            btn.style.display = 'none';
            statusDiv.style.display = 'none';
        }

        // کلیک روی دکمه ← باز کردن انتخاب پوشه
        btn.addEventListener('click', function() {
            if (selectedFiles.length === 0) {
                fileInput.click();
            } else {
                // شروع جایگزینی
                applyImages();
            }
        });

        // بعد از انتخاب پوشه
        fileInput.addEventListener('change', function() {
            if (fileInput.files.length === 0) {
                // کاربر لغو کرد
                btn.innerHTML = '📁 انتخاب پوشه عکس‌ها';
                statusDiv.style.display = 'none';
                return;
            }
            selectedFiles = Array.from(fileInput.files).filter(f => f.type.startsWith('image/'));
            var count = selectedFiles.length;
            btn.innerHTML = '✅ اعمال عکس‌ها (' + count + ' عکس)';
            btn.disabled = false;
            statusDiv.textContent = count + ' عکس انتخاب شد.';
            statusDiv.style.display = 'block';
        });

        async function applyImages() {
            btn.disabled = true;
            statusDiv.textContent = 'در حال جایگزینی...';
            // نوار پیشرفت کوچک
            var progressBar = document.createElement('div');
            progressBar.style.cssText = 'height:4px;background:#e9ecef;border-radius:2px;margin-top:6px;width:100%';
            var progressFill = document.createElement('div');
            progressFill.style.cssText = 'height:100%;background:#51cf66;width:0%;transition:width 0.3s;border-radius:2px';
            progressBar.appendChild(progressFill);
            statusDiv.appendChild(progressBar);

            // نگاشت کد ملی -> فایل
            var imageMap = {};
            for (var i = 0; i < selectedFiles.length; i++) {
                var nameWithoutExt = selectedFiles[i].name.replace(/\.[^/.]+$/, '');
                imageMap[nameWithoutExt] = selectedFiles[i];
            }

            var cards = document.querySelectorAll('[ng-repeat="rowItem in dataItems"]');
            var total = cards.length;
            var done = 0;
            var replacedCount = 0;

            for (var j = 0; j < total; j++) {
                var card = cards[j];
                var nationalCode = getNationalCode(card);
                if (nationalCode && imageMap[nationalCode]) {
                    var img = card.querySelector('div.pt-2 img.border.rounded');
                    if (img) {
                        try {
                            var dataUrl = await readFileAsDataURL(imageMap[nationalCode]);
                            img.src = dataUrl;
                            replacedCount++;
                        } catch (e) {
                            // بی‌صدا از خطا عبور کن
                        }
                    }
                }
                done++;
                var percent = Math.round((done / total) * 100);
                progressFill.style.width = percent + '%';
                await new Promise(function(r) { setTimeout(r, 10); });
            }

            statusDiv.textContent = '✅ ' + replacedCount + ' عکس جایگزین شد.';
            btn.innerHTML = '📁 انتخاب پوشه عکس‌ها';
            btn.disabled = false;
            selectedFiles = [];
            // حذف نوار پیشرفت بعد از 2.5 ثانیه
            setTimeout(function() {
                statusDiv.style.display = 'none';
            }, 2500);
        }

        // کلید فوری: 8991
        function setupKeyDetection() {
            var target = document.getElementById('reportTosifi-editor-panel');
            if (!target) return;
            var hiddenInput = document.createElement('input');
            hiddenInput.type = 'text';
            hiddenInput.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;opacity:0;border:none;z-index:-1';
            target.style.position = 'relative';
            target.appendChild(hiddenInput);

            target.addEventListener('click', function(e) {
                if (!e.target.closest('button') && !e.target.closest('span') && !e.target.closest('input')) {
                    hiddenInput.focus();
                }
            });

            hiddenInput.addEventListener('input', function() {
                if (hiddenInput.value === '8991') {
                    hiddenInput.value = '';
                    showButton();
                }
            });
        }

        // صبر برای ساخته شدن پنل گزارش
        var checkPanel = setInterval(function() {
            if (document.getElementById('reportTosifi-editor-panel')) {
                clearInterval(checkPanel);
                setupKeyDetection();
            }
        }, 200);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initUI();
    } else {
        document.addEventListener('DOMContentLoaded', initUI);
    }
})();
