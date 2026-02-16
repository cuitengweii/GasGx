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
                                "zh": "新闻资讯",
                                "en": "News"
                        },
                        "path": "/news",
                        "type": "menu",
                        "children": [
                                {
                                        "title": {
                                                "zh": "新闻首页",
                                                "en": "News Home"
                                        },
                                        "path": "/news"
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
                                                "zh": "发电机",
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
                        "type": "mega",
                        "gridCols": "grid-cols-2",
                        "sections": [
                                {
                                        "header": {
                                                "zh": "Applications",
                                                "en": "Applications"
                                        },
                                        "items": [
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
                                        "header": {
                                                "zh": "Success Stories",
                                                "en": "Success Stories"
                                        },
                                        "items": [
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
                                }
                        ]
                },
                {
                        "title": {
                                "zh": "机型库",
                                "en": "Products"
                        },
                        "path": "/products",
                        "type": "mega",
                        "sections": [
                                {
                                        "header": {
                                                "zh": "按功率分类",
                                                "en": "By Power"
                                        },
                                        "items": [
                                                {
                                                        "title": {
                                                                "zh": "小于 500 kW",
                                                                "en": "< 500 kW"
                                                        },
                                                        "path": "/products/power-range/0-500kw"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "500 – 1,000 kW",
                                                                "en": "500 – 1,000 kW"
                                                        },
                                                        "path": "/products/power-range/500-1000kw"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "1 MW 以上",
                                                                "en": "1 MW+"
                                                        },
                                                        "path": "/products/power-range/1mw-plus"
                                                }
                                        ]
                                },
                                {
                                        "header": {
                                                "zh": "按冷却方式",
                                                "en": "By Cooling"
                                        },
                                        "items": [
                                                {
                                                        "title": {
                                                                "zh": "风冷",
                                                                "en": "Air Cooled"
                                                        },
                                                        "path": "/products/cooling/air"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "液冷",
                                                                "en": "Liquid Cooled"
                                                        },
                                                        "path": "/products/cooling/liquid"
                                                }
                                        ]
                                },
                                {
                                        "header": {
                                                "zh": "按气源类型",
                                                "en": "By Gas Type"
                                        },
                                        "items": [
                                                {
                                                        "title": {
                                                                "zh": "天然气",
                                                                "en": "Natural Gas"
                                                        },
                                                        "path": "/products/gas/natural"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "伴生气",
                                                                "en": "Flare Gas"
                                                        },
                                                        "path": "/products/gas/associated"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "低甲烷值气",
                                                                "en": "Low Methane Gas"
                                                        },
                                                        "path": "/products/gas/low-methane"
                                                }
                                        ]
                                },
                                {
                                        "header": {
                                                "zh": "按部署形式",
                                                "en": "By Deployment"
                                        },
                                        "items": [
                                                {
                                                        "title": {
                                                                "zh": "集装箱机组",
                                                                "en": "Containerized"
                                                        },
                                                        "path": "/products/deployment/container"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "一体化机组 AIS",
                                                                "en": "Integrated (AIS)"
                                                        },
                                                        "path": "/products/deployment/ais"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "滑撬式机组",
                                                                "en": "Skid Mounted"
                                                        },
                                                        "path": "/products/deployment/skid"
                                                }
                                        ]
                                },
                                {
                                        "header": {
                                                "zh": "按品牌",
                                                "en": "By Brand"
                                        },
                                        "items": [
                                                {
                                                        "title": {
                                                                "zh": "全部品牌",
                                                                "en": "All Brands"
                                                        },
                                                        "path": "/products/brands"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "中国生产",
                                                                "en": "Made in China"
                                                        },
                                                        "path": "/products/brands/china"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "海外生产",
                                                                "en": "Overseas Brands"
                                                        },
                                                        "path": "/products/brands/overseas"
                                                }
                                        ]
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
                                                        "path": "/rankings/performance"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "高效率榜",
                                                                "en": "High Efficiency"
                                                        },
                                                        "path": "/rankings/efficiency"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "天然气内燃机发电效率排行榜",
                                                                "en": "Elec. Efficiency Rank"
                                                        },
                                                        "path": "/rankings/engine-efficiency"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "天然气内燃机热效率排行榜",
                                                                "en": "Thermal Efficiency Rank"
                                                        },
                                                        "path": "/rankings/thermal-efficiency"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "天然气内燃机耗气量排行榜",
                                                                "en": "Gas Consumption Rank"
                                                        },
                                                        "path": "/rankings/gas-consumption"
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
                                                        "path": "/rankings/roi"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "最低发电成本 LCOE 榜",
                                                                "en": "Lowest LCOE"
                                                        },
                                                        "path": "/rankings/lcoe"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "天然气内燃机折旧排行榜",
                                                                "en": "Depreciation Rank"
                                                        },
                                                        "path": "/rankings/depreciation"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "天然气内燃机投资回报率排行榜",
                                                                "en": "ROI Rank"
                                                        },
                                                        "path": "/rankings/engine-roi"
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
                                                        "path": "/rankings/reliability"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "最长 MTBF 榜",
                                                                "en": "Longest MTBF"
                                                        },
                                                        "path": "/rankings/mtbf"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "天然气内燃机保养时间排行榜",
                                                                "en": "Maintenance Interval Rank"
                                                        },
                                                        "path": "/rankings/maintenance-interval"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "天然气内燃机备件保障排行榜",
                                                                "en": "Spare Parts Rank"
                                                        },
                                                        "path": "/rankings/spare-parts"
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
                                                        "path": "/rankings/emissions"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "天然气内燃机噪音排行榜",
                                                                "en": "Noise Rank"
                                                        },
                                                        "path": "/rankings/noise"
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
                                                        "path": "/rankings/generator"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "天然气内燃机控制系统排行榜",
                                                                "en": "Control System Rank"
                                                        },
                                                        "path": "/rankings/control-system"
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
                                                        "path": "/rankings/usa"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "加拿大市场榜",
                                                                "en": "Canada Market"
                                                        },
                                                        "path": "/rankings/canada"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "中东市场榜",
                                                                "en": "Middle East Market"
                                                        },
                                                        "path": "/rankings/middle-east"
                                                },
                                                {
                                                        "title": {
                                                                "zh": "俄罗斯市场榜",
                                                                "en": "Russia Market"
                                                        },
                                                        "path": "/rankings/russia"
                                                }
                                        ]
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
                        authLogin: "Login",
                        authLogout: "Logout",
                        contactUs: "Contact Us",
                        account: "Account",
                        welcome: "Welcome,",
                        privacyPolicy: "Privacy Policy",
                        languageEnglish: "English",
                        languageChinese: "简体中文"
                },
                zh: {
                        tagline: "天然气发电挖矿助手",
                        footerTagline: "让天然气发电挖矿更简单",
                        authLogin: "登录",
                        authLogout: "退出",
                        contactUs: "联系我们",
                        account: "账号",
                        welcome: "欢迎，",
                        privacyPolicy: "隐私政策",
                        languageEnglish: "English",
                        languageChinese: "简体中文"
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
