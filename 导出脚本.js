// 在你已有的采集脚本运行后执行此段代码，即可把 window.products 导出为 CSV 文件
(() => {
  // 读取全局产品数组
  const products = Array.isArray(window.products) ? window.products : [];
  if (!products.length) {
    console.warn('没有可导出的产品数据：window.products 为空或不是数组');
    return;
  }

  // 定义导出字段与表头
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

  // CSV 字段转义（始终加双引号，处理引号与换行）
  const escapeCsv = (val) => {
    const str = val == null ? '' : String(val);
    // 去除换行避免 Excel/其他工具解析异常
    const sanitized = str.replace(/\r?\n/g, ' ').replace(/\r/g, ' ');
    // 处理双引号
    const escaped = sanitized.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  // 生成表头
  const header = fields.map(f => escapeCsv(f.label)).join(',');

  // 生成数据行
  const rows = products
    .map(p => fields.map(f => escapeCsv(p[f.key])).join(','))
    .join('\n');

  // 加 BOM 以便 Excel 正常识别 UTF-8
  const csvContent = '\ufeff' + header + '\n' + rows;

  // 生成文件并触发下载
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = `products_${new Date().toISOString().slice(0,19).replace(/[:T]/g, '-')}.csv`;

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // 清理
  setTimeout(() => {
    URL.revokeObjectURL(link.href);
    link.remove();
  }, 0);
})();