// panel-reportTosifi.js (حذف اطلاعات آموزش و پرورش از فوتر)
(function() {
    'use strict';
    console.log('panel-reportTosifi.js اجرا شد');

    function waitForHandlers(callback) {
        if (window.handlersRegistry && window.handlersRegistry['reportTosifi']) {
            callback();
        } else {
            console.log('منتظر ثبت handlers...');
            var check = setInterval(function() {
                if (window.handlersRegistry && window.handlersRegistry['reportTosifi']) {
                    clearInterval(check);
                    callback();
                }
            }, 200);
        }
    }

    function init() {
        var panel = null;
        var toggleIcon = null;
        var isPanelVisible = false;
        var dragState = { dragging: false, startX: 0, startY: 0, startLeft: 0, startTop: 0 };
        var colSectionVisible = false;
        var marginSectionVisible = true;

        function showPanel() {
            if (!panel || !document.body.contains(panel)) {
                if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
                createPanel();
            }
            panel.style.left = 'auto';
            panel.style.right = '20px';
            panel.style.top = '100px';
            if (window.minimizeMainPanel) window.minimizeMainPanel();
            isPanelVisible = true;
            panel.style.display = 'block';
            if (toggleIcon) toggleIcon.innerHTML = '🔧';
        }

        function hidePanel() {
            if (!panel) return;
            isPanelVisible = false;
            panel.style.display = 'none';
            if (toggleIcon) toggleIcon.innerHTML = '📊';
        }

        window.minimizeReportPanel = hidePanel;

        function createFloatingIcon() {
            if (toggleIcon) return;
            toggleIcon = document.createElement('div');
            toggleIcon.id = 'reportTosifi-floating-toggle';
            toggleIcon.innerHTML = '📊';
            toggleIcon.title = 'تنظیمات گزارش پیشرفت تحصیلی';
            toggleIcon.style.cssText = 'position:fixed;bottom:20px;right:80px;z-index:9999999;width:48px;height:48px;background:linear-gradient(135deg,#84fab0,#8fd3f4);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;cursor:pointer;box-shadow:0 6px 12px rgba(0,0,0,0.4);user-select:none;transition:transform 0.2s;';
            toggleIcon.addEventListener('mouseenter', function() { this.style.transform = 'scale(1.1)'; });
            toggleIcon.addEventListener('mouseleave', function() { this.style.transform = 'scale(1)'; });
            toggleIcon.addEventListener('click', function() {
                if (isPanelVisible) {
                    hidePanel();
                } else {
                    showPanel();
                }
            });
            document.body.appendChild(toggleIcon);
            console.log('دکمهٔ شناور گزارش ساخته شد');
        }

        function createPanel() {
            if (panel && panel.parentNode) {
                panel.parentNode.removeChild(panel);
                panel = null;
            }
            panel = document.createElement('div');
            panel.id = 'reportTosifi-editor-panel';
            panel.style.cssText = 'position:fixed;top:100px;right:20px;z-index:999999;background:#fff;border:1px solid #ddd;border-radius:8px;box-shadow:0 8px 20px rgba(0,0,0,0.2);padding:12px;width:320px;max-height:calc(100vh - 140px);overflow-y:auto;font-family:Tahoma,sans-serif;font-size:13px;display:none;user-select:none;';

            var titleBar = document.createElement('div');
            titleBar.style.cssText = 'cursor:move;background:#f8f9fa;padding:6px 30px 6px 10px;margin:-12px -12px 10px -12px;border-radius:8px 8px 0 0;font-weight:bold;color:#333;border-bottom:1px solid #dee2e6;position:relative;';
            titleBar.textContent = 'تنظیمات گزارش';
            titleBar.addEventListener('mousedown', startDrag);
            var closeBtn = document.createElement('span');
            closeBtn.innerHTML = '&times;';
            closeBtn.style.cssText = 'position:absolute;top:4px;left:8px;font-size:18px;font-weight:bold;color:#888;cursor:pointer;line-height:1;';
            closeBtn.title = 'بستن پنل';
            closeBtn.addEventListener('click', function(e) { e.stopPropagation(); hidePanel(); });
            titleBar.appendChild(closeBtn);
            panel.appendChild(titleBar);

            // بخش یکپارچهٔ حاشیه‌ها + Zoom
            var marginToggleBtn = document.createElement('button');
            marginToggleBtn.style.cssText = 'width:100%;padding:5px;background:#e9ecef;border:1px solid #ced4da;border-radius:4px;cursor:pointer;font-weight:bold;color:#333;margin-bottom:6px;text-align:right;';
            marginToggleBtn.innerHTML = 'تنظیمات حاشیه‌ها و Zoom <span style="float:left;">▼</span>';
            var marginContent = document.createElement('div');
            marginContent.style.cssText = 'margin-bottom:8px;';

            function addDirectionRow(label, incFineId, decFineId, dispId, incCoarseId, decCoarseId) {
                var container = document.createElement('div');
                container.style.cssText = 'margin-bottom:6px;';
                var row = document.createElement('div');
                row.style.cssText = 'display:flex;align-items:center;';

                var lbl = document.createElement('span');
                lbl.textContent = label;
                lbl.style.cssText = 'width:45px;text-align:right;margin-left:5px;font-weight:bold;color:#495057;';
                row.appendChild(lbl);

                var decCoarse = document.createElement('button');
                decCoarse.id = decCoarseId;
                decCoarse.textContent = '−۵';
                decCoarse.style.cssText = 'width:32px;height:28px;font-size:13px;font-weight:bold;line-height:1;margin:0 1px;background:#ffc9c9;border:1px solid #ff8787;border-radius:4px;cursor:pointer;color:#c92a2a;';
                row.appendChild(decCoarse);
                var decFine = document.createElement('button');
                decFine.id = decFineId;
                decFine.textContent = '−';
                decFine.style.cssText = 'width:28px;height:28px;font-size:16px;font-weight:bold;line-height:1;margin:0 2px;background:#e9ecef;border:1px solid #ced4da;border-radius:4px;cursor:pointer;color:#495057;';
                row.appendChild(decFine);
                var disp = document.createElement('div');
                disp.id = dispId;
                disp.style.cssText = 'width:36px;text-align:center;font-weight:bold;font-size:14px;color:#0050ef;';
                disp.textContent = '0';
                row.appendChild(disp);
                var incFine = document.createElement('button');
                incFine.id = incFineId;
                incFine.textContent = '+';
                incFine.style.cssText = 'width:28px;height:28px;font-size:16px;font-weight:bold;line-height:1;margin:0 2px;background:#e9ecef;border:1px solid #ced4da;border-radius:4px;cursor:pointer;color:#495057;';
                row.appendChild(incFine);
                var incCoarse = document.createElement('button');
                incCoarse.id = incCoarseId;
                incCoarse.textContent = '+۵';
                incCoarse.style.cssText = 'width:32px;height:28px;font-size:13px;font-weight:bold;line-height:1;margin:0 1px;background:#b2f2bb;border:1px solid #51cf66;border-radius:4px;cursor:pointer;color:#2b8a3e;';
                row.appendChild(incCoarse);
                container.appendChild(row);
                marginContent.appendChild(container);
            }

            addDirectionRow('بالا', 'reportTosifi-increaseTopBtn', 'reportTosifi-decreaseTopBtn', 'reportTosifi-topHeightDisp', 'reportTosifi-increaseTopCoarseBtn', 'reportTosifi-decreaseTopCoarseBtn');
            addDirectionRow('پایین', 'reportTosifi-increaseBottomBtn', 'reportTosifi-decreaseBottomBtn', 'reportTosifi-bottomHeightDisp', 'reportTosifi-increaseBottomCoarseBtn', 'reportTosifi-decreaseBottomCoarseBtn');
            addDirectionRow('راست', 'reportTosifi-increaseRightBtn', 'reportTosifi-decreaseRightBtn', 'reportTosifi-rightHeightDisp', 'reportTosifi-increaseRightCoarseBtn', 'reportTosifi-decreaseRightCoarseBtn');
            addDirectionRow('پهنا', 'reportTosifi-increaseWidthBtn', 'reportTosifi-decreaseWidthBtn', 'reportTosifi-widthDisp', 'reportTosifi-increaseWidthCoarseBtn', 'reportTosifi-decreaseWidthCoarseBtn');

            // ردیف Zoom
            var zoomRow = document.createElement('div');
            zoomRow.style.cssText = 'display:flex;align-items:center;margin-top:6px;';
            var zoomLabel = document.createElement('span');
            zoomLabel.textContent = 'Zoom';
            zoomLabel.style.cssText = 'width:45px;text-align:right;margin-left:5px;font-weight:bold;color:#495057;';
            zoomRow.appendChild(zoomLabel);
            var decZoomCoarse = document.createElement('button');
            decZoomCoarse.id = 'reportTosifi-decreaseZoomCoarseBtn';
            decZoomCoarse.textContent = '−۵';
            decZoomCoarse.style.cssText = 'width:32px;height:28px;font-size:13px;font-weight:bold;line-height:1;margin:0 1px;background:#ffc9c9;border:1px solid #ff8787;border-radius:4px;cursor:pointer;color:#c92a2a;';
            zoomRow.appendChild(decZoomCoarse);
            var decZoom = document.createElement('button');
            decZoom.id = 'reportTosifi-decreaseZoomBtn';
            decZoom.textContent = '−';
            decZoom.style.cssText = 'width:28px;height:28px;font-size:16px;font-weight:bold;line-height:1;margin:0 2px;background:#e9ecef;border:1px solid #ced4da;border-radius:4px;cursor:pointer;color:#495057;';
            zoomRow.appendChild(decZoom);
            var zoomDisp = document.createElement('div');
            zoomDisp.id = 'reportTosifi-zoomDisp';
            zoomDisp.textContent = '100%';
            zoomDisp.style.cssText = 'width:42px;text-align:center;font-weight:bold;font-size:14px;color:#0050ef;';
            zoomRow.appendChild(zoomDisp);
            var incZoom = document.createElement('button');
            incZoom.id = 'reportTosifi-increaseZoomBtn';
            incZoom.textContent = '+';
            incZoom.style.cssText = 'width:28px;height:28px;font-size:16px;font-weight:bold;line-height:1;margin:0 2px;background:#e9ecef;border:1px solid #ced4da;border-radius:4px;cursor:pointer;color:#495057;';
            zoomRow.appendChild(incZoom);
            var incZoomCoarse = document.createElement('button');
            incZoomCoarse.id = 'reportTosifi-increaseZoomCoarseBtn';
            incZoomCoarse.textContent = '+۵';
            incZoomCoarse.style.cssText = 'width:32px;height:28px;font-size:13px;font-weight:bold;line-height:1;margin:0 1px;background:#b2f2bb;border:1px solid #51cf66;border-radius:4px;cursor:pointer;color:#2b8a3e;';
            zoomRow.appendChild(incZoomCoarse);
            marginContent.appendChild(zoomRow);

            marginToggleBtn.addEventListener('click', function() {
                marginSectionVisible = !marginSectionVisible;
                marginContent.style.display = marginSectionVisible ? 'block' : 'none';
                var arrow = marginToggleBtn.querySelector('span');
                arrow.textContent = marginSectionVisible ? '▼' : '▶';
            });
            panel.appendChild(marginToggleBtn);
            panel.appendChild(marginContent);

            // دکمه اعمال
            var applyBtn = document.createElement('button');
            applyBtn.id = 'reportTosifi-applySpacingBtn';
            applyBtn.textContent = 'اعمال فاصله‌ها';
            applyBtn.style.cssText = 'margin-top:8px;width:100%;padding:6px;background:#0050ef;color:white;border:none;border-radius:6px;font-weight:bold;cursor:pointer;transition:background 0.2s;';
            panel.appendChild(applyBtn);

            // بخش ستون‌ها
            var colToggleDiv = document.createElement('div');
            colToggleDiv.style.cssText = 'margin-top:10px;';
            var colToggleBtn = document.createElement('button');
            colToggleBtn.textContent = 'تنظیمات ستون‌ها ▶';
            colToggleBtn.style.cssText = 'width:100%;padding:5px;background:#e9ecef;border:1px solid #ced4da;border-radius:4px;cursor:pointer;font-weight:bold;color:#333;';
            colToggleDiv.appendChild(colToggleBtn);
            var colContent = document.createElement('div');
            colContent.id = 'reportTosifi-colContent';
            colContent.style.cssText = 'display:none;background:#f8f9fa;border:1px solid #dee2e6;border-radius:4px;padding:8px;margin-top:6px;';
            var colHeader = document.createElement('div');
            colHeader.style.cssText = 'display:flex;justify-content:space-between;margin-bottom:4px;font-weight:bold;color:#495057;';
            colHeader.innerHTML = '<span>ستون</span><span>٪</span>';
            colContent.appendChild(colHeader);
            var colLabels = ['ستون ۱', 'ستون ۲', 'ستون ۳', 'ستون ۴', 'ستون ۵', 'ستون ۶'];
            var colInputs = [];
            var colDisplays = [];
            for (var i = 0; i < 6; i++) {
                var row = document.createElement('div');
                row.style.cssText = 'display:flex;align-items:center;margin-bottom:4px;';
                var lbl = document.createElement('span');
                lbl.textContent = colLabels[i];
                lbl.style.cssText = 'width:50px;font-size:12px;color:#333;';
                row.appendChild(lbl);
                var input = document.createElement('input');
                input.type = 'range';
                input.min = '1';
                input.max = '90';
                input.value = '10';
                input.style.cssText = 'flex:1;margin:0 5px;';
                colInputs.push(input);
                row.appendChild(input);
                var disp = document.createElement('span');
                disp.textContent = '10%';
                disp.style.cssText = 'width:30px;text-align:center;font-size:12px;color:#0050ef;';
                colDisplays.push(disp);
                row.appendChild(disp);
                colContent.appendChild(row);
            }
            var totalRow = document.createElement('div');
            totalRow.style.cssText = 'margin-top:6px;font-weight:bold;text-align:center;';
            var totalLabel = document.createElement('span');
            totalLabel.textContent = 'جمع: ';
            var totalValue = document.createElement('span');
            totalValue.id = 'reportTosifi-colTotal';
            totalValue.textContent = '100%';
            totalValue.style.color = '#2b8a3e';
            totalRow.appendChild(totalLabel);
            totalRow.appendChild(totalValue);
            colContent.appendChild(totalRow);
            colToggleDiv.appendChild(colContent);
            panel.appendChild(colToggleDiv);

            // لینک کهکشان سافت (بدون متن آموزش و پرورش)
            var siteLink = document.createElement('div');
            siteLink.style.cssText = 'margin-top:12px;text-align:center;';
            var link = document.createElement('a');
            link.href = 'http://kahkeshansoft.ir/';
            link.target = '_blank';
            link.textContent = 'kahkeshansoft.ir';
            link.style.cssText = 'color:#0050ef;text-decoration:none;font-size:12px;font-weight:bold;';
            link.addEventListener('mouseenter', function() { this.style.textDecoration = 'underline'; });
            link.addEventListener('mouseleave', function() { this.style.textDecoration = 'none'; });
            siteLink.appendChild(link);
            panel.appendChild(siteLink);

            document.body.appendChild(panel);
            console.log('پنل گزارش ساخته شد');

            colToggleBtn.addEventListener('click', function() {
                colSectionVisible = !colSectionVisible;
                colContent.style.display = colSectionVisible ? 'block' : 'none';
                colToggleBtn.textContent = 'تنظیمات ستون‌ها ' + (colSectionVisible ? '▼' : '▶');
            });

            attachEventListeners(colInputs, colDisplays, totalValue);
        }

        function startDrag(e) {
            e.preventDefault();
            var rect = panel.getBoundingClientRect();
            panel.style.right = 'auto';
            panel.style.left = rect.left + 'px';
            dragState.dragging = true;
            dragState.startX = e.clientX;
            dragState.startY = e.clientY;
            dragState.startLeft = panel.offsetLeft;
            dragState.startTop = panel.offsetTop;
            window.addEventListener('mousemove', onDrag);
            window.addEventListener('mouseup', stopDrag);
        }

        function onDrag(e) {
            if (!dragState.dragging) return;
            panel.style.left = (dragState.startLeft + e.clientX - dragState.startX) + 'px';
            panel.style.top = (dragState.startTop + e.clientY - dragState.startY) + 'px';
        }

        function stopDrag() {
            dragState.dragging = false;
            window.removeEventListener('mousemove', onDrag);
            window.removeEventListener('mouseup', stopDrag);
        }

        function attachEventListeners(colInputs, colDisplays, totalEl) {
            var handlers = window.handlersRegistry['reportTosifi'];
            if (!handlers) {
                console.error('handlers برای reportTosifi یافت نشد!');
                return;
            }
            var spacing = handlers.spacing;
            var zoom = handlers.zoom;
            var column = handlers.column;

            var displays = {
                topHeight: document.getElementById('reportTosifi-topHeightDisp'),
                bottomHeight: document.getElementById('reportTosifi-bottomHeightDisp'),
                rightHeight: document.getElementById('reportTosifi-rightHeightDisp'),
                widthDisp: document.getElementById('reportTosifi-widthDisp')
            };

            document.getElementById('reportTosifi-increaseTopBtn').addEventListener('click', function() { spacing.increaseTop(displays); });
            document.getElementById('reportTosifi-decreaseTopBtn').addEventListener('click', function() { spacing.decreaseTop(displays); });
            document.getElementById('reportTosifi-increaseTopCoarseBtn').addEventListener('click', function() { spacing.increaseTopCoarse(displays); });
            document.getElementById('reportTosifi-decreaseTopCoarseBtn').addEventListener('click', function() { spacing.decreaseTopCoarse(displays); });
            document.getElementById('reportTosifi-increaseBottomBtn').addEventListener('click', function() { spacing.increaseBottom(displays); });
            document.getElementById('reportTosifi-decreaseBottomBtn').addEventListener('click', function() { spacing.decreaseBottom(displays); });
            document.getElementById('reportTosifi-increaseBottomCoarseBtn').addEventListener('click', function() { spacing.increaseBottomCoarse(displays); });
            document.getElementById('reportTosifi-decreaseBottomCoarseBtn').addEventListener('click', function() { spacing.decreaseBottomCoarse(displays); });
            document.getElementById('reportTosifi-increaseRightBtn').addEventListener('click', function() { spacing.increaseRight(displays); });
            document.getElementById('reportTosifi-decreaseRightBtn').addEventListener('click', function() { spacing.decreaseRight(displays); });
            document.getElementById('reportTosifi-increaseRightCoarseBtn').addEventListener('click', function() { spacing.increaseRightCoarse(displays); });
            document.getElementById('reportTosifi-decreaseRightCoarseBtn').addEventListener('click', function() { spacing.decreaseRightCoarse(displays); });
            document.getElementById('reportTosifi-increaseWidthBtn').addEventListener('click', function() { spacing.increaseWidth(displays); });
            document.getElementById('reportTosifi-decreaseWidthBtn').addEventListener('click', function() { spacing.decreaseWidth(displays); });
            document.getElementById('reportTosifi-increaseWidthCoarseBtn').addEventListener('click', function() { spacing.increaseWidthCoarse(displays); });
            document.getElementById('reportTosifi-decreaseWidthCoarseBtn').addEventListener('click', function() { spacing.decreaseWidthCoarse(displays); });
            document.getElementById('reportTosifi-applySpacingBtn').addEventListener('click', function() { spacing.applyStored(); });

            document.getElementById('reportTosifi-increaseZoomBtn').addEventListener('click', function() { zoom.set(zoom.get() + 1); });
            document.getElementById('reportTosifi-decreaseZoomBtn').addEventListener('click', function() { zoom.set(zoom.get() - 1); });
            document.getElementById('reportTosifi-increaseZoomCoarseBtn').addEventListener('click', function() { zoom.set(zoom.get() + 5); });
            document.getElementById('reportTosifi-decreaseZoomCoarseBtn').addEventListener('click', function() { zoom.set(zoom.get() - 5); });

            var currentWidths = column.getWidths();
            for (var i = 0; i < 6; i++) {
                colInputs[i].value = currentWidths[i];
                colDisplays[i].textContent = currentWidths[i] + '%';
                (function(index) {
                    colInputs[index].addEventListener('input', function() {
                        var val = parseInt(this.value) || 1;
                        column.setWidth(index, val);
                        colDisplays[index].textContent = val + '%';
                        var sum = column.getSum();
                        totalEl.textContent = sum + '%';
                        totalEl.style.color = sum === 100 ? '#2b8a3e' : '#c92a2a';
                    });
                })(i);
            }
            var sum = column.getSum();
            totalEl.textContent = sum + '%';
            totalEl.style.color = sum === 100 ? '#2b8a3e' : '#c92a2a';
            console.log('رویدادهای پنل گزارش متصل شدند');
        }

        createFloatingIcon();
        createPanel();
    }

    waitForHandlers(init);
})();
