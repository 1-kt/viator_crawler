(() => {
  const PANEL_ID = 'viator-tools-panel';
  if (document.getElementById(PANEL_ID)) return;

  const panel = document.createElement('div');
  panel.id = PANEL_ID;

  const title = document.createElement('div');
  title.className = 'vtp-title';
  title.textContent = '工具箱';

  const extractBtn = document.createElement('button');
  extractBtn.type = 'button';
  extractBtn.id = 'vtp-extract-btn';
  extractBtn.className = 'vtp-btn';
  extractBtn.textContent = '提取';

  const exportBtn = document.createElement('button');
  exportBtn.type = 'button';
  exportBtn.id = 'vtp-export-btn';
  exportBtn.className = 'vtp-btn vtp-btn-secondary';
  exportBtn.textContent = '导出';

  const status = document.createElement('div');
  status.className = 'vtp-status';
  status.textContent = '就绪';

  panel.appendChild(title);
  panel.appendChild(extractBtn);
  panel.appendChild(exportBtn);
  panel.appendChild(status);
  document.body.appendChild(panel);

  const setStatus = (text, isError = false) => {
    status.textContent = text;
    status.classList.toggle('vtp-status-error', isError);
  };

  const runExtractScript = () => new Promise((resolve, reject) => {
    if (!chrome?.runtime?.id) {
      reject(new Error('Extension context invalidated'));
      return;
    }
    chrome.runtime.sendMessage({ type: 'run-extract' }, (response) => {
      const err = chrome.runtime.lastError;
      if (err) {
        reject(new Error(err.message));
        return;
      }
      if (!response || !response.ok) {
        reject(new Error(response?.error || 'Unknown error'));
        return;
      }
      resolve();
    });
  });

  const runExportScript = () => new Promise((resolve, reject) => {
    if (!chrome?.runtime?.id) {
      reject(new Error('Extension context invalidated'));
      return;
    }
    chrome.runtime.sendMessage({ type: 'run-export' }, (response) => {
      const err = chrome.runtime.lastError;
      if (err) {
        reject(new Error(err.message));
        return;
      }
      if (!response || !response.ok) {
        reject(new Error(response?.error || 'Unknown error'));
        return;
      }
      resolve();
    });
  });

  const exportProducts = () => {
    const products = Array.isArray(window.products) ? window.products : [];
    if (!products.length) {
      setStatus('没有可导出的数据', true);
      return;
    }

    const fields = [
      { key: 'status', label: '销售状态' },
      { key: 'rating', label: '评分' },
      { key: 'comments', label: '评论数' },
      { key: 'title', label: '标题' },
      { key: 'description', label: '产品描述' },
      { key: 'price', label: '价格' },
      { key: 'priceDescription', label: '价格说明' },
      { key: 'link', label: '链接' }
    ];

    const escapeCsv = (val) => {
      const str = val == null ? '' : String(val);
      const sanitized = str.replace(/\r?\n/g, ' ').replace(/\r/g, ' ');
      const escaped = sanitized.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const header = fields.map(f => escapeCsv(f.label)).join(',');
    const rows = products
      .map(p => fields.map(f => escapeCsv(p[f.key])).join(','))
      .join('\n');

    const csvContent = '\ufeff' + header + '\n' + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = `products_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(link.href);
      link.remove();
    }, 0);

    setStatus(`已导出 ${products.length} 条`);
  };

  extractBtn.addEventListener('click', async () => {
    try {
      await runExtractScript();
      setStatus('已执行提取脚本');
    } catch (err) {
      const message = err?.message || String(err);
      if (message.includes('Extension context invalidated')) {
        setStatus('插件已更新，请刷新页面', true);
      } else {
        setStatus('提取失败，请查看控制台', true);
      }
      console.error(err);
    }
  });

  exportBtn.addEventListener('click', () => {
    (async () => {
      try {
        await runExportScript();
        setStatus('已执行导出脚本');
      } catch (err) {
        const message = err?.message || String(err);
        if (message.includes('Extension context invalidated')) {
          setStatus('插件已更新，请刷新页面', true);
        } else {
          setStatus('导出失败，请查看控制台', true);
        }
        console.error(err);
      }
    })();
  });
})();
