(function () {
  const pages = window.GASGX_QUOTE_PAGES || {};
  const pageKeys = Object.keys(pages);
  const params = new URLSearchParams(window.location.search);
  const requestedPageKey = params.get('company');
  const requestedLang = params.get('lang');
  const requestedProductId = params.get('product');
  const viewMode = params.get('mode') === 'view';
  const state = {
    pageKey: pageKeys.includes(requestedPageKey) ? requestedPageKey : (pageKeys[0] || ''),
    lang: ['zh', 'en', 'ru'].includes(requestedLang) ? requestedLang : 'zh',
    rates: { USD: 0.1398, EUR: 0.1265, CAD: 0.1888, RUB: 12.866 },
    products: [],
    productId: '',
  };

  const dict = {
    zh: {
      studioTitle: '报价系统工作台',
      company: '公司',
      product: '产品',
      language: '语言',
      mainConfig: '主配置',
      optionalConfig: '选配',
      systemTotal: '系统预估总价 / EST. SYSTEM TOTAL',
      headers: ['SEQ', '模块描述 (DESCRIPTION)', '规格 (BRAND)', 'QTY', 'RMB (¥)', 'USD ($)', 'EUR (€)', 'CAD (C$)', 'RUB (₽)'],
      included: '包含',
      pageTitlePrefix: '产品报价总览',
      onlineRates: '全球实时汇率在线',
      refreshRates: '刷新汇率',
      noProduct: '暂无产品数据',
    },
    en: {
      studioTitle: 'Quotation Studio',
      company: 'Company',
      product: 'Product',
      language: 'Language',
      mainConfig: 'MAIN CONFIG',
      optionalConfig: 'OPTIONAL CONFIG',
      systemTotal: 'EST. SYSTEM TOTAL',
      headers: ['SEQ', 'DESCRIPTION', 'BRAND', 'QTY', 'RMB (¥)', 'USD ($)', 'EUR (€)', 'CAD (C$)', 'RUB (₽)'],
      included: 'Included',
      pageTitlePrefix: 'Product Quotation Overview',
      onlineRates: 'GLOBAL LIVE RATES',
      refreshRates: 'REFRESH',
      noProduct: 'No product data',
    },
    ru: {
      studioTitle: 'Система коммерческих предложений',
      company: 'Компания',
      product: 'Продукт',
      language: 'Язык',
      mainConfig: 'БАЗОВАЯ КОМПЛЕКТАЦИЯ',
      optionalConfig: 'ОПЦИИ',
      systemTotal: 'ОЦЕНОЧНАЯ СТОИМОСТЬ СИСТЕМЫ',
      headers: ['№', 'ОПИСАНИЕ', 'БРЕНД', 'КОЛ', 'RMB (¥)', 'USD ($)', 'EUR (€)', 'CAD (C$)', 'RUB (₽)'],
      included: 'Вкл.',
      pageTitlePrefix: 'Обзор продукции и цен',
      onlineRates: 'ГЛОБАЛЬНЫЕ КУРСЫ ОНЛАЙН',
      refreshRates: 'ОБНОВИТЬ',
      noProduct: 'Нет данных по продукту',
    },
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function text(value) {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    return value[state.lang] || value.zh || value.en || value.ru || '';
  }

  function formatMoney(num) {
    return Number(num || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  function itemSubtotal(items) {
    return items.reduce((sum, item) => sum + (Number(item.price) > 0 ? Number(item.price) : 0), 0);
  }

  function quoteTotal(product, totalMode) {
    if (totalMode === 'section-subtotals') {
      return product.sections.reduce((sum, section) => sum + Math.max(0, Number(section.subtotal) || 0), 0);
    }
    return product.sections.reduce((sum, section) => sum + itemSubtotal(section.items), 0);
  }

  function moneyCells(amount) {
    return {
      rmb: `¥${formatMoney(amount)}`,
      usd: `$${formatMoney(amount * state.rates.USD)}`,
      eur: `€${formatMoney(amount * state.rates.EUR)}`,
      cad: `C$${formatMoney(amount * state.rates.CAD)}`,
      rub: `₽${formatMoney(amount * state.rates.RUB)}`,
    };
  }

  function normalizeProducts(page) {
    return page.productMappings.map((mapping) => {
      const title = mapping.titlePath.split('.').reduce((acc, key) => acc?.[key], page.rawData);
      const items = mapping.itemsPath.split('.').reduce((acc, key) => acc?.[key], page.rawData) || [];
      const sections = [];
      let currentSection = null;
      let headerIndex = 0;

      items.forEach((item) => {
        if (item.isHeader) {
          currentSection = {
            key: headerIndex === 0 ? 'mainConfig' : 'optionalConfig',
            label: item.n,
            subtotal: Number(item.price) || 0,
            explicitSubtotal: true,
            items: [],
          };
          sections.push(currentSection);
          headerIndex += 1;
          return;
        }

        if (!currentSection) {
          currentSection = {
            key: 'mainConfig',
            label: null,
            subtotal: 0,
            explicitSubtotal: false,
            items: [],
          };
          sections.push(currentSection);
        }

        currentSection.items.push({ ...item });
      });

      if (!sections.length) {
        sections.push({
          key: 'mainConfig',
          label: null,
          subtotal: itemSubtotal(items),
          explicitSubtotal: false,
          items: items.map((item) => ({ ...item })),
        });
      }

      sections.forEach((section) => {
        if (!section.explicitSubtotal) {
          section.subtotal = itemSubtotal(section.items);
        }
      });

      return { id: mapping.id, title, sections };
    });
  }

  function renderSelectors() {
    const companySelect = byId('company-select');
    const productSelect = byId('product-select');
    const langSelect = byId('lang-select');
    const currentPage = pages[state.pageKey];

    companySelect.innerHTML = pageKeys
      .map((key) => `<option value="${key}" ${key === state.pageKey ? 'selected' : ''}>${pages[key].company.brandFull}</option>`)
      .join('');

    productSelect.innerHTML = state.products
      .map((product) => `<option value="${product.id}" ${product.id === state.productId ? 'selected' : ''}>${text(product.title)}</option>`)
      .join('');

    langSelect.innerHTML = `
      <option value="zh" ${state.lang === 'zh' ? 'selected' : ''}>CN</option>
      <option value="en" ${state.lang === 'en' ? 'selected' : ''}>EN</option>
      <option value="ru" ${state.lang === 'ru' ? 'selected' : ''}>RU</option>
    `;

    byId('studio-title').innerText = `${currentPage.company.brandFull} ${dict[state.lang].studioTitle}`;
    byId('lbl-company').innerText = dict[state.lang].company;
    byId('lbl-product').innerText = dict[state.lang].product;
    byId('lbl-language').innerText = dict[state.lang].language;
    byId('rate-status').innerHTML = `<i class="fa-solid fa-wifi text-[var(--gas-green-light)] mr-1.5"></i>${dict[state.lang].onlineRates}`;
    byId('refresh-rates-text').innerText = dict[state.lang].refreshRates;

    const studioPanel = byId('studio-panel');
    if (studioPanel) {
      studioPanel.classList.toggle('hidden', viewMode);
    }

    const studioSidebar = byId('studio-sidebar');
    const studioMain = byId('studio-main');
    if (studioSidebar) {
      studioSidebar.classList.toggle('hidden', viewMode);
    }
    if (studioMain) {
      studioMain.classList.toggle('lg:col-span-2', viewMode);
    }
  }

  function renderQuote() {
    const page = pages[state.pageKey];
    const product = state.products.find((item) => item.id === state.productId);
    const container = byId('quote-preview');

    if (!product) {
      container.innerHTML = `<div class="text-sm text-[var(--text-muted)]">${dict[state.lang].noProduct}</div>`;
      return;
    }

    const total = quoteTotal(product, page.totalMode);
    const totalMoney = moneyCells(total);
    const rows = [];

    product.sections.forEach((section) => {
      const sectionTitle = text(section.label) || dict[state.lang][section.key];
      const sectionMoney = moneyCells(section.subtotal);

      rows.push(`
        <tr style="background-color: var(--bg-base);">
          <td class="text-[var(--text-muted)] opacity-50 text-center text-xs font-mono-num whitespace-nowrap">-</td>
          <td class="text-[var(--gas-green-light)] font-semibold whitespace-nowrap">${sectionTitle}</td>
          <td class="text-[var(--text-muted)] opacity-50 text-xs whitespace-nowrap">-</td>
          <td class="text-[var(--text-muted)] opacity-50 text-center font-mono-num whitespace-nowrap">-</td>
          <td class="font-mono-num text-[var(--gas-green-light)] font-medium whitespace-nowrap">${sectionMoney.rmb}</td>
          <td class="font-mono-num text-[var(--gas-green-light)] font-medium whitespace-nowrap">${sectionMoney.usd}</td>
          <td class="font-mono-num text-[var(--gas-green-light)] font-medium whitespace-nowrap">${sectionMoney.eur}</td>
          <td class="font-mono-num text-[var(--gas-green-light)] font-medium whitespace-nowrap">${sectionMoney.cad}</td>
          <td class="font-mono-num text-[var(--gas-green-light)] font-medium whitespace-nowrap">${sectionMoney.rub}</td>
        </tr>
      `);

      section.items.forEach((item) => {
        const included = Number(item.price) === -1;
        const itemMoney = moneyCells(item.price);
        rows.push(`
          <tr>
            <td class="text-[var(--text-body)] text-center text-xs font-mono-num whitespace-nowrap">${item.id}</td>
            <td class="text-white min-w-[200px]">${text(item.n)}</td>
            <td class="text-[var(--text-body)] text-xs whitespace-nowrap">${item.brand}</td>
            <td class="text-[var(--text-body)] text-center font-mono-num whitespace-nowrap">${item.qty}</td>
            <td class="font-mono-num ${included ? 'text-[var(--text-muted)]' : 'text-[var(--gas-green-light)] font-medium'} whitespace-nowrap">${included ? dict[state.lang].included : itemMoney.rmb}</td>
            <td class="font-mono-num ${included ? 'text-[#333333]' : 'text-[var(--gas-green-light)] font-medium'} whitespace-nowrap">${included ? '-' : itemMoney.usd}</td>
            <td class="font-mono-num ${included ? 'text-[#333333]' : 'text-[var(--gas-green-light)] font-medium'} whitespace-nowrap">${included ? '-' : itemMoney.eur}</td>
            <td class="font-mono-num ${included ? 'text-[#333333]' : 'text-[var(--gas-green-light)] font-medium'} whitespace-nowrap">${included ? '-' : itemMoney.cad}</td>
            <td class="font-mono-num ${included ? 'text-[#333333]' : 'text-[var(--gas-green-light)] font-medium'} whitespace-nowrap">${included ? '-' : itemMoney.rub}</td>
          </tr>
        `);
      });
    });

    container.innerHTML = `
      <div class="border-b border-[var(--border-color)] pb-6 md:pb-8 mb-8 md:mb-10 flex flex-col xl:flex-row justify-between items-start gap-6">
        <div class="w-full xl:flex-1 xl:pr-8 overflow-hidden">
          <h1 class="text-xl md:text-3xl font-bold tracking-wide text-[var(--gas-green-light)] leading-snug break-words flex-1 m-0 mb-4 md:mb-8">
            ${page.title[state.lang] || page.title.zh}
          </h1>
          <div class="doc-meta-grid grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-12 gap-y-4 md:gap-y-5 text-sm md:text-[15px]">
            <div class="doc-meta-item flex items-center border-b border-[var(--border-color)] pb-2 overflow-hidden">
              <span class="min-w-max pr-3 text-[var(--text-body)] flex-shrink-0 whitespace-nowrap">${dict[state.lang].company}：</span>
              <div class="doc-meta-value flex-1 w-0 overflow-x-auto no-scrollbar flex items-center">
                <span class="font-semibold text-white whitespace-nowrap outline-none w-full text-left block">${page.company.supplierName}</span>
              </div>
            </div>
            <div class="doc-meta-item flex items-center border-b border-[var(--border-color)] pb-2 overflow-hidden">
              <span class="min-w-max pr-3 text-[var(--text-body)] flex-shrink-0 whitespace-nowrap">EMAIL：</span>
              <div class="doc-meta-value flex-1 w-0 overflow-x-auto no-scrollbar flex items-center">
                <span class="text-[var(--gas-green-light)] whitespace-nowrap outline-none w-full text-left block">${page.company.senderEmail}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="w-full xl:w-auto text-left xl:text-right flex-shrink-0 flex flex-col items-start xl:items-end">
          <div class="bg-[var(--bg-base)] border border-[var(--border-color)] p-4 md:p-5 rounded shadow-inner w-full xl:min-w-[280px]">
            <div class="text-xs text-[var(--text-muted)] mb-2 uppercase tracking-widest flex items-center justify-start xl:justify-end gap-2">
              <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--gas-green-light)] opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--gas-green-light)]"></span></span>
              SYS_TIME_SYNC
            </div>
            <div class="text-2xl md:text-3xl font-mono-num text-white tracking-widest">${new Date().toISOString().slice(0, 10)}</div>
            <div class="text-xs md:text-sm font-mono-num text-[var(--text-body)] mt-1">${new Date().toLocaleTimeString('en-GB')}</div>
          </div>
        </div>
      </div>

      <div class="mb-10 md:mb-16">
        <h3 class="text-base md:text-lg font-semibold text-[var(--gas-green-light)] mb-4 md:mb-5 flex items-center gap-2 md:gap-3">
          <span class="bg-[var(--gas-green-bg)] border border-[var(--gas-green-primary)] text-[var(--gas-green-light)] w-6 h-6 md:w-7 md:h-7 rounded flex items-center justify-center text-xs md:text-sm font-mono-num flex-shrink-0">1</span>
          <span class="leading-tight">${text(product.title)}</span>
        </h3>

        <div class="bg-[var(--bg-base)] border border-[var(--border-color)] rounded p-4 md:p-5 mb-4 md:mb-6 flex flex-col md:flex-row md:flex-wrap items-start md:items-center justify-between shadow-inner gap-4">
          <span class="font-bold text-white tracking-wider text-xs md:text-sm">${dict[state.lang].systemTotal}:</span>
          <div class="flex flex-wrap gap-x-4 md:gap-x-6 gap-y-2 text-sm md:text-[15px]">
            <span class="flex items-center gap-2"><span class="gas-tag">RMB</span> <span class="text-[var(--gas-green-light)] font-mono-num font-bold">${totalMoney.rmb}</span></span>
            <span class="flex items-center gap-2"><span class="gas-tag">USD</span> <span class="text-[var(--gas-green-light)] font-mono-num font-bold">${totalMoney.usd}</span></span>
            <span class="flex items-center gap-2"><span class="gas-tag">EUR</span> <span class="text-[var(--gas-green-light)] font-mono-num font-bold">${totalMoney.eur}</span></span>
            <span class="flex items-center gap-2"><span class="gas-tag">CAD</span> <span class="text-[var(--gas-green-light)] font-mono-num font-bold">${totalMoney.cad}</span></span>
            <span class="flex items-center gap-2"><span class="gas-tag">RUB</span> <span class="text-[var(--gas-green-light)] font-mono-num font-bold">${totalMoney.rub}</span></span>
          </div>
        </div>

        <div class="table-responsive-wrapper w-full">
          <table class="industrial-table text-left">
            <thead>
              <tr>${dict[state.lang].headers.map((header, idx) => `<th class="${idx === 0 ? 'w-12 text-center whitespace-nowrap' : 'whitespace-nowrap'}">${header}</th>`).join('')}</tr>
            </thead>
            <tbody>${rows.join('')}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  async function fetchRates() {
    const status = byId('rate-status');
    status.innerHTML = `<i class="fa-solid fa-rotate fa-spin text-[var(--gas-green-light)] mr-1.5"></i>${state.lang === 'zh' ? '正在刷新...' : state.lang === 'ru' ? 'Обновление...' : 'Refreshing...'}`;
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/CNY');
      const data = await response.json();
      if (data?.rates) {
        state.rates = {
          USD: data.rates.USD,
          EUR: data.rates.EUR,
          CAD: data.rates.CAD,
          RUB: data.rates.RUB,
        };
      }
      status.innerHTML = `<i class="fa-solid fa-wifi text-[var(--gas-green-light)] mr-1.5"></i>${dict[state.lang].onlineRates}`;
      renderQuote();
    } catch (_error) {
      status.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-yellow-500 mr-1.5"></i>${state.lang === 'zh' ? '汇率获取失败，使用基准数据' : state.lang === 'ru' ? 'Не удалось получить курс, используются базовые данные' : 'Rate fetch failed, using baseline data'}`;
    }
  }

  function syncProducts() {
    state.products = normalizeProducts(pages[state.pageKey]);
    const hasRequestedProduct = state.products.some((item) => item.id === requestedProductId);
    state.productId = hasRequestedProduct ? requestedProductId : (state.products[0]?.id || '');
  }

  function init() {
    syncProducts();
    renderSelectors();
    renderQuote();

    byId('company-select').addEventListener('change', (event) => {
      state.pageKey = event.target.value;
      syncProducts();
      renderSelectors();
      renderQuote();
    });

    byId('product-select').addEventListener('change', (event) => {
      state.productId = event.target.value;
      renderQuote();
    });

    byId('lang-select').addEventListener('change', (event) => {
      state.lang = event.target.value;
      renderSelectors();
      renderQuote();
    });

    byId('refresh-rates').addEventListener('click', fetchRates);
  }

  init();
})();
