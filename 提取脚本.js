(() => {
// 若不存在或不是数组，则创建全局存储（可选）
window.products = Array.isArray(window.products) ? window.products : [];

// 注意：避免用单独的 links 列表按索引对应，直接在每个卡片内找链接更稳
const elements = document.getElementsByClassName('contentContainer__uVXF');

for (let i = 0; i < elements.length; i++) {
const element = elements[i];
const link = element.querySelector('a.productListCardWrapper___oy3')?.href || '';

const product = {
status: element.querySelector('[data-automation="srp-product-list-card-badge"] strong')?.textContent.trim() || '',
rating: element.querySelector('[data-automation="srp-product-list-card-rating"] .rating__JCMy')?.textContent.trim() || '',
comments: (element.querySelector('[data-automation="srp-product-list-card-rating"] .reviewCount__FJR8')?.textContent.trim() || '').replace(/[^\d]/g, ''),
title: element.querySelector('[data-automation="srp-product-list-card-title"]')?.textContent.trim() || '',
description: Array.from(
element.querySelectorAll('[data-automation="srp-product-list-card-duration"], [data-automation="srp-product-list-card-free-cancellation"]')
)
.map(el => el.textContent.trim().replace(/\s+/g, ' '))
.join('; '),
price: (element.querySelector('[data-automation="srp-product-list-card-price"] [data-automation="current-price"]')?.textContent.trim().replace(/\D+/g, '') || ''),
priceDescription: element.querySelector('[data-automation="srp-product-list-card-price"] [class*="tieredPricingLabel"]')?.textContent.trim() || '',
link
};

// 可选：按链接去重，避免多次点击累积重复数据
if (!window.products.some(p => p.link === product.link && product.link)) {
window.products.push(product);
console.log(product);
}
}

console.log('累计产品数量:', window.products.length);
console.log(window.products);
})();