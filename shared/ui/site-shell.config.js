(function () {
    "use strict";

    window.GASGX_SITE_SHELL_CONFIG = {
        // `title` / `header` uses explicit zh/en labels generated from current index navigation.
        // You can manually optimize any wording later.
        navigation: [
                {
                        "title": {
                                "zh": "首页",
                                "en": "Home"
                        },
                        "path": "/index.html",
                        "type": "link",
                        "icon": "fa-solid fa-house"
                },
                {
                        "title": {
                                "zh": "新闻",
                                "en": "News"
                        },
                        "path": "/news/",
                        "type": "menu",
                        "icon": "fa-solid fa-newspaper",
                        "children": [
                                {
                                        "title": {
                                                "zh": "首页",
                                                "en": "Home"
                                        },
                                        "path": "/news/"
                                },
                                {
                                        "title": {
                                                "zh": "快讯",
                                                "en": "Flash"
                                        },
                                        "path": "/news/flash"
                                },
                                {
                                        "title": {
                                                "zh": "天然气能源",
                                                "en": "Gas Energy"
                                        },
                                        "path": "/news/gas-energy"
                                },
                                {
                                        "title": {
                                                "zh": "发电机组",
                                                "en": "Generators"
                                        },
                                        "path": "/news/generators"
                                },
                                {
                                        "title": {
                                                "zh": "挖矿",
                                                "en": "Mining"
                                        },
                                        "path": "/news/mining"
                                },
                                {
                                        "title": {
                                                "zh": "洞察",
                                                "en": "Insights"
                                        },
                                        "path": "/news/insights"
                                },
                                {
                                        "title": {
                                                "zh": "数据",
                                                "en": "Data"
                                        },
                                        "path": "/news/data"
                                },
                                {
                                        "title": {
                                                "zh": "活动",
                                                "en": "Events"
                                        },
                                        "path": "/news/events"
                                }
                        ]
                },
                {
                        "title": {
                                "zh": "解决方案",
                                "en": "Solutions"
                        },
                        "path": "/solutions",
                        "type": "menu",
                        "children": [
                                {
                                        "title": {
                                                "zh": "油气井/伴生气发电",
                                                "en": "Oil/Gas Field Power"
                                        },
                                        "path": "/solutions/oilfield"
                                },
                                {
                                        "title": {
                                                "zh": "工业园区与分布式能源",
                                                "en": "Industrial Power"
                                        },
                                        "path": "/solutions/industrial"
                                },
                                {
                                        "title": {
                                                "zh": "数据中心 / 挖矿电力",
                                                "en": "Data Center / Mining"
                                        },
                                        "path": "/solutions/mining"
                                },
                                {
                                        "title": {
                                                "zh": "热电联供 CHP",
                                                "en": "CHP Cogeneration"
                                        },
                                        "path": "/solutions/chp"
                                }
                        ]
                },
                {
                        "title": {
                                "zh": "机型库",
                                "en": "Products"
                        },
                        "path": "/products",
                        "type": "menu",
                        "children": [
                                {
                                        "title": {
                                                "zh": "300kW",
                                                "en": "300kW"
                                        },
                                        "path": "/products/300kw"
                                },
                                {
                                        "title": {
                                                "zh": "1000kW",
                                                "en": "1000kW"
                                        },
                                        "path": "/products/1000kw"
                                }
                        ]
                },
                {
                        "title": {
                                "zh": "排行榜",
                                "en": "Rankings"
                        },
                        "path": "/rankings",
                        "type": "mega",
                        "gridCols": "grid-cols-6",
                        "sections": [
                                {
                                        "header": {
                                                "zh": "性能榜",
                                                "en": "Performance"
                                        },
                                        "items": [
                                                {
                                                        "title": {
                                                                "zh": "综合性能 TOP 榜",
                                                                "en": "Top Performance"
                                                        },
                                                        "path": "/rankings#rank-top-performance"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "高效率榜",
                                                                "en": "High Efficiency"
                                                        },
                                                        "path": "/rankings#rank-high-efficiency"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "天然气内燃机发电效率排行榜",
                                                                "en": "Elec. Efficiency Rank"
                                                        },
                                                        "path": "/rankings#rank-high-efficiency"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "天然气内燃机热效率排行榜",
                                                                "en": "Thermal Efficiency Rank"
                                                        },
                                                        "path": "/rankings#rank-thermal-efficiency"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "天然气内燃机耗气量排行榜",
                                                                "en": "Gas Consumption Rank"
                                                        },
                                                        "path": "/rankings#rank-gas-consumption"
                                                }
                                        ]
                                },
                                {
                                        "header": {
                                                "zh": "经济性榜",
                                                "en": "Economics"
                                        },
                                        "items": [
                                                {
                                                        "title": {
                                                                "zh": "最佳 ROI 榜",
                                                                "en": "Best ROI"
                                                        },
                                                        "path": "/rankings#rank-best-roi"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "最低发电成本 LCOE 榜",
                                                                "en": "Lowest LCOE"
                                                        },
                                                        "path": "/rankings#rank-lowest-lcoe"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "天然气内燃机折旧排行榜",
                                                                "en": "Depreciation Rank"
                                                        },
                                                        "path": "/rankings#rank-best-roi"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "天然气内燃机投资回报率排行榜",
                                                                "en": "ROI Rank"
                                                        },
                                                        "path": "/rankings#rank-best-roi"
                                                }
                                        ]
                                },
                                {
                                        "header": {
                                                "zh": "可靠性榜",
                                                "en": "Reliability"
                                        },
                                        "items": [
                                                {
                                                        "title": {
                                                                "zh": "高可靠机组榜",
                                                                "en": "High Reliability"
                                                        },
                                                        "path": "/rankings#rank-high-reliability"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "最长 MTBF 榜",
                                                                "en": "Longest MTBF"
                                                        },
                                                        "path": "/rankings#rank-high-reliability"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "天然气内燃机保养时间排行榜",
                                                                "en": "Maintenance Interval Rank"
                                                        },
                                                        "path": "/rankings#rank-maintenance-interval"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "天然气内燃机备件保障排行榜",
                                                                "en": "Spare Parts Rank"
                                                        },
                                                        "path": "/rankings#rank-maintenance-interval"
                                                }
                                        ]
                                },
                                {
                                        "header": {
                                                "zh": "品质与环保榜",
                                                "en": "Quality & Eco"
                                        },
                                        "items": [
                                                {
                                                        "title": {
                                                                "zh": "天然气内燃机排放排行榜",
                                                                "en": "Emission Rank"
                                                        },
                                                        "path": "/rankings#rank-emission"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "天然气内燃机噪音排行榜",
                                                                "en": "Noise Rank"
                                                        },
                                                        "path": "/rankings#rank-noise"
                                                }
                                        ]
                                },
                                {
                                        "header": {
                                                "zh": "系统能力榜",
                                                "en": "System Cap."
                                        },
                                        "items": [
                                                {
                                                        "title": {
                                                                "zh": "天然气内燃机发电机排行榜",
                                                                "en": "Generator Rank"
                                                        },
                                                        "path": "/rankings#rank-generator"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "天然气内燃机控制系统排行榜",
                                                                "en": "Control System Rank"
                                                        },
                                                        "path": "/rankings#rank-control-system"
                                                }
                                        ]
                                },
                                {
                                        "header": {
                                                "zh": "区域榜",
                                                "en": "Regions"
                                        },
                                        "items": [
                                                {
                                                        "title": {
                                                                "zh": "美国市场榜",
                                                                "en": "USA Market"
                                                        },
                                                        "path": "/rankings#rank-usa-market"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "加拿大市场榜",
                                                                "en": "Canada Market"
                                                        },
                                                        "path": "/rankings#rank-canada-market"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "中东市场榜",
                                                                "en": "Middle East Market"
                                                        },
                                                        "path": "/rankings#rank-middle-east-market"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "俄罗斯市场榜",
                                                                "en": "Russia Market"
                                                        },
                                                        "path": "/rankings#rank-russia-market"
                                                }
                                        ]
                                }
                        ]
                },
                {
                        "title": {
                                "zh": "应用场景",
                                "en": "Use Cases"
                        },
                        "path": "/use-cases",
                        "type": "menu",
                        "children": [
                                {
                                        "title": {
                                                "zh": "油气井 / 伴生气",
                                                "en": "Oilfield / Associated Gas"
                                        },
                                        "path": "/use-cases/oilfield"
                                },
                                {
                                        "title": {
                                                "zh": "工业与园区能源",
                                                "en": "Industrial & Park"
                                        },
                                        "path": "/use-cases/industrial"
                                },
                                {
                                        "title": {
                                                "zh": "挖矿 / 数据中心",
                                                "en": "Mining / Data Center"
                                        },
                                        "path": "/use-cases/mining"
                                },
                                {
                                        "title": {
                                                "zh": "CHP 热电联供",
                                                "en": "CHP"
                                        },
                                        "path": "/use-cases/chp"
                                }
                        ]
                },
                {
                        "title": {
                                "zh": "工具箱",
                                "en": "Tools"
                        },
                        "path": "/tools",
                        "type": "mega",
                        "gridCols": "grid-cols-5",
                        "sections": [
                                {
                                        "header": {
                                                "zh": "经济测算工具",
                                                "en": "Economic Tools"
                                        },
                                        "items": [
                                                {
                                                        "title": {
                                                                "zh": "LCOE 成本计算器",
                                                                "en": "LCOE Calculator"
                                                        },
                                                        "path": "/tools/lcoe-calculator"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "ROI 回报估算器",
                                                                "en": "ROI Estimator"
                                                        },
                                                        "path": "/tools/roi"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "燃气发电挖矿收益计算器",
                                                                "en": "Gas Mining Revenue"
                                                        },
                                                        "path": "/tools/mining-power-calc"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "蒙特卡洛模拟盈利分析",
                                                                "en": "Monte Carlo Sim"
                                                        },
                                                        "path": "/tools/monte-carlo-profit"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "天然气发电耗气成本分析",
                                                                "en": "Gas Cost Analysis"
                                                        },
                                                        "path": "/tools/gas-cost-analysis"
                                                }
                                        ]
                                },
                                {
                                        "header": {
                                                "zh": "工程与技术工具",
                                                "en": "Engineering Tools"
                                        },
                                        "items": [
                                                {
                                                        "title": {
                                                                "zh": "气质适配工具",
                                                                "en": "Gas Fit Tool"
                                                        },
                                                        "path": "/tools/gas-fit"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "排放估算工具",
                                                                "en": "Emission Estimator"
                                                        },
                                                        "path": "/tools/emission"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "气体分析计算器",
                                                                "en": "Gas Analyzer"
                                                        },
                                                        "path": "/tools/gas-analyzer"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "能电转换计算器",
                                                                "en": "Energy Conversion"
                                                        },
                                                        "path": "/tools/energy-conversion"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "天然气主要成分热值表",
                                                                "en": "Heat Value Table"
                                                        },
                                                        "path": "/tools/gas-composition-heat"
                                                }
                                        ]
                                },
                                {
                                        "header": {
                                                "zh": "项目与选型工具",
                                                "en": "Selection Tools"
                                        },
                                        "items": [
                                                {
                                                        "title": {
                                                                "zh": "站点匹配向导",
                                                                "en": "Site Fit Wizard"
                                                        },
                                                        "path": "/tools/site-fit"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "气源所在地分析",
                                                                "en": "Location Analysis"
                                                        },
                                                        "path": "/tools/gas-location-analysis"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "燃气发动机选型与运营经济性",
                                                                "en": "Engine Selection & Econ"
                                                        },
                                                        "path": "/tools/engine-selection"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "天然气发电机机油消耗率",
                                                                "en": "Oil Consumption"
                                                        },
                                                        "path": "/tools/oil-consumption"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "车机 VS 工业机 10MW 对比分析",
                                                                "en": "Vehicle vs Ind. (10MW)"
                                                        },
                                                        "path": "/tools/vehicle-vs-industrial-10mw"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "多机型对比 3 年运营数据",
                                                                "en": "3-Year Ops Data"
                                                        },
                                                        "path": "/tools/3y-compare"
                                                }
                                        ]
                                },
                                {
                                        "header": {
                                                "zh": "矿工专区（托管与算力分析）",
                                                "en": "Miners Zone"
                                        },
                                        "items": [
                                                {
                                                        "title": {
                                                                "zh": "挖矿收益计算器",
                                                                "en": "Mining Revenue Calc"
                                                        },
                                                        "path": "/tools/mining-income-calculator"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "矿机盈利能力计算器",
                                                                "en": "Miner Profitability"
                                                        },
                                                        "path": "/tools/miner-profitability"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "矿机选购速查",
                                                                "en": "Miner Buyer Guide"
                                                        },
                                                        "path": "/tools/miner-buying-guide"
                                                }
                                        ]
                                },
                                {
                                        "header": {
                                                "zh": "全球支持与合规",
                                                "en": "Global Support"
                                        },
                                        "items": [
                                                {
                                                        "title": {
                                                                "zh": "加拿大 AECO 天然气价格预测",
                                                                "en": "AECO Price Forecast"
                                                        },
                                                        "path": "/tools/aeco-price-forecast"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "全球物流运输推荐",
                                                                "en": "Global Logistics"
                                                        },
                                                        "path": "/tools/global-logistics"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "全球合规政策",
                                                                "en": "Global Compliance"
                                                        },
                                                        "path": "/tools/global-compliance"
                                                }
                                        ]
                                }
                        ]
                },
                {
                        "title": {
                                "zh": "资料中心",
                                "en": "Resources"
                        },
                        "path": "/resources",
                        "type": "mega",
                        "gridCols": "grid-cols-4",
                        "sections": [
                                {
                                        "header": {
                                                "zh": "文档",
                                                "en": "Documents"
                                        },
                                        "items": [
                                                {
                                                        "title": {
                                                                "zh": "白皮书",
                                                                "en": "Whitepapers"
                                                        },
                                                        "path": "/resources/whitepapers"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "行业报告",
                                                                "en": "Industry Reports"
                                                        },
                                                        "path": "/resources/reports"
                                                }
                                        ]
                                },
                                {
                                        "header": {
                                                "zh": "案例",
                                                "en": "Case Studies"
                                        },
                                        "items": [
                                                {
                                                        "title": {
                                                                "zh": "全部案例",
                                                                "en": "All Cases"
                                                        },
                                                        "path": "/resources/case-studies"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "按区域查看",
                                                                "en": "By Region"
                                                        },
                                                        "path": "/resources/case-studies/regions"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "按场景查看",
                                                                "en": "By Scenario"
                                                        },
                                                        "path": "/resources/case-studies/scenarios"
                                                }
                                        ]
                                },
                                {
                                        "header": {
                                                "zh": "技术库",
                                                "en": "Tech Library"
                                        },
                                        "items": [
                                                {
                                                        "title": {
                                                                "zh": "技术参数表",
                                                                "en": "Datasheets"
                                                        },
                                                        "path": "/resources/datasheets"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "认证与合规文件",
                                                                "en": "Certifications"
                                                        },
                                                        "path": "/resources/certifications"
                                                }
                                        ]
                                },
                                {
                                        "header": {
                                                "zh": "媒体与支持",
                                                "en": "Media & Support"
                                        },
                                        "items": [
                                                {
                                                        "title": {
                                                                "zh": "视频与教程",
                                                                "en": "Videos & Tutorials"
                                                        },
                                                        "path": "/resources/videos"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "常见问答 FAQ",
                                                                "en": "FAQ"
                                                        },
                                                        "path": "/resources/faq"
                                                }
                                        ]
                                }
                        ]
                },
                {
                        "title": {
                                "zh": "服务支持",
                                "en": "Support"
                        },
                        "path": "/support",
                        "type": "menu",
                        "children": [
                                {
                                        "title": {
                                                "zh": "服务网络",
                                                "en": "Service Network"
                                        },
                                        "path": "/support/network"
                                },
                                {
                                        "title": {
                                                "zh": "技术支持",
                                                "en": "Tech Support"
                                        },
                                        "path": "/support/tech"
                                },
                                {
                                        "title": {
                                                "zh": "售后与保养",
                                                "en": "After-sales"
                                        },
                                        "path": "/support/service"
                                }
                        ]
                },
                {
                        "title": {
                                "zh": "关于我们GasGx",
                                "en": "About UsGasGx"
                        },
                        "path": "/about",
                        "type": "menu",
                        "children": [
                                {
                                        "title": {
                                                "zh": "公司介绍",
                                                "en": "Company Profile"
                                        },
                                        "path": "/about/company"
                                },
                                {
                                        "title": {
                                                "zh": "联系我们",
                                                "en": "Contact Us"
                                        },
                                        "path": "/about/contact"
                                }
                        ]
                }
        ],
        sharedText: {
                en: {
                        tagline: "Natural Gas Power Mining Assistant",
                        footerTagline: "Making natural gas power mining easier",
                        strategicPartners: "Strategic Partners",
                        authLogin: "Login",
                        authLogout: "Logout",
                        contactUs: "Contact Us",
                        account: "Account",
                        welcome: "Welcome,",
                        privacyPolicy: "Privacy Policy",
                        languageEnglish: "EN",
                        languageChinese: "中文"
                },
                zh: {
                        tagline: "天然气发电挖矿助手",
                        footerTagline: "让天然气发电挖矿更简单",
                        strategicPartners: "战略合作伙伴",
                        authLogin: "登录",
                        authLogout: "退出",
                        contactUs: "联系我们",
                        account: "账号",
                        welcome: "欢迎，",
                        privacyPolicy: "隐私政策",
                        languageEnglish: "EN",
                        languageChinese: "中文"
                }
        },
        pages: {
                home: {
                        meta: {
                                title: {
                                        zh: "GasGx - 天然气发电挖矿",
                                        en: "GasGx - Natural Gas Power Mining"
                                },
                                description: {
                                        zh: "GasGx 提供全球天然气发电挖矿机会、政策状态与国家排名的总览。",
                                        en: "GasGx provides a global view of natural gas-powered mining opportunities, policy status, and country rankings."
                                }
                        },
                        heroCard: {
                                label: {
                                        zh: "分析范围",
                                        en: "Analysis Scope"
                                },
                                value: "25+",
                                unit: {
                                        zh: "国家",
                                        en: "Countries"
                                }
                        },
                        map: {
                                loadingText: {
                                        zh: "正在加载挖矿数据...",
                                        en: "Loading Mining Data..."
                                },
                                rotateHint: {
                                        zh: "拖拽旋转",
                                        en: "Drag to Rotate"
                                }
                        },
                        ranking: {
                                title: {
                                        zh: "全球天然气排行榜",
                                        en: "Total Score Ranking"
                                },
                                legendLegal: {
                                        zh: "合法 / 高分",
                                        en: "Legal / High Score"
                                },
                                legendRestricted: {
                                        zh: "受限",
                                        en: "Restricted"
                                },
                                legendBanned: {
                                        zh: "禁止",
                                        en: "Banned"
                                }
                        },
                        capture: {
                                modalTitle: {
                                        zh: "截图已生成！",
                                        en: "Snapshot Generated!"
                                },
                                modalDescription: {
                                        zh: "整页截图已成功生成。",
                                        en: "Full page captured successfully."
                                },
                                closeLabel: {
                                        zh: "关闭",
                                        en: "Close"
                                },
                                qrSubtitle: {
                                        zh: "扫码关注我们",
                                        en: "Scan to follow us"
                                },
                                qrHint: {
                                        zh: "长按或截图保存二维码。",
                                        en: "Long press or screenshot to save the QR code."
                                },
                                watermarkTagline: {
                                        zh: "天然气发电挖矿助手",
                                        en: "Natural Gas Power Mining Assistant"
                                },
                                downloadFileName: "GasGx-Map-Capture.png"
                        }
                },
                aboutCompany: {
                        meta: {
                                title: {
                                        zh: "About GasGx | 天然气发电算力行业研究平台",
                                        en: "About GasGx | Natural Gas Power Mining Research Platform"
                                }
                        },
                        texts: {
                                zh: {},
                                en: {},
                                ru: {}
                        },
                        subscribe: {
                                emailPlaceholder: {
                                        zh: "请输入您的邮箱",
                                        en: "Enter your email",
                                        ru: "Введите ваш email"
                                },
                                invalidEmail: {
                                        zh: "请输入有效的邮箱地址",
                                        en: "Please enter a valid email address",
                                        ru: "Введите корректный email"
                                },
                                recipientEmail: "contact@gasgx.com",
                                subject: "GasGx 2026 行业白皮书"
                        }
                },
                aboutContact: {
                        meta: {
                                title: {
                                        zh: "Contact GasGx | 联系我们",
                                        en: "Contact GasGx | Get in Touch"
                                }
                        },
                        texts: {
                                zh: {},
                                en: {},
                                ru: {}
                        },
                        contactEmail: "contact@gasgx.com",
                        socialLinks: [
                                { id: "wechat", enabled: true, mode: "qr", qrType: "wechat", iconClass: "fa-brands fa-weixin", ariaLabel: "Open WeChat QR" },
                                { id: "telegram", enabled: true, mode: "qr", qrType: "telegram", iconClass: "fa-brands fa-telegram", ariaLabel: "Open Telegram QR" },
                                { id: "twitter", enabled: true, mode: "qr", qrType: "twitter", iconClass: "fa-brands fa-x-twitter", ariaLabel: "Open Twitter QR" },
                                { id: "whatsapp", enabled: true, mode: "qr", qrType: "whatsapp", iconClass: "fa-brands fa-whatsapp", ariaLabel: "Open WhatsApp QR" }
                        ]
                }
        },
        site: {
                brand: {
                        name: "GasGx",
                        homeHref: "/index.html",
                        logoHtml: "<div class=\"gasgx-logo\" aria-label=\"GasGx\"><div class=\"logo-title\"><span class=\"t-gas\">Gas</span><span class=\"t-gx\">Gx</span></div></div>",
                        logoCss: ".gasgx-logo{display:inline-flex;align-items:center;justify-content:flex-start;text-align:left;}.gasgx-logo .logo-title{font-family:'Arial Black','Segoe UI',Arial,sans-serif;font-weight:900;font-size:2rem;line-height:1;letter-spacing:-0.04em;margin:0;white-space:nowrap;}.gasgx-logo .t-gas,.gasgx-logo .t-gx{display:inline-block;line-height:1;}.gasgx-logo .t-gas{color:#5dd62c;text-shadow:0 0 10px rgba(93,214,44,.18);}.gasgx-logo .t-gx{color:#f5f7fa;text-shadow:0 0 10px rgba(255,255,255,.08);}",
                        footerMeta: "Energy-compute infrastructure for mining operators.",
                        copyright: "© 2026 GasGx. All rights reserved."
                },
                features: {
                        backToTopEnabled: true,
                        chatbotEnabled: true,
                        chatApiUrl: "https://mkpcliytqudclkwtewru.supabase.co/functions/v1/site-chat"
                },
                mainAuth: {
                        storageKey: "gasgx-main-auth",
                        signInUrl: "/account/user.html",
                        accountUrl: "/account/account.html",
                        signOutRedirectUrl: "/account/user.html",
                        returnUrlStorageKey: "gx_main_return_url",
                        supabaseUrl: "https://mkpcliytqudclkwtewru.supabase.co",
                        supabaseKey: "sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw",
                        telegramBotName: "gasgx_bot",
                        telegramAuthUrl: "https://mkpcliytqudclkwtewru.supabase.co/functions/v1/auth-telegram",
                        providerRollout: {
                                twitter: false,
                                linkedin: false,
                                telegram: true
                        }
                }
        },
        footer: {
                "contact": {
                        "mode": "qr",
                        "label": "www_gasgx_com",
                        "iconClass": "fa-brands fa-weixin",
                        "qrType": "wechat"
                },
                "privacyPolicy": {
                        "href": "/about/app_privacy_policy.html",
                        "target": "_blank",
                        "rel": "noopener noreferrer",
                        "i18nKey": "privacy_policy"
                },
                "partners": [
                        {
                                "id": "bitmain",
                                "title": "BITMAIN",
                                "href": "https://www.bitmain.com/"
                        },
                        {
                                "id": "bitlink",
                                "title": "BITLINK",
                                "href": "https://www.bitlinkpower.com/"
                        },
                        {
                                "id": "linkmine",
                                "title": "LINKMINE",
                                "href": "https://linkmine.cc/"
                        },
                        {
                                "id": "vman",
                                "title": "VMAN",
                                "href": "https://www.vman-engine.com/"
                        }
                ],
                "socialLinks": [
                        {
                                "id": "x",
                                "enabled": true,
                                "mode": "link",
                                "href": "https://x.com/",
                                "target": "_blank",
                                "rel": "noopener noreferrer",
                                "iconClass": "fa-brands fa-x-twitter",
                                "ariaLabel": "Open X"
                        },
                        {
                                "id": "telegram",
                                "enabled": true,
                                "mode": "link",
                                "href": "https://t.me/",
                                "target": "_blank",
                                "rel": "noopener noreferrer",
                                "iconClass": "fa-brands fa-telegram",
                                "ariaLabel": "Open Telegram"
                        },
                        {
                                "id": "discord",
                                "enabled": true,
                                "mode": "link",
                                "href": "https://discord.com/",
                                "target": "_blank",
                                "rel": "noopener noreferrer",
                                "iconClass": "fa-brands fa-discord",
                                "ariaLabel": "Open Discord"
                        },
                        {
                                "id": "youtube",
                                "enabled": true,
                                "mode": "link",
                                "href": "https://www.youtube.com/",
                                "target": "_blank",
                                "rel": "noopener noreferrer",
                                "iconClass": "fa-brands fa-youtube",
                                "ariaLabel": "Open YouTube"
                        },
                        {
                                "id": "linkedin",
                                "enabled": true,
                                "mode": "link",
                                "href": "https://www.linkedin.com/",
                                "target": "_blank",
                                "rel": "noopener noreferrer",
                                "iconClass": "fa-brands fa-linkedin",
                                "ariaLabel": "Open LinkedIn"
                        },
                        {
                                "id": "facebook",
                                "enabled": true,
                                "mode": "link",
                                "href": "https://www.facebook.com/",
                                "target": "_blank",
                                "rel": "noopener noreferrer",
                                "iconClass": "fa-brands fa-facebook",
                                "ariaLabel": "Open Facebook"
                        },
                        {
                                "id": "tiktok",
                                "enabled": true,
                                "mode": "link",
                                "href": "https://www.tiktok.com/",
                                "target": "_blank",
                                "rel": "noopener noreferrer",
                                "iconClass": "fa-brands fa-tiktok",
                                "ariaLabel": "Open TikTok"
                        },
                        {
                                "id": "wechat",
                                "enabled": true,
                                "mode": "qr",
                                "qrType": "wechat",
                                "iconClass": "fa-brands fa-weixin",
                                "ariaLabel": "Open WeChat QR"
                        },
                        {
                                "id": "whatsapp",
                                "enabled": true,
                                "mode": "link",
                                "href": "https://wa.me/",
                                "target": "_blank",
                                "rel": "noopener noreferrer",
                                "iconClass": "fa-brands fa-whatsapp",
                                "ariaLabel": "Open WhatsApp"
                        },
                        {
                                "id": "instagram",
                                "enabled": true,
                                "mode": "link",
                                "href": "https://www.instagram.com/",
                                "target": "_blank",
                                "rel": "noopener noreferrer",
                                "iconClass": "fa-brands fa-instagram",
                                "ariaLabel": "Open Instagram"
                        },
                        {
                                "id": "xhs",
                                "enabled": true,
                                "mode": "link",
                                "href": "https://www.xiaohongshu.com/",
                                "target": "_blank",
                                "rel": "noopener noreferrer",
                                "text": "XHS",
                                "ariaLabel": "Open Xiaohongshu"
                        },
                        {
                                "id": "video",
                                "enabled": true,
                                "mode": "link",
                                "href": "/news/index.html",
                                "target": "_blank",
                                "rel": "noopener noreferrer",
                                "iconClass": "fa-solid fa-circle-play",
                                "ariaLabel": "Open Video Channel"
                        }
                ]
        }
    };
})();
