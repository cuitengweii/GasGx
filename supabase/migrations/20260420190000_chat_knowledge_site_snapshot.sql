-- Auto-generated GasGx site knowledge snapshot migration.
-- Source scope: public site pages from sitemap + public gas_engine product catalog summary.

insert into public.knowledge_documents (source_type, visibility, language, title, canonical_url, excerpt, content_markdown, source_meta, status, last_crawled_at)
values
    (
        'public_page',
        'public',
        'zh',
        'About GasGx | 天然气发电算力行业研究平台',
        'https://www.gasgx.com/about/company/',
        'GasGx 是全球领先的天然气发电与算力结合的行研平台。我们专注于解决伴生气放散问题，提供从燃气发电机组选型到比特币挖矿及 AI 数据中心建设的全链路可行性分析。',
        '# Connecting Stranded Gas to Global Compute Power

GasGx 是全球领先的天然气发电与算力结合的行研平台。我们专注于解决伴生气放散问题，提供从燃气发电机组选型到比特币挖矿及 AI 数据中心建设的全链路可行性分析。

## /// Our Expertise

我们不仅仅是一个数据库，更是连接能源与数字资产的桥梁。

### Data Insights

收录全球主流燃气发电机组参数（CAT, Jenbacher等），提供针对高硫气、伴生气的设备选型建议与效率对比。

### Compute Integration

专注于比特币挖矿与 AI 高性能计算的能源供给研究。分析算力功耗比，设计集装箱式、浸没式液冷的现场部署方案。

### Financial Models

基于 CAPEX/OPEX 的深度财务模型。涵盖碳信用（Carbon Credits）变现、电力套利策略以及合规性风险评估。

## Ready to Monetize Your Stranded Gas?

GasGx 2026 行业白皮书现已开放。立即联系我们获取针对您的气井或矿场的定制化能源报告。',
        '{"path": "/about/company/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'zh',
        'Contact GasGx | 联系我们',
        'https://www.gasgx.com/about/contact/',
        '无论是项目咨询、白皮书索取还是技术合作，GasGx 团队随时为您提供支持。',
        '# Get in Touch

无论是项目咨询、白皮书索取还是技术合作，GasGx 团队随时为您提供支持。

### Email Us

contact@gasgx.com

### Social Networks

Click icon to scan QR code',
        '{"path": "/about/contact/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx ECM Controller',
        'https://www.gasgx.com/digitalization/ecm/',
        'GasGx ECM Controller demonstrates engine-control diagnostics for speed, ignition, lambda, water temperature, oil pressure, remote diagnostics and fault narratives.',
        '# GasGx ECM Controller

GasGx ECM Controller is a diagnostic and simulation page for gas-engine control, focusing on speed control, ignition, lambda, water temperature, oil pressure and protective trip logic.

## Diagnostic Focus

- Remote diagnostics and log analysis
- ECU and actuator behavior under fault scenarios
- Speed, lambda, MAP, water temperature and oil-pressure trends
- Expert-system style fault narrative for root cause and solution guidance

## Use In GasGx Context

The page positions ECM as a control-layer capability inside GasGx digital operations, helping engineering and O&M teams diagnose genset behavior before field dispatch or onsite troubleshooting.',
        '{"path": "/digitalization/ecm/", "snapshot_kind": "override"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'zh',
        'GasGx IMS | 全球燃气电站物资数字孪生系统',
        'https://www.gasgx.com/digitalization/ims/',
        'GasGx 将中国强大的备件供应链与全球电站运维一线实时耦合。通过数字孪生配件追踪与智能预警，确保每一个节点都拥有“总仓级”的控制力。 GasGx connects China''s spare-parts supply with global site O&M in real time, using digital-twin tracking and predictive alerts.',
        '# 让跨国运维 从未如此简单 Cross-Border O&M Made Effortless

GasGx 将中国强大的备件供应链与全球电站运维一线实时耦合。通过数字孪生配件追踪与智能预警，确保每一个节点都拥有“总仓级”的控制力。 GasGx connects China''s spare-parts supply with global site O&M in real time, using digital-twin tracking and predictive alerts.

## 全球补给桥梁 THE BRIDGE 中国制造，全球云管 China Built, Cloud Operated Globally

我们构建了从中国四大中心仓（上海、深圳、成都、北京）到全球 140+ 运维站点的数字化桥梁。通过 GasGx 出入库系统，每一件备件在离开中国工厂的瞬间，就已经进入了全球站点的在途预报清单。 We built a digital bridge from four China hub warehouses to 140+ global O&M sites. Every spare enters the in-transit forecast list the moment it leaves factory.

#### 中国集采中心 China Central Procurement Hub

统一质检、数字化赋码、HS编码自动匹配 Unified QC, digital tagging, HS-code matching

#### 全球节点一致性 Global Node Consistency

多语言库存对照、跨时区自动同步、当地关税预估 Multilingual inventory map, timezone sync, duty forecast

## 资产拆解视图 Asset Explosion

点击机组任何部位，查看其背后的库存健康度与全球调拨计划 Tap any module to inspect inventory health and global dispatch plans.

#### 整流二极管 Rectifier Diode SKU:51719193

跨境预警补给流 Cross-Border Alert Replenishment

检测到机组累计运行 3500h，已触发中国总仓向拉各斯站点调拨 4 套配件。 At 3500 runtime hours, the system triggered dispatch of 4 kits from China HQ to Lagos.

#### 全球库存一致性摘要 Global Inventory Snapshot

中国总仓 China Central Hub

2,400

海外站点总计 Overseas Total

482

## 终极运维流程 ULTIMATE WORKFLOW

这不只是几个界面。这是整合了机器视觉、GPS 地理围栏、实时报关 API 与多币种清算的超级运维终端。 Beyond dashboards, this is a full operations terminal with machine vision, geofencing, customs APIs and multi-currency settlement.

### #01 智能入库流程 #01 SMART_INBOUND.exe

AI 增强入库工作流 AI-Augmented Inbound Workflow

入库详情复核 Inbound Detail Review

### #02 预警中心 #02 ALERT_CENTER.node

全球跨时区库存熔断预警 Cross-Timezone Inventory Breakpoint Alerts

系统预测未来 72h 内需进行 4000h 中检，目前现场库存：0。中国总仓调拨物资正在清关中。 A 4000-hour inspection is predicted within 72h. On-site stock is zero and emergency parts from China are in customs clearance.

### #03 全域管理中枢 #03 GLOBAL_ADMIN.sys

全域管理员权限镜像 Global Admin Permission Mirror

艾伦_领矿 ALLEN_LINKMINE

跨境运维总控 Cross-Border Ops Master

资产总额 Total Assets

1.2M $

全球用户 Global Users

842

## 重塑运维 Redefine Maintenance

停止在表格中寻找物资，开始在地图上指挥战斗。GasGx 为您的全球燃气电站提供最坚韧的数字化补给线。 Stop searching parts in spreadsheets and command supply on the map. GasGx provides a resilient digital lifeline for global gas power plants.',
        '{"path": "/digitalization/ims/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'zh',
        'GasGx 智维云 - 全球分布式燃气算力电站 O&M 领航者',
        'https://www.gasgx.com/digitalization/platform/',
        '打破传统机械制造与加密挖矿的运维代沟。一套系统，横跨硬件采集、中控大屏、AI诊断与移动工单。让全球十万台散落的机组，如同一台机器般运转。 Bridging the O&M gap between traditional manufacturing and crypto mining. One system across edge hardware, SCADA, AI diagnostics, and mobile dispatch. Make 100,000 scattered gen-sets run as o',
        '# 全链路接管 Full-Stack Takeover 全球分布式燃气算力 Global Distributed Gas Hashrate 超级数字中枢 Super Digital Hub

打破传统机械制造与加密挖矿的运维代沟。一套系统，横跨硬件采集、中控大屏、AI诊断与移动工单。让全球十万台散落的机组，如同一台机器般运转。 Bridging the O&M gap between traditional manufacturing and crypto mining. One system across edge hardware, SCADA, AI diagnostics, and mobile dispatch. Make 100,000 scattered gen-sets run as one.

Trust By Global Crypto Miners & Energy Providers

## 当百年机械制造， 遭遇 毫秒必争的算力狂潮

## When Century-old Manufacturing, Meets Millisecond Crypto Mining

### 主机厂的“失控孤岛”

### OEM''s "Isolated Islands"

机组被卖到得州荒漠、西伯利亚冻土。物理空间的极度分散，让传统的巡检、维保体系瞬间瘫痪。机器运行状态沦为“黑盒”，售后变成了高昂且低效的“跨洋救火”。

Gen-sets sold to Texas deserts or Siberian permafrost. Extreme physical dispersion paralyzes traditional O&M. Machine status becomes a "black box," making after-sales an expensive and inefficient "cross-ocean firefighting."

### 挖矿客户的“生死时速”

### Miners'' "Race Against Time"

比特币挖矿要求 7×24 小时满负荷极限压榨。停机一分钟就是实打实的算力损失与资金蒸发。孤网环境下，极端的负载要求与滞后的维修响应构成了致命矛盾。

Bitcoin mining demands 24/7 limit-pushing operation. A minute of downtime means real hash rate and capital loss. In isolated grids, extreme load demands and delayed maintenance create a fatal contradiction.

## 第一道防线：GasGx 边缘计算网关

## The First Line of Defense: GasGx Edge IoT Gateway

直连底层 PLC 与传感器，强力破除信息孤岛。在极端恶劣环境下，依然能将百种高频数据压缩加密，通过 4G/星链 稳定上云。

Direct connection to underlying PLC and sensors, shattering information silos. In extreme environments, it compresses and encrypts hundreds of high-frequency data points for stable cloud uplink via 4G/Starlink.

#### 广泛的协议兼容

#### Extensive Protocol Compatibility

内置解析引擎，全面兼容 J1939、Modbus RTU/TCP 等工业协议。无缝对接各类主流燃气发电机组 (Jenbacher, Caterpillar, Cummins 等)。

Built-in parsing engine, fully compatible with J1939, Modbus RTU/TCP. Seamlessly integrates with mainstream gas gen-sets (Jenbacher, CAT, Cummins).

#### 边缘侧毫秒级响应

#### Millisecond Edge Response

在设备端即可执行基础的阈值判断。当发生致命过载时，无需等待云端指令，网关直接下发停机保护信号，守护百万资产。

Executes threshold judgments at the device level. During fatal overloads, the gateway issues immediate shutdown signals without waiting for cloud commands, safeguarding millions in assets.

#### 断网续传机制

#### Offline Resumption

针对偏远矿场恶劣网络，内置本地缓存芯片，断网期间数据不丢失，网络恢复后自动进行时序对齐与补传。

Built-in cache chip for harsh remote networks. Data is retained during outages and automatically backfilled upon reconnection.

## 智维控制台：百兆瓦级集群，一屏尽览

## SCADA Console: 100MW+ Fleet at a Glance

告别 100 个现场的折返跑。现在，您可以坐在纽约的办公室，实时查看德州某一台机组 2 分钟前的火花塞点火电压。 (← 手机端请左右滑动查看完整控制台 →)

Say goodbye to running between 100 sites. Now, sit in your New York office and monitor the spark plug voltage of a Texas gen-set from 2 minutes ago. (← Swipe left/right on mobile to view full console →)

## AI 深度诊断引擎： 比经验最老的技师更 懂 你的机器

## AI Deep Diagnostics Engine: Knows Your Machine Better Than Veteran Techs

在伴生气（Flare Gas）或井口孤网发电中，气源的甲烷值（MN）波动极大。传统的固定阈值告警形同虚设。GasGx AI 结合设备机理，针对 Jenbacher, CAT 等大型燃气机 的核心痛点，提供提前数周的“预测性维护（PdM）”。

Flare gas or isolated wellhead power generation faces massive Methane Number (MN) fluctuations. Fixed thresholds fail. GasGx AI provides weeks of Predictive Maintenance (PdM) tailored for large gen-sets like Jenbacher and CAT .

#### 动态甲烷值与爆震预测

#### Dynamic MN & Knock Prediction

持续追踪点火提前角（Timing）与爆震传感器（Knock Sensor）频谱。当气源热值突变引发轻微爆震时，AI先于ECU限载前发现趋势，避免损坏活塞环。

Continuously tracks ignition timing and knock sensor spectrums. Catches trends before ECU derating to prevent piston ring damage when gas composition changes.

#### 各缸排温 (EGT) 偏差分析

#### Cylinder EGT Deviation Analysis

建立 V16/V20 发动机的气缸热力均衡模型。精准识别单个气缸高达 60°C 的温度漂移，判断是“火花塞失效”、“点火线圈老化”还是“混合气阀堵塞”。

Builds thermal equilibrium models for V16/V20 engines. Accurately identifies 60°C drifts in single cylinders to diagnose spark plug failure, coil aging, or valve blockage.

#### 机油压降与滤芯生命周期

#### Oil Pressure Drop & Filter Lifecycle

根据压降曲线斜率，AI 直接推算滤芯剩余寿命百分比，结合 WMS 仓储库存，自动发起“按需保养”工单，告别盲目的定期更换。

Calculates remaining filter lifespan percentage directly from pressure drop slopes. Links with WMS to trigger on-demand maintenance orders, eliminating blind routine changes.

检测到 #10 气缸 排温持续异常，且点火电压需求剧增。判断为火花塞即将彻底击穿。已自动拦截严重宕机风险，并联动 WMS 发出【火花塞 x2】的备料工单至现场终端。

Detected persistent abnormal EGT on #10 CYL with surging ignition voltage demand. Diagnosed as impending spark plug breakdown. Fatal downtime intercepted. WMS order [Spark Plug x2] dispatched to field terminal.

## 全端协同：大脑与四肢的完美咬合

## End-to-End Synergy: Perfect Mesh of Brain and Limbs

当 AI 发现上述异常时，系统将自动生成标准 SOP，并直接派发到运维人员与库管员的移动终端。0 沟通误差，0 跑错路。

When AI detects anomalies, the system auto-generates standard SOPs and dispatches them to mobile terminals of field techs and warehouse keepers. Zero miscommunication, zero wasted trips.

## 财务对齐：打通【气-电-算】链路

## FinOps Alignment: Bridging [Gas-Power-Hashrate]

GasGx 不仅仅看设备指标，更关心您的钱包。系统内置能源测算模块，直观呈现每一方气如何转化为每一度电，最终换算为 BTC 挖矿收益。

GasGx cares about your wallet, not just machine metrics. Built-in energy calculation visualizes how each cubic meter of gas converts to kWh, and ultimately to BTC mining revenue.

## 从井口到算力：全链路数字化接管图景

## From Wellhead to Hashrate: Full-Chain Digital Takeover

GasGx 将荒野上孤立的天然气开采、发电与比特币挖矿物理设施，用数字神经紧密相连。运维人员只需一部移动设备，即可在现场实现对整个复杂业务链的精准掌控。 (← 请左右滑动查看完整场景图景 →)

GasGx connects isolated gas extraction, power generation, and Bitcoin mining facilities in the wilderness with a digital nerve system. Field techs control the entire complex value chain via a single mobile device. (← Swipe left/right to explore full scene →)

## 准备好将您的车队 全面接入数字宇宙了吗？ Ready to Connect Your Fleet to the Digital Universe?

不要再为跨洋救火和无休止的机器宕机支付昂贵的代价。现在就预约演示，看看 GasGx 如何在 30 天内重塑您的全球运维体系。

Stop paying for cross-ocean firefighting and endless downtime. Book a demo now and see how GasGx reshapes your global O&M in 30 days.',
        '{"path": "/digitalization/platform/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'zh',
        'GasGx Sales Full-Link Closed-Loop System',
        'https://www.gasgx.com/digitalization/sales/',
        '为什么选择统一闭环系统？打破部门壁垒，让数据流转毫无断点。从商机触达到最终交付，全局视角把控进度风险，用数据驱动每一个关键里程碑。',
        '# 解决从 建档到运维 的全链路推进

为什么选择统一闭环系统？打破部门壁垒，让数据流转毫无断点。从商机触达到最终交付，全局视角把控进度风险，用数据驱动每一个关键里程碑。

## 13 节点销售流水线总览

实时追踪单据状态，精准定位处理瓶颈

### 总流水线模式 (当前压力分布)

### 客户档案中心

#### 需求获取与确认

从采集到确认全状态记录，强关联客户主体与商机池，防止需求脱节。

#### 报价流转与合同

报价草稿到确认自动流转，无缝对接签约合同与定金付款里程碑。

#### 交付与运维执行

排产、验收、尾款、物流、部署直至运维支持，后半程链路严密监控。

## 下一步动作驱动 (Action Queue)

告别被动等待，系统智能推送近期阶段待办与活动提醒。

#### 跟进 Global Ind. 出厂验收报告

#### 确认 TechVision 最终报价单

## 流程收口与风险控制

保证数据口径一致，区分当前运作与历史追溯。

项目完结后转入历史池，确保当前工作台数据高信噪比，同时保留全链路追溯能力。

控制误操作风险。异常单据作废收口，特殊情况可鉴权恢复，保持报表口径稳定。

阶段推进时，自动保存各负责人、完成时间及备注，形成不可篡改的操作快照。',
        '{"path": "/digitalization/sales/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog',
        'https://www.gasgx.com/products/',
        'GasGx product snapshot for all public gas-engine products with 89 matched models.',
        '# GasGx Product Catalog

GasGx public gas-engine catalog snapshot for `/products/`.

Page scope: all public gas-engine products.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '{"path": "/products/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog',
        'https://www.gasgx.com/products/brands/',
        'GasGx product snapshot for the public product catalog page scope with 89 matched models.',
        '# GasGx Product Catalog

GasGx public gas-engine catalog snapshot for `/products/brands/`.

Page scope: the public product catalog page scope.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '{"path": "/products/brands/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | China-made brands',
        'https://www.gasgx.com/products/brands/china/',
        'GasGx product snapshot for China-made brands with 89 matched models.',
        '# GasGx Product Catalog | China-made brands

GasGx public gas-engine catalog snapshot for `/products/brands/china/`.

Page scope: China-made brands.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '{"path": "/products/brands/china/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | Overseas brands',
        'https://www.gasgx.com/products/brands/overseas/',
        'GasGx product snapshot for Overseas brands with 89 matched models.',
        '# GasGx Product Catalog | Overseas brands

GasGx public gas-engine catalog snapshot for `/products/brands/overseas/`.

Page scope: Overseas brands.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '{"path": "/products/brands/overseas/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | Air Cooling',
        'https://www.gasgx.com/products/cooling/air/',
        'GasGx product snapshot for Air Cooling with 89 matched models.',
        '# GasGx Product Catalog | Air Cooling

GasGx public gas-engine catalog snapshot for `/products/cooling/air/`.

Page scope: Air Cooling.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '{"path": "/products/cooling/air/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | Liquid Cooling',
        'https://www.gasgx.com/products/cooling/liquid/',
        'GasGx product snapshot for Liquid Cooling with 89 matched models.',
        '# GasGx Product Catalog | Liquid Cooling

GasGx public gas-engine catalog snapshot for `/products/cooling/liquid/`.

Page scope: Liquid Cooling.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '{"path": "/products/cooling/liquid/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | AIS Integrated',
        'https://www.gasgx.com/products/deployment/ais/',
        'GasGx product snapshot for AIS Integrated with 14 matched models.',
        '# GasGx Product Catalog | AIS Integrated

GasGx public gas-engine catalog snapshot for `/products/deployment/ais/`.

Page scope: AIS Integrated.

## Portfolio Summary

- Matched models: 14

- Power range: 500 kW to 900 kW

- Efficiency range: 38.08% to 43.5%

- Main gas sources: 天然气

- Cooling methods: 液冷

- Deployment types: 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 曼海姆（MWM）, 威曼（VMAN）, 博杜安（Baudouin）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）, 康明斯（Cummins）, 卡特彼勒（Caterpillar）, 潍柴动力（WEICHAI）, 上柴（SHANGCHAI）, 西门子（Siemens）

- Common applications: 大型发电机组, 中小型CHP系统, 同缸径平台旗舰型号, 高压力条件下运行，多种燃料灵活使用, 煤层气、天然气、沼气、伴生气、丙烷等多种燃料, 中型电站项目, 中小型工业备电, 大功率发电项目

- Main series: TCG 3016, VGF, 3系列, DT30/YDT30, DT30+/YDT30, K38N

## Representative Models

- 康明斯（Cummins） | K38N-G8 | K38N | 900 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 中型电站项目

- 瓦克夏（Waukesha） | VGF | VGF | 800 kW | 41.2% | 天然气 | 液冷 | 一体化机组AIS | 高压力条件下运行，多种燃料灵活使用

- 曼海姆（MWM） | TCG 3016 V16 | TCG 3016 | 800 kW | 43.5% | 天然气 | 液冷 | 一体化机组AIS | 中小型CHP系统

- 卡特彼勒（Caterpillar） | CG132B-16 | CG132B | 800 kW | 43.5% | 天然气 | 液冷 | 一体化机组AIS | 中小型工业备电

- 潍柴动力（WEICHAI） | WPG1000*7NG | M33系列 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 博杜安（Baudouin） | 12M33 | 12M33 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 颜巴赫（Jenbacher） | J320 | 3系列 | 795 kW | 40.7% | 天然气 | 液冷 | 一体化机组AIS | 煤层气、天然气、沼气、伴生气、丙烷等多种燃料

- 斗山（Doosan） | DP222CA V12 | DP222CA | 727 kW | 40% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 曼海姆（MWM） | TCG 3016 V12 | TCG 3016 | 600 kW | 43.2% | 天然气 | 液冷 | 一体化机组AIS | 中小型CHP系统

- 上柴（SHANGCHAI） | SC27G | G系列 | 600 kW | 40% | 天然气 | 液冷 | 一体化机组AIS | 大功率发电项目

- 博杜安（Baudouin） | 12M26 | 12M26 | 600 kW | 39.5% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 威曼（VMAN） | DT30+/YDT30 | DT30+/YDT30 | 550 kW | 40.04% | 天然气 | 液冷 | 一体化机组AIS | 同缸径平台旗舰型号

- 西门子（Siemens） | SGE-24HM | SGE-24HM | 520 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 中小型发电机组

- 威曼（VMAN） | DT30/YDT30 | DT30/YDT30 | 500 kW | 38.08% | 天然气 | 液冷 | 一体化机组AIS | 同缸径平台旗舰型号',
        '{"path": "/products/deployment/ais/", "snapshot_kind": "gas_engine_catalog", "matched_models": 14}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | Containerized',
        'https://www.gasgx.com/products/deployment/container/',
        'GasGx product snapshot for Containerized with 89 matched models.',
        '# GasGx Product Catalog | Containerized

GasGx public gas-engine catalog snapshot for `/products/deployment/container/`.

Page scope: Containerized.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '{"path": "/products/deployment/container/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | Skid Mounted',
        'https://www.gasgx.com/products/deployment/skid/',
        'GasGx product snapshot for Skid Mounted with 89 matched models.',
        '# GasGx Product Catalog | Skid Mounted

GasGx public gas-engine catalog snapshot for `/products/deployment/skid/`.

Page scope: Skid Mounted.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '{"path": "/products/deployment/skid/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog',
        'https://www.gasgx.com/products/gas/',
        'GasGx product snapshot for the public product catalog page scope with 89 matched models.',
        '# GasGx Product Catalog

GasGx public gas-engine catalog snapshot for `/products/gas/`.

Page scope: the public product catalog page scope.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '{"path": "/products/gas/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | Associated Gas',
        'https://www.gasgx.com/products/gas/associated/',
        'GasGx product snapshot for Associated Gas with 89 matched models.',
        '# GasGx Product Catalog | Associated Gas

GasGx public gas-engine catalog snapshot for `/products/gas/associated/`.

Page scope: Associated Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '{"path": "/products/gas/associated/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog',
        'https://www.gasgx.com/products/gas/brands/',
        'GasGx product snapshot for the public product catalog page scope with 89 matched models.',
        '# GasGx Product Catalog

GasGx public gas-engine catalog snapshot for `/products/gas/brands/`.

Page scope: the public product catalog page scope.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '{"path": "/products/gas/brands/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | China-made brands',
        'https://www.gasgx.com/products/gas/brands/china/',
        'GasGx product snapshot for China-made brands with 89 matched models.',
        '# GasGx Product Catalog | China-made brands

GasGx public gas-engine catalog snapshot for `/products/gas/brands/china/`.

Page scope: China-made brands.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '{"path": "/products/gas/brands/china/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | Overseas brands',
        'https://www.gasgx.com/products/gas/brands/overseas/',
        'GasGx product snapshot for Overseas brands with 89 matched models.',
        '# GasGx Product Catalog | Overseas brands

GasGx public gas-engine catalog snapshot for `/products/gas/brands/overseas/`.

Page scope: Overseas brands.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '{"path": "/products/gas/brands/overseas/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | Air Cooling',
        'https://www.gasgx.com/products/gas/cooling/air/',
        'GasGx product snapshot for Air Cooling with 89 matched models.',
        '# GasGx Product Catalog | Air Cooling

GasGx public gas-engine catalog snapshot for `/products/gas/cooling/air/`.

Page scope: Air Cooling.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '{"path": "/products/gas/cooling/air/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | Liquid Cooling',
        'https://www.gasgx.com/products/gas/cooling/liquid/',
        'GasGx product snapshot for Liquid Cooling with 89 matched models.',
        '# GasGx Product Catalog | Liquid Cooling

GasGx public gas-engine catalog snapshot for `/products/gas/cooling/liquid/`.

Page scope: Liquid Cooling.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '{"path": "/products/gas/cooling/liquid/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | AIS Integrated',
        'https://www.gasgx.com/products/gas/deployment/ais/',
        'GasGx product snapshot for AIS Integrated with 14 matched models.',
        '# GasGx Product Catalog | AIS Integrated

GasGx public gas-engine catalog snapshot for `/products/gas/deployment/ais/`.

Page scope: AIS Integrated.

## Portfolio Summary

- Matched models: 14

- Power range: 500 kW to 900 kW

- Efficiency range: 38.08% to 43.5%

- Main gas sources: 天然气

- Cooling methods: 液冷

- Deployment types: 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 曼海姆（MWM）, 威曼（VMAN）, 博杜安（Baudouin）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）, 康明斯（Cummins）, 卡特彼勒（Caterpillar）, 潍柴动力（WEICHAI）, 上柴（SHANGCHAI）, 西门子（Siemens）

- Common applications: 大型发电机组, 中小型CHP系统, 同缸径平台旗舰型号, 高压力条件下运行，多种燃料灵活使用, 煤层气、天然气、沼气、伴生气、丙烷等多种燃料, 中型电站项目, 中小型工业备电, 大功率发电项目

- Main series: TCG 3016, VGF, 3系列, DT30/YDT30, DT30+/YDT30, K38N

## Representative Models

- 康明斯（Cummins） | K38N-G8 | K38N | 900 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 中型电站项目

- 瓦克夏（Waukesha） | VGF | VGF | 800 kW | 41.2% | 天然气 | 液冷 | 一体化机组AIS | 高压力条件下运行，多种燃料灵活使用

- 曼海姆（MWM） | TCG 3016 V16 | TCG 3016 | 800 kW | 43.5% | 天然气 | 液冷 | 一体化机组AIS | 中小型CHP系统

- 卡特彼勒（Caterpillar） | CG132B-16 | CG132B | 800 kW | 43.5% | 天然气 | 液冷 | 一体化机组AIS | 中小型工业备电

- 潍柴动力（WEICHAI） | WPG1000*7NG | M33系列 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 博杜安（Baudouin） | 12M33 | 12M33 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 颜巴赫（Jenbacher） | J320 | 3系列 | 795 kW | 40.7% | 天然气 | 液冷 | 一体化机组AIS | 煤层气、天然气、沼气、伴生气、丙烷等多种燃料

- 斗山（Doosan） | DP222CA V12 | DP222CA | 727 kW | 40% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 曼海姆（MWM） | TCG 3016 V12 | TCG 3016 | 600 kW | 43.2% | 天然气 | 液冷 | 一体化机组AIS | 中小型CHP系统

- 上柴（SHANGCHAI） | SC27G | G系列 | 600 kW | 40% | 天然气 | 液冷 | 一体化机组AIS | 大功率发电项目

- 博杜安（Baudouin） | 12M26 | 12M26 | 600 kW | 39.5% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 威曼（VMAN） | DT30+/YDT30 | DT30+/YDT30 | 550 kW | 40.04% | 天然气 | 液冷 | 一体化机组AIS | 同缸径平台旗舰型号

- 西门子（Siemens） | SGE-24HM | SGE-24HM | 520 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 中小型发电机组

- 威曼（VMAN） | DT30/YDT30 | DT30/YDT30 | 500 kW | 38.08% | 天然气 | 液冷 | 一体化机组AIS | 同缸径平台旗舰型号',
        '{"path": "/products/gas/deployment/ais/", "snapshot_kind": "gas_engine_catalog", "matched_models": 14}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | Containerized',
        'https://www.gasgx.com/products/gas/deployment/container/',
        'GasGx product snapshot for Containerized with 89 matched models.',
        '# GasGx Product Catalog | Containerized

GasGx public gas-engine catalog snapshot for `/products/gas/deployment/container/`.

Page scope: Containerized.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '{"path": "/products/gas/deployment/container/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | Skid Mounted',
        'https://www.gasgx.com/products/gas/deployment/skid/',
        'GasGx product snapshot for Skid Mounted with 89 matched models.',
        '# GasGx Product Catalog | Skid Mounted

GasGx public gas-engine catalog snapshot for `/products/gas/deployment/skid/`.

Page scope: Skid Mounted.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '{"path": "/products/gas/deployment/skid/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | Associated Gas',
        'https://www.gasgx.com/products/gas/gas/associated/',
        'GasGx product snapshot for Associated Gas with 89 matched models.',
        '# GasGx Product Catalog | Associated Gas

GasGx public gas-engine catalog snapshot for `/products/gas/gas/associated/`.

Page scope: Associated Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '{"path": "/products/gas/gas/associated/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | Low Methane Gas',
        'https://www.gasgx.com/products/gas/gas/low-methane/',
        'GasGx product snapshot for Low Methane Gas with 89 matched models.',
        '# GasGx Product Catalog | Low Methane Gas

GasGx public gas-engine catalog snapshot for `/products/gas/gas/low-methane/`.

Page scope: Low Methane Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '{"path": "/products/gas/gas/low-methane/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | Natural Gas',
        'https://www.gasgx.com/products/gas/gas/natural/',
        'GasGx product snapshot for Natural Gas with 89 matched models.',
        '# GasGx Product Catalog | Natural Gas

GasGx public gas-engine catalog snapshot for `/products/gas/gas/natural/`.

Page scope: Natural Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '{"path": "/products/gas/gas/natural/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | Low Methane Gas',
        'https://www.gasgx.com/products/gas/low-methane/',
        'GasGx product snapshot for Low Methane Gas with 89 matched models.',
        '# GasGx Product Catalog | Low Methane Gas

GasGx public gas-engine catalog snapshot for `/products/gas/low-methane/`.

Page scope: Low Methane Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '{"path": "/products/gas/low-methane/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | Natural Gas',
        'https://www.gasgx.com/products/gas/natural/',
        'GasGx product snapshot for Natural Gas with 89 matched models.',
        '# GasGx Product Catalog | Natural Gas

GasGx public gas-engine catalog snapshot for `/products/gas/natural/`.

Page scope: Natural Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '{"path": "/products/gas/natural/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | 0-500 kW',
        'https://www.gasgx.com/products/gas/power-range/0-500kw/',
        'GasGx product snapshot for 0-500 kW with 36 matched models.',
        '# GasGx Product Catalog | 0-500 kW

GasGx public gas-engine catalog snapshot for `/products/gas/power-range/0-500kw/`.

Page scope: 0-500 kW.

## Portfolio Summary

- Matched models: 36

- Power range: 41.5 kW to 450 kW

- Efficiency range: 37.8% to 42.9%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 撬装式机组

- Brand origins: 海外生产, 中国生产

- Representative brands: 道依茨（Deutz）, 潍柴动力（WEICHAI）, 威曼（VMAN）, 博杜安（Baudouin）, 锡柴（XICHAI）, 康明斯（Cummins）, 斗山（Doosan）, 上柴（SHANGCHAI）, 汉马（HANMA）, 颜巴赫（Jenbacher）

- Common applications: 中小型发电机组, 商用车辆、发电机组, 小型发电机组, 大型发电机组, 小型发电机组、工程机械, 中小功率发电, 煤层气、天然气、沼气等多种燃料, 中小型CHP系统

- Main series: WP系列, 铂威系列, TCG 2015, CM6T, G 2.2 L3, 2系列

## Representative Models

- 康明斯（Cummins） | K19N-G4 | K19N | 450 kW | 40% | 天然气 | 液冷 | 撬装式机组 | 油田伴生气发电

- 曼海姆（MWM） | TCG 3016 V08 | TCG 3016 | 400 kW | 42.9% | 天然气 | 液冷 | 撬装式机组 | 中小型CHP系统

- 潍柴动力（WEICHAI） | WPG500*7NG | M33系列 | 400 kW | 40% | 天然气 | 液冷 | 撬装式机组 | 中型发电机组

- 博杜安（Baudouin） | 6M26 | 6M26 | 400 kW | 38.5% | 天然气 | 液冷 | 撬装式机组 | 中小型发电机组

- 康明斯（Cummins） | X15N (2024) | X15N | 373 kW | 41% | 天然气 | 液冷 | 撬装式机组 | 重型卡车、发电机组

- 颜巴赫（Jenbacher） | J220 | 2系列 | 360 kW | 40.2% | 天然气 | 液冷 | 撬装式机组 | 煤层气、天然气、沼气等多种燃料

- 威曼（VMAN） | DT22/YDT22 | DT22/YDT22 | 350 kW | 38.08% | 天然气 | 液冷 | 撬装式机组 | 中小型分布式能源

- 博杜安（Baudouin） | 6M33 | 6M33 | 350 kW | 39% | 天然气 | 液冷 | 撬装式机组 | 中小型发电机组

- 汉马（HANMA） | CM6T28 | CM6T | 350 kW | 39.5% | 天然气 | 液冷+风冷 | 撬装式机组 | 中小功率发电

- 锡柴（XICHAI） | 6DK1 | 铂威系列 | 320 kW | 38.5% | 天然气 | 液冷 | 撬装式机组 | 商用车辆、发电机组

- 斗山（Doosan） | GV222TI V12 | GV222TI | 315 kW | 39% | 天然气 | 液冷 | 撬装式机组 | 大型发电机组

- 道依茨（Deutz） | TCD 12.0 V6 | TCD 12.0 V6 | 300 kW | 41% | 天然气 | 液冷 | 撬装式机组 | 大型发电机组

- 锡柴（XICHAI） | 6DH1 | 铂威系列 | 293 kW | 38.2% | 天然气 | 液冷 | 撬装式机组 | 商用车辆、发电机组

- 玉柴（YUCHAI） | YC6K360LN-D30 | YC6K | 265 kW | 39.5% | 天然气 | 液冷 | 撬装式机组 | 中小型发电项目',
        '{"path": "/products/gas/power-range/0-500kw/", "snapshot_kind": "gas_engine_catalog", "matched_models": 36}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | 1 MW+',
        'https://www.gasgx.com/products/gas/power-range/1mw-plus/',
        'GasGx product snapshot for 1 MW+ with 39 matched models.',
        '# GasGx Product Catalog | 1 MW+

GasGx public gas-engine catalog snapshot for `/products/gas/power-range/1mw-plus/`.

Page scope: 1 MW+.

## Portfolio Summary

- Matched models: 39

- Power range: 1000 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组

- Brand origins: 海外生产, 中国生产

- Representative brands: 贝克休斯（Baker Hughes）, 西门子（Siemens）, 瓦克夏（Waukesha）, 曼海姆（MWM）, 威曼（VMAN）, 颜巴赫（Jenbacher）, 卡特彼勒（Caterpillar）, 潍柴动力（WEICHAI）, MTU（罗罗动力）, 玉柴（YUCHAI）

- Common applications: 工业发电, 高压力条件下运行，多种燃料灵活使用, 煤层气、天然气、沼气、伴生气等多种燃料, 大型发电机组, 集装箱式电站，空间受限场景, 大型电站专用, 天然气专用, 中小型CHP系统

- Main series: HND重载系列, 275GL+, Series 4000, VHP, 4系列, 6系列

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '{"path": "/products/gas/power-range/1mw-plus/", "snapshot_kind": "gas_engine_catalog", "matched_models": 39}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | 500-1000 kW',
        'https://www.gasgx.com/products/gas/power-range/500-1000kw/',
        'GasGx product snapshot for 500-1000 kW with 14 matched models.',
        '# GasGx Product Catalog | 500-1000 kW

GasGx public gas-engine catalog snapshot for `/products/gas/power-range/500-1000kw/`.

Page scope: 500-1000 kW.

## Portfolio Summary

- Matched models: 14

- Power range: 500 kW to 900 kW

- Efficiency range: 38.08% to 43.5%

- Main gas sources: 天然气

- Cooling methods: 液冷

- Deployment types: 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 曼海姆（MWM）, 威曼（VMAN）, 博杜安（Baudouin）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）, 康明斯（Cummins）, 卡特彼勒（Caterpillar）, 潍柴动力（WEICHAI）, 上柴（SHANGCHAI）, 西门子（Siemens）

- Common applications: 大型发电机组, 中小型CHP系统, 同缸径平台旗舰型号, 高压力条件下运行，多种燃料灵活使用, 煤层气、天然气、沼气、伴生气、丙烷等多种燃料, 中型电站项目, 中小型工业备电, 大功率发电项目

- Main series: TCG 3016, VGF, 3系列, DT30/YDT30, DT30+/YDT30, K38N

## Representative Models

- 康明斯（Cummins） | K38N-G8 | K38N | 900 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 中型电站项目

- 瓦克夏（Waukesha） | VGF | VGF | 800 kW | 41.2% | 天然气 | 液冷 | 一体化机组AIS | 高压力条件下运行，多种燃料灵活使用

- 曼海姆（MWM） | TCG 3016 V16 | TCG 3016 | 800 kW | 43.5% | 天然气 | 液冷 | 一体化机组AIS | 中小型CHP系统

- 卡特彼勒（Caterpillar） | CG132B-16 | CG132B | 800 kW | 43.5% | 天然气 | 液冷 | 一体化机组AIS | 中小型工业备电

- 潍柴动力（WEICHAI） | WPG1000*7NG | M33系列 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 博杜安（Baudouin） | 12M33 | 12M33 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 颜巴赫（Jenbacher） | J320 | 3系列 | 795 kW | 40.7% | 天然气 | 液冷 | 一体化机组AIS | 煤层气、天然气、沼气、伴生气、丙烷等多种燃料

- 斗山（Doosan） | DP222CA V12 | DP222CA | 727 kW | 40% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 曼海姆（MWM） | TCG 3016 V12 | TCG 3016 | 600 kW | 43.2% | 天然气 | 液冷 | 一体化机组AIS | 中小型CHP系统

- 上柴（SHANGCHAI） | SC27G | G系列 | 600 kW | 40% | 天然气 | 液冷 | 一体化机组AIS | 大功率发电项目

- 博杜安（Baudouin） | 12M26 | 12M26 | 600 kW | 39.5% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 威曼（VMAN） | DT30+/YDT30 | DT30+/YDT30 | 550 kW | 40.04% | 天然气 | 液冷 | 一体化机组AIS | 同缸径平台旗舰型号

- 西门子（Siemens） | SGE-24HM | SGE-24HM | 520 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 中小型发电机组

- 威曼（VMAN） | DT30/YDT30 | DT30/YDT30 | 500 kW | 38.08% | 天然气 | 液冷 | 一体化机组AIS | 同缸径平台旗舰型号',
        '{"path": "/products/gas/power-range/500-1000kw/", "snapshot_kind": "gas_engine_catalog", "matched_models": 14}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | 0-500 kW',
        'https://www.gasgx.com/products/power-range/0-500kw/',
        'GasGx product snapshot for 0-500 kW with 36 matched models.',
        '# GasGx Product Catalog | 0-500 kW

GasGx public gas-engine catalog snapshot for `/products/power-range/0-500kw/`.

Page scope: 0-500 kW.

## Portfolio Summary

- Matched models: 36

- Power range: 41.5 kW to 450 kW

- Efficiency range: 37.8% to 42.9%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 撬装式机组

- Brand origins: 海外生产, 中国生产

- Representative brands: 道依茨（Deutz）, 潍柴动力（WEICHAI）, 威曼（VMAN）, 博杜安（Baudouin）, 锡柴（XICHAI）, 康明斯（Cummins）, 斗山（Doosan）, 上柴（SHANGCHAI）, 汉马（HANMA）, 颜巴赫（Jenbacher）

- Common applications: 中小型发电机组, 商用车辆、发电机组, 小型发电机组, 大型发电机组, 小型发电机组、工程机械, 中小功率发电, 煤层气、天然气、沼气等多种燃料, 中小型CHP系统

- Main series: WP系列, 铂威系列, TCG 2015, CM6T, G 2.2 L3, 2系列

## Representative Models

- 康明斯（Cummins） | K19N-G4 | K19N | 450 kW | 40% | 天然气 | 液冷 | 撬装式机组 | 油田伴生气发电

- 曼海姆（MWM） | TCG 3016 V08 | TCG 3016 | 400 kW | 42.9% | 天然气 | 液冷 | 撬装式机组 | 中小型CHP系统

- 潍柴动力（WEICHAI） | WPG500*7NG | M33系列 | 400 kW | 40% | 天然气 | 液冷 | 撬装式机组 | 中型发电机组

- 博杜安（Baudouin） | 6M26 | 6M26 | 400 kW | 38.5% | 天然气 | 液冷 | 撬装式机组 | 中小型发电机组

- 康明斯（Cummins） | X15N (2024) | X15N | 373 kW | 41% | 天然气 | 液冷 | 撬装式机组 | 重型卡车、发电机组

- 颜巴赫（Jenbacher） | J220 | 2系列 | 360 kW | 40.2% | 天然气 | 液冷 | 撬装式机组 | 煤层气、天然气、沼气等多种燃料

- 威曼（VMAN） | DT22/YDT22 | DT22/YDT22 | 350 kW | 38.08% | 天然气 | 液冷 | 撬装式机组 | 中小型分布式能源

- 博杜安（Baudouin） | 6M33 | 6M33 | 350 kW | 39% | 天然气 | 液冷 | 撬装式机组 | 中小型发电机组

- 汉马（HANMA） | CM6T28 | CM6T | 350 kW | 39.5% | 天然气 | 液冷+风冷 | 撬装式机组 | 中小功率发电

- 锡柴（XICHAI） | 6DK1 | 铂威系列 | 320 kW | 38.5% | 天然气 | 液冷 | 撬装式机组 | 商用车辆、发电机组

- 斗山（Doosan） | GV222TI V12 | GV222TI | 315 kW | 39% | 天然气 | 液冷 | 撬装式机组 | 大型发电机组

- 道依茨（Deutz） | TCD 12.0 V6 | TCD 12.0 V6 | 300 kW | 41% | 天然气 | 液冷 | 撬装式机组 | 大型发电机组

- 锡柴（XICHAI） | 6DH1 | 铂威系列 | 293 kW | 38.2% | 天然气 | 液冷 | 撬装式机组 | 商用车辆、发电机组

- 玉柴（YUCHAI） | YC6K360LN-D30 | YC6K | 265 kW | 39.5% | 天然气 | 液冷 | 撬装式机组 | 中小型发电项目',
        '{"path": "/products/power-range/0-500kw/", "snapshot_kind": "gas_engine_catalog", "matched_models": 36}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | 1 MW+',
        'https://www.gasgx.com/products/power-range/1mw-plus/',
        'GasGx product snapshot for 1 MW+ with 39 matched models.',
        '# GasGx Product Catalog | 1 MW+

GasGx public gas-engine catalog snapshot for `/products/power-range/1mw-plus/`.

Page scope: 1 MW+.

## Portfolio Summary

- Matched models: 39

- Power range: 1000 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组

- Brand origins: 海外生产, 中国生产

- Representative brands: 贝克休斯（Baker Hughes）, 西门子（Siemens）, 瓦克夏（Waukesha）, 曼海姆（MWM）, 威曼（VMAN）, 颜巴赫（Jenbacher）, 卡特彼勒（Caterpillar）, 潍柴动力（WEICHAI）, MTU（罗罗动力）, 玉柴（YUCHAI）

- Common applications: 工业发电, 高压力条件下运行，多种燃料灵活使用, 煤层气、天然气、沼气、伴生气等多种燃料, 大型发电机组, 集装箱式电站，空间受限场景, 大型电站专用, 天然气专用, 中小型CHP系统

- Main series: HND重载系列, 275GL+, Series 4000, VHP, 4系列, 6系列

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '{"path": "/products/power-range/1mw-plus/", "snapshot_kind": "gas_engine_catalog", "matched_models": 39}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx Product Catalog | 500-1000 kW',
        'https://www.gasgx.com/products/power-range/500-1000kw/',
        'GasGx product snapshot for 500-1000 kW with 14 matched models.',
        '# GasGx Product Catalog | 500-1000 kW

GasGx public gas-engine catalog snapshot for `/products/power-range/500-1000kw/`.

Page scope: 500-1000 kW.

## Portfolio Summary

- Matched models: 14

- Power range: 500 kW to 900 kW

- Efficiency range: 38.08% to 43.5%

- Main gas sources: 天然气

- Cooling methods: 液冷

- Deployment types: 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 曼海姆（MWM）, 威曼（VMAN）, 博杜安（Baudouin）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）, 康明斯（Cummins）, 卡特彼勒（Caterpillar）, 潍柴动力（WEICHAI）, 上柴（SHANGCHAI）, 西门子（Siemens）

- Common applications: 大型发电机组, 中小型CHP系统, 同缸径平台旗舰型号, 高压力条件下运行，多种燃料灵活使用, 煤层气、天然气、沼气、伴生气、丙烷等多种燃料, 中型电站项目, 中小型工业备电, 大功率发电项目

- Main series: TCG 3016, VGF, 3系列, DT30/YDT30, DT30+/YDT30, K38N

## Representative Models

- 康明斯（Cummins） | K38N-G8 | K38N | 900 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 中型电站项目

- 瓦克夏（Waukesha） | VGF | VGF | 800 kW | 41.2% | 天然气 | 液冷 | 一体化机组AIS | 高压力条件下运行，多种燃料灵活使用

- 曼海姆（MWM） | TCG 3016 V16 | TCG 3016 | 800 kW | 43.5% | 天然气 | 液冷 | 一体化机组AIS | 中小型CHP系统

- 卡特彼勒（Caterpillar） | CG132B-16 | CG132B | 800 kW | 43.5% | 天然气 | 液冷 | 一体化机组AIS | 中小型工业备电

- 潍柴动力（WEICHAI） | WPG1000*7NG | M33系列 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 博杜安（Baudouin） | 12M33 | 12M33 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 颜巴赫（Jenbacher） | J320 | 3系列 | 795 kW | 40.7% | 天然气 | 液冷 | 一体化机组AIS | 煤层气、天然气、沼气、伴生气、丙烷等多种燃料

- 斗山（Doosan） | DP222CA V12 | DP222CA | 727 kW | 40% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 曼海姆（MWM） | TCG 3016 V12 | TCG 3016 | 600 kW | 43.2% | 天然气 | 液冷 | 一体化机组AIS | 中小型CHP系统

- 上柴（SHANGCHAI） | SC27G | G系列 | 600 kW | 40% | 天然气 | 液冷 | 一体化机组AIS | 大功率发电项目

- 博杜安（Baudouin） | 12M26 | 12M26 | 600 kW | 39.5% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 威曼（VMAN） | DT30+/YDT30 | DT30+/YDT30 | 550 kW | 40.04% | 天然气 | 液冷 | 一体化机组AIS | 同缸径平台旗舰型号

- 西门子（Siemens） | SGE-24HM | SGE-24HM | 520 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 中小型发电机组

- 威曼（VMAN） | DT30/YDT30 | DT30/YDT30 | 500 kW | 38.08% | 天然气 | 液冷 | 一体化机组AIS | 同缸径平台旗舰型号',
        '{"path": "/products/power-range/500-1000kw/", "snapshot_kind": "gas_engine_catalog", "matched_models": 14}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx - Generator Rankings',
        'https://www.gasgx.com/rankings/',
        'Comprehensive evaluation system based on real measured data and market models.',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '{"path": "/rankings/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx - Generator Rankings',
        'https://www.gasgx.com/rankings/canada/',
        'Comprehensive evaluation system based on real measured data and market models.',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '{"path": "/rankings/canada/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx - Generator Rankings',
        'https://www.gasgx.com/rankings/control-system/',
        'Comprehensive evaluation system based on real measured data and market models.',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '{"path": "/rankings/control-system/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx - Generator Rankings',
        'https://www.gasgx.com/rankings/depreciation/',
        'Comprehensive evaluation system based on real measured data and market models.',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '{"path": "/rankings/depreciation/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx - Generator Rankings',
        'https://www.gasgx.com/rankings/efficiency/',
        'Comprehensive evaluation system based on real measured data and market models.',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '{"path": "/rankings/efficiency/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx - Generator Rankings',
        'https://www.gasgx.com/rankings/emissions/',
        'Comprehensive evaluation system based on real measured data and market models.',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '{"path": "/rankings/emissions/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx - Generator Rankings',
        'https://www.gasgx.com/rankings/engine-efficiency/',
        'Comprehensive evaluation system based on real measured data and market models.',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '{"path": "/rankings/engine-efficiency/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx - Generator Rankings',
        'https://www.gasgx.com/rankings/engine-roi/',
        'Comprehensive evaluation system based on real measured data and market models.',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '{"path": "/rankings/engine-roi/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx - Generator Rankings',
        'https://www.gasgx.com/rankings/gas-consumption/',
        'Comprehensive evaluation system based on real measured data and market models.',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '{"path": "/rankings/gas-consumption/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx - Generator Rankings',
        'https://www.gasgx.com/rankings/generator/',
        'Comprehensive evaluation system based on real measured data and market models.',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '{"path": "/rankings/generator/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx - Generator Rankings',
        'https://www.gasgx.com/rankings/lcoe/',
        'Comprehensive evaluation system based on real measured data and market models.',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '{"path": "/rankings/lcoe/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx - Generator Rankings',
        'https://www.gasgx.com/rankings/maintenance-interval/',
        'Comprehensive evaluation system based on real measured data and market models.',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '{"path": "/rankings/maintenance-interval/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx - Generator Rankings',
        'https://www.gasgx.com/rankings/middle-east/',
        'Comprehensive evaluation system based on real measured data and market models.',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '{"path": "/rankings/middle-east/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx - Generator Rankings',
        'https://www.gasgx.com/rankings/mtbf/',
        'Comprehensive evaluation system based on real measured data and market models.',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '{"path": "/rankings/mtbf/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx - Generator Rankings',
        'https://www.gasgx.com/rankings/noise/',
        'Comprehensive evaluation system based on real measured data and market models.',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '{"path": "/rankings/noise/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx - Generator Rankings',
        'https://www.gasgx.com/rankings/performance/',
        'Comprehensive evaluation system based on real measured data and market models.',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '{"path": "/rankings/performance/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx - Generator Rankings',
        'https://www.gasgx.com/rankings/reliability/',
        'Comprehensive evaluation system based on real measured data and market models.',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '{"path": "/rankings/reliability/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx - Generator Rankings',
        'https://www.gasgx.com/rankings/roi/',
        'Comprehensive evaluation system based on real measured data and market models.',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '{"path": "/rankings/roi/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx - Generator Rankings',
        'https://www.gasgx.com/rankings/russia/',
        'Comprehensive evaluation system based on real measured data and market models.',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '{"path": "/rankings/russia/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx - Generator Rankings',
        'https://www.gasgx.com/rankings/spare-parts/',
        'Comprehensive evaluation system based on real measured data and market models.',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '{"path": "/rankings/spare-parts/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx - Generator Rankings',
        'https://www.gasgx.com/rankings/thermal-efficiency/',
        'Comprehensive evaluation system based on real measured data and market models.',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '{"path": "/rankings/thermal-efficiency/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'GasGx - Generator Rankings',
        'https://www.gasgx.com/rankings/usa/',
        'Comprehensive evaluation system based on real measured data and market models.',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '{"path": "/rankings/usa/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'case_study',
        'public',
        'zh',
        'Global Case Studies | GasGx 案例库',
        'https://www.gasgx.com/resources/case-studies/',
        '探索全球最具代表性的天然气发电与算力结合项目，涵盖从石油巨头到创新型初创企业的多种合作模式。',
        '# Global Case Studies

探索全球最具代表性的天然气发电与算力结合项目，涵盖从石油巨头到创新型初创企业的多种合作模式。

### Crusoe & ExxonMobil

北达科他州 Bakken 盆地的 DFM 标杆。每月消耗 1800万立方英尺天然气，燃烧效率 99.9%，正向 AI 云计算转型。

### YPF Luz & GDA

Vaca Muerta 盆地的国企合作案例。7MW 装机，1200 台矿机，预计减少 63% 二氧化碳当量排放。

### LINKMINE 艾伯塔项目

利用艾伯塔省废弃气井（OWA）和离网豁免政策。实现 $0.043/kWh 低成本电力，并预留氢能接口。

### 北美 (North America)

- 德克萨斯 (Texas): ERCOT 市场灵活负载，ExxonMobil 等巨头布局。

- 纽约州 (New York): Greenidge 电厂自用模式，面临环保法规挑战。

- 艾伯塔 (Alberta): 受益于离网自用 (<10MW) 豁免政策，废弃气井利用活跃。

### 南美 (South America)

- 阿根廷 (Argentina): Vaca Muerta 盆地，YPF 将无法出口的天然气“数字货币化”。

### 欧亚与中东 (Eurasia & ME)

- 俄罗斯 (Russia): 西伯利亚伴生气离网挖矿，解决电力短缺。

- 中东 (Middle East): ADNOC 投资布局，LNG 与伴生气挖矿潜力巨大。

### 数字火炬缓解 (DFM)

部署在井口，直接利用伴生气发电。替代燃烧火炬，获取碳信用收益。

### 搁浅气货币化

针对因缺乏管道而关停的气井（Shut-in Wells），就地变现为数字资产。

### 离网自用模式

无需并网，完全独立的电力孤岛。规避复杂的电网审批，快速部署。',
        '{"path": "/resources/case-studies/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'case_study',
        'public',
        'zh',
        'Global Case Studies | GasGx 案例库',
        'https://www.gasgx.com/resources/case-studies/regions/',
        '探索全球最具代表性的天然气发电与算力结合项目，涵盖从石油巨头到创新型初创企业的多种合作模式。',
        '# Global Case Studies

探索全球最具代表性的天然气发电与算力结合项目，涵盖从石油巨头到创新型初创企业的多种合作模式。

### Crusoe & ExxonMobil

北达科他州 Bakken 盆地的 DFM 标杆。每月消耗 1800万立方英尺天然气，燃烧效率 99.9%，正向 AI 云计算转型。

### YPF Luz & GDA

Vaca Muerta 盆地的国企合作案例。7MW 装机，1200 台矿机，预计减少 63% 二氧化碳当量排放。

### LINKMINE 艾伯塔项目

利用艾伯塔省废弃气井（OWA）和离网豁免政策。实现 $0.043/kWh 低成本电力，并预留氢能接口。

### 北美 (North America)

- 德克萨斯 (Texas): ERCOT 市场灵活负载，ExxonMobil 等巨头布局。

- 纽约州 (New York): Greenidge 电厂自用模式，面临环保法规挑战。

- 艾伯塔 (Alberta): 受益于离网自用 (<10MW) 豁免政策，废弃气井利用活跃。

### 南美 (South America)

- 阿根廷 (Argentina): Vaca Muerta 盆地，YPF 将无法出口的天然气“数字货币化”。

### 欧亚与中东 (Eurasia & ME)

- 俄罗斯 (Russia): 西伯利亚伴生气离网挖矿，解决电力短缺。

- 中东 (Middle East): ADNOC 投资布局，LNG 与伴生气挖矿潜力巨大。

### 数字火炬缓解 (DFM)

部署在井口，直接利用伴生气发电。替代燃烧火炬，获取碳信用收益。

### 搁浅气货币化

针对因缺乏管道而关停的气井（Shut-in Wells），就地变现为数字资产。

### 离网自用模式

无需并网，完全独立的电力孤岛。规避复杂的电网审批，快速部署。',
        '{"path": "/resources/case-studies/regions/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'case_study',
        'public',
        'zh',
        'Global Case Studies | GasGx 案例库',
        'https://www.gasgx.com/resources/case-studies/scenarios/',
        '探索全球最具代表性的天然气发电与算力结合项目，涵盖从石油巨头到创新型初创企业的多种合作模式。',
        '# Global Case Studies

探索全球最具代表性的天然气发电与算力结合项目，涵盖从石油巨头到创新型初创企业的多种合作模式。

### Crusoe & ExxonMobil

北达科他州 Bakken 盆地的 DFM 标杆。每月消耗 1800万立方英尺天然气，燃烧效率 99.9%，正向 AI 云计算转型。

### YPF Luz & GDA

Vaca Muerta 盆地的国企合作案例。7MW 装机，1200 台矿机，预计减少 63% 二氧化碳当量排放。

### LINKMINE 艾伯塔项目

利用艾伯塔省废弃气井（OWA）和离网豁免政策。实现 $0.043/kWh 低成本电力，并预留氢能接口。

### 北美 (North America)

- 德克萨斯 (Texas): ERCOT 市场灵活负载，ExxonMobil 等巨头布局。

- 纽约州 (New York): Greenidge 电厂自用模式，面临环保法规挑战。

- 艾伯塔 (Alberta): 受益于离网自用 (<10MW) 豁免政策，废弃气井利用活跃。

### 南美 (South America)

- 阿根廷 (Argentina): Vaca Muerta 盆地，YPF 将无法出口的天然气“数字货币化”。

### 欧亚与中东 (Eurasia & ME)

- 俄罗斯 (Russia): 西伯利亚伴生气离网挖矿，解决电力短缺。

- 中东 (Middle East): ADNOC 投资布局，LNG 与伴生气挖矿潜力巨大。

### 数字火炬缓解 (DFM)

部署在井口，直接利用伴生气发电。替代燃烧火炬，获取碳信用收益。

### 搁浅气货币化

针对因缺乏管道而关停的气井（Shut-in Wells），就地变现为数字资产。

### 离网自用模式

无需并网，完全独立的电力孤岛。规避复杂的电网审批，快速部署。',
        '{"path": "/resources/case-studies/scenarios/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'certification',
        'public',
        'zh',
        'Certifications & Compliance | GasGx 认证与合规',
        'https://www.gasgx.com/resources/certifications/',
        '汇集我们在环境、电力、工业安全及数字资产运营方面的核心资质，为全球合作伙伴提供透明的尽职调查依据。',
        '# Certifications & Compliance

汇集我们在环境、电力、工业安全及数字资产运营方面的核心资质，为全球合作伙伴提供透明的尽职调查依据。

## 1. 环境排放与碳减排认证

核心合规：量化“数字火炬缓解”（DFM）的温室气体减排效益，确保碳资产的“额外性”与可交易性。

### [碳权] Verra VMR0016 认证

采用 Verra 最新 VMR0016 方法学（原 ACM0001）。通过高精度流量计核证每消耗 1 吨甲烷产生的碳信用。

### [排放] EPA Quad O / Quad Oa

符合美国 EPA 对油气设施 VOCs 和甲烷排放的 NSPS 标准。燃气机组配备闭环控制系统，确保破坏效率 >95%。

## 2. 电力接入与电网规范

核心合规：针对“离网自用”与“余电上网”两种模式的合法性文件，规避非法售电风险。

### [加拿大] AUC Rule 007 豁免

针对 <10MW 的小型电厂，符合艾伯塔省 AUC 的自用（Own-Use）豁免条款，无需申请全面电厂牌照。

### [美国] ERCOT 灵活负载注册

在德州 ERCOT 市场注册为可中断负载资源（CLR）。参与辅助服务市场，在电价高企时关机响应。

## 3. 工业安全与设备标准

核心合规：保障高含硫（Sour Gas）及易爆环境下的设备可靠性与人员安全。

### [抗硫] NACE MR0175

针对含硫化氢环境的金属材料抗裂标准。管道及阀门使用316不锈钢，防止硫化物应力开裂。

### [电气] UL 2200 / CSA

集装箱式数据中心及配电柜符合北美 NEC 电气规范，通过现场电气验收。

### [防爆] Class I, Div 2

靠近气源接口的电气设备符合防爆要求，确保甲烷泄漏时不会产生火花。

## 4. 数字资产与运营牌照

核心合规：确保挖矿及资产处置业务在所在国的合法经营权。

### [俄罗斯] 挖矿登记簿

依据《数字货币挖矿法》，法人实体已在联邦税务局（FTS）的挖矿活动登记簿中注册，不仅限于工业配额。

### [哈萨克斯坦] AIFC 牌照

在阿斯塔纳国际金融中心（AIFC）持有数字资产经营牌照，并将部分算力接入国家矿池。',
        '{"path": "/resources/certifications/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'datasheet',
        'public',
        'zh',
        'Technical Datasheets | GasGx 技术参数表',
        'https://www.gasgx.com/resources/datasheets/',
        '从选址规划到电网并联，GasGx 为您提供最详尽的天然气发电挖矿工程参数指南。',
        '# Technical Parameters

从选址规划到电网并联，GasGx 为您提供最详尽的天然气发电挖矿工程参数指南。

### 1. 土地与场地 (Land & Site)

#### 占地面积

- 模块化标准： 1MW 约需 150-200 平方米

- 集装箱尺寸： ISO 20尺 (6m) 或 40尺 (12m)

#### 地面承重

- 基础要求： 硬化地面 > 3000 kg/m²

- 平整度： 坡度 < 5度 (液位传感器要求)

#### 环境距离

- 噪音缓冲区： 居民区距离 > 500米

- 安全距离： 井口高压设备 > 30-50米

### 2. 气源参数 (Gas Source)

#### 甲烷值 (MN)

- 理想值： MN > 80 (运行稳定)

- 低值处理： MN < 65 时需降额运行

#### 热值 (Heating Value)

- 低热值 (LHV)： > 1000 BTU/scf (37 MJ/m³)

#### 杂质耐受

- 硫化氢 (H₂S)： < 200 ppm (直燃); > 500 ppm (需预处理)

- 水分： 需脱水处理 (防止冻结)

### 3. 排放与环保 (Emissions)

#### NOx 排放

- 标准： 1.0 g/bhp-hr (常规); 0.15 g/bhp-hr (严控)

- 技术： 稀薄燃烧 + SCR 后处理

#### 燃烧效率

- 甲烷破坏率： > 99% (火炬仅 91-95%)

### 4. 发电机组参数 (Genset)

#### 电力输出

- 电压： 400V/480V (低压); 10.5kV+ (高压)

- 频率： 50Hz (中/欧/俄) 或 60Hz (美/加)

#### 效率 (Efficiency)

- 电效率： 38% - 44% (例如 MWM TCG 3016)

- 气耗率： 0.24 - 0.30 m³/kWh

#### 冷却方式

- 适应温度： -20°C 至 +40°C

### 5. 挖矿与负载 (Mining Load)

#### 负荷特性

- 类型： 恒定负荷 (Base Load), 24/7 运行

- 功率因数： 需校正至 0.9 - 0.95

#### 矿机耐受性

- 环境： 液冷/浸没式耐受高温及沙尘

- 启动： 需 Load Bank 或软启动控制

### 6. 电网与并网 (Grid)

#### 离网模式

- 无需电网接入，需配备黑启动电池组。

#### 并网模式

- 需符合电网代码 (Grid Code)，配备同步装置。

- 支持“削峰填谷”收益模式。

### 7. 网络与通讯 (Connectivity)

#### 带宽需求

- 挖矿协议： 数据量极低 (< 50kbps/台)

- 总带宽： 1MW 仅需 10-20 Mbps (含监控)

#### 接入方案

- 首选： Starlink (延迟 30-50ms)

- 备用： 4G/5G LTE 或微波链路',
        '{"path": "/resources/datasheets/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'faq',
        'public',
        'zh',
        'FAQ | GasGx 常见问题解答',
        'https://www.gasgx.com/resources/faq/',
        '探索关于天然气发电挖矿的运作原理、经济模型、环保价值及合规路径的深度解答。',
        '# Frequently Asked Questions

探索关于天然气发电挖矿的运作原理、经济模型、环保价值及合规路径的深度解答。

## 基础概念与运作原理

这是一种基于“工业共生”理念的能源利用模式，旨在将能源行业的“废料”转化为算力行业的“燃料”。具体做法是在油气田井口部署模块化的天然气发电机组和集装箱式数据中心。利用原本因缺乏管道设施而只能被燃烧（Flaring）或直接排放（Venting）的伴生气（Associated Gas）或搁浅气（Stranded Gas）驱动发电机产生电力，现场直接供给比特币矿机或 AI 服务器进行计算。GasGx 将此称为“数字火炬缓解”（Digital Flare Mitigation, DFM）技术。

主要是由于经济性和基础设施限制：

- 资源浪费规模： 全球每年约有 1450 亿立方米的天然气被燃烧掉，价值超过 300 亿美元。

- 经济痛点： 许多油气田位于偏远地区，建设天然气管道成本极高。如果不进行现场消纳，石油公司为了开采高价值的原油，被迫将其作为废料处理。

- 搁浅定义： 这些无法输送的气体被称为“搁浅气体”，通过现场发电挖矿，省去了昂贵的中游管道运输环节，实现了能源的就地增值。

主要包括五个关键环节：

- 气体捕获与预处理： 包括脱水器和脱硫装置，用于去除水分、硫化氢（H₂S）等杂质。

- 发电机组： 通常采用往复式燃气发电机（如 INNIO Jenbacher、Waukesha 系列）或微型燃气轮机，燃烧效率可达 99% 以上。

- 模块化算力中心： 集成了矿机、配电和冷却系统的集装箱（如 Linkmine 的 MinerPower 气算一体集装箱），支持“插电即开机”。

- 冷却系统： 采用液冷（Hydro-cooling）或浸没式冷却，以适应高密度算力需求。

- 网络连接： 针对偏远地区，通常集成 Starlink 卫星通信或光纤回传。

## 经济效益与成本

优势主要体现在将能源成本（OPEX）与电网价格解耦，成本可降低约 30%-40% 甚至更多。

- 传统电网成本： 工业电价通常在 $0.06 - $0.14/kWh 之间，且面临高峰电价和需量电费的压力。

- 离网发电成本： 气源成本接近零甚至为负（油企付费处理），综合发电成本（LCOE）通常在 $0.02 - $0.05/kWh。LINKMINE 项目实测发电成本可低至 $0.043/kWh。

- 抗风险能力： 即使在比特币减半周期后，极低的能源成本（$0.02/kWh 左右）能确保项目在币价低迷时仍保持正向现金流。

石油公司可从“负资产”转向“正收益”：

- 规避罚款： 避免因超标燃烧面临的巨额环保罚款（如美国新墨西哥州曾开出 4000 万美元罚单）。

- 资产货币化： 将原本需要花钱处理的废气转化为电力销售收入或特许权使用费。

- ESG 评级提升： 响应世界银行“2030 零常规火炬”倡议，提升企业绿色融资能力。

## 环境影响与 ESG

科学数据支持其为有效的减排手段，即“甲烷减排”。

- 甲烷危害： 甲烷在 20 年内的温室效应是二氧化碳的 84 倍。

- 效率对比： 传统火炬燃烧效率约为 91%，意味着约 9% 的甲烷会逃逸到大气中；而高效燃气发电机组可实现 >99.9% 的甲烷破坏率。

- 减排量化： 理论上，利用搁浅气挖矿可减少全球 23% 的甲烷排放。以 LINKMINE 项目为例，其碳负属性每年可产生约 180 万美元的碳权收益。

是的，该模式与全球去碳化目标高度一致。

- 国际倡议： 完全符合世界银行“2030 年零常规燃烧”（Zero Routine Flaring by 2030）倡议。

- 碳信用认证： 项目可依据 Verra 新标准 VMR0016 开发碳信用（Carbon Credits），将减排量资产化并进行交易。

## 技术挑战与解决方案

可以，但必须克服“酸性气”的技术壁垒。

- 材料要求： 所有管道和阀门需符合 NACE MR0175/ISO 15156 抗硫腐蚀标准。

- 处理工艺： 对于低浓度硫化氢，使用三嗪（Triazine）等化学清除剂；对于高浓度，采用受阻胺（FLEXSORB）工艺进行选择性去除。GasGx 的技术方案已包含针对酸性气的模块化处理单元。

采用工业级防护和先进冷却技术：

- 集装箱化： 使用“Hash Hut”等集装箱设计，防尘、防雨，支持 -40℃ 至 +45℃ 的极端环境运行。

- 液冷技术： 引入 Antminer S21 XP Hydro 等液冷矿机，配合 HydroCooling 水冷矿箱，能效比更佳且隔绝了外部沙尘对芯片的损害。

- 智能负载： 使用 LinkBrain 等 AI 系统实时匹配燃气供应与算力负载，波动率可控制在 ≤2%。

这是一个提升能源利用率的高级阶段。

- 热循环利用： 回收发电机产生的废热，可用于防冻或进一步的工业用途。例如，LINKMINE 计划在三期工程启用热循环系统，将综合能源利用效率从 35% 提升至 60%。

- 余热价值： 除了提升效率，还能通过热能管理降低整体运营成本。

## 全球趋势与监管

- 北美： 美国得克萨斯州（ERCOT 市场）和北达科他州是先行者。加拿大艾伯塔省对 <10MW 的自用离网发电有豁免政策，便于快速部署。

- 南美： 阿根廷 Vaca Muerta 盆地，YPF（国家石油公司）与科技公司合作，利用丰富的页岩气资源挖矿。

- 独联体地区： 俄罗斯和哈萨克斯坦利用伴生气解决电力短缺问题，并逐步完善加密货币挖矿的立法框架。

- AI 算力转型： 随着 AI 数据中心电力需求预计增长 165%，GasGx 模式正从比特币挖矿向高性能计算（HPC）和 AI 训练中心转型，作为稳定的基荷电源。

- 金融化（RWA）： 算力资产和碳信用正在被打包成资产支持证券（ABS）或 REITs，例如 LINKMINE 计划将碳权收益资产证券化。

- 氢能结合： 未来项目将预留氢能副产接口，向综合能源服务商升级。

- 排放合规： 美国 EPA Quad O 法规要求燃烧装置必须达到 95% 以上的破坏效率，这是硬性合规门槛。

- 离网界定： 如加拿大艾伯塔省，需确保发电“仅供自用”（Own-Use）以获得监管豁免，否则需通过复杂的审批。

- 政策波动： 部分国家（如吉尔吉斯斯坦）可能在能源短缺时限制挖矿，但离网伴生气发电通常作为“解决方案”而非“负担”被允许甚至鼓励。',
        '{"path": "/resources/faq/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'resource_doc',
        'public',
        'en',
        'GasGx Industry Report 2026: Natural Gas Power & Mining',
        'https://www.gasgx.com/resources/reports/',
        'In 2026, the boundary between the global digital asset mining industry and the traditional energy sector has completely blurred. With the Bitcoin network hashrate officially breaking the 1 ZettaHash (1,000 EH/s) threshold [1] , and the exponential explosion of',
        '### Contents

## 1. Executive Summary: The Industrial Convergence

In 2026, the boundary between the global digital asset mining industry and the traditional energy sector has completely blurred. With the Bitcoin network hashrate officially breaking the 1 ZettaHash (1,000 EH/s) threshold [1] , and the exponential explosion of power demand from Artificial Intelligence (AI), Gas-to-Compute (GasGx) has evolved from a marginal arbitrage strategy into an indispensable "flexible load" layer of energy infrastructure.

The 2026 market is defined by "High Difficulty" and "High Compliance." While the global crypto mining market size reached approximately $4.6 billion in 2025 with a CAGR of 12% projected towards 2030 [3] , growth is uneven. Traditional grid-connected miners face the dual squeeze of volatile electricity prices and connection backlogs. Conversely, GasGx projects utilizing Stranded Gas and Associated Gas are becoming the new darlings of capital expenditure due to their unique "negative cost energy" attributes and ESG compliance value.

#### Key Driver: The WEC Mandate

The core driver is the "Waste Emissions Charge" (WEC) from the U.S. Inflation Reduction Act (IRA), fully implemented in 2026. It imposes a punitive fee of $1,500 per ton on excess methane emissions [5] . This policy has fundamentally altered cost structures; deploying onsite mining is no longer just about earning Bitcoin, but about avoiding massive environmental fines.

## 2. Global Macro Energy & Compute Environment (2026)

### 2.1 Global Natural Gas Market Dynamics

Entering 2026, the global natural gas market is in a critical cycle of supply-demand rebalancing. Despite the rise of renewables, the new base load added by data centers and AI clusters has reinforced natural gas''s role as a grid stabilizer.

#### USA Henry Hub & LNG Effects

The 2026 average spot price for Henry Hub is projected between $3.46 - $3.85/MMBtu , a significant rebound from the lows of 2024-2025 [17] . For grid-dependent miners, this raises marginal costs. However, for GasGx operators with stranded gas, rising main grid prices actually expand their relative advantage—since stranded gas often has a shadow price near zero (or negative), creating a massive arbitrage opportunity.

#### Canada AECO & Regional Arbitrage

The AECO benchmark price in Alberta is expected to rebound to $3.50-$3.82 CAD/GJ in 2026 [20] . Despite this, remote wells remain physically disconnected from pipelines. Canaan and Aurora AZ Energy''s pilot projects in Calgary utilize this "stranded" gas to bypass pipeline costs and export energy value globally via hashrate [15] .

### 2.2 Bitcoin Network Economics

In 2026, the network has fully digested the 2024 halving impact. With hashrate over 1 ZH/s, mining difficulty has surged 36% year-over-year. This growth is driven by hardware efficiency (computing inflation) rather than just price action. Miners with older generation hardware (>30 J/TH) have been flushed out.

### 2.3 The Regulatory Storm

## 3. Technical Infrastructure Evolution

### 3.1 Hardware: The Moore''s Law of 15 J/TH

Mainstream ASIC miners in 2026 have achieved a generational leap in efficiency, compressing from 20+ J/TH in 2024 to 15-16 J/TH [9] . Canaan''s Avalon A15 Pro series has become a star product, specifically optimized for the unstable voltage environments of oil fields.

### 3.2 Cooling Revolution: Immersion Dominance

Immersion Cooling is the 2026 industry standard for GasGx.

- Environment: Completely isolates chips from desert dust or arctic cold [27] .

- Overclocking: Safely boosts hash rate output by 40% due to high specific heat capacity of fluids [11] .

- ROI: Despite higher CAPEX (~$375k/MW), the ROI beats air cooling within 12-18 months [30] .

### 3.3 Modular Generation

LoadSync technology (patent by Upstream Data) allows millisecond-level synchronization between miner load and generator output, preventing downtime during gas flow fluctuations [31] .

## 4. Business Model & Economic Analysis

### 4.1 Cost Structure (LCOE Analysis)

In stranded gas scenarios, fuel cost is effectively $0. The All-in electricity cost (including O&M) is approximately $0.02 - $0.03/kWh . Compared to the Texas industrial grid rate of $0.05-$0.07/kWh, off-grid GasGx maintains a >50% cost advantage [36] .

Table: 1MW Off-Grid Immersion CAPEX

### 4.2 Revenue Stacking: Carbon Credits

#### Avoiding WEC Fines

For a facility venting 1,000 tons of methane, the fine is $1.5M/year . GasGx eliminates this fine, creating a "negative cost" baseline [30] .

#### TIER Credits (Alberta)

A 1MW project reduces ~12k tons of CO2e annually. At ~$95 CAD/ton, this yields ~$1.2M CAD/year in credit revenue, covering almost all OPEX [15] .

### 4.3 Profitability Sensitivity

In the 2026 baseline scenario (BTC $90k, Difficulty 1.1 ZH/s), pure mining payback is 8-10 months. When stacking carbon credits or WEC fine avoidance, payback drops to 4-6 months .

Interactive: Analyze Daily Profit based on BTC Price (Y) vs Energy Cost (X)

## 5. Competitive Landscape

The settlement of the patent dispute between Crusoe Energy and Upstream Data [13] has eliminated the legal sword of Damocles, leading to an explosion of modular solutions.

#### Canaan

Transitioning from hardware sales to vertical integration. Partnering with Aurora AZ Energy to operate sites directly, trading "equipment for hashrate" [15] .

#### Crusoe Energy

Pivoting to AI Cloud. Upgrading the narrative to "Green AI Infrastructure" and solving fiber connectivity challenges to attract sovereign fund investment [13] .

#### Greenidge

Hybrid model. Selling power to the grid during peak prices and self-mining during troughs, while introducing AI inference loads [42] .

## 6. From Bitcoin to AI: The Second Curve

While AI/HPC offers 3-5x the revenue potential per MWh compared to Bitcoin mining, physical constraints limit deployment at remote wells [41] .

- Network Latency: AI training requires fiber optics, which Starlink cannot replace for large clusters.

- The 2026 Reality - Inference at the Edge: GasGx AI attempts focus on Inference and batch rendering. These tasks tolerate higher latency and are suitable for edge gas power plants.

## 7. Future Outlook & Risks

- Regulatory Risk: Despite WEC benefits, environmental groups still challenge GasGx for extending the fossil fuel lifecycle [44] .

- Depletion Risk: Associated gas volume declines over time, necessitating Skid-mounted (mobile) solutions.

- Obsolescence: 30 J/TH machines are effectively e-waste in 2026.

### Conclusion: Distributed Compute Utilities

2026 marks the "Industrial Year One" for GasGx. In 3-5 years, we will see the rise of Distributed Compute Utilities—companies that produce neither oil nor grid electricity, but convert geological energy directly into digital intelligence.

Primary Sources Index

[1] The Block: 2026 Bitcoin Mining Outlook

[3] Grand View Research: Mining Market Outlook

[5] Biden White House: Methane Emissions Reduction Action Plan

[7] Alberta.ca: TIER Regulation

[9] Canaan Avalon A15 Technical Specs

[13] Blockspace Media: Crusoe vs Upstream Patent Dispute

[15] PR Newswire: Canaan Inc. Gas-to-Computing Pilot

[30] QuoteColo: Immersion Cooling ROI Analysis

[31] Upstream Data: LoadSync Technology

[36] Earthjustice: Subsidizing Crypto Mining',
        '{"path": "/resources/reports/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'resource_doc',
        'public',
        'zh',
        'Videos & Tutorials | GasGx 视频资源库',
        'https://www.gasgx.com/resources/videos/',
        '从“商业模式扫盲”到“深度技术实操”，为您提供完整的视觉化学习路径。深入理解数字火炬缓解 (DFM) 的核心价值。',
        '# Video & Tutorial Library

从“商业模式扫盲”到“深度技术实操”，为您提供完整的视觉化学习路径。深入理解数字火炬缓解 (DFM) 的核心价值。

## 入门必看：商业模式与愿景

### Turning Fireballs into Bitcoin

Crusoe Energy 创始人 Cully Cavness 的经典演讲。通俗易懂地解释了如何利用油田废气解决两大全球难题：能源浪费与高能耗计算。

#### 它是如何运作的？

从井口采气、预处理（脱水/脱硫）、发电机发电到矿箱计算的全流程解构。

## 实地考察：全球项目案例

### 德克萨斯油田的比特币矿场

深入西德克萨斯油田，实拍燃气发电机组与矿箱的连接细节。展示如何在野外环境处理伴生气。

### 阿根廷 Vaca Muerta 的能源主权

聚焦 YPF（阿根廷国家石油公司）如何利用 Vaca Muerta 盆地的搁浅气进行挖矿，实现能源出口。

## 技术深度与实操教程

#### Jenbacher 发电机操作指南

INNIO Jenbacher 燃气引擎的手动启停与基础维护逻辑。

#### 酸性气处理系统演示

胺液（Amine）脱硫塔的设计与工作原理，解决高含硫气体难题。

#### Hash Hut 部署概览

模块化矿箱（Mining Container）的内部结构与快速部署方案。

## 内部培训模块 (Coming Soon)

#### 财务测算模型

LCOE 与 ROI 计算器实操，针对投资人与 CFO。

#### 合规申报指南

艾伯塔省离网豁免申请与 AUC Rule 007 解读。

#### HSE 安全演练

含硫气井 H₂S 泄漏应急演练与呼吸器使用规范。',
        '{"path": "/resources/videos/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'resource_doc',
        'public',
        'en',
        'GasGx: Natural Gas Power Generation & Mining Whitepaper',
        'https://www.gasgx.com/resources/whitepapers/',
        'Transforming 151 billion cubic meters of wasted natural gas into the backbone of the decentralized digital economy and AI infrastructure.',
        '# Stranded Energy Reshaping Global Computation

Transforming 151 billion cubic meters of wasted natural gas into the backbone of the decentralized digital economy and AI infrastructure.

## The Energy-Compute Paradox

We face a dual crisis: The energy sector burns billions of dollars in "stranded gas" due to lack of pipeline infrastructure. Simultaneously, the digital economy—driven by Bitcoin mining and explosive AI growth—is starving for low-cost, reliable power. GasGx bridges this gap through Industrial Symbiosis.

### Market Misalignment

- Wasted Resources Global flaring has returned to 2007 highs. This gas is trapped geographically, making pipeline transport economically unviable.

- Rising Compute Costs Post-halving Bitcoin mining requires electricity under $0.04/kWh. Grid prices often exceed $0.07-$0.12/kWh.

- The GasGx Solution Deploying mobile "Hash Huts" directly to the wellhead. We bring the consumer to the energy, eliminating transmission costs.

#### Global Flaring Leaders vs. Mining Potential

Volume of wasted gas (BCM) by country

## Digital Flare Mitigation Architecture

A modular, mobile infrastructure converting hazardous waste into high-performance compute.

### Stranded Gas

Associated petroleum gas (APG) from oil wells or landfill methane is captured instead of burned.

### Generation Unit

Gas flows into reciprocating generators (e.g., MP-500WF) with acid gas treatment capabilities.

### Hash Huts

Electricity powers on-site containerized ASICs or AI GPUs using hydro-cooling (PUE < 1.05).

### Value Output

Output includes Bitcoin rewards, carbon credits (ERUs), and AI inference results.

## Economic Feasibility

The core advantage of GasGx is energy arbitrage . By utilizing "free" or negative-cost fuel (where producers pay to remove gas), the Levelized Cost of Electricity (LCOE) drops significantly below grid parity.

63% Savings

*Based on 2025-2026 projections for North American deployment (Texas/Alberta) using 10MW modular sites.

#### Cost Composition: Grid vs. GasGx Off-Grid

### Profitability Sensitivity Surface

Interactive analysis of Daily Profit based on BTC Price and Energy Cost.

## ESG & Carbon Credits

### The Methane Multiplier Effect

Methane (CH4) is 84x more potent than CO2 over a 20-year period. Venting or inefficient flaring releases vast amounts of CH4.

By using high-efficiency reciprocating engines, GasGx achieves 99.9% combustion efficiency . We convert the methane into CO2 and water vapor. While CO2 is still a greenhouse gas, the net reduction in Global Warming Potential (GWP) is over 63%.

#### World Bank Initiative

Directly supports the "Zero Routine Flaring by 2030" initiative, allowing oil producers to monetize waste while complying with strict EPA and global regulations.

## Future Horizon: From BTC to AI

The infrastructure built for Bitcoin mining today is the foundation for the AI data centers of tomorrow.

### Global Expansion

Expanding beyond North America to Vaca Muerta (Argentina) and Central Asia (Kazakhstan), navigating regulatory landscapes to unlock gigawatts of power.

### AI Transition

Retrofitting sites with HPC GPUs. GasGx sites provide the baseload power stability required for AI inference, unlike intermittent renewables.

### Financialization

Tokenization of Real World Assets (RWA). GasGx aims to create asset-backed securities based on the hash rate and carbon credits generated.

#### Projected Global Power Demand (2024-2030)

### Snapshot Generated!

Full page captured successfully.',
        '{"path": "/resources/whitepapers/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'CHP & Heat Recovery Solutions - GasGx',
        'https://www.gasgx.com/solutions/',
        'Don''t just burn gas for power. Capture the heat. Transform waste into steam, cooling, or carbon-negative agriculture, boosting system efficiency from 35% to over 80%.',
        '# Efficiency Beyond Electricity (80%+)

Don''t just burn gas for power. Capture the heat. Transform waste into steam, cooling, or carbon-negative agriculture, boosting system efficiency from 35% to over 80%.

### System Efficiency Comparison

## Technology Path

We deploy advanced thermal capture systems tailored to your engine type and mining setup.

- HRSG (Exhaust Gas) Heat Recovery Steam Generators capture 400°C+ exhaust to produce high-pressure steam for industrial use.

#### HRSG (Exhaust Gas)

Heat Recovery Steam Generators capture 400°C+ exhaust to produce high-pressure steam for industrial use.

- Liquid Cooling Loops Plate heat exchangers recycle 60°C hot water from hydro-cooled miners for greenhouse heating or district warming.

#### Liquid Cooling Loops

Plate heat exchangers recycle 60°C hot water from hydro-cooled miners for greenhouse heating or district warming.

## Triple Revenue Streams

Monetize the Electron (Mining), the Molecule (Gas), and the Thermal Unit (Heat).

### Industrial Steam

Sell process steam to nearby factories (paper, chemical, food processing). Steam is often priced equivalent to ~$0.04/kWh, creating a stable third revenue stream independent of crypto prices.

### Carbon Sink Agriculture

"Heat-Power-Carbon" Loop. Waste heat warms greenhouses, while scrubbed CO2 from exhaust is piped in to boost photosynthesis by 30%. Ref: Genesis Digital Assets Projects.

### District Cooling (CCHP)

Combined Cooling, Heat and Power. Use Absorption Chillers to convert waste heat into cooling for the data center itself or nearby buildings, significantly lowering the PUE (Power Usage Effectiveness).',
        '{"path": "/solutions/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'CHP & Heat Recovery Solutions - GasGx',
        'https://www.gasgx.com/solutions/chp/',
        'Don''t just burn gas for power. Capture the heat. Transform waste into steam, cooling, or carbon-negative agriculture, boosting system efficiency from 35% to over 80%.',
        '# Efficiency Beyond Electricity (80%+)

Don''t just burn gas for power. Capture the heat. Transform waste into steam, cooling, or carbon-negative agriculture, boosting system efficiency from 35% to over 80%.

### System Efficiency Comparison

## Technology Path

We deploy advanced thermal capture systems tailored to your engine type and mining setup.

- HRSG (Exhaust Gas) Heat Recovery Steam Generators capture 400°C+ exhaust to produce high-pressure steam for industrial use.

#### HRSG (Exhaust Gas)

Heat Recovery Steam Generators capture 400°C+ exhaust to produce high-pressure steam for industrial use.

- Liquid Cooling Loops Plate heat exchangers recycle 60°C hot water from hydro-cooled miners for greenhouse heating or district warming.

#### Liquid Cooling Loops

Plate heat exchangers recycle 60°C hot water from hydro-cooled miners for greenhouse heating or district warming.

## Triple Revenue Streams

Monetize the Electron (Mining), the Molecule (Gas), and the Thermal Unit (Heat).

### Industrial Steam

Sell process steam to nearby factories (paper, chemical, food processing). Steam is often priced equivalent to ~$0.04/kWh, creating a stable third revenue stream independent of crypto prices.

### Carbon Sink Agriculture

"Heat-Power-Carbon" Loop. Waste heat warms greenhouses, while scrubbed CO2 from exhaust is piped in to boost photosynthesis by 30%. Ref: Genesis Digital Assets Projects.

### District Cooling (CCHP)

Combined Cooling, Heat and Power. Use Absorption Chillers to convert waste heat into cooling for the data center itself or nearby buildings, significantly lowering the PUE (Power Usage Effectiveness).',
        '{"path": "/solutions/chp/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'Industrial Power & Microgrids - GasGx',
        'https://www.gasgx.com/solutions/industrial/',
        'Bypass grid delays and volatility. Deploy gas-powered microgrids with flexible loads to secure 24/7 power for AI and industrial parks.',
        '# Independent Power Behind the Meter

Bypass grid delays and volatility. Deploy gas-powered microgrids with flexible loads to secure 24/7 power for AI and industrial parks.

### Power Demand Forecast

Data Centers Power Demand Growth (2030)

Grid capacity cannot keep up. Behind-the-meter generation is the only viable bridge for rapid deployment.

## Behind-the-Meter & Microgrids

Solving the interconnection queue and pricing volatility with autonomous energy infrastructure.

### Baseload Power Security

Renewables are intermittent. Natural gas engines provide dispatchable, 24/7 baseload power essential for AI data centers and industrial processes, bridging the gap when sun and wind fail.

- 99% Availability

- Grid Independence

### Flex Load Management

Deploy Bitcoin miners as "interruptible load". During peak grid demand or high prices, miners shut down instantly, releasing power back to the park or selling to the grid (Demand Response).

- Economic Optimization

- Grid Balancing Service

### Infrastructure Avoidance

Bypass the multi-year wait for transmission line permits. "Gas-Compute Direct Connection" locates computing power directly at the fuel source, eliminating transmission congestion.

- Speed to Market

- No Transmission Loss

#### Riot Platforms (Texas)

## Turning Energy into an Asset

Riot Platforms utilizes a massive flexible load strategy in Texas (ERCOT). By curtailing mining operations during heatwaves, they return hundreds of megawatts to the grid.

" Through demand response programs, miners act as a virtual battery, stabilizing the grid while earning significant energy credits. "',
        '{"path": "/solutions/industrial/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'Mining & AI Power Solutions - GasGx',
        'https://www.gasgx.com/solutions/mining/',
        'Transition from Bitcoin mining to High Performance Computing (HPC). Secure low-cost off-grid power for the next generation of liquid-cooled ASIC and AI infrastructure.',
        '# From Mining to High-Density AI

Transition from Bitcoin mining to High Performance Computing (HPC). Secure low-cost off-grid power for the next generation of liquid-cooled ASIC and AI infrastructure.

### 2025 Grid Reality

High Volatility Risk

### GasGx Off-Grid Solution

Survival Mode & AI Ready

### Power Cost Arbitrage

Grid rates kill profitability. With commercial grid mining costs hitting ~$130k/BTC, off-grid natural gas generation is the only way to lock in low OPEX, survive halving cycles, and pivot infrastructure to AI.

### Hydro & Immersion Cooling

Supporting the heat density of Antminer S21 XP Hydro and AI servers. Liquid cooling enables operation in 50°C+ desert oilfields while keeping chips stable for overclocking or continuous training loads.

### Connectivity Upgrade

Mining works on Starlink, but AI demands low latency. Our site selection now prioritizes fiber proximity or microwave links to enable real-time inference and high-speed model training data transfer.

#### Gas → Power → Compute

## The AI Infrastructure Play

The bear market for mining is the bull market for AI infrastructure. Your natural gas generators don''t care if they are powering SHA-256 hashes or LLM training.

- Flexible Strategy Start with mining to monetize gas immediately. Upgrade to Tier 3/4 containerized data centers for AI clients when fiber arrives.',
        '{"path": "/solutions/mining/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'Oil & Gas Power Solutions - GasGx',
        'https://www.gasgx.com/solutions/oilfield/',
        'Deploy modular data centers directly at the wellhead. Zero routine flaring, 99.9% combustion efficiency, and monetized energy.',
        '# Turn Flared Gas into Digital Gold

Deploy modular data centers directly at the wellhead. Zero routine flaring, 99.9% combustion efficiency, and monetized energy.

## Digital Flare Mitigation (DFM)

A three-step engineered process to convert stranded gas liabilities into high-performance computing assets.

### 1. Capture & Treatment

Separators collect associated gas at the wellhead. For sour gas (H₂S), we utilize chemical scavengers (Triazine) or amine systems (FLEXSORB™) to dehydrate and sweeten the gas, preventing engine corrosion.

### 2. Power Generation

Treated gas fuels modular reciprocating engines. Achieving 99.9% combustion efficiency compared to ~91% for open flares, drastically reducing methane slip and VOC emissions.

### 3. Compute Consumption

Electricity is routed directly to on-site mobile data centers (Hash Huts/Smartboxes). The load is consistent and flexible, providing immediate monetization without grid interconnection.

### Superior Economics

- Ultra-Low LCOE Generate power at $0.02 - $0.04/kWh using free waste gas, ensuring mining profitability even post-halving.

- Modular Scaling Scale from 500kW to 10MW+ rapidly. Assets are mobile and can move to new wells as depletion occurs.

### Environmental Compliance

- Zero Routine Flaring Align with World Bank 2030 initiatives. Eliminate visible flames and smoke, improving community relations.

- Emission Reduction Reduce CO2e by up to 63% by converting methane (CH4) to CO2 efficiently through controlled combustion.

## Success Stories

### YPF & GDA

State oil giant YPF piloted 1MW gas-to-compute project. Exported gas constraints were solved by onsite mining, reducing 30% of flare volumes in the pilot block.

### Crusoe Energy

The pioneer of DFM deployed hundreds of modular data centers across the Bakken shale, capturing millions of cubic feet of gas daily and powering high-performance cloud computing.',
        '{"path": "/solutions/oilfield/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'zh',
        'Global Network | GasGx 全球服务网络',
        'https://www.gasgx.com/support/network/',
        '从北美的页岩气田到中亚的广阔草原，GasGx 在全球关键能源节点部署了分布式算力与服务中心，为您提供本地化的 EPC 建设与 7x24 小时运维支持。',
        '# Global Energy & Compute Network

从北美的页岩气田到中亚的广阔草原，GasGx 在全球关键能源节点部署了分布式算力与服务中心，为您提供本地化的 EPC 建设与 7x24 小时运维支持。

### R&D & Compliance

技术研发总部与 EPA 合规中心。专注于高硫气处理技术 (Sour Gas) 与模块化机组设计。

### Operations Base

全球最大的算力托管基地。具备极寒天气运维经验，提供低成本电力接入与矿场建设。

### Financial Hub

资本运作与设备采购中心。链接全球主权财富基金，提供供应链金融与碳信用交易服务。

### Emerging Projects

Vaca Muerta 盆地战略节点。专注于伴生天然气（APG）消纳与离网电力货币化试点。

### 24/7 Network Operations Center

我们的分布式云端监控系统链接全球所有节点。实时监测发电机组热效率、矿机算力波动及现场安全，确保 99.9% 的正常运行时间。

## Delivery Workflow

从气源评估到算力收益，标准化的四步交付流程。

#### Audit & Design

气组分分析、ROI 测算与设备选型 (1-2 Weeks)

#### Logistics & EPC

全球供应链发货，现场土建与模块化组装 (4-8 Weeks)

#### Commissioning

并网测试、算力加载与压力测试 (1 Week)

#### O&M & Profit

7x24 运维托管，每日BTC收益结算 (Ongoing)

Our global teams usually respond within 24 hours.',
        '{"path": "/support/network/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'zh',
        'Service & Maintenance | GasGx 售后服务体系',
        'https://www.gasgx.com/support/service/',
        'GasGx 提供覆盖全生命周期的综合服务体系。从基础的定期保养到基于数字监控的预测性维护，我们致力于降低您的总拥有成本 (TCO) 并延长设备寿命。',
        '# Total Care Solution

GasGx 提供覆盖全生命周期的综合服务体系。从基础的定期保养到基于数字监控的预测性维护，我们致力于降低您的总拥有成本 (TCO) 并延长设备寿命。

### Routine Maintenance

确保机组运行的基础。严格遵循运行小时数 (Operating Hours) 计划。

- 耗材更换: Waukesha VHP 5系列机油/火花塞更换间隔可达 4,000 小时。

- 流体分析 (S•O•S℠): 分析废油/冷却液样本，精准确定组件状态，优化换油间隔。

### Overhaul & Replacement

随着运行时间积累进行的深度维修，包括顶部大修与全面大修。

- 大修周期: Jenbacher 6系列/MWM TCG2032 大修间隔可达 60,000-80,000 小时。

- X-Change 计划: 使用工厂翻新部件替代现场维修，节省 75% 停机时间。

### Digital Solutions

从“被动维修”向“预测性维护”转变，实时掌握资产绩效。

- APM 平台: 集成 myplant 与 TPEM 系统，远程跟踪性能与故障预警。

- 绕组监测: 实时监控发电机轴承与绕组温度，防止电机过热损坏。

#### Spare Parts & Logistics

我们强调使用 OEM 原厂备件以确保可靠性。依托卡特彼勒全球 1,600+ 经销商网络及 MWM 德国物流中心，确保关键备件的快速供应，减少停机损失。

#### Upgrades & Retrofits

针对老旧机组进行技术更新。提供 25H2-Kit 套件（混燃 25% 氢气升级）及 SCR 尾气后处理系统加装，满足德国 44. BImSchV 等严苛排放法规。

### Training & Support

授人以渔。我们提供操作员与服务技术人员培训，涵盖点火系统、控制逻辑及故障排除。同时开放 "Do it the smart way" 视频教程库与电子维修手册。

### Service Agreements (LTSA)

锁定全生命周期成本。长期服务协议 (LTSA) 涵盖计划内/外维护、备件供应及性能保证。部分原厂认证再制造引擎（如 reUp 计划）提供与新机相同的 1 年质保。',
        '{"path": "/support/service/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'zh',
        'Tech Support | GasGx 技术支持中心',
        'https://www.gasgx.com/support/tech/',
        '从燃气发电机组的 ECU 标定到矿场算力的集群优化，我们的技术工程师团队为您提供软硬件一体化的专业支持。',
        '# Technical Support

从燃气发电机组的 ECU 标定到矿场算力的集群优化，我们的技术工程师团队为您提供软硬件一体化的专业支持。

### Remote Diagnostics

- Log analysis & Fault code clearing

- Network latency optimization

- ECU firmware remote flash

### Genset Engineering

- Air/Fuel ratio tuning (High Sulfur)

- Lubrication system analysis

- Overhaul parts consultation

### Mining Optimization

- Immersion cooling parameters

- ASIC firmware upgrade (S19/S21)

- Hashrate fluctuation troubleshooting

## Resource Center

## Submit Support Ticket

Please provide details about your equipment. Our engineers will analyze your logs and reply via email.',
        '{"path": "/support/tech/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'zh',
        'CHP & CCHP Cogeneration Solutions - GasGx',
        'https://www.gasgx.com/use-cases/',
        '不仅是电力，更是能源的极致利用。回收发电废热，将综合效率从传统的 40% 提升至 80% 以上，创造第三重收入流。',
        '# CHP 热电联供解决方案

不仅是电力，更是能源的极致利用。回收发电废热，将综合效率从传统的 40% 提升至 80% 以上，创造第三重收入流。

### 工业供汽与区域供暖

利用余热锅炉回收燃气机组排气热量。在生产比特币和电力的同时，向周边工业设施或居民社区销售蒸汽与热水。

- 能效跃升 从单一发电的 35%-40% 效率提升至热电联产的 80%+。

- 多重收入流 电力销售 + 算力收益 + 热力销售 (Steam/Heat Sales)。

### 现代农业与碳汇温室

将天然气清洁燃烧产生的热量和 CO₂ 输送至温室，打造“热+碳”协同的现代农业生态。

#### 碳汇农业

利用 CO₂ 促进植物光合作用，实现碳捕获的同时增加农作物产量。Genesis Digital Assets (GDA) 已成功落地此类项目。

#### 经济效益

以 LINKMINE 模式为例，通过温室农业碳汇分成，预计每年可为项目增收 200 万美元。

## 驱动制冷 (CCHP)

#### 冷热电三联供

利用废热驱动吸收式制冷机 (Absorption Chillers)。将原本排放的热能转化为冷能，为数据中心或矿场本身提供冷却。

## 最大化您的能源价值

不仅仅是发电。探索如何通过 CHP 系统将废热转化为利润。',
        '{"path": "/use-cases/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'CHP & CCHP Cogeneration Solutions - GasGx',
        'https://www.gasgx.com/use-cases/chp/',
        '不仅是电力，更是能源的极致利用。回收发电废热，将综合效率从传统的 40% 提升至 80% 以上，创造第三重收入流。',
        '# CHP 热电联供解决方案

不仅是电力，更是能源的极致利用。回收发电废热，将综合效率从传统的 40% 提升至 80% 以上，创造第三重收入流。

### 工业供汽与区域供暖

利用余热锅炉回收燃气机组排气热量。在生产比特币和电力的同时，向周边工业设施或居民社区销售蒸汽与热水。

- 能效跃升 从单一发电的 35%-40% 效率提升至热电联产的 80%+。

- 多重收入流 电力销售 + 算力收益 + 热力销售 (Steam/Heat Sales)。

### 现代农业与碳汇温室

将天然气清洁燃烧产生的热量和 CO₂ 输送至温室，打造“热+碳”协同的现代农业生态。

#### 碳汇农业

利用 CO₂ 促进植物光合作用，实现碳捕获的同时增加农作物产量。Genesis Digital Assets (GDA) 已成功落地此类项目。

#### 经济效益

以 LINKMINE 模式为例，通过温室农业碳汇分成，预计每年可为项目增收 200 万美元。

## 驱动制冷 (CCHP)

#### 冷热电三联供

利用废热驱动吸收式制冷机 (Absorption Chillers)。将原本排放的热能转化为冷能，为数据中心或矿场本身提供冷却。

## 最大化您的能源价值

不仅仅是发电。探索如何通过 CHP 系统将废热转化为利润。',
        '{"path": "/use-cases/chp/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'Industrial & Park Power Solutions - GasGx',
        'https://www.gasgx.com/use-cases/industrial/',
        '针对电网连接延迟与电价波动，提供“表后发电”与“灵活负载”平衡方案。规避电网瓶颈，实现气算直连。',
        '# 工业园区与分布式能源

针对电网连接延迟与电价波动，提供“表后发电”与“灵活负载”平衡方案。规避电网瓶颈，实现气算直连。

### 规避电网瓶颈

随着 AI 数据中心需求预计到 2030 年增长 165%，电网扩容和输电许可往往需要数年时间。

- 跳过排队周期 无需等待漫长的电网接入审批，直接部署园区内燃气发电设施。

- 气算直连 在负荷中心直接发电，减少输电损耗，提高能源利用率。

### 灵活负载与需求响应

在园区内部署比特币矿机作为“可中断负载” (Interruptible Load)。将原本固定的工业用电转化为可调节的智能电网节点。

#### 削峰填谷

在电价飙升或电网负荷高峰期，矿机自动关机，将电力释放给园区关键生产线或卖回电网。

#### 监管合规与自用豁免

利用 <10MW 自用豁免条款（如加拿大艾伯塔省）加速落地，同时需严谨设计法律架构，规避违规售电风险。

## 应用案例

#### Riot Platforms (ERCOT)

通过参与 ERCOT 的需求响应计划，在电价高峰期主动削减负荷，单月获得巨额能源信用，大幅降低综合电力成本。

#### Regulatory Compliance: Self-Use

针对 Link Global 曾因未获审批运营受罚的案例，强调在艾伯塔省利用 10MW 以下“自用发电”豁免权的重要性与法律界限。

## 工业园区电力优化

面对电网容量不足或电费过高？了解我们的模块化燃气发电方案。',
        '{"path": "/use-cases/industrial/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'Mining & AI Data Center Power - GasGx',
        'https://www.gasgx.com/use-cases/mining/',
        '为高价值计算提供 24/7 稳定电力。相比间歇性新能源，天然气发电是 AI 数据中心最可靠的能源桥梁。',
        '# 从比特币挖矿到 AI 算力基荷

为高价值计算提供 24/7 稳定电力。相比间歇性新能源，天然气发电是 AI 数据中心最可靠的能源桥梁。

### AI 数据中心的基荷电源

AI 训练对电力中断零容忍。天然气发电提供了太阳能和风能无法企及的持续性，是目前填补数据中心电力缺口的关键资源。

- 24/7 稳定运行 区别于可中断的挖矿负载，AI 训练需要持续稳定的基荷电力 (Baseload Power)。

- 独立供能岛 在电网容量受限区域，建立独立的天然气微电网，保障 HPC 集群算力不掉线。

### 极端环境与高密度部署

适应西伯利亚寒冬或德州酷暑，集成液冷与浸没式技术，为 S21 XP Hydro 等大算力设备提供最佳运行环境。

#### 液冷与浸没式技术

大幅降低 PUE，提升算力密度，无惧沙尘与极端温差。

#### 废热利用

配合 CHP 系统，将芯片废热用于供暖或工业流程，进一步摊薄能源成本。

## 全球地理套利

#### 成本驱动迁移

比特币减半后，美国电网挖矿成本飙升至 $130k/BTC (部分地区)。矿工正被迫寻找新的能源洼地。

#### 俄罗斯与中亚

利用西伯利亚丰富的搁浅天然气和哈萨克斯坦（后 AIFC 垄断时代）的政策窗口，实现极低成本挖矿。

#### 南美洲机遇

阿根廷与巴拉圭等地的水电与天然气资源，正在成为全球算力迁移的新热土。

## 算力基础设施升级

无论是比特币挖矿选址，还是 AI 数据中心供能，我们提供从气源分析到电力交付的一站式方案。',
        '{"path": "/use-cases/mining/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'public_page',
        'public',
        'en',
        'Oil & Gas Digital Flare Mitigation - GasGx',
        'https://www.gasgx.com/use-cases/oilfield/',
        '将原本被燃烧或排放的“废气”转化为高性能计算电力。零边际成本能源，为算力基础设施提供最强动力。',
        '# 油气井伴生气发电解决方案

将原本被燃烧或排放的“废气”转化为高性能计算电力。零边际成本能源，为算力基础设施提供最强动力。

### 搁浅气体货币化

在偏远油气井口，利用模块化燃气发电机组直接消耗伴生气。产生的电力不并网，直接供给集装箱式数据中心（矿箱）。

- 负资产转正 消除燃烧罚款，将废气转化为正向现金流。

- 极低电力成本 综合成本低至 $0.02 - $0.04/kWh，远低于工业电网价格。

### 酸性气 (Sour Gas) 处理技术

面对含高浓度硫化氢 (H₂S) 的劣质气源，我们提供完整的预处理与抗腐蚀发电方案，解锁原本无法利用的能源储备。

#### 化学清除与胺处理

使用三嗪或胺液高效脱硫，保护发电机组。

#### 设备防腐保护

防止硫化物应力开裂，延长设备MTBF。

## 典型落地案例

#### YPF Luz & Genesis Digital Assets

在 Vaca Muerta 油田，利用 Bajo del Toro 热电厂的搁浅气体为 1,200 台矿机供电。

#### Crusoe Energy & ExxonMobil

利用页岩油田伴生气驱动模块化数据中心，通过 Digital Flare Mitigation 技术大幅减少甲烷排放。

## 准备好计算您的收益了吗？

使用我们的 ROI 计算器，输入您的气量参数，立即估算挖矿回本周期。',
        '{"path": "/use-cases/oilfield/", "snapshot_kind": "site_html"}'::jsonb,
        'published',
        timezone('utc', now())
    )
on conflict (canonical_url) do update
set source_type = excluded.source_type,
    visibility = excluded.visibility,
    language = excluded.language,
    title = excluded.title,
    excerpt = excluded.excerpt,
    content_markdown = excluded.content_markdown,
    source_meta = excluded.source_meta,
    status = excluded.status,
    last_crawled_at = excluded.last_crawled_at,
    updated_at = timezone('utc', now());

delete from public.knowledge_chunks where document_id in (
    select id from public.knowledge_documents where canonical_url in (
        'https://www.gasgx.com/about/company/',
        'https://www.gasgx.com/about/contact/',
        'https://www.gasgx.com/digitalization/ecm/',
        'https://www.gasgx.com/digitalization/ims/',
        'https://www.gasgx.com/digitalization/platform/',
        'https://www.gasgx.com/digitalization/sales/',
        'https://www.gasgx.com/products/',
        'https://www.gasgx.com/products/brands/',
        'https://www.gasgx.com/products/brands/china/',
        'https://www.gasgx.com/products/brands/overseas/',
        'https://www.gasgx.com/products/cooling/air/',
        'https://www.gasgx.com/products/cooling/liquid/',
        'https://www.gasgx.com/products/deployment/ais/',
        'https://www.gasgx.com/products/deployment/container/',
        'https://www.gasgx.com/products/deployment/skid/',
        'https://www.gasgx.com/products/gas/',
        'https://www.gasgx.com/products/gas/associated/',
        'https://www.gasgx.com/products/gas/brands/',
        'https://www.gasgx.com/products/gas/brands/china/',
        'https://www.gasgx.com/products/gas/brands/overseas/',
        'https://www.gasgx.com/products/gas/cooling/air/',
        'https://www.gasgx.com/products/gas/cooling/liquid/',
        'https://www.gasgx.com/products/gas/deployment/ais/',
        'https://www.gasgx.com/products/gas/deployment/container/',
        'https://www.gasgx.com/products/gas/deployment/skid/',
        'https://www.gasgx.com/products/gas/gas/associated/',
        'https://www.gasgx.com/products/gas/gas/low-methane/',
        'https://www.gasgx.com/products/gas/gas/natural/',
        'https://www.gasgx.com/products/gas/low-methane/',
        'https://www.gasgx.com/products/gas/natural/',
        'https://www.gasgx.com/products/gas/power-range/0-500kw/',
        'https://www.gasgx.com/products/gas/power-range/1mw-plus/',
        'https://www.gasgx.com/products/gas/power-range/500-1000kw/',
        'https://www.gasgx.com/products/power-range/0-500kw/',
        'https://www.gasgx.com/products/power-range/1mw-plus/',
        'https://www.gasgx.com/products/power-range/500-1000kw/',
        'https://www.gasgx.com/rankings/',
        'https://www.gasgx.com/rankings/canada/',
        'https://www.gasgx.com/rankings/control-system/',
        'https://www.gasgx.com/rankings/depreciation/',
        'https://www.gasgx.com/rankings/efficiency/',
        'https://www.gasgx.com/rankings/emissions/',
        'https://www.gasgx.com/rankings/engine-efficiency/',
        'https://www.gasgx.com/rankings/engine-roi/',
        'https://www.gasgx.com/rankings/gas-consumption/',
        'https://www.gasgx.com/rankings/generator/',
        'https://www.gasgx.com/rankings/lcoe/',
        'https://www.gasgx.com/rankings/maintenance-interval/',
        'https://www.gasgx.com/rankings/middle-east/',
        'https://www.gasgx.com/rankings/mtbf/',
        'https://www.gasgx.com/rankings/noise/',
        'https://www.gasgx.com/rankings/performance/',
        'https://www.gasgx.com/rankings/reliability/',
        'https://www.gasgx.com/rankings/roi/',
        'https://www.gasgx.com/rankings/russia/',
        'https://www.gasgx.com/rankings/spare-parts/',
        'https://www.gasgx.com/rankings/thermal-efficiency/',
        'https://www.gasgx.com/rankings/usa/',
        'https://www.gasgx.com/resources/case-studies/',
        'https://www.gasgx.com/resources/case-studies/regions/',
        'https://www.gasgx.com/resources/case-studies/scenarios/',
        'https://www.gasgx.com/resources/certifications/',
        'https://www.gasgx.com/resources/datasheets/',
        'https://www.gasgx.com/resources/faq/',
        'https://www.gasgx.com/resources/reports/',
        'https://www.gasgx.com/resources/videos/',
        'https://www.gasgx.com/resources/whitepapers/',
        'https://www.gasgx.com/solutions/',
        'https://www.gasgx.com/solutions/chp/',
        'https://www.gasgx.com/solutions/industrial/',
        'https://www.gasgx.com/solutions/mining/',
        'https://www.gasgx.com/solutions/oilfield/',
        'https://www.gasgx.com/support/network/',
        'https://www.gasgx.com/support/service/',
        'https://www.gasgx.com/support/tech/',
        'https://www.gasgx.com/use-cases/',
        'https://www.gasgx.com/use-cases/chp/',
        'https://www.gasgx.com/use-cases/industrial/',
        'https://www.gasgx.com/use-cases/mining/',
        'https://www.gasgx.com/use-cases/oilfield/'
    )
);

insert into public.knowledge_chunks (document_id, chunk_text, chunk_summary, language, keywords, section_path, sort_order, token_count, source_meta, search_text)
values
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/about/company/' limit 1),
        '# Connecting Stranded Gas to Global Compute Power

GasGx 是全球领先的天然气发电与算力结合的行研平台。我们专注于解决伴生气放散问题，提供从燃气发电机组选型到比特币挖矿及 AI 数据中心建设的全链路可行性分析。

## /// Our Expertise

我们不仅仅是一个数据库，更是连接能源与数字资产的桥梁。

### Data Insights

收录全球主流燃气发电机组参数（CAT, Jenbacher等），提供针对高硫气、伴生气的设备选型建议与效率对比。

### Compute Integration

专注于比特币挖矿与 AI 高性能计算的能源供给研究。分析算力功耗比，设计集装箱式、浸没式液冷的现场部署方案。

### Financial Models

基于 CAPEX/OPEX 的深度财务模型。涵盖碳信用（Carbon Credits）变现、电力套利策略以及合规性风险评估。

## Ready to Monetize Your Stranded Gas?

GasGx 2026 行业白皮书现已开放。立即联系我们获取针对您的气井或矿场的定制化能源报告。',
        '# Connecting Stranded Gas to Global Compute Power

GasGx 是全球领先的天然气发电与算力结合的行研平台。我们专注于解决伴生气放散问题，提供从燃气发电机组选型到比特币挖矿及 AI 数据中心建设的全链路可行性分析。

## /// Our Expertise

我们不仅仅是一个数据库，更是连接能源与数字资产的桥梁。

### Data Insights

收录全球主流燃气发电机组参数（C',
        'zh',
        array['about', 'gasgx', '天然气发电算力行业研究平台', '天然', '然气', '气发', '发电', '电算', '算力', '力行', '行业', '业研', '研究', '究平', '平台', 'https', 'www', 'com', 'company', 'connecting', 'stranded', 'gas', 'to', 'global', 'compute', 'power', '是全球领先的天然气发电与算力结合的行研平台', '我们专注于解决伴生气放散问题', '我们', '们专', '专注', '注于', '于解', '解决', '决伴', '伴生', '生气', '气放', '放散', '散问', '问题', '提供从燃气发电机组选型到比特币挖矿及', 'ai', '数据中心建设的全链路可行性分析', '数据', '据中', '中心', '心建', '建设', '设的', '的全', '全链', '链路', '路可', '可行', '行性', '性分', '分析', 'our', 'expertise', '我们不仅仅是一个数据库', '们不', '不仅', '仅仅', '仅是', '是一', '一个', '个数', '据库', '更是连接能源与数字资产的桥梁', '更是', '是连', '连接', '接能', '能源', '源与', '与数', '数字', '字资', '资产']::text[],
        'Ready to Monetize Your Stranded Gas?',
        0,
        128,
        '{"path": "/about/company/", "snapshot_kind": "site_html"}'::jsonb,
        '# Connecting Stranded Gas to Global Compute Power

GasGx 是全球领先的天然气发电与算力结合的行研平台。我们专注于解决伴生气放散问题，提供从燃气发电机组选型到比特币挖矿及 AI 数据中心建设的全链路可行性分析。

## /// Our Expertise

我们不仅仅是一个数据库，更是连接能源与数字资产的桥梁。

### Data Insights

收录全球主流燃气发电机组参数（CAT, Jenbacher等），提供针对高硫气、伴生气的设备选型建议与效率对比。

### Compute Integration

专注于比特币挖矿与 AI 高性能计算的能源供给研究。分析算力功耗比，设计集装箱式、浸没式液冷的现场部署方案。

### Financial Models

基于 CAPEX/OPEX 的深度财务模型。涵盖碳信用（Carbon Credits）变现、电力套利策略以及合规性风险评估。

## Ready to Monetize Your Stranded Gas?

GasGx 2026 行业白皮书现已开放。立即联系我们获取针对您的气井或矿场的定制化能源报告。 # Connecting Stranded Gas to Global Compute Power

GasGx 是全球领先的天然气发电与算力结合的行研平台。我们专注于解决伴生气放散问题，提供从燃气发电机组选型到比特币挖矿及 AI 数据中心建设的全链路可行性分析。

## /// Our Expertise

我们不仅仅是一个数据库，更是连接能源与数字资产的桥梁。

### Data Insights

收录全球主流燃气发电机组参数（C about gasgx 天然气发电算力行业研究平台 天然 然气 气发 发电 电算 算力 力行 行业 业研 研究 究平 平台 https www com company connecting stranded gas to global compute power 是全球领先的天然气发电与算力结合的行研平台 我们专注于解决伴生气放散问题 我们 们专 专注 注于 于解 解决 决伴 伴生 生气 气放 放散 散问 问题 提供从燃气发电机组选型到比特币挖矿及 ai 数据中心建设的全链路可行性分析 数据 据中 中心 心建 建设 设的 的全 全链 链路 路可 可行 行性 性分 分析 our expertise 我们不仅仅是一个数据库 们不 不仅 仅仅 仅是 是一 一个 个数 据库 更是连接能源与数字资产的桥梁 更是 是连 连接 接能 能源 源与 与数 数字 字资 资产'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/about/contact/' limit 1),
        '# Get in Touch

无论是项目咨询、白皮书索取还是技术合作，GasGx 团队随时为您提供支持。

### Email Us

contact@gasgx.com

### Social Networks

Click icon to scan QR code',
        '# Get in Touch

无论是项目咨询、白皮书索取还是技术合作，GasGx 团队随时为您提供支持。

### Email Us

contact@gasgx.com

### Social Networks

Click icon to scan QR code',
        'zh',
        array['contact', 'gasgx', '联系我们', '联系', '系我', '我们', 'https', 'www', 'com', 'about', 'get', 'in', 'touch', '无论是项目咨询', '无论', '论是', '是项', '项目', '目咨', '咨询', '白皮书索取还是技术合作', '白皮', '皮书', '书索', '索取', '取还', '还是', '是技', '技术', '术合', '合作', '团队随时为您提供支持', '团队', '队随', '随时', '时为', '为您', '您提', '提供', '供支', '支持', 'email', 'us', 'social', 'networks', 'click', 'icon', 'to', 'scan', 'qr', 'code']::text[],
        'Social Networks',
        0,
        34,
        '{"path": "/about/contact/", "snapshot_kind": "site_html"}'::jsonb,
        '# Get in Touch

无论是项目咨询、白皮书索取还是技术合作，GasGx 团队随时为您提供支持。

### Email Us

contact@gasgx.com

### Social Networks

Click icon to scan QR code # Get in Touch

无论是项目咨询、白皮书索取还是技术合作，GasGx 团队随时为您提供支持。

### Email Us

contact@gasgx.com

### Social Networks

Click icon to scan QR code contact gasgx 联系我们 联系 系我 我们 https www com about get in touch 无论是项目咨询 无论 论是 是项 项目 目咨 咨询 白皮书索取还是技术合作 白皮 皮书 书索 索取 取还 还是 是技 技术 术合 合作 团队随时为您提供支持 团队 队随 随时 时为 为您 您提 提供 供支 支持 email us social networks click icon to scan qr code'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/digitalization/ecm/' limit 1),
        '# GasGx ECM Controller

GasGx ECM Controller is a diagnostic and simulation page for gas-engine control, focusing on speed control, ignition, lambda, water temperature, oil pressure and protective trip logic.

## Diagnostic Focus

- Remote diagnostics and log analysis
- ECU and actuator behavior under fault scenarios
- Speed, lambda, MAP, water temperature and oil-pressure trends
- Expert-system style fault narrative for root cause and solution guidance

## Use In GasGx Context

The page positions ECM as a control-layer capability inside GasGx digital operations, helping engineering and O&M teams diagnose genset behavior before field dispatch or onsite troubleshooting.',
        '# GasGx ECM Controller

GasGx ECM Controller is a diagnostic and simulation page for gas-engine control, focusing on speed control, ignition, lambda, water temperature, oil pressure and protective trip logic.

## Diagnos',
        'en',
        array['gasgx', 'ecm', 'controller', 'https', 'www', 'com', 'digitalization', 'demonstrates', 'engine', 'control', 'diagnostics', 'for', 'speed', 'ignition', 'lambda', 'water', 'temperature', 'oil', 'pressure', 'remote', 'and', 'fault', 'narratives', 'is', 'diagnostic', 'simulation', 'page', 'gas', 'focusing', 'on', 'protective', 'trip', 'logic', 'focus', 'log', 'analysis', 'ecu', 'actuator', 'behavior', 'under', 'scenarios', 'map', 'trends', 'expert', 'system', 'style', 'narrative', 'root', 'cause', 'solution', 'guidance', 'use', 'in', 'context', 'the', 'positions', 'as', 'layer', 'capability', 'inside', 'digital', 'operations', 'helping', 'engineering', 'teams', 'diagnose', 'genset', 'before', 'field', 'dispatch', 'or', 'onsite', 'troubleshooting']::text[],
        'Use In GasGx Context',
        0,
        169,
        '{"path": "/digitalization/ecm/", "snapshot_kind": "override"}'::jsonb,
        '# GasGx ECM Controller

GasGx ECM Controller is a diagnostic and simulation page for gas-engine control, focusing on speed control, ignition, lambda, water temperature, oil pressure and protective trip logic.

## Diagnostic Focus

- Remote diagnostics and log analysis
- ECU and actuator behavior under fault scenarios
- Speed, lambda, MAP, water temperature and oil-pressure trends
- Expert-system style fault narrative for root cause and solution guidance

## Use In GasGx Context

The page positions ECM as a control-layer capability inside GasGx digital operations, helping engineering and O&M teams diagnose genset behavior before field dispatch or onsite troubleshooting. # GasGx ECM Controller

GasGx ECM Controller is a diagnostic and simulation page for gas-engine control, focusing on speed control, ignition, lambda, water temperature, oil pressure and protective trip logic.

## Diagnos gasgx ecm controller https www com digitalization demonstrates engine control diagnostics for speed ignition lambda water temperature oil pressure remote and fault narratives is diagnostic simulation page gas focusing on protective trip logic focus log analysis ecu actuator behavior under scenarios map trends expert system style narrative root cause solution guidance use in context the positions as layer capability inside digital operations helping engineering teams diagnose genset before field dispatch or onsite troubleshooting'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/digitalization/ims/' limit 1),
        '# 让跨国运维 从未如此简单 Cross-Border O&M Made Effortless

GasGx 将中国强大的备件供应链与全球电站运维一线实时耦合。通过数字孪生配件追踪与智能预警，确保每一个节点都拥有“总仓级”的控制力。 GasGx connects China''s spare-parts supply with global site O&M in real time, using digital-twin tracking and predictive alerts.

## 全球补给桥梁 THE BRIDGE 中国制造，全球云管 China Built, Cloud Operated Globally

我们构建了从中国四大中心仓（上海、深圳、成都、北京）到全球 140+ 运维站点的数字化桥梁。通过 GasGx 出入库系统，每一件备件在离开中国工厂的瞬间，就已经进入了全球站点的在途预报清单。 We built a digital bridge from four China hub warehouses to 140+ global O&M sites. Every spare enters the in-transit forecast list the moment it leaves factory.

#### 中国集采中心 China Central Procurement Hub

统一质检、数字化赋码、HS编码自动匹配 Unified QC, digital tagging, HS-code matching

#### 全球节点一致性 Global Node Consistency

多语言库存对照、跨时区自动同步、当地关税预估 Multilingual inventory map, timezone sync, duty forecast

## 资产拆解视图 Asset Explosion

点击机组任何部位，查看其背后的库存健康度与全球调拨计划 Tap any module to inspect inventory health and global dispatch plans.

#### 整流二极管 Rectifier Diode SKU:51719193

跨境预警补给流 Cross-Border Alert Replenishment',
        '# 让跨国运维 从未如此简单 Cross-Border O&M Made Effortless

GasGx 将中国强大的备件供应链与全球电站运维一线实时耦合。通过数字孪生配件追踪与智能预警，确保每一个节点都拥有“总仓级”的控制力。 GasGx connects China''s spare-parts supply with global site O&M in real time, using digital-twin trackin',
        'zh',
        array['gasgx', 'ims', '全球燃气电站物资数字孪生系统', '全球', '球燃', '燃气', '气电', '电站', '站物', '物资', '资数', '数字', '字孪', '孪生', '生系', '系统', 'https', 'www', 'com', 'digitalization', '让跨国运维', '让跨', '跨国', '国运', '运维', '从未如此简单', '从未', '未如', '如此', '此简', '简单', 'cross', 'border', 'made', 'effortless', '将中国强大的备件供应链与全球电站运维一线实时耦合', '通过数字孪生配件追踪与智能预警', '通过', '过数', '生配', '配件', '件追', '追踪', '踪与', '与智', '智能', '能预', '预警', '确保每一个节点都拥有', '确保', '保每', '每一', '一个', '个节', '节点', '点都', '都拥', '拥有', '总仓级', '总仓', '仓级', '的控制力', '的控', '控制', '制力', 'connects', 'china', 'spare', 'parts', 'supply', 'with', 'global', 'site', 'in', 'real', 'time', 'using', 'digital', 'twin', 'tracking']::text[],
        '整流二极管 Rectifier Diode SKU:51719193',
        0,
        251,
        '{"path": "/digitalization/ims/", "snapshot_kind": "site_html"}'::jsonb,
        '# 让跨国运维 从未如此简单 Cross-Border O&M Made Effortless

GasGx 将中国强大的备件供应链与全球电站运维一线实时耦合。通过数字孪生配件追踪与智能预警，确保每一个节点都拥有“总仓级”的控制力。 GasGx connects China''s spare-parts supply with global site O&M in real time, using digital-twin tracking and predictive alerts.

## 全球补给桥梁 THE BRIDGE 中国制造，全球云管 China Built, Cloud Operated Globally

我们构建了从中国四大中心仓（上海、深圳、成都、北京）到全球 140+ 运维站点的数字化桥梁。通过 GasGx 出入库系统，每一件备件在离开中国工厂的瞬间，就已经进入了全球站点的在途预报清单。 We built a digital bridge from four China hub warehouses to 140+ global O&M sites. Every spare enters the in-transit forecast list the moment it leaves factory.

#### 中国集采中心 China Central Procurement Hub

统一质检、数字化赋码、HS编码自动匹配 Unified QC, digital tagging, HS-code matching

#### 全球节点一致性 Global Node Consistency

多语言库存对照、跨时区自动同步、当地关税预估 Multilingual inventory map, timezone sync, duty forecast

## 资产拆解视图 Asset Explosion

点击机组任何部位，查看其背后的库存健康度与全球调拨计划 Tap any module to inspect inventory health and global dispatch plans.

#### 整流二极管 Rectifier Diode SKU:51719193

跨境预警补给流 Cross-Border Alert Replenishment # 让跨国运维 从未如此简单 Cross-Border O&M Made Effortless

GasGx 将中国强大的备件供应链与全球电站运维一线实时耦合。通过数字孪生配件追踪与智能预警，确保每一个节点都拥有“总仓级”的控制力。 GasGx connects China''s spare-parts supply with global site O&M in real time, using digital-twin trackin gasgx ims 全球燃气电站物资数字孪生系统 全球 球燃 燃气 气电 电站 站物 物资 资数 数字 字孪 孪生 生系 系统 https www com digitalization 让跨国运维 让跨 跨国 国运 运维 从未如此简单 从未 未如 如此 此简 简单 cross border made effortless 将中国强大的备件供应链与全球电站运维一线实时耦合 通过数字孪生配件追踪与智能预警 通过 过数 生配 配件 件追 追踪 踪与 与智 智能 能预 预警 确保每一个节点都拥有 确保 保每 每一 一个 个节 节点 点都 都拥 拥有 总仓级 总仓 仓级 的控制力 的控 控制 制力 connects china spare parts supply with global site in real time using digital twin tracking'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/digitalization/ims/' limit 1),
        '检测到机组累计运行 3500h，已触发中国总仓向拉各斯站点调拨 4 套配件。 At 3500 runtime hours, the system triggered dispatch of 4 kits from China HQ to Lagos.

#### 全球库存一致性摘要 Global Inventory Snapshot

中国总仓 China Central Hub

2,400

海外站点总计 Overseas Total

482

## 终极运维流程 ULTIMATE WORKFLOW

这不只是几个界面。这是整合了机器视觉、GPS 地理围栏、实时报关 API 与多币种清算的超级运维终端。 Beyond dashboards, this is a full operations terminal with machine vision, geofencing, customs APIs and multi-currency settlement.

### #01 智能入库流程 #01 SMART_INBOUND.exe

AI 增强入库工作流 AI-Augmented Inbound Workflow

入库详情复核 Inbound Detail Review

### #02 预警中心 #02 ALERT_CENTER.node

全球跨时区库存熔断预警 Cross-Timezone Inventory Breakpoint Alerts

系统预测未来 72h 内需进行 4000h 中检，目前现场库存：0。中国总仓调拨物资正在清关中。 A 4000-hour inspection is predicted within 72h. On-site stock is zero and emergency parts from China are in customs clearance.

### #03 全域管理中枢 #03 GLOBAL_ADMIN.sys

全域管理员权限镜像 Global Admin Permission Mirror

艾伦_领矿 ALLEN_LINKMINE

跨境运维总控 Cross-Border Ops Master

资产总额 Total Assets

1.2M $

全球用户 Global Users

842

## 重塑运维 Redefine Maintenance',
        '检测到机组累计运行 3500h，已触发中国总仓向拉各斯站点调拨 4 套配件。 At 3500 runtime hours, the system triggered dispatch of 4 kits from China HQ to Lagos.

#### 全球库存一致性摘要 Global Inventory Snapshot

中国总仓 China Central Hub

2,400

海外站点总计 Overseas Tota',
        'zh',
        array['gasgx', 'ims', '全球燃气电站物资数字孪生系统', '全球', '球燃', '燃气', '气电', '电站', '站物', '物资', '资数', '数字', '字孪', '孪生', '生系', '系统', 'https', 'www', 'com', 'digitalization', '让跨国运维', '让跨', '跨国', '国运', '运维', '从未如此简单', '从未', '未如', '如此', '此简', '简单', 'cross', 'border', 'made', 'effortless', '将中国强大的备件供应链与全球电站运维一线实时耦合', '通过数字孪生配件追踪与智能预警', '通过', '过数', '生配', '配件', '件追', '追踪', '踪与', '与智', '智能', '能预', '预警', '确保每一个节点都拥有', '确保', '保每', '每一', '一个', '个节', '节点', '点都', '都拥', '拥有', '总仓级', '总仓', '仓级', '的控制力', '的控', '控制', '制力', 'connects', 'china', 'spare', 'parts', 'supply', 'with', 'global', 'site', 'in', 'real', 'time', 'using', 'digital', 'twin', 'tracking']::text[],
        '重塑运维 Redefine Maintenance',
        1,
        255,
        '{"path": "/digitalization/ims/", "snapshot_kind": "site_html"}'::jsonb,
        '检测到机组累计运行 3500h，已触发中国总仓向拉各斯站点调拨 4 套配件。 At 3500 runtime hours, the system triggered dispatch of 4 kits from China HQ to Lagos.

#### 全球库存一致性摘要 Global Inventory Snapshot

中国总仓 China Central Hub

2,400

海外站点总计 Overseas Total

482

## 终极运维流程 ULTIMATE WORKFLOW

这不只是几个界面。这是整合了机器视觉、GPS 地理围栏、实时报关 API 与多币种清算的超级运维终端。 Beyond dashboards, this is a full operations terminal with machine vision, geofencing, customs APIs and multi-currency settlement.

### #01 智能入库流程 #01 SMART_INBOUND.exe

AI 增强入库工作流 AI-Augmented Inbound Workflow

入库详情复核 Inbound Detail Review

### #02 预警中心 #02 ALERT_CENTER.node

全球跨时区库存熔断预警 Cross-Timezone Inventory Breakpoint Alerts

系统预测未来 72h 内需进行 4000h 中检，目前现场库存：0。中国总仓调拨物资正在清关中。 A 4000-hour inspection is predicted within 72h. On-site stock is zero and emergency parts from China are in customs clearance.

### #03 全域管理中枢 #03 GLOBAL_ADMIN.sys

全域管理员权限镜像 Global Admin Permission Mirror

艾伦_领矿 ALLEN_LINKMINE

跨境运维总控 Cross-Border Ops Master

资产总额 Total Assets

1.2M $

全球用户 Global Users

842

## 重塑运维 Redefine Maintenance 检测到机组累计运行 3500h，已触发中国总仓向拉各斯站点调拨 4 套配件。 At 3500 runtime hours, the system triggered dispatch of 4 kits from China HQ to Lagos.

#### 全球库存一致性摘要 Global Inventory Snapshot

中国总仓 China Central Hub

2,400

海外站点总计 Overseas Tota gasgx ims 全球燃气电站物资数字孪生系统 全球 球燃 燃气 气电 电站 站物 物资 资数 数字 字孪 孪生 生系 系统 https www com digitalization 让跨国运维 让跨 跨国 国运 运维 从未如此简单 从未 未如 如此 此简 简单 cross border made effortless 将中国强大的备件供应链与全球电站运维一线实时耦合 通过数字孪生配件追踪与智能预警 通过 过数 生配 配件 件追 追踪 踪与 与智 智能 能预 预警 确保每一个节点都拥有 确保 保每 每一 一个 个节 节点 点都 都拥 拥有 总仓级 总仓 仓级 的控制力 的控 控制 制力 connects china spare parts supply with global site in real time using digital twin tracking'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/digitalization/ims/' limit 1),
        '停止在表格中寻找物资，开始在地图上指挥战斗。GasGx 为您的全球燃气电站提供最坚韧的数字化补给线。 Stop searching parts in spreadsheets and command supply on the map. GasGx provides a resilient digital lifeline for global gas power plants.',
        '停止在表格中寻找物资，开始在地图上指挥战斗。GasGx 为您的全球燃气电站提供最坚韧的数字化补给线。 Stop searching parts in spreadsheets and command supply on the map. GasGx provides a resilient digital lifeline for global gas power plants.',
        'zh',
        array['gasgx', 'ims', '全球燃气电站物资数字孪生系统', '全球', '球燃', '燃气', '气电', '电站', '站物', '物资', '资数', '数字', '字孪', '孪生', '生系', '系统', 'https', 'www', 'com', 'digitalization', '让跨国运维', '让跨', '跨国', '国运', '运维', '从未如此简单', '从未', '未如', '如此', '此简', '简单', 'cross', 'border', 'made', 'effortless', '将中国强大的备件供应链与全球电站运维一线实时耦合', '通过数字孪生配件追踪与智能预警', '通过', '过数', '生配', '配件', '件追', '追踪', '踪与', '与智', '智能', '能预', '预警', '确保每一个节点都拥有', '确保', '保每', '每一', '一个', '个节', '节点', '点都', '都拥', '拥有', '总仓级', '总仓', '仓级', '的控制力', '的控', '控制', '制力', 'connects', 'china', 'spare', 'parts', 'supply', 'with', 'global', 'site', 'in', 'real', 'time', 'using', 'digital', 'twin', 'tracking']::text[],
        '重塑运维 Redefine Maintenance',
        2,
        48,
        '{"path": "/digitalization/ims/", "snapshot_kind": "site_html"}'::jsonb,
        '停止在表格中寻找物资，开始在地图上指挥战斗。GasGx 为您的全球燃气电站提供最坚韧的数字化补给线。 Stop searching parts in spreadsheets and command supply on the map. GasGx provides a resilient digital lifeline for global gas power plants. 停止在表格中寻找物资，开始在地图上指挥战斗。GasGx 为您的全球燃气电站提供最坚韧的数字化补给线。 Stop searching parts in spreadsheets and command supply on the map. GasGx provides a resilient digital lifeline for global gas power plants. gasgx ims 全球燃气电站物资数字孪生系统 全球 球燃 燃气 气电 电站 站物 物资 资数 数字 字孪 孪生 生系 系统 https www com digitalization 让跨国运维 让跨 跨国 国运 运维 从未如此简单 从未 未如 如此 此简 简单 cross border made effortless 将中国强大的备件供应链与全球电站运维一线实时耦合 通过数字孪生配件追踪与智能预警 通过 过数 生配 配件 件追 追踪 踪与 与智 智能 能预 预警 确保每一个节点都拥有 确保 保每 每一 一个 个节 节点 点都 都拥 拥有 总仓级 总仓 仓级 的控制力 的控 控制 制力 connects china spare parts supply with global site in real time using digital twin tracking'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/digitalization/platform/' limit 1),
        '# 全链路接管 Full-Stack Takeover 全球分布式燃气算力 Global Distributed Gas Hashrate 超级数字中枢 Super Digital Hub

打破传统机械制造与加密挖矿的运维代沟。一套系统，横跨硬件采集、中控大屏、AI诊断与移动工单。让全球十万台散落的机组，如同一台机器般运转。 Bridging the O&M gap between traditional manufacturing and crypto mining. One system across edge hardware, SCADA, AI diagnostics, and mobile dispatch. Make 100,000 scattered gen-sets run as one.

Trust By Global Crypto Miners & Energy Providers

## 当百年机械制造， 遭遇 毫秒必争的算力狂潮

## When Century-old Manufacturing, Meets Millisecond Crypto Mining

### 主机厂的“失控孤岛”

### OEM''s "Isolated Islands"

机组被卖到得州荒漠、西伯利亚冻土。物理空间的极度分散，让传统的巡检、维保体系瞬间瘫痪。机器运行状态沦为“黑盒”，售后变成了高昂且低效的“跨洋救火”。

Gen-sets sold to Texas deserts or Siberian permafrost. Extreme physical dispersion paralyzes traditional O&M. Machine status becomes a "black box," making after-sales an expensive and inefficient "cross-ocean firefighting."

### 挖矿客户的“生死时速”

### Miners'' "Race Against Time"

比特币挖矿要求 7×24 小时满负荷极限压榨。停机一分钟就是实打实的算力损失与资金蒸发。孤网环境下，极端的负载要求与滞后的维修响应构成了致命矛盾。',
        '# 全链路接管 Full-Stack Takeover 全球分布式燃气算力 Global Distributed Gas Hashrate 超级数字中枢 Super Digital Hub

打破传统机械制造与加密挖矿的运维代沟。一套系统，横跨硬件采集、中控大屏、AI诊断与移动工单。让全球十万台散落的机组，如同一台机器般运转。 Bridging the O&M gap between traditional manufacturing ',
        'zh',
        array['gasgx', '智维云', '智维', '维云', '全球分布式燃气算力电站', '全球', '球分', '分布', '布式', '式燃', '燃气', '气算', '算力', '力电', '电站', '领航者', '领航', '航者', 'https', 'www', 'com', 'digitalization', 'platform', '全链路接管', '全链', '链路', '路接', '接管', 'full', 'stack', 'takeover', '全球分布式燃气算力', 'global', 'distributed', 'gas', 'hashrate', '超级数字中枢', '超级', '级数', '数字', '字中', '中枢', 'super', 'digital', 'hub', '打破传统机械制造与加密挖矿的运维代沟', '一套系统', '一套', '套系', '系统', '横跨硬件采集', '横跨', '跨硬', '硬件', '件采', '采集', '中控大屏', '中控', '控大', '大屏', 'ai', '诊断与移动工单', '诊断', '断与', '与移', '移动', '动工', '工单', '让全球十万台散落的机组', '让全', '球十', '十万', '万台', '台散', '散落', '落的', '的机', '机组', '如同一台机器般运转', '如同']::text[],
        'Miners'' "Race Against Time"',
        0,
        242,
        '{"path": "/digitalization/platform/", "snapshot_kind": "site_html"}'::jsonb,
        '# 全链路接管 Full-Stack Takeover 全球分布式燃气算力 Global Distributed Gas Hashrate 超级数字中枢 Super Digital Hub

打破传统机械制造与加密挖矿的运维代沟。一套系统，横跨硬件采集、中控大屏、AI诊断与移动工单。让全球十万台散落的机组，如同一台机器般运转。 Bridging the O&M gap between traditional manufacturing and crypto mining. One system across edge hardware, SCADA, AI diagnostics, and mobile dispatch. Make 100,000 scattered gen-sets run as one.

Trust By Global Crypto Miners & Energy Providers

## 当百年机械制造， 遭遇 毫秒必争的算力狂潮

## When Century-old Manufacturing, Meets Millisecond Crypto Mining

### 主机厂的“失控孤岛”

### OEM''s "Isolated Islands"

机组被卖到得州荒漠、西伯利亚冻土。物理空间的极度分散，让传统的巡检、维保体系瞬间瘫痪。机器运行状态沦为“黑盒”，售后变成了高昂且低效的“跨洋救火”。

Gen-sets sold to Texas deserts or Siberian permafrost. Extreme physical dispersion paralyzes traditional O&M. Machine status becomes a "black box," making after-sales an expensive and inefficient "cross-ocean firefighting."

### 挖矿客户的“生死时速”

### Miners'' "Race Against Time"

比特币挖矿要求 7×24 小时满负荷极限压榨。停机一分钟就是实打实的算力损失与资金蒸发。孤网环境下，极端的负载要求与滞后的维修响应构成了致命矛盾。 # 全链路接管 Full-Stack Takeover 全球分布式燃气算力 Global Distributed Gas Hashrate 超级数字中枢 Super Digital Hub

打破传统机械制造与加密挖矿的运维代沟。一套系统，横跨硬件采集、中控大屏、AI诊断与移动工单。让全球十万台散落的机组，如同一台机器般运转。 Bridging the O&M gap between traditional manufacturing  gasgx 智维云 智维 维云 全球分布式燃气算力电站 全球 球分 分布 布式 式燃 燃气 气算 算力 力电 电站 领航者 领航 航者 https www com digitalization platform 全链路接管 全链 链路 路接 接管 full stack takeover 全球分布式燃气算力 global distributed gas hashrate 超级数字中枢 超级 级数 数字 字中 中枢 super digital hub 打破传统机械制造与加密挖矿的运维代沟 一套系统 一套 套系 系统 横跨硬件采集 横跨 跨硬 硬件 件采 采集 中控大屏 中控 控大 大屏 ai 诊断与移动工单 诊断 断与 与移 移动 动工 工单 让全球十万台散落的机组 让全 球十 十万 万台 台散 散落 落的 的机 机组 如同一台机器般运转 如同'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/digitalization/platform/' limit 1),
        'Bitcoin mining demands 24/7 limit-pushing operation. A minute of downtime means real hash rate and capital loss. In isolated grids, extreme load demands and delayed maintenance create a fatal contradiction.

## 第一道防线：GasGx 边缘计算网关

## The First Line of Defense: GasGx Edge IoT Gateway

直连底层 PLC 与传感器，强力破除信息孤岛。在极端恶劣环境下，依然能将百种高频数据压缩加密，通过 4G/星链 稳定上云。

Direct connection to underlying PLC and sensors, shattering information silos. In extreme environments, it compresses and encrypts hundreds of high-frequency data points for stable cloud uplink via 4G/Starlink.

#### 广泛的协议兼容

#### Extensive Protocol Compatibility

内置解析引擎，全面兼容 J1939、Modbus RTU/TCP 等工业协议。无缝对接各类主流燃气发电机组 (Jenbacher, Caterpillar, Cummins 等)。

Built-in parsing engine, fully compatible with J1939, Modbus RTU/TCP. Seamlessly integrates with mainstream gas gen-sets (Jenbacher, CAT, Cummins).

#### 边缘侧毫秒级响应

#### Millisecond Edge Response

在设备端即可执行基础的阈值判断。当发生致命过载时，无需等待云端指令，网关直接下发停机保护信号，守护百万资产。',
        'Bitcoin mining demands 24/7 limit-pushing operation. A minute of downtime means real hash rate and capital loss. In isolated grids, extreme load demands and delayed maintenance create a fatal contradiction.

## 第一道防线：Gas',
        'zh',
        array['gasgx', '智维云', '智维', '维云', '全球分布式燃气算力电站', '全球', '球分', '分布', '布式', '式燃', '燃气', '气算', '算力', '力电', '电站', '领航者', '领航', '航者', 'https', 'www', 'com', 'digitalization', 'platform', '全链路接管', '全链', '链路', '路接', '接管', 'full', 'stack', 'takeover', '全球分布式燃气算力', 'global', 'distributed', 'gas', 'hashrate', '超级数字中枢', '超级', '级数', '数字', '字中', '中枢', 'super', 'digital', 'hub', '打破传统机械制造与加密挖矿的运维代沟', '一套系统', '一套', '套系', '系统', '横跨硬件采集', '横跨', '跨硬', '硬件', '件采', '采集', '中控大屏', '中控', '控大', '大屏', 'ai', '诊断与移动工单', '诊断', '断与', '与移', '移动', '动工', '工单', '让全球十万台散落的机组', '让全', '球十', '十万', '万台', '台散', '散落', '落的', '的机', '机组', '如同一台机器般运转', '如同']::text[],
        'Millisecond Edge Response',
        1,
        239,
        '{"path": "/digitalization/platform/", "snapshot_kind": "site_html"}'::jsonb,
        'Bitcoin mining demands 24/7 limit-pushing operation. A minute of downtime means real hash rate and capital loss. In isolated grids, extreme load demands and delayed maintenance create a fatal contradiction.

## 第一道防线：GasGx 边缘计算网关

## The First Line of Defense: GasGx Edge IoT Gateway

直连底层 PLC 与传感器，强力破除信息孤岛。在极端恶劣环境下，依然能将百种高频数据压缩加密，通过 4G/星链 稳定上云。

Direct connection to underlying PLC and sensors, shattering information silos. In extreme environments, it compresses and encrypts hundreds of high-frequency data points for stable cloud uplink via 4G/Starlink.

#### 广泛的协议兼容

#### Extensive Protocol Compatibility

内置解析引擎，全面兼容 J1939、Modbus RTU/TCP 等工业协议。无缝对接各类主流燃气发电机组 (Jenbacher, Caterpillar, Cummins 等)。

Built-in parsing engine, fully compatible with J1939, Modbus RTU/TCP. Seamlessly integrates with mainstream gas gen-sets (Jenbacher, CAT, Cummins).

#### 边缘侧毫秒级响应

#### Millisecond Edge Response

在设备端即可执行基础的阈值判断。当发生致命过载时，无需等待云端指令，网关直接下发停机保护信号，守护百万资产。 Bitcoin mining demands 24/7 limit-pushing operation. A minute of downtime means real hash rate and capital loss. In isolated grids, extreme load demands and delayed maintenance create a fatal contradiction.

## 第一道防线：Gas gasgx 智维云 智维 维云 全球分布式燃气算力电站 全球 球分 分布 布式 式燃 燃气 气算 算力 力电 电站 领航者 领航 航者 https www com digitalization platform 全链路接管 全链 链路 路接 接管 full stack takeover 全球分布式燃气算力 global distributed gas hashrate 超级数字中枢 超级 级数 数字 字中 中枢 super digital hub 打破传统机械制造与加密挖矿的运维代沟 一套系统 一套 套系 系统 横跨硬件采集 横跨 跨硬 硬件 件采 采集 中控大屏 中控 控大 大屏 ai 诊断与移动工单 诊断 断与 与移 移动 动工 工单 让全球十万台散落的机组 让全 球十 十万 万台 台散 散落 落的 的机 机组 如同一台机器般运转 如同'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/digitalization/platform/' limit 1),
        'Executes threshold judgments at the device level. During fatal overloads, the gateway issues immediate shutdown signals without waiting for cloud commands, safeguarding millions in assets.

#### 断网续传机制

#### Offline Resumption

针对偏远矿场恶劣网络，内置本地缓存芯片，断网期间数据不丢失，网络恢复后自动进行时序对齐与补传。

Built-in cache chip for harsh remote networks. Data is retained during outages and automatically backfilled upon reconnection.

## 智维控制台：百兆瓦级集群，一屏尽览

## SCADA Console: 100MW+ Fleet at a Glance

告别 100 个现场的折返跑。现在，您可以坐在纽约的办公室，实时查看德州某一台机组 2 分钟前的火花塞点火电压。 (← 手机端请左右滑动查看完整控制台 →)

Say goodbye to running between 100 sites. Now, sit in your New York office and monitor the spark plug voltage of a Texas gen-set from 2 minutes ago. (← Swipe left/right on mobile to view full console →)

## AI 深度诊断引擎： 比经验最老的技师更 懂 你的机器

## AI Deep Diagnostics Engine: Knows Your Machine Better Than Veteran Techs

在伴生气（Flare Gas）或井口孤网发电中，气源的甲烷值（MN）波动极大。传统的固定阈值告警形同虚设。GasGx AI 结合设备机理，针对 Jenbacher, CAT 等大型燃气机 的核心痛点，提供提前数周的“预测性维护（PdM）”。',
        'Executes threshold judgments at the device level. During fatal overloads, the gateway issues immediate shutdown signals without waiting for cloud commands, safeguarding millions in assets.

#### 断网续传机制

#### Offline Resu',
        'zh',
        array['gasgx', '智维云', '智维', '维云', '全球分布式燃气算力电站', '全球', '球分', '分布', '布式', '式燃', '燃气', '气算', '算力', '力电', '电站', '领航者', '领航', '航者', 'https', 'www', 'com', 'digitalization', 'platform', '全链路接管', '全链', '链路', '路接', '接管', 'full', 'stack', 'takeover', '全球分布式燃气算力', 'global', 'distributed', 'gas', 'hashrate', '超级数字中枢', '超级', '级数', '数字', '字中', '中枢', 'super', 'digital', 'hub', '打破传统机械制造与加密挖矿的运维代沟', '一套系统', '一套', '套系', '系统', '横跨硬件采集', '横跨', '跨硬', '硬件', '件采', '采集', '中控大屏', '中控', '控大', '大屏', 'ai', '诊断与移动工单', '诊断', '断与', '与移', '移动', '动工', '工单', '让全球十万台散落的机组', '让全', '球十', '十万', '万台', '台散', '散落', '落的', '的机', '机组', '如同一台机器般运转', '如同']::text[],
        'AI Deep Diagnostics Engine: Knows Your Machine Better Than Veteran Techs',
        2,
        244,
        '{"path": "/digitalization/platform/", "snapshot_kind": "site_html"}'::jsonb,
        'Executes threshold judgments at the device level. During fatal overloads, the gateway issues immediate shutdown signals without waiting for cloud commands, safeguarding millions in assets.

#### 断网续传机制

#### Offline Resumption

针对偏远矿场恶劣网络，内置本地缓存芯片，断网期间数据不丢失，网络恢复后自动进行时序对齐与补传。

Built-in cache chip for harsh remote networks. Data is retained during outages and automatically backfilled upon reconnection.

## 智维控制台：百兆瓦级集群，一屏尽览

## SCADA Console: 100MW+ Fleet at a Glance

告别 100 个现场的折返跑。现在，您可以坐在纽约的办公室，实时查看德州某一台机组 2 分钟前的火花塞点火电压。 (← 手机端请左右滑动查看完整控制台 →)

Say goodbye to running between 100 sites. Now, sit in your New York office and monitor the spark plug voltage of a Texas gen-set from 2 minutes ago. (← Swipe left/right on mobile to view full console →)

## AI 深度诊断引擎： 比经验最老的技师更 懂 你的机器

## AI Deep Diagnostics Engine: Knows Your Machine Better Than Veteran Techs

在伴生气（Flare Gas）或井口孤网发电中，气源的甲烷值（MN）波动极大。传统的固定阈值告警形同虚设。GasGx AI 结合设备机理，针对 Jenbacher, CAT 等大型燃气机 的核心痛点，提供提前数周的“预测性维护（PdM）”。 Executes threshold judgments at the device level. During fatal overloads, the gateway issues immediate shutdown signals without waiting for cloud commands, safeguarding millions in assets.

#### 断网续传机制

#### Offline Resu gasgx 智维云 智维 维云 全球分布式燃气算力电站 全球 球分 分布 布式 式燃 燃气 气算 算力 力电 电站 领航者 领航 航者 https www com digitalization platform 全链路接管 全链 链路 路接 接管 full stack takeover 全球分布式燃气算力 global distributed gas hashrate 超级数字中枢 超级 级数 数字 字中 中枢 super digital hub 打破传统机械制造与加密挖矿的运维代沟 一套系统 一套 套系 系统 横跨硬件采集 横跨 跨硬 硬件 件采 采集 中控大屏 中控 控大 大屏 ai 诊断与移动工单 诊断 断与 与移 移动 动工 工单 让全球十万台散落的机组 让全 球十 十万 万台 台散 散落 落的 的机 机组 如同一台机器般运转 如同'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/digitalization/platform/' limit 1),
        'Flare gas or isolated wellhead power generation faces massive Methane Number (MN) fluctuations. Fixed thresholds fail. GasGx AI provides weeks of Predictive Maintenance (PdM) tailored for large gen-sets like Jenbacher and CAT .

#### 动态甲烷值与爆震预测

#### Dynamic MN & Knock Prediction

持续追踪点火提前角（Timing）与爆震传感器（Knock Sensor）频谱。当气源热值突变引发轻微爆震时，AI先于ECU限载前发现趋势，避免损坏活塞环。

Continuously tracks ignition timing and knock sensor spectrums. Catches trends before ECU derating to prevent piston ring damage when gas composition changes.

#### 各缸排温 (EGT) 偏差分析

#### Cylinder EGT Deviation Analysis

建立 V16/V20 发动机的气缸热力均衡模型。精准识别单个气缸高达 60°C 的温度漂移，判断是“火花塞失效”、“点火线圈老化”还是“混合气阀堵塞”。

Builds thermal equilibrium models for V16/V20 engines. Accurately identifies 60°C drifts in single cylinders to diagnose spark plug failure, coil aging, or valve blockage.

#### 机油压降与滤芯生命周期

#### Oil Pressure Drop & Filter Lifecycle

根据压降曲线斜率，AI 直接推算滤芯剩余寿命百分比，结合 WMS 仓储库存，自动发起“按需保养”工单，告别盲目的定期更换。',
        'Flare gas or isolated wellhead power generation faces massive Methane Number (MN) fluctuations. Fixed thresholds fail. GasGx AI provides weeks of Predictive Maintenance (PdM) tailored for large gen-sets like Jenbacher an',
        'zh',
        array['gasgx', '智维云', '智维', '维云', '全球分布式燃气算力电站', '全球', '球分', '分布', '布式', '式燃', '燃气', '气算', '算力', '力电', '电站', '领航者', '领航', '航者', 'https', 'www', 'com', 'digitalization', 'platform', '全链路接管', '全链', '链路', '路接', '接管', 'full', 'stack', 'takeover', '全球分布式燃气算力', 'global', 'distributed', 'gas', 'hashrate', '超级数字中枢', '超级', '级数', '数字', '字中', '中枢', 'super', 'digital', 'hub', '打破传统机械制造与加密挖矿的运维代沟', '一套系统', '一套', '套系', '系统', '横跨硬件采集', '横跨', '跨硬', '硬件', '件采', '采集', '中控大屏', '中控', '控大', '大屏', 'ai', '诊断与移动工单', '诊断', '断与', '与移', '移动', '动工', '工单', '让全球十万台散落的机组', '让全', '球十', '十万', '万台', '台散', '散落', '落的', '的机', '机组', '如同一台机器般运转', '如同']::text[],
        'Oil Pressure Drop & Filter Lifecycle',
        3,
        237,
        '{"path": "/digitalization/platform/", "snapshot_kind": "site_html"}'::jsonb,
        'Flare gas or isolated wellhead power generation faces massive Methane Number (MN) fluctuations. Fixed thresholds fail. GasGx AI provides weeks of Predictive Maintenance (PdM) tailored for large gen-sets like Jenbacher and CAT .

#### 动态甲烷值与爆震预测

#### Dynamic MN & Knock Prediction

持续追踪点火提前角（Timing）与爆震传感器（Knock Sensor）频谱。当气源热值突变引发轻微爆震时，AI先于ECU限载前发现趋势，避免损坏活塞环。

Continuously tracks ignition timing and knock sensor spectrums. Catches trends before ECU derating to prevent piston ring damage when gas composition changes.

#### 各缸排温 (EGT) 偏差分析

#### Cylinder EGT Deviation Analysis

建立 V16/V20 发动机的气缸热力均衡模型。精准识别单个气缸高达 60°C 的温度漂移，判断是“火花塞失效”、“点火线圈老化”还是“混合气阀堵塞”。

Builds thermal equilibrium models for V16/V20 engines. Accurately identifies 60°C drifts in single cylinders to diagnose spark plug failure, coil aging, or valve blockage.

#### 机油压降与滤芯生命周期

#### Oil Pressure Drop & Filter Lifecycle

根据压降曲线斜率，AI 直接推算滤芯剩余寿命百分比，结合 WMS 仓储库存，自动发起“按需保养”工单，告别盲目的定期更换。 Flare gas or isolated wellhead power generation faces massive Methane Number (MN) fluctuations. Fixed thresholds fail. GasGx AI provides weeks of Predictive Maintenance (PdM) tailored for large gen-sets like Jenbacher an gasgx 智维云 智维 维云 全球分布式燃气算力电站 全球 球分 分布 布式 式燃 燃气 气算 算力 力电 电站 领航者 领航 航者 https www com digitalization platform 全链路接管 全链 链路 路接 接管 full stack takeover 全球分布式燃气算力 global distributed gas hashrate 超级数字中枢 超级 级数 数字 字中 中枢 super digital hub 打破传统机械制造与加密挖矿的运维代沟 一套系统 一套 套系 系统 横跨硬件采集 横跨 跨硬 硬件 件采 采集 中控大屏 中控 控大 大屏 ai 诊断与移动工单 诊断 断与 与移 移动 动工 工单 让全球十万台散落的机组 让全 球十 十万 万台 台散 散落 落的 的机 机组 如同一台机器般运转 如同'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/digitalization/platform/' limit 1),
        'Calculates remaining filter lifespan percentage directly from pressure drop slopes. Links with WMS to trigger on-demand maintenance orders, eliminating blind routine changes.

检测到 #10 气缸 排温持续异常，且点火电压需求剧增。判断为火花塞即将彻底击穿。已自动拦截严重宕机风险，并联动 WMS 发出【火花塞 x2】的备料工单至现场终端。

Detected persistent abnormal EGT on #10 CYL with surging ignition voltage demand. Diagnosed as impending spark plug breakdown. Fatal downtime intercepted. WMS order [Spark Plug x2] dispatched to field terminal.

## 全端协同：大脑与四肢的完美咬合

## End-to-End Synergy: Perfect Mesh of Brain and Limbs

当 AI 发现上述异常时，系统将自动生成标准 SOP，并直接派发到运维人员与库管员的移动终端。0 沟通误差，0 跑错路。

When AI detects anomalies, the system auto-generates standard SOPs and dispatches them to mobile terminals of field techs and warehouse keepers. Zero miscommunication, zero wasted trips.

## 财务对齐：打通【气-电-算】链路

## FinOps Alignment: Bridging [Gas-Power-Hashrate]

GasGx 不仅仅看设备指标，更关心您的钱包。系统内置能源测算模块，直观呈现每一方气如何转化为每一度电，最终换算为 BTC 挖矿收益。',
        'Calculates remaining filter lifespan percentage directly from pressure drop slopes. Links with WMS to trigger on-demand maintenance orders, eliminating blind routine changes.

检测到 #10 气缸 排温持续异常，且点火电压需求剧增。判断为火花塞即将彻底击穿。已自动',
        'zh',
        array['gasgx', '智维云', '智维', '维云', '全球分布式燃气算力电站', '全球', '球分', '分布', '布式', '式燃', '燃气', '气算', '算力', '力电', '电站', '领航者', '领航', '航者', 'https', 'www', 'com', 'digitalization', 'platform', '全链路接管', '全链', '链路', '路接', '接管', 'full', 'stack', 'takeover', '全球分布式燃气算力', 'global', 'distributed', 'gas', 'hashrate', '超级数字中枢', '超级', '级数', '数字', '字中', '中枢', 'super', 'digital', 'hub', '打破传统机械制造与加密挖矿的运维代沟', '一套系统', '一套', '套系', '系统', '横跨硬件采集', '横跨', '跨硬', '硬件', '件采', '采集', '中控大屏', '中控', '控大', '大屏', 'ai', '诊断与移动工单', '诊断', '断与', '与移', '移动', '动工', '工单', '让全球十万台散落的机组', '让全', '球十', '十万', '万台', '台散', '散落', '落的', '的机', '机组', '如同一台机器般运转', '如同']::text[],
        'FinOps Alignment: Bridging [Gas-Power-Hashrate]',
        4,
        234,
        '{"path": "/digitalization/platform/", "snapshot_kind": "site_html"}'::jsonb,
        'Calculates remaining filter lifespan percentage directly from pressure drop slopes. Links with WMS to trigger on-demand maintenance orders, eliminating blind routine changes.

检测到 #10 气缸 排温持续异常，且点火电压需求剧增。判断为火花塞即将彻底击穿。已自动拦截严重宕机风险，并联动 WMS 发出【火花塞 x2】的备料工单至现场终端。

Detected persistent abnormal EGT on #10 CYL with surging ignition voltage demand. Diagnosed as impending spark plug breakdown. Fatal downtime intercepted. WMS order [Spark Plug x2] dispatched to field terminal.

## 全端协同：大脑与四肢的完美咬合

## End-to-End Synergy: Perfect Mesh of Brain and Limbs

当 AI 发现上述异常时，系统将自动生成标准 SOP，并直接派发到运维人员与库管员的移动终端。0 沟通误差，0 跑错路。

When AI detects anomalies, the system auto-generates standard SOPs and dispatches them to mobile terminals of field techs and warehouse keepers. Zero miscommunication, zero wasted trips.

## 财务对齐：打通【气-电-算】链路

## FinOps Alignment: Bridging [Gas-Power-Hashrate]

GasGx 不仅仅看设备指标，更关心您的钱包。系统内置能源测算模块，直观呈现每一方气如何转化为每一度电，最终换算为 BTC 挖矿收益。 Calculates remaining filter lifespan percentage directly from pressure drop slopes. Links with WMS to trigger on-demand maintenance orders, eliminating blind routine changes.

检测到 #10 气缸 排温持续异常，且点火电压需求剧增。判断为火花塞即将彻底击穿。已自动 gasgx 智维云 智维 维云 全球分布式燃气算力电站 全球 球分 分布 布式 式燃 燃气 气算 算力 力电 电站 领航者 领航 航者 https www com digitalization platform 全链路接管 全链 链路 路接 接管 full stack takeover 全球分布式燃气算力 global distributed gas hashrate 超级数字中枢 超级 级数 数字 字中 中枢 super digital hub 打破传统机械制造与加密挖矿的运维代沟 一套系统 一套 套系 系统 横跨硬件采集 横跨 跨硬 硬件 件采 采集 中控大屏 中控 控大 大屏 ai 诊断与移动工单 诊断 断与 与移 移动 动工 工单 让全球十万台散落的机组 让全 球十 十万 万台 台散 散落 落的 的机 机组 如同一台机器般运转 如同'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/digitalization/platform/' limit 1),
        'GasGx cares about your wallet, not just machine metrics. Built-in energy calculation visualizes how each cubic meter of gas converts to kWh, and ultimately to BTC mining revenue.

## 从井口到算力：全链路数字化接管图景

## From Wellhead to Hashrate: Full-Chain Digital Takeover

GasGx 将荒野上孤立的天然气开采、发电与比特币挖矿物理设施，用数字神经紧密相连。运维人员只需一部移动设备，即可在现场实现对整个复杂业务链的精准掌控。 (← 请左右滑动查看完整场景图景 →)

GasGx connects isolated gas extraction, power generation, and Bitcoin mining facilities in the wilderness with a digital nerve system. Field techs control the entire complex value chain via a single mobile device. (← Swipe left/right to explore full scene →)

## 准备好将您的车队 全面接入数字宇宙了吗？ Ready to Connect Your Fleet to the Digital Universe?

不要再为跨洋救火和无休止的机器宕机支付昂贵的代价。现在就预约演示，看看 GasGx 如何在 30 天内重塑您的全球运维体系。

Stop paying for cross-ocean firefighting and endless downtime. Book a demo now and see how GasGx reshapes your global O&M in 30 days.',
        'GasGx cares about your wallet, not just machine metrics. Built-in energy calculation visualizes how each cubic meter of gas converts to kWh, and ultimately to BTC mining revenue.

## 从井口到算力：全链路数字化接管图景

## From Wellhead t',
        'zh',
        array['gasgx', '智维云', '智维', '维云', '全球分布式燃气算力电站', '全球', '球分', '分布', '布式', '式燃', '燃气', '气算', '算力', '力电', '电站', '领航者', '领航', '航者', 'https', 'www', 'com', 'digitalization', 'platform', '全链路接管', '全链', '链路', '路接', '接管', 'full', 'stack', 'takeover', '全球分布式燃气算力', 'global', 'distributed', 'gas', 'hashrate', '超级数字中枢', '超级', '级数', '数字', '字中', '中枢', 'super', 'digital', 'hub', '打破传统机械制造与加密挖矿的运维代沟', '一套系统', '一套', '套系', '系统', '横跨硬件采集', '横跨', '跨硬', '硬件', '件采', '采集', '中控大屏', '中控', '控大', '大屏', 'ai', '诊断与移动工单', '诊断', '断与', '与移', '移动', '动工', '工单', '让全球十万台散落的机组', '让全', '球十', '十万', '万台', '台散', '散落', '落的', '的机', '机组', '如同一台机器般运转', '如同']::text[],
        '准备好将您的车队 全面接入数字宇宙了吗？ Ready to Connect Your Fleet to the Digital Universe?',
        5,
        223,
        '{"path": "/digitalization/platform/", "snapshot_kind": "site_html"}'::jsonb,
        'GasGx cares about your wallet, not just machine metrics. Built-in energy calculation visualizes how each cubic meter of gas converts to kWh, and ultimately to BTC mining revenue.

## 从井口到算力：全链路数字化接管图景

## From Wellhead to Hashrate: Full-Chain Digital Takeover

GasGx 将荒野上孤立的天然气开采、发电与比特币挖矿物理设施，用数字神经紧密相连。运维人员只需一部移动设备，即可在现场实现对整个复杂业务链的精准掌控。 (← 请左右滑动查看完整场景图景 →)

GasGx connects isolated gas extraction, power generation, and Bitcoin mining facilities in the wilderness with a digital nerve system. Field techs control the entire complex value chain via a single mobile device. (← Swipe left/right to explore full scene →)

## 准备好将您的车队 全面接入数字宇宙了吗？ Ready to Connect Your Fleet to the Digital Universe?

不要再为跨洋救火和无休止的机器宕机支付昂贵的代价。现在就预约演示，看看 GasGx 如何在 30 天内重塑您的全球运维体系。

Stop paying for cross-ocean firefighting and endless downtime. Book a demo now and see how GasGx reshapes your global O&M in 30 days. GasGx cares about your wallet, not just machine metrics. Built-in energy calculation visualizes how each cubic meter of gas converts to kWh, and ultimately to BTC mining revenue.

## 从井口到算力：全链路数字化接管图景

## From Wellhead t gasgx 智维云 智维 维云 全球分布式燃气算力电站 全球 球分 分布 布式 式燃 燃气 气算 算力 力电 电站 领航者 领航 航者 https www com digitalization platform 全链路接管 全链 链路 路接 接管 full stack takeover 全球分布式燃气算力 global distributed gas hashrate 超级数字中枢 超级 级数 数字 字中 中枢 super digital hub 打破传统机械制造与加密挖矿的运维代沟 一套系统 一套 套系 系统 横跨硬件采集 横跨 跨硬 硬件 件采 采集 中控大屏 中控 控大 大屏 ai 诊断与移动工单 诊断 断与 与移 移动 动工 工单 让全球十万台散落的机组 让全 球十 十万 万台 台散 散落 落的 的机 机组 如同一台机器般运转 如同'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/digitalization/sales/' limit 1),
        '# 解决从 建档到运维 的全链路推进

为什么选择统一闭环系统？打破部门壁垒，让数据流转毫无断点。从商机触达到最终交付，全局视角把控进度风险，用数据驱动每一个关键里程碑。

## 13 节点销售流水线总览

实时追踪单据状态，精准定位处理瓶颈

### 总流水线模式 (当前压力分布)

### 客户档案中心

#### 需求获取与确认

从采集到确认全状态记录，强关联客户主体与商机池，防止需求脱节。

#### 报价流转与合同

报价草稿到确认自动流转，无缝对接签约合同与定金付款里程碑。

#### 交付与运维执行

排产、验收、尾款、物流、部署直至运维支持，后半程链路严密监控。

## 下一步动作驱动 (Action Queue)

告别被动等待，系统智能推送近期阶段待办与活动提醒。

#### 跟进 Global Ind. 出厂验收报告

#### 确认 TechVision 最终报价单

## 流程收口与风险控制

保证数据口径一致，区分当前运作与历史追溯。

项目完结后转入历史池，确保当前工作台数据高信噪比，同时保留全链路追溯能力。

控制误操作风险。异常单据作废收口，特殊情况可鉴权恢复，保持报表口径稳定。

阶段推进时，自动保存各负责人、完成时间及备注，形成不可篡改的操作快照。',
        '# 解决从 建档到运维 的全链路推进

为什么选择统一闭环系统？打破部门壁垒，让数据流转毫无断点。从商机触达到最终交付，全局视角把控进度风险，用数据驱动每一个关键里程碑。

## 13 节点销售流水线总览

实时追踪单据状态，精准定位处理瓶颈

### 总流水线模式 (当前压力分布)

### 客户档案中心

#### 需求获取与确认

从采集到确认全状态记录，强关联客户主体与商机池，防止需求脱节。

#### 报价流转与合同

报价草',
        'zh',
        array['gasgx', 'sales', 'full', 'link', 'closed', 'loop', 'system', 'https', 'www', 'com', 'digitalization', '解决从', '解决', '决从', '建档到运维', '建档', '档到', '到运', '运维', '的全链路推进', '的全', '全链', '链路', '路推', '推进', '为什么选择统一闭环系统', '为什', '什么', '么选', '选择', '择统', '统一', '一闭', '闭环', '环系', '系统', '打破部门壁垒', '打破', '破部', '部门', '门壁', '壁垒', '让数据流转毫无断点', '让数', '数据', '据流', '流转', '转毫', '毫无', '无断', '断点', '从商机触达到最终交付', '从商', '商机', '机触', '触达', '达到', '到最', '最终', '终交', '交付', '全局视角把控进度风险', '全局', '局视', '视角', '角把', '把控', '控进', '进度', '度风', '风险', '用数据驱动每一个关键里程碑', '用数', '据驱', '驱动', '动每', '每一', '一个', '个关', '关键']::text[],
        '流程收口与风险控制',
        0,
        136,
        '{"path": "/digitalization/sales/", "snapshot_kind": "site_html"}'::jsonb,
        '# 解决从 建档到运维 的全链路推进

为什么选择统一闭环系统？打破部门壁垒，让数据流转毫无断点。从商机触达到最终交付，全局视角把控进度风险，用数据驱动每一个关键里程碑。

## 13 节点销售流水线总览

实时追踪单据状态，精准定位处理瓶颈

### 总流水线模式 (当前压力分布)

### 客户档案中心

#### 需求获取与确认

从采集到确认全状态记录，强关联客户主体与商机池，防止需求脱节。

#### 报价流转与合同

报价草稿到确认自动流转，无缝对接签约合同与定金付款里程碑。

#### 交付与运维执行

排产、验收、尾款、物流、部署直至运维支持，后半程链路严密监控。

## 下一步动作驱动 (Action Queue)

告别被动等待，系统智能推送近期阶段待办与活动提醒。

#### 跟进 Global Ind. 出厂验收报告

#### 确认 TechVision 最终报价单

## 流程收口与风险控制

保证数据口径一致，区分当前运作与历史追溯。

项目完结后转入历史池，确保当前工作台数据高信噪比，同时保留全链路追溯能力。

控制误操作风险。异常单据作废收口，特殊情况可鉴权恢复，保持报表口径稳定。

阶段推进时，自动保存各负责人、完成时间及备注，形成不可篡改的操作快照。 # 解决从 建档到运维 的全链路推进

为什么选择统一闭环系统？打破部门壁垒，让数据流转毫无断点。从商机触达到最终交付，全局视角把控进度风险，用数据驱动每一个关键里程碑。

## 13 节点销售流水线总览

实时追踪单据状态，精准定位处理瓶颈

### 总流水线模式 (当前压力分布)

### 客户档案中心

#### 需求获取与确认

从采集到确认全状态记录，强关联客户主体与商机池，防止需求脱节。

#### 报价流转与合同

报价草 gasgx sales full link closed loop system https www com digitalization 解决从 解决 决从 建档到运维 建档 档到 到运 运维 的全链路推进 的全 全链 链路 路推 推进 为什么选择统一闭环系统 为什 什么 么选 选择 择统 统一 一闭 闭环 环系 系统 打破部门壁垒 打破 破部 部门 门壁 壁垒 让数据流转毫无断点 让数 数据 据流 流转 转毫 毫无 无断 断点 从商机触达到最终交付 从商 商机 机触 触达 达到 到最 最终 终交 交付 全局视角把控进度风险 全局 局视 视角 角把 把控 控进 进度 度风 风险 用数据驱动每一个关键里程碑 用数 据驱 驱动 动每 每一 一个 个关 关键'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/' limit 1),
        '# GasGx Product Catalog

GasGx public gas-engine catalog snapshot for `/products/`.

Page scope: all public gas-engine products.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '# GasGx Product Catalog

GasGx public gas-engine catalog snapshot for `/products/`.

Page scope: all public gas-engine products.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficie',
        'en',
        array['gasgx', 'product', 'catalog', 'https', 'www', 'com', 'products', 'all', 'public', 'gas', 'engine', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆']::text[],
        'Representative Models',
        0,
        266,
        '{"path": "/products/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '# GasGx Product Catalog

GasGx public gas-engine catalog snapshot for `/products/`.

Page scope: all public gas-engine products.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电 # GasGx Product Catalog

GasGx public gas-engine catalog snapshot for `/products/`.

Page scope: all public gas-engine products.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficie gasgx product catalog https www com products all public gas engine 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/' limit 1),
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT',
        'en',
        array['gasgx', 'product', 'catalog', 'https', 'www', 'com', 'products', 'all', 'public', 'gas', 'engine', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆']::text[],
        'Representative Models',
        1,
        214,
        '{"path": "/products/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电 - 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT gasgx product catalog https www com products all public gas engine 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/brands/' limit 1),
        '# GasGx Product Catalog

GasGx public gas-engine catalog snapshot for `/products/brands/`.

Page scope: the public product catalog page scope.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '# GasGx Product Catalog

GasGx public gas-engine catalog snapshot for `/products/brands/`.

Page scope: the public product catalog page scope.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000',
        'en',
        array['gasgx', 'product', 'catalog', 'https', 'www', 'com', 'products', 'brands', 'the', 'public', 'page', 'scope', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车']::text[],
        'Representative Models',
        0,
        270,
        '{"path": "/products/brands/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '# GasGx Product Catalog

GasGx public gas-engine catalog snapshot for `/products/brands/`.

Page scope: the public product catalog page scope.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电 # GasGx Product Catalog

GasGx public gas-engine catalog snapshot for `/products/brands/`.

Page scope: the public product catalog page scope.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 gasgx product catalog https www com products brands the public page scope 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/brands/' limit 1),
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT',
        'en',
        array['gasgx', 'product', 'catalog', 'https', 'www', 'com', 'products', 'brands', 'the', 'public', 'page', 'scope', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车']::text[],
        'Representative Models',
        1,
        214,
        '{"path": "/products/brands/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电 - 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT gasgx product catalog https www com products brands the public page scope 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/brands/china/' limit 1),
        '# GasGx Product Catalog | China-made brands

GasGx public gas-engine catalog snapshot for `/products/brands/china/`.

Page scope: China-made brands.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '# GasGx Product Catalog | China-made brands

GasGx public gas-engine catalog snapshot for `/products/brands/china/`.

Page scope: China-made brands.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to ',
        'en',
        array['gasgx', 'product', 'catalog', 'china', 'made', 'brands', 'https', 'www', 'com', 'products', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组']::text[],
        'Representative Models',
        0,
        252,
        '{"path": "/products/brands/china/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '# GasGx Product Catalog | China-made brands

GasGx public gas-engine catalog snapshot for `/products/brands/china/`.

Page scope: China-made brands.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电 # GasGx Product Catalog | China-made brands

GasGx public gas-engine catalog snapshot for `/products/brands/china/`.

Page scope: China-made brands.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to  gasgx product catalog china made brands https www com products 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/brands/china/' limit 1),
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5',
        'en',
        array['gasgx', 'product', 'catalog', 'china', 'made', 'brands', 'https', 'www', 'com', 'products', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组']::text[],
        'Representative Models',
        1,
        233,
        '{"path": "/products/brands/china/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电 - 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 gasgx product catalog china made brands https www com products 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/brands/overseas/' limit 1),
        '# GasGx Product Catalog | Overseas brands

GasGx public gas-engine catalog snapshot for `/products/brands/overseas/`.

Page scope: Overseas brands.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '# GasGx Product Catalog | Overseas brands

GasGx public gas-engine catalog snapshot for `/products/brands/overseas/`.

Page scope: Overseas brands.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 1',
        'en',
        array['gasgx', 'product', 'catalog', 'overseas', 'brands', 'https', 'www', 'com', 'products', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组', '小型发电机组']::text[],
        'Representative Models',
        0,
        252,
        '{"path": "/products/brands/overseas/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '# GasGx Product Catalog | Overseas brands

GasGx public gas-engine catalog snapshot for `/products/brands/overseas/`.

Page scope: Overseas brands.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电 # GasGx Product Catalog | Overseas brands

GasGx public gas-engine catalog snapshot for `/products/brands/overseas/`.

Page scope: Overseas brands.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 1 gasgx product catalog overseas brands https www com products 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组 小型发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/brands/overseas/' limit 1),
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5',
        'en',
        array['gasgx', 'product', 'catalog', 'overseas', 'brands', 'https', 'www', 'com', 'products', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组', '小型发电机组']::text[],
        'Representative Models',
        1,
        233,
        '{"path": "/products/brands/overseas/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电 - 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 gasgx product catalog overseas brands https www com products 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组 小型发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/cooling/air/' limit 1),
        '# GasGx Product Catalog | Air Cooling

GasGx public gas-engine catalog snapshot for `/products/cooling/air/`.

Page scope: Air Cooling.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '# GasGx Product Catalog | Air Cooling

GasGx public gas-engine catalog snapshot for `/products/cooling/air/`.

Page scope: Air Cooling.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- ',
        'en',
        array['gasgx', 'product', 'catalog', 'air', 'cooling', 'https', 'www', 'com', 'products', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组', '小型发电机组']::text[],
        'Representative Models',
        0,
        268,
        '{"path": "/products/cooling/air/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '# GasGx Product Catalog | Air Cooling

GasGx public gas-engine catalog snapshot for `/products/cooling/air/`.

Page scope: Air Cooling.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电 # GasGx Product Catalog | Air Cooling

GasGx public gas-engine catalog snapshot for `/products/cooling/air/`.

Page scope: Air Cooling.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

-  gasgx product catalog air cooling https www com products 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组 小型发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/cooling/air/' limit 1),
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT',
        'en',
        array['gasgx', 'product', 'catalog', 'air', 'cooling', 'https', 'www', 'com', 'products', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组', '小型发电机组']::text[],
        'Representative Models',
        1,
        214,
        '{"path": "/products/cooling/air/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电 - 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT gasgx product catalog air cooling https www com products 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组 小型发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/cooling/liquid/' limit 1),
        '# GasGx Product Catalog | Liquid Cooling

GasGx public gas-engine catalog snapshot for `/products/cooling/liquid/`.

Page scope: Liquid Cooling.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '# GasGx Product Catalog | Liquid Cooling

GasGx public gas-engine catalog snapshot for `/products/cooling/liquid/`.

Page scope: Liquid Cooling.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 1320',
        'en',
        array['gasgx', 'product', 'catalog', 'liquid', 'cooling', 'https', 'www', 'com', 'products', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组', '小型发电机组']::text[],
        'Representative Models',
        0,
        270,
        '{"path": "/products/cooling/liquid/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '# GasGx Product Catalog | Liquid Cooling

GasGx public gas-engine catalog snapshot for `/products/cooling/liquid/`.

Page scope: Liquid Cooling.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电 # GasGx Product Catalog | Liquid Cooling

GasGx public gas-engine catalog snapshot for `/products/cooling/liquid/`.

Page scope: Liquid Cooling.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 1320 gasgx product catalog liquid cooling https www com products 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组 小型发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/cooling/liquid/' limit 1),
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT',
        'en',
        array['gasgx', 'product', 'catalog', 'liquid', 'cooling', 'https', 'www', 'com', 'products', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组', '小型发电机组']::text[],
        'Representative Models',
        1,
        214,
        '{"path": "/products/cooling/liquid/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电 - 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT gasgx product catalog liquid cooling https www com products 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组 小型发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/deployment/ais/' limit 1),
        '# GasGx Product Catalog | AIS Integrated

GasGx public gas-engine catalog snapshot for `/products/deployment/ais/`.

Page scope: AIS Integrated.

## Portfolio Summary

- Matched models: 14

- Power range: 500 kW to 900 kW

- Efficiency range: 38.08% to 43.5%

- Main gas sources: 天然气

- Cooling methods: 液冷

- Deployment types: 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 曼海姆（MWM）, 威曼（VMAN）, 博杜安（Baudouin）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）, 康明斯（Cummins）, 卡特彼勒（Caterpillar）, 潍柴动力（WEICHAI）, 上柴（SHANGCHAI）, 西门子（Siemens）

- Common applications: 大型发电机组, 中小型CHP系统, 同缸径平台旗舰型号, 高压力条件下运行，多种燃料灵活使用, 煤层气、天然气、沼气、伴生气、丙烷等多种燃料, 中型电站项目, 中小型工业备电, 大功率发电项目

- Main series: TCG 3016, VGF, 3系列, DT30/YDT30, DT30+/YDT30, K38N

## Representative Models

- 康明斯（Cummins） | K38N-G8 | K38N | 900 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 中型电站项目

- 瓦克夏（Waukesha） | VGF | VGF | 800 kW | 41.2% | 天然气 | 液冷 | 一体化机组AIS | 高压力条件下运行，多种燃料灵活使用

- 曼海姆（MWM） | TCG 3016 V16 | TCG 3016 | 800 kW | 43.5% | 天然气 | 液冷 | 一体化机组AIS | 中小型CHP系统

- 卡特彼勒（Caterpillar） | CG132B-16 | CG132B | 800 kW | 43.5% | 天然气 | 液冷 | 一体化机组AIS | 中小型工业备电',
        '# GasGx Product Catalog | AIS Integrated

GasGx public gas-engine catalog snapshot for `/products/deployment/ais/`.

Page scope: AIS Integrated.

## Portfolio Summary

- Matched models: 14

- Power range: 500 kW to 900 k',
        'en',
        array['gasgx', 'product', 'catalog', 'ais', 'integrated', 'https', 'www', 'com', 'products', 'deployment', '曼海姆', '曼海', '海姆', 'mwm', '威曼', 'vman', '博杜安', '博杜', '杜安', 'baudouin', '瓦克夏', '瓦克', '克夏', 'waukesha', '颜巴赫', '颜巴', '巴赫', 'jenbacher', '康明斯', '康明', '明斯', 'cummins', '卡特彼勒', '卡特', '特彼', '彼勒', 'caterpillar', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '天然气', '天然', '然气', '大型发电机组', '大型', '型发', '发电', '电机', '机组', '中小型', '中小', '小型', 'chp', '系统', '同缸径平台旗舰型号', '同缸', '缸径', '径平', '平台', '台旗', '旗舰', '舰型', '型号', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使']::text[],
        'Representative Models',
        0,
        270,
        '{"path": "/products/deployment/ais/", "snapshot_kind": "gas_engine_catalog", "matched_models": 14}'::jsonb,
        '# GasGx Product Catalog | AIS Integrated

GasGx public gas-engine catalog snapshot for `/products/deployment/ais/`.

Page scope: AIS Integrated.

## Portfolio Summary

- Matched models: 14

- Power range: 500 kW to 900 kW

- Efficiency range: 38.08% to 43.5%

- Main gas sources: 天然气

- Cooling methods: 液冷

- Deployment types: 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 曼海姆（MWM）, 威曼（VMAN）, 博杜安（Baudouin）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）, 康明斯（Cummins）, 卡特彼勒（Caterpillar）, 潍柴动力（WEICHAI）, 上柴（SHANGCHAI）, 西门子（Siemens）

- Common applications: 大型发电机组, 中小型CHP系统, 同缸径平台旗舰型号, 高压力条件下运行，多种燃料灵活使用, 煤层气、天然气、沼气、伴生气、丙烷等多种燃料, 中型电站项目, 中小型工业备电, 大功率发电项目

- Main series: TCG 3016, VGF, 3系列, DT30/YDT30, DT30+/YDT30, K38N

## Representative Models

- 康明斯（Cummins） | K38N-G8 | K38N | 900 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 中型电站项目

- 瓦克夏（Waukesha） | VGF | VGF | 800 kW | 41.2% | 天然气 | 液冷 | 一体化机组AIS | 高压力条件下运行，多种燃料灵活使用

- 曼海姆（MWM） | TCG 3016 V16 | TCG 3016 | 800 kW | 43.5% | 天然气 | 液冷 | 一体化机组AIS | 中小型CHP系统

- 卡特彼勒（Caterpillar） | CG132B-16 | CG132B | 800 kW | 43.5% | 天然气 | 液冷 | 一体化机组AIS | 中小型工业备电 # GasGx Product Catalog | AIS Integrated

GasGx public gas-engine catalog snapshot for `/products/deployment/ais/`.

Page scope: AIS Integrated.

## Portfolio Summary

- Matched models: 14

- Power range: 500 kW to 900 k gasgx product catalog ais integrated https www com products deployment 曼海姆 曼海 海姆 mwm 威曼 vman 博杜安 博杜 杜安 baudouin 瓦克夏 瓦克 克夏 waukesha 颜巴赫 颜巴 巴赫 jenbacher 康明斯 康明 明斯 cummins 卡特彼勒 卡特 特彼 彼勒 caterpillar 潍柴动力 潍柴 柴动 动力 weichai 天然气 天然 然气 大型发电机组 大型 型发 发电 电机 机组 中小型 中小 小型 chp 系统 同缸径平台旗舰型号 同缸 缸径 径平 平台 台旗 旗舰 舰型 型号 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/deployment/ais/' limit 1),
        '- 潍柴动力（WEICHAI） | WPG1000*7NG | M33系列 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 博杜安（Baudouin） | 12M33 | 12M33 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 颜巴赫（Jenbacher） | J320 | 3系列 | 795 kW | 40.7% | 天然气 | 液冷 | 一体化机组AIS | 煤层气、天然气、沼气、伴生气、丙烷等多种燃料

- 斗山（Doosan） | DP222CA V12 | DP222CA | 727 kW | 40% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 曼海姆（MWM） | TCG 3016 V12 | TCG 3016 | 600 kW | 43.2% | 天然气 | 液冷 | 一体化机组AIS | 中小型CHP系统

- 上柴（SHANGCHAI） | SC27G | G系列 | 600 kW | 40% | 天然气 | 液冷 | 一体化机组AIS | 大功率发电项目

- 博杜安（Baudouin） | 12M26 | 12M26 | 600 kW | 39.5% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 威曼（VMAN） | DT30+/YDT30 | DT30+/YDT30 | 550 kW | 40.04% | 天然气 | 液冷 | 一体化机组AIS | 同缸径平台旗舰型号

- 西门子（Siemens） | SGE-24HM | SGE-24HM | 520 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 中小型发电机组

- 威曼（VMAN） | DT30/YDT30 | DT30/YDT30 | 500 kW | 38.08% | 天然气 | 液冷 | 一体化机组AIS | 同缸径平台旗舰型号',
        '- 潍柴动力（WEICHAI） | WPG1000*7NG | M33系列 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 博杜安（Baudouin） | 12M33 | 12M33 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 颜巴赫（Jenbacher） | J320 | 3系列 | 795 kW | 40.7% | 天然气 | 液',
        'en',
        array['gasgx', 'product', 'catalog', 'ais', 'integrated', 'https', 'www', 'com', 'products', 'deployment', '曼海姆', '曼海', '海姆', 'mwm', '威曼', 'vman', '博杜安', '博杜', '杜安', 'baudouin', '瓦克夏', '瓦克', '克夏', 'waukesha', '颜巴赫', '颜巴', '巴赫', 'jenbacher', '康明斯', '康明', '明斯', 'cummins', '卡特彼勒', '卡特', '特彼', '彼勒', 'caterpillar', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '天然气', '天然', '然气', '大型发电机组', '大型', '型发', '发电', '电机', '机组', '中小型', '中小', '小型', 'chp', '系统', '同缸径平台旗舰型号', '同缸', '缸径', '径平', '平台', '台旗', '旗舰', '舰型', '型号', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使']::text[],
        'Representative Models',
        1,
        213,
        '{"path": "/products/deployment/ais/", "snapshot_kind": "gas_engine_catalog", "matched_models": 14}'::jsonb,
        '- 潍柴动力（WEICHAI） | WPG1000*7NG | M33系列 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 博杜安（Baudouin） | 12M33 | 12M33 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 颜巴赫（Jenbacher） | J320 | 3系列 | 795 kW | 40.7% | 天然气 | 液冷 | 一体化机组AIS | 煤层气、天然气、沼气、伴生气、丙烷等多种燃料

- 斗山（Doosan） | DP222CA V12 | DP222CA | 727 kW | 40% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 曼海姆（MWM） | TCG 3016 V12 | TCG 3016 | 600 kW | 43.2% | 天然气 | 液冷 | 一体化机组AIS | 中小型CHP系统

- 上柴（SHANGCHAI） | SC27G | G系列 | 600 kW | 40% | 天然气 | 液冷 | 一体化机组AIS | 大功率发电项目

- 博杜安（Baudouin） | 12M26 | 12M26 | 600 kW | 39.5% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 威曼（VMAN） | DT30+/YDT30 | DT30+/YDT30 | 550 kW | 40.04% | 天然气 | 液冷 | 一体化机组AIS | 同缸径平台旗舰型号

- 西门子（Siemens） | SGE-24HM | SGE-24HM | 520 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 中小型发电机组

- 威曼（VMAN） | DT30/YDT30 | DT30/YDT30 | 500 kW | 38.08% | 天然气 | 液冷 | 一体化机组AIS | 同缸径平台旗舰型号 - 潍柴动力（WEICHAI） | WPG1000*7NG | M33系列 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 博杜安（Baudouin） | 12M33 | 12M33 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 颜巴赫（Jenbacher） | J320 | 3系列 | 795 kW | 40.7% | 天然气 | 液 gasgx product catalog ais integrated https www com products deployment 曼海姆 曼海 海姆 mwm 威曼 vman 博杜安 博杜 杜安 baudouin 瓦克夏 瓦克 克夏 waukesha 颜巴赫 颜巴 巴赫 jenbacher 康明斯 康明 明斯 cummins 卡特彼勒 卡特 特彼 彼勒 caterpillar 潍柴动力 潍柴 柴动 动力 weichai 天然气 天然 然气 大型发电机组 大型 型发 发电 电机 机组 中小型 中小 小型 chp 系统 同缸径平台旗舰型号 同缸 缸径 径平 平台 台旗 旗舰 舰型 型号 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/deployment/container/' limit 1),
        '# GasGx Product Catalog | Containerized

GasGx public gas-engine catalog snapshot for `/products/deployment/container/`.

Page scope: Containerized.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '# GasGx Product Catalog | Containerized

GasGx public gas-engine catalog snapshot for `/products/deployment/container/`.

Page scope: Containerized.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to ',
        'en',
        array['gasgx', 'product', 'catalog', 'containerized', 'https', 'www', 'com', 'products', 'deployment', 'container', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组']::text[],
        'Representative Models',
        0,
        252,
        '{"path": "/products/deployment/container/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '# GasGx Product Catalog | Containerized

GasGx public gas-engine catalog snapshot for `/products/deployment/container/`.

Page scope: Containerized.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电 # GasGx Product Catalog | Containerized

GasGx public gas-engine catalog snapshot for `/products/deployment/container/`.

Page scope: Containerized.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to  gasgx product catalog containerized https www com products deployment container 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/deployment/container/' limit 1),
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5',
        'en',
        array['gasgx', 'product', 'catalog', 'containerized', 'https', 'www', 'com', 'products', 'deployment', 'container', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组']::text[],
        'Representative Models',
        1,
        233,
        '{"path": "/products/deployment/container/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电 - 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 gasgx product catalog containerized https www com products deployment container 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/deployment/skid/' limit 1),
        '# GasGx Product Catalog | Skid Mounted

GasGx public gas-engine catalog snapshot for `/products/deployment/skid/`.

Page scope: Skid Mounted.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '# GasGx Product Catalog | Skid Mounted

GasGx public gas-engine catalog snapshot for `/products/deployment/skid/`.

Page scope: Skid Mounted.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 ',
        'en',
        array['gasgx', 'product', 'catalog', 'skid', 'mounted', 'https', 'www', 'com', 'products', 'deployment', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组']::text[],
        'Representative Models',
        0,
        270,
        '{"path": "/products/deployment/skid/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '# GasGx Product Catalog | Skid Mounted

GasGx public gas-engine catalog snapshot for `/products/deployment/skid/`.

Page scope: Skid Mounted.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电 # GasGx Product Catalog | Skid Mounted

GasGx public gas-engine catalog snapshot for `/products/deployment/skid/`.

Page scope: Skid Mounted.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000  gasgx product catalog skid mounted https www com products deployment 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/deployment/skid/' limit 1),
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT',
        'en',
        array['gasgx', 'product', 'catalog', 'skid', 'mounted', 'https', 'www', 'com', 'products', 'deployment', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组']::text[],
        'Representative Models',
        1,
        214,
        '{"path": "/products/deployment/skid/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电 - 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT gasgx product catalog skid mounted https www com products deployment 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/' limit 1),
        '# GasGx Product Catalog

GasGx public gas-engine catalog snapshot for `/products/gas/`.

Page scope: the public product catalog page scope.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '# GasGx Product Catalog

GasGx public gas-engine catalog snapshot for `/products/gas/`.

Page scope: the public product catalog page scope.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW',
        'en',
        array['gasgx', 'product', 'catalog', 'https', 'www', 'com', 'products', 'gas', 'the', 'public', 'page', 'scope', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车']::text[],
        'Representative Models',
        0,
        269,
        '{"path": "/products/gas/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '# GasGx Product Catalog

GasGx public gas-engine catalog snapshot for `/products/gas/`.

Page scope: the public product catalog page scope.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电 # GasGx Product Catalog

GasGx public gas-engine catalog snapshot for `/products/gas/`.

Page scope: the public product catalog page scope.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW gasgx product catalog https www com products gas the public page scope 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/' limit 1),
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT',
        'en',
        array['gasgx', 'product', 'catalog', 'https', 'www', 'com', 'products', 'gas', 'the', 'public', 'page', 'scope', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车']::text[],
        'Representative Models',
        1,
        214,
        '{"path": "/products/gas/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电 - 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT gasgx product catalog https www com products gas the public page scope 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/associated/' limit 1),
        '# GasGx Product Catalog | Associated Gas

GasGx public gas-engine catalog snapshot for `/products/gas/associated/`.

Page scope: Associated Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '# GasGx Product Catalog | Associated Gas

GasGx public gas-engine catalog snapshot for `/products/gas/associated/`.

Page scope: Associated Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 1320',
        'en',
        array['gasgx', 'product', 'catalog', 'associated', 'gas', 'https', 'www', 'com', 'products', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组', '小型发电机组']::text[],
        'Representative Models',
        0,
        270,
        '{"path": "/products/gas/associated/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '# GasGx Product Catalog | Associated Gas

GasGx public gas-engine catalog snapshot for `/products/gas/associated/`.

Page scope: Associated Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电 # GasGx Product Catalog | Associated Gas

GasGx public gas-engine catalog snapshot for `/products/gas/associated/`.

Page scope: Associated Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 1320 gasgx product catalog associated gas https www com products 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组 小型发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/associated/' limit 1),
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT',
        'en',
        array['gasgx', 'product', 'catalog', 'associated', 'gas', 'https', 'www', 'com', 'products', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组', '小型发电机组']::text[],
        'Representative Models',
        1,
        214,
        '{"path": "/products/gas/associated/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电 - 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT gasgx product catalog associated gas https www com products 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组 小型发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/brands/' limit 1),
        '# GasGx Product Catalog

GasGx public gas-engine catalog snapshot for `/products/gas/brands/`.

Page scope: the public product catalog page scope.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '# GasGx Product Catalog

GasGx public gas-engine catalog snapshot for `/products/gas/brands/`.

Page scope: the public product catalog page scope.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 13',
        'en',
        array['gasgx', 'product', 'catalog', 'https', 'www', 'com', 'products', 'gas', 'brands', 'the', 'public', 'page', 'scope', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用']::text[],
        'Representative Models',
        0,
        252,
        '{"path": "/products/gas/brands/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '# GasGx Product Catalog

GasGx public gas-engine catalog snapshot for `/products/gas/brands/`.

Page scope: the public product catalog page scope.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电 # GasGx Product Catalog

GasGx public gas-engine catalog snapshot for `/products/gas/brands/`.

Page scope: the public product catalog page scope.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 13 gasgx product catalog https www com products gas brands the public page scope 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/brands/' limit 1),
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5',
        'en',
        array['gasgx', 'product', 'catalog', 'https', 'www', 'com', 'products', 'gas', 'brands', 'the', 'public', 'page', 'scope', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用']::text[],
        'Representative Models',
        1,
        233,
        '{"path": "/products/gas/brands/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电 - 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 gasgx product catalog https www com products gas brands the public page scope 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/brands/china/' limit 1),
        '# GasGx Product Catalog | China-made brands

GasGx public gas-engine catalog snapshot for `/products/gas/brands/china/`.

Page scope: China-made brands.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '# GasGx Product Catalog | China-made brands

GasGx public gas-engine catalog snapshot for `/products/gas/brands/china/`.

Page scope: China-made brands.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW',
        'en',
        array['gasgx', 'product', 'catalog', 'china', 'made', 'brands', 'https', 'www', 'com', 'products', 'gas', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆']::text[],
        'Representative Models',
        0,
        253,
        '{"path": "/products/gas/brands/china/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '# GasGx Product Catalog | China-made brands

GasGx public gas-engine catalog snapshot for `/products/gas/brands/china/`.

Page scope: China-made brands.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电 # GasGx Product Catalog | China-made brands

GasGx public gas-engine catalog snapshot for `/products/gas/brands/china/`.

Page scope: China-made brands.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW gasgx product catalog china made brands https www com products gas 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/brands/china/' limit 1),
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5',
        'en',
        array['gasgx', 'product', 'catalog', 'china', 'made', 'brands', 'https', 'www', 'com', 'products', 'gas', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆']::text[],
        'Representative Models',
        1,
        233,
        '{"path": "/products/gas/brands/china/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电 - 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 gasgx product catalog china made brands https www com products gas 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/brands/overseas/' limit 1),
        '# GasGx Product Catalog | Overseas brands

GasGx public gas-engine catalog snapshot for `/products/gas/brands/overseas/`.

Page scope: Overseas brands.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '# GasGx Product Catalog | Overseas brands

GasGx public gas-engine catalog snapshot for `/products/gas/brands/overseas/`.

Page scope: Overseas brands.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW ',
        'en',
        array['gasgx', 'product', 'catalog', 'overseas', 'brands', 'https', 'www', 'com', 'products', 'gas', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组']::text[],
        'Representative Models',
        0,
        253,
        '{"path": "/products/gas/brands/overseas/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '# GasGx Product Catalog | Overseas brands

GasGx public gas-engine catalog snapshot for `/products/gas/brands/overseas/`.

Page scope: Overseas brands.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电 # GasGx Product Catalog | Overseas brands

GasGx public gas-engine catalog snapshot for `/products/gas/brands/overseas/`.

Page scope: Overseas brands.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW  gasgx product catalog overseas brands https www com products gas 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/brands/overseas/' limit 1),
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5',
        'en',
        array['gasgx', 'product', 'catalog', 'overseas', 'brands', 'https', 'www', 'com', 'products', 'gas', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组']::text[],
        'Representative Models',
        1,
        233,
        '{"path": "/products/gas/brands/overseas/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电 - 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 gasgx product catalog overseas brands https www com products gas 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/cooling/air/' limit 1),
        '# GasGx Product Catalog | Air Cooling

GasGx public gas-engine catalog snapshot for `/products/gas/cooling/air/`.

Page scope: Air Cooling.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '# GasGx Product Catalog | Air Cooling

GasGx public gas-engine catalog snapshot for `/products/gas/cooling/air/`.

Page scope: Air Cooling.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW',
        'en',
        array['gasgx', 'product', 'catalog', 'air', 'cooling', 'https', 'www', 'com', 'products', 'gas', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组']::text[],
        'Representative Models',
        0,
        269,
        '{"path": "/products/gas/cooling/air/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '# GasGx Product Catalog | Air Cooling

GasGx public gas-engine catalog snapshot for `/products/gas/cooling/air/`.

Page scope: Air Cooling.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电 # GasGx Product Catalog | Air Cooling

GasGx public gas-engine catalog snapshot for `/products/gas/cooling/air/`.

Page scope: Air Cooling.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW gasgx product catalog air cooling https www com products gas 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/cooling/air/' limit 1),
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT',
        'en',
        array['gasgx', 'product', 'catalog', 'air', 'cooling', 'https', 'www', 'com', 'products', 'gas', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组']::text[],
        'Representative Models',
        1,
        214,
        '{"path": "/products/gas/cooling/air/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电 - 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT gasgx product catalog air cooling https www com products gas 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/cooling/liquid/' limit 1),
        '# GasGx Product Catalog | Liquid Cooling

GasGx public gas-engine catalog snapshot for `/products/gas/cooling/liquid/`.

Page scope: Liquid Cooling.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '# GasGx Product Catalog | Liquid Cooling

GasGx public gas-engine catalog snapshot for `/products/gas/cooling/liquid/`.

Page scope: Liquid Cooling.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to ',
        'en',
        array['gasgx', 'product', 'catalog', 'liquid', 'cooling', 'https', 'www', 'com', 'products', 'gas', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组']::text[],
        'Representative Models',
        0,
        252,
        '{"path": "/products/gas/cooling/liquid/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '# GasGx Product Catalog | Liquid Cooling

GasGx public gas-engine catalog snapshot for `/products/gas/cooling/liquid/`.

Page scope: Liquid Cooling.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电 # GasGx Product Catalog | Liquid Cooling

GasGx public gas-engine catalog snapshot for `/products/gas/cooling/liquid/`.

Page scope: Liquid Cooling.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to  gasgx product catalog liquid cooling https www com products gas 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/cooling/liquid/' limit 1),
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5',
        'en',
        array['gasgx', 'product', 'catalog', 'liquid', 'cooling', 'https', 'www', 'com', 'products', 'gas', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组']::text[],
        'Representative Models',
        1,
        233,
        '{"path": "/products/gas/cooling/liquid/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电 - 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 gasgx product catalog liquid cooling https www com products gas 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/deployment/ais/' limit 1),
        '# GasGx Product Catalog | AIS Integrated

GasGx public gas-engine catalog snapshot for `/products/gas/deployment/ais/`.

Page scope: AIS Integrated.

## Portfolio Summary

- Matched models: 14

- Power range: 500 kW to 900 kW

- Efficiency range: 38.08% to 43.5%

- Main gas sources: 天然气

- Cooling methods: 液冷

- Deployment types: 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 曼海姆（MWM）, 威曼（VMAN）, 博杜安（Baudouin）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）, 康明斯（Cummins）, 卡特彼勒（Caterpillar）, 潍柴动力（WEICHAI）, 上柴（SHANGCHAI）, 西门子（Siemens）

- Common applications: 大型发电机组, 中小型CHP系统, 同缸径平台旗舰型号, 高压力条件下运行，多种燃料灵活使用, 煤层气、天然气、沼气、伴生气、丙烷等多种燃料, 中型电站项目, 中小型工业备电, 大功率发电项目

- Main series: TCG 3016, VGF, 3系列, DT30/YDT30, DT30+/YDT30, K38N

## Representative Models

- 康明斯（Cummins） | K38N-G8 | K38N | 900 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 中型电站项目

- 瓦克夏（Waukesha） | VGF | VGF | 800 kW | 41.2% | 天然气 | 液冷 | 一体化机组AIS | 高压力条件下运行，多种燃料灵活使用

- 曼海姆（MWM） | TCG 3016 V16 | TCG 3016 | 800 kW | 43.5% | 天然气 | 液冷 | 一体化机组AIS | 中小型CHP系统

- 卡特彼勒（Caterpillar） | CG132B-16 | CG132B | 800 kW | 43.5% | 天然气 | 液冷 | 一体化机组AIS | 中小型工业备电',
        '# GasGx Product Catalog | AIS Integrated

GasGx public gas-engine catalog snapshot for `/products/gas/deployment/ais/`.

Page scope: AIS Integrated.

## Portfolio Summary

- Matched models: 14

- Power range: 500 kW to 9',
        'en',
        array['gasgx', 'product', 'catalog', 'ais', 'integrated', 'https', 'www', 'com', 'products', 'gas', 'deployment', '曼海姆', '曼海', '海姆', 'mwm', '威曼', 'vman', '博杜安', '博杜', '杜安', 'baudouin', '瓦克夏', '瓦克', '克夏', 'waukesha', '颜巴赫', '颜巴', '巴赫', 'jenbacher', '康明斯', '康明', '明斯', 'cummins', '卡特彼勒', '卡特', '特彼', '彼勒', 'caterpillar', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '天然气', '天然', '然气', '大型发电机组', '大型', '型发', '发电', '电机', '机组', '中小型', '中小', '小型', 'chp', '系统', '同缸径平台旗舰型号', '同缸', '缸径', '径平', '平台', '台旗', '旗舰', '舰型', '型号', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活']::text[],
        'Representative Models',
        0,
        271,
        '{"path": "/products/gas/deployment/ais/", "snapshot_kind": "gas_engine_catalog", "matched_models": 14}'::jsonb,
        '# GasGx Product Catalog | AIS Integrated

GasGx public gas-engine catalog snapshot for `/products/gas/deployment/ais/`.

Page scope: AIS Integrated.

## Portfolio Summary

- Matched models: 14

- Power range: 500 kW to 900 kW

- Efficiency range: 38.08% to 43.5%

- Main gas sources: 天然气

- Cooling methods: 液冷

- Deployment types: 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 曼海姆（MWM）, 威曼（VMAN）, 博杜安（Baudouin）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）, 康明斯（Cummins）, 卡特彼勒（Caterpillar）, 潍柴动力（WEICHAI）, 上柴（SHANGCHAI）, 西门子（Siemens）

- Common applications: 大型发电机组, 中小型CHP系统, 同缸径平台旗舰型号, 高压力条件下运行，多种燃料灵活使用, 煤层气、天然气、沼气、伴生气、丙烷等多种燃料, 中型电站项目, 中小型工业备电, 大功率发电项目

- Main series: TCG 3016, VGF, 3系列, DT30/YDT30, DT30+/YDT30, K38N

## Representative Models

- 康明斯（Cummins） | K38N-G8 | K38N | 900 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 中型电站项目

- 瓦克夏（Waukesha） | VGF | VGF | 800 kW | 41.2% | 天然气 | 液冷 | 一体化机组AIS | 高压力条件下运行，多种燃料灵活使用

- 曼海姆（MWM） | TCG 3016 V16 | TCG 3016 | 800 kW | 43.5% | 天然气 | 液冷 | 一体化机组AIS | 中小型CHP系统

- 卡特彼勒（Caterpillar） | CG132B-16 | CG132B | 800 kW | 43.5% | 天然气 | 液冷 | 一体化机组AIS | 中小型工业备电 # GasGx Product Catalog | AIS Integrated

GasGx public gas-engine catalog snapshot for `/products/gas/deployment/ais/`.

Page scope: AIS Integrated.

## Portfolio Summary

- Matched models: 14

- Power range: 500 kW to 9 gasgx product catalog ais integrated https www com products gas deployment 曼海姆 曼海 海姆 mwm 威曼 vman 博杜安 博杜 杜安 baudouin 瓦克夏 瓦克 克夏 waukesha 颜巴赫 颜巴 巴赫 jenbacher 康明斯 康明 明斯 cummins 卡特彼勒 卡特 特彼 彼勒 caterpillar 潍柴动力 潍柴 柴动 动力 weichai 天然气 天然 然气 大型发电机组 大型 型发 发电 电机 机组 中小型 中小 小型 chp 系统 同缸径平台旗舰型号 同缸 缸径 径平 平台 台旗 旗舰 舰型 型号 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/deployment/ais/' limit 1),
        '- 潍柴动力（WEICHAI） | WPG1000*7NG | M33系列 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 博杜安（Baudouin） | 12M33 | 12M33 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 颜巴赫（Jenbacher） | J320 | 3系列 | 795 kW | 40.7% | 天然气 | 液冷 | 一体化机组AIS | 煤层气、天然气、沼气、伴生气、丙烷等多种燃料

- 斗山（Doosan） | DP222CA V12 | DP222CA | 727 kW | 40% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 曼海姆（MWM） | TCG 3016 V12 | TCG 3016 | 600 kW | 43.2% | 天然气 | 液冷 | 一体化机组AIS | 中小型CHP系统

- 上柴（SHANGCHAI） | SC27G | G系列 | 600 kW | 40% | 天然气 | 液冷 | 一体化机组AIS | 大功率发电项目

- 博杜安（Baudouin） | 12M26 | 12M26 | 600 kW | 39.5% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 威曼（VMAN） | DT30+/YDT30 | DT30+/YDT30 | 550 kW | 40.04% | 天然气 | 液冷 | 一体化机组AIS | 同缸径平台旗舰型号

- 西门子（Siemens） | SGE-24HM | SGE-24HM | 520 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 中小型发电机组

- 威曼（VMAN） | DT30/YDT30 | DT30/YDT30 | 500 kW | 38.08% | 天然气 | 液冷 | 一体化机组AIS | 同缸径平台旗舰型号',
        '- 潍柴动力（WEICHAI） | WPG1000*7NG | M33系列 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 博杜安（Baudouin） | 12M33 | 12M33 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 颜巴赫（Jenbacher） | J320 | 3系列 | 795 kW | 40.7% | 天然气 | 液',
        'en',
        array['gasgx', 'product', 'catalog', 'ais', 'integrated', 'https', 'www', 'com', 'products', 'gas', 'deployment', '曼海姆', '曼海', '海姆', 'mwm', '威曼', 'vman', '博杜安', '博杜', '杜安', 'baudouin', '瓦克夏', '瓦克', '克夏', 'waukesha', '颜巴赫', '颜巴', '巴赫', 'jenbacher', '康明斯', '康明', '明斯', 'cummins', '卡特彼勒', '卡特', '特彼', '彼勒', 'caterpillar', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '天然气', '天然', '然气', '大型发电机组', '大型', '型发', '发电', '电机', '机组', '中小型', '中小', '小型', 'chp', '系统', '同缸径平台旗舰型号', '同缸', '缸径', '径平', '平台', '台旗', '旗舰', '舰型', '型号', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活']::text[],
        'Representative Models',
        1,
        213,
        '{"path": "/products/gas/deployment/ais/", "snapshot_kind": "gas_engine_catalog", "matched_models": 14}'::jsonb,
        '- 潍柴动力（WEICHAI） | WPG1000*7NG | M33系列 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 博杜安（Baudouin） | 12M33 | 12M33 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 颜巴赫（Jenbacher） | J320 | 3系列 | 795 kW | 40.7% | 天然气 | 液冷 | 一体化机组AIS | 煤层气、天然气、沼气、伴生气、丙烷等多种燃料

- 斗山（Doosan） | DP222CA V12 | DP222CA | 727 kW | 40% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 曼海姆（MWM） | TCG 3016 V12 | TCG 3016 | 600 kW | 43.2% | 天然气 | 液冷 | 一体化机组AIS | 中小型CHP系统

- 上柴（SHANGCHAI） | SC27G | G系列 | 600 kW | 40% | 天然气 | 液冷 | 一体化机组AIS | 大功率发电项目

- 博杜安（Baudouin） | 12M26 | 12M26 | 600 kW | 39.5% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 威曼（VMAN） | DT30+/YDT30 | DT30+/YDT30 | 550 kW | 40.04% | 天然气 | 液冷 | 一体化机组AIS | 同缸径平台旗舰型号

- 西门子（Siemens） | SGE-24HM | SGE-24HM | 520 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 中小型发电机组

- 威曼（VMAN） | DT30/YDT30 | DT30/YDT30 | 500 kW | 38.08% | 天然气 | 液冷 | 一体化机组AIS | 同缸径平台旗舰型号 - 潍柴动力（WEICHAI） | WPG1000*7NG | M33系列 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 博杜安（Baudouin） | 12M33 | 12M33 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 颜巴赫（Jenbacher） | J320 | 3系列 | 795 kW | 40.7% | 天然气 | 液 gasgx product catalog ais integrated https www com products gas deployment 曼海姆 曼海 海姆 mwm 威曼 vman 博杜安 博杜 杜安 baudouin 瓦克夏 瓦克 克夏 waukesha 颜巴赫 颜巴 巴赫 jenbacher 康明斯 康明 明斯 cummins 卡特彼勒 卡特 特彼 彼勒 caterpillar 潍柴动力 潍柴 柴动 动力 weichai 天然气 天然 然气 大型发电机组 大型 型发 发电 电机 机组 中小型 中小 小型 chp 系统 同缸径平台旗舰型号 同缸 缸径 径平 平台 台旗 旗舰 舰型 型号 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/deployment/container/' limit 1),
        '# GasGx Product Catalog | Containerized

GasGx public gas-engine catalog snapshot for `/products/gas/deployment/container/`.

Page scope: Containerized.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '# GasGx Product Catalog | Containerized

GasGx public gas-engine catalog snapshot for `/products/gas/deployment/container/`.

Page scope: Containerized.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW',
        'en',
        array['gasgx', 'product', 'catalog', 'containerized', 'https', 'www', 'com', 'products', 'gas', 'deployment', 'container', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆']::text[],
        'Representative Models',
        0,
        253,
        '{"path": "/products/gas/deployment/container/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '# GasGx Product Catalog | Containerized

GasGx public gas-engine catalog snapshot for `/products/gas/deployment/container/`.

Page scope: Containerized.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电 # GasGx Product Catalog | Containerized

GasGx public gas-engine catalog snapshot for `/products/gas/deployment/container/`.

Page scope: Containerized.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW gasgx product catalog containerized https www com products gas deployment container 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/deployment/container/' limit 1),
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5',
        'en',
        array['gasgx', 'product', 'catalog', 'containerized', 'https', 'www', 'com', 'products', 'gas', 'deployment', 'container', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆']::text[],
        'Representative Models',
        1,
        233,
        '{"path": "/products/gas/deployment/container/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电 - 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 gasgx product catalog containerized https www com products gas deployment container 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/deployment/skid/' limit 1),
        '# GasGx Product Catalog | Skid Mounted

GasGx public gas-engine catalog snapshot for `/products/gas/deployment/skid/`.

Page scope: Skid Mounted.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '# GasGx Product Catalog | Skid Mounted

GasGx public gas-engine catalog snapshot for `/products/gas/deployment/skid/`.

Page scope: Skid Mounted.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132',
        'en',
        array['gasgx', 'product', 'catalog', 'skid', 'mounted', 'https', 'www', 'com', 'products', 'gas', 'deployment', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆']::text[],
        'Representative Models',
        0,
        271,
        '{"path": "/products/gas/deployment/skid/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '# GasGx Product Catalog | Skid Mounted

GasGx public gas-engine catalog snapshot for `/products/gas/deployment/skid/`.

Page scope: Skid Mounted.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电 # GasGx Product Catalog | Skid Mounted

GasGx public gas-engine catalog snapshot for `/products/gas/deployment/skid/`.

Page scope: Skid Mounted.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132 gasgx product catalog skid mounted https www com products gas deployment 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/deployment/skid/' limit 1),
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT',
        'en',
        array['gasgx', 'product', 'catalog', 'skid', 'mounted', 'https', 'www', 'com', 'products', 'gas', 'deployment', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆']::text[],
        'Representative Models',
        1,
        214,
        '{"path": "/products/gas/deployment/skid/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电 - 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT gasgx product catalog skid mounted https www com products gas deployment 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/gas/associated/' limit 1),
        '# GasGx Product Catalog | Associated Gas

GasGx public gas-engine catalog snapshot for `/products/gas/gas/associated/`.

Page scope: Associated Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '# GasGx Product Catalog | Associated Gas

GasGx public gas-engine catalog snapshot for `/products/gas/gas/associated/`.

Page scope: Associated Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to ',
        'en',
        array['gasgx', 'product', 'catalog', 'associated', 'gas', 'https', 'www', 'com', 'products', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组', '小型发电机组']::text[],
        'Representative Models',
        0,
        252,
        '{"path": "/products/gas/gas/associated/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '# GasGx Product Catalog | Associated Gas

GasGx public gas-engine catalog snapshot for `/products/gas/gas/associated/`.

Page scope: Associated Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电 # GasGx Product Catalog | Associated Gas

GasGx public gas-engine catalog snapshot for `/products/gas/gas/associated/`.

Page scope: Associated Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to  gasgx product catalog associated gas https www com products 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组 小型发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/gas/associated/' limit 1),
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5',
        'en',
        array['gasgx', 'product', 'catalog', 'associated', 'gas', 'https', 'www', 'com', 'products', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组', '小型发电机组']::text[],
        'Representative Models',
        1,
        233,
        '{"path": "/products/gas/gas/associated/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电 - 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 gasgx product catalog associated gas https www com products 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组 小型发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/gas/low-methane/' limit 1),
        '# GasGx Product Catalog | Low Methane Gas

GasGx public gas-engine catalog snapshot for `/products/gas/gas/low-methane/`.

Page scope: Low Methane Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '# GasGx Product Catalog | Low Methane Gas

GasGx public gas-engine catalog snapshot for `/products/gas/gas/low-methane/`.

Page scope: Low Methane Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW ',
        'en',
        array['gasgx', 'product', 'catalog', 'low', 'methane', 'gas', 'https', 'www', 'com', 'products', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组']::text[],
        'Representative Models',
        0,
        253,
        '{"path": "/products/gas/gas/low-methane/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '# GasGx Product Catalog | Low Methane Gas

GasGx public gas-engine catalog snapshot for `/products/gas/gas/low-methane/`.

Page scope: Low Methane Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电 # GasGx Product Catalog | Low Methane Gas

GasGx public gas-engine catalog snapshot for `/products/gas/gas/low-methane/`.

Page scope: Low Methane Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW  gasgx product catalog low methane gas https www com products 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/gas/low-methane/' limit 1),
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5',
        'en',
        array['gasgx', 'product', 'catalog', 'low', 'methane', 'gas', 'https', 'www', 'com', 'products', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组']::text[],
        'Representative Models',
        1,
        233,
        '{"path": "/products/gas/gas/low-methane/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电 - 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 gasgx product catalog low methane gas https www com products 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/gas/natural/' limit 1),
        '# GasGx Product Catalog | Natural Gas

GasGx public gas-engine catalog snapshot for `/products/gas/gas/natural/`.

Page scope: Natural Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '# GasGx Product Catalog | Natural Gas

GasGx public gas-engine catalog snapshot for `/products/gas/gas/natural/`.

Page scope: Natural Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW',
        'en',
        array['gasgx', 'product', 'catalog', 'natural', 'gas', 'https', 'www', 'com', 'products', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组', '小型发电机组']::text[],
        'Representative Models',
        0,
        269,
        '{"path": "/products/gas/gas/natural/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '# GasGx Product Catalog | Natural Gas

GasGx public gas-engine catalog snapshot for `/products/gas/gas/natural/`.

Page scope: Natural Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电 # GasGx Product Catalog | Natural Gas

GasGx public gas-engine catalog snapshot for `/products/gas/gas/natural/`.

Page scope: Natural Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW gasgx product catalog natural gas https www com products 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组 小型发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/gas/natural/' limit 1),
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT',
        'en',
        array['gasgx', 'product', 'catalog', 'natural', 'gas', 'https', 'www', 'com', 'products', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组', '小型发电机组']::text[],
        'Representative Models',
        1,
        214,
        '{"path": "/products/gas/gas/natural/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电 - 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT gasgx product catalog natural gas https www com products 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组 小型发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/low-methane/' limit 1),
        '# GasGx Product Catalog | Low Methane Gas

GasGx public gas-engine catalog snapshot for `/products/gas/low-methane/`.

Page scope: Low Methane Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '# GasGx Product Catalog | Low Methane Gas

GasGx public gas-engine catalog snapshot for `/products/gas/low-methane/`.

Page scope: Low Methane Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 1',
        'en',
        array['gasgx', 'product', 'catalog', 'low', 'methane', 'gas', 'https', 'www', 'com', 'products', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组']::text[],
        'Representative Models',
        0,
        252,
        '{"path": "/products/gas/low-methane/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '# GasGx Product Catalog | Low Methane Gas

GasGx public gas-engine catalog snapshot for `/products/gas/low-methane/`.

Page scope: Low Methane Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电 # GasGx Product Catalog | Low Methane Gas

GasGx public gas-engine catalog snapshot for `/products/gas/low-methane/`.

Page scope: Low Methane Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 1 gasgx product catalog low methane gas https www com products 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/low-methane/' limit 1),
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5',
        'en',
        array['gasgx', 'product', 'catalog', 'low', 'methane', 'gas', 'https', 'www', 'com', 'products', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组']::text[],
        'Representative Models',
        1,
        233,
        '{"path": "/products/gas/low-methane/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电 - 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 gasgx product catalog low methane gas https www com products 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/natural/' limit 1),
        '# GasGx Product Catalog | Natural Gas

GasGx public gas-engine catalog snapshot for `/products/gas/natural/`.

Page scope: Natural Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '# GasGx Product Catalog | Natural Gas

GasGx public gas-engine catalog snapshot for `/products/gas/natural/`.

Page scope: Natural Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- ',
        'en',
        array['gasgx', 'product', 'catalog', 'natural', 'gas', 'https', 'www', 'com', 'products', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组', '小型发电机组']::text[],
        'Representative Models',
        0,
        268,
        '{"path": "/products/gas/natural/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '# GasGx Product Catalog | Natural Gas

GasGx public gas-engine catalog snapshot for `/products/gas/natural/`.

Page scope: Natural Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组, 撬装式机组, 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 威曼（VMAN）, 潍柴动力（WEICHAI）, 贝克休斯（Baker Hughes）, 道依茨（Deutz）, 曼海姆（MWM）, 博杜安（Baudouin）, 西门子（Siemens）, 斗山（Doosan）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）

- Common applications: 工业发电, 中小型发电机组, 大型发电机组, 高压力条件下运行，多种燃料灵活使用, 中小型CHP系统, 商用车辆、发电机组, 小型发电机组, 小型发电机组、工程机械

- Main series: TCG 3016, WP系列, 铂威系列, HND重载系列, M33系列, 275GL+

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电 # GasGx Product Catalog | Natural Gas

GasGx public gas-engine catalog snapshot for `/products/gas/natural/`.

Page scope: Natural Gas.

## Portfolio Summary

- Matched models: 89

- Power range: 41.5 kW to 132000 kW

-  gasgx product catalog natural gas https www com products 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组 小型发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/natural/' limit 1),
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT',
        'en',
        array['gasgx', 'product', 'catalog', 'natural', 'gas', 'https', 'www', 'com', 'products', '威曼', 'vman', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '道依茨', '道依', '依茨', 'deutz', '曼海姆', '曼海', '海姆', 'mwm', '博杜安', '博杜', '杜安', 'baudouin', '西门子', '西门', '门子', 'siemens', '斗山', 'doosan', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '中小型发电机组', '中小', '小型', '型发', '电机', '机组', '大型发电机组', '大型', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '中小型', 'chp', '系统', '商用车辆', '商用', '用车', '车辆', '发电机组', '小型发电机组']::text[],
        'Representative Models',
        1,
        214,
        '{"path": "/products/gas/natural/", "snapshot_kind": "gas_engine_catalog", "matched_models": 89}'::jsonb,
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电 - 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT gasgx product catalog natural gas https www com products 威曼 vman 潍柴动力 潍柴 柴动 动力 weichai 贝克休斯 贝克 克休 休斯 baker hughes 道依茨 道依 依茨 deutz 曼海姆 曼海 海姆 mwm 博杜安 博杜 杜安 baudouin 西门子 西门 门子 siemens 斗山 doosan 天然气 天然 然气 工业发电 工业 业发 发电 中小型发电机组 中小 小型 型发 电机 机组 大型发电机组 大型 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 中小型 chp 系统 商用车辆 商用 用车 车辆 发电机组 小型发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/power-range/0-500kw/' limit 1),
        '# GasGx Product Catalog | 0-500 kW

GasGx public gas-engine catalog snapshot for `/products/gas/power-range/0-500kw/`.

Page scope: 0-500 kW.

## Portfolio Summary

- Matched models: 36

- Power range: 41.5 kW to 450 kW

- Efficiency range: 37.8% to 42.9%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 撬装式机组

- Brand origins: 海外生产, 中国生产

- Representative brands: 道依茨（Deutz）, 潍柴动力（WEICHAI）, 威曼（VMAN）, 博杜安（Baudouin）, 锡柴（XICHAI）, 康明斯（Cummins）, 斗山（Doosan）, 上柴（SHANGCHAI）, 汉马（HANMA）, 颜巴赫（Jenbacher）

- Common applications: 中小型发电机组, 商用车辆、发电机组, 小型发电机组, 大型发电机组, 小型发电机组、工程机械, 中小功率发电, 煤层气、天然气、沼气等多种燃料, 中小型CHP系统

- Main series: WP系列, 铂威系列, TCG 2015, CM6T, G 2.2 L3, 2系列

## Representative Models

- 康明斯（Cummins） | K19N-G4 | K19N | 450 kW | 40% | 天然气 | 液冷 | 撬装式机组 | 油田伴生气发电

- 曼海姆（MWM） | TCG 3016 V08 | TCG 3016 | 400 kW | 42.9% | 天然气 | 液冷 | 撬装式机组 | 中小型CHP系统

- 潍柴动力（WEICHAI） | WPG500*7NG | M33系列 | 400 kW | 40% | 天然气 | 液冷 | 撬装式机组 | 中型发电机组

- 博杜安（Baudouin） | 6M26 | 6M26 | 400 kW | 38.5% | 天然气 | 液冷 | 撬装式机组 | 中小型发电机组',
        '# GasGx Product Catalog | 0-500 kW

GasGx public gas-engine catalog snapshot for `/products/gas/power-range/0-500kw/`.

Page scope: 0-500 kW.

## Portfolio Summary

- Matched models: 36

- Power range: 41.5 kW to 450 kW
',
        'en',
        array['gasgx', 'product', 'catalog', '500', 'kw', 'https', 'www', 'com', 'products', 'gas', 'power', 'range', '500kw', '道依茨', '道依', '依茨', 'deutz', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '威曼', 'vman', '博杜安', '博杜', '杜安', 'baudouin', '锡柴', 'xichai', '康明斯', '康明', '明斯', 'cummins', '斗山', 'doosan', '上柴', 'shangchai', '天然气', '天然', '然气', '中小型发电机组', '中小', '小型', '型发', '发电', '电机', '机组', '商用车辆', '商用', '用车', '车辆', '发电机组', '小型发电机组', '大型发电机组', '大型', '工程机械', '工程', '程机', '机械', '中小功率发电', '小功', '功率', '率发', '煤层气', '煤层', '层气', '沼气等多种燃料', '沼气', '气等', '等多', '多种', '种燃', '燃料', '中小型', 'chp', '系统', '分布式能源', '分布', '布式']::text[],
        'Representative Models',
        0,
        255,
        '{"path": "/products/gas/power-range/0-500kw/", "snapshot_kind": "gas_engine_catalog", "matched_models": 36}'::jsonb,
        '# GasGx Product Catalog | 0-500 kW

GasGx public gas-engine catalog snapshot for `/products/gas/power-range/0-500kw/`.

Page scope: 0-500 kW.

## Portfolio Summary

- Matched models: 36

- Power range: 41.5 kW to 450 kW

- Efficiency range: 37.8% to 42.9%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 撬装式机组

- Brand origins: 海外生产, 中国生产

- Representative brands: 道依茨（Deutz）, 潍柴动力（WEICHAI）, 威曼（VMAN）, 博杜安（Baudouin）, 锡柴（XICHAI）, 康明斯（Cummins）, 斗山（Doosan）, 上柴（SHANGCHAI）, 汉马（HANMA）, 颜巴赫（Jenbacher）

- Common applications: 中小型发电机组, 商用车辆、发电机组, 小型发电机组, 大型发电机组, 小型发电机组、工程机械, 中小功率发电, 煤层气、天然气、沼气等多种燃料, 中小型CHP系统

- Main series: WP系列, 铂威系列, TCG 2015, CM6T, G 2.2 L3, 2系列

## Representative Models

- 康明斯（Cummins） | K19N-G4 | K19N | 450 kW | 40% | 天然气 | 液冷 | 撬装式机组 | 油田伴生气发电

- 曼海姆（MWM） | TCG 3016 V08 | TCG 3016 | 400 kW | 42.9% | 天然气 | 液冷 | 撬装式机组 | 中小型CHP系统

- 潍柴动力（WEICHAI） | WPG500*7NG | M33系列 | 400 kW | 40% | 天然气 | 液冷 | 撬装式机组 | 中型发电机组

- 博杜安（Baudouin） | 6M26 | 6M26 | 400 kW | 38.5% | 天然气 | 液冷 | 撬装式机组 | 中小型发电机组 # GasGx Product Catalog | 0-500 kW

GasGx public gas-engine catalog snapshot for `/products/gas/power-range/0-500kw/`.

Page scope: 0-500 kW.

## Portfolio Summary

- Matched models: 36

- Power range: 41.5 kW to 450 kW
 gasgx product catalog 500 kw https www com products gas power range 500kw 道依茨 道依 依茨 deutz 潍柴动力 潍柴 柴动 动力 weichai 威曼 vman 博杜安 博杜 杜安 baudouin 锡柴 xichai 康明斯 康明 明斯 cummins 斗山 doosan 上柴 shangchai 天然气 天然 然气 中小型发电机组 中小 小型 型发 发电 电机 机组 商用车辆 商用 用车 车辆 发电机组 小型发电机组 大型发电机组 大型 工程机械 工程 程机 机械 中小功率发电 小功 功率 率发 煤层气 煤层 层气 沼气等多种燃料 沼气 气等 等多 多种 种燃 燃料 中小型 chp 系统 分布式能源 分布 布式'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/power-range/0-500kw/' limit 1),
        '- 康明斯（Cummins） | X15N (2024) | X15N | 373 kW | 41% | 天然气 | 液冷 | 撬装式机组 | 重型卡车、发电机组

- 颜巴赫（Jenbacher） | J220 | 2系列 | 360 kW | 40.2% | 天然气 | 液冷 | 撬装式机组 | 煤层气、天然气、沼气等多种燃料

- 威曼（VMAN） | DT22/YDT22 | DT22/YDT22 | 350 kW | 38.08% | 天然气 | 液冷 | 撬装式机组 | 中小型分布式能源

- 博杜安（Baudouin） | 6M33 | 6M33 | 350 kW | 39% | 天然气 | 液冷 | 撬装式机组 | 中小型发电机组

- 汉马（HANMA） | CM6T28 | CM6T | 350 kW | 39.5% | 天然气 | 液冷+风冷 | 撬装式机组 | 中小功率发电

- 锡柴（XICHAI） | 6DK1 | 铂威系列 | 320 kW | 38.5% | 天然气 | 液冷 | 撬装式机组 | 商用车辆、发电机组

- 斗山（Doosan） | GV222TI V12 | GV222TI | 315 kW | 39% | 天然气 | 液冷 | 撬装式机组 | 大型发电机组

- 道依茨（Deutz） | TCD 12.0 V6 | TCD 12.0 V6 | 300 kW | 41% | 天然气 | 液冷 | 撬装式机组 | 大型发电机组

- 锡柴（XICHAI） | 6DH1 | 铂威系列 | 293 kW | 38.2% | 天然气 | 液冷 | 撬装式机组 | 商用车辆、发电机组

- 玉柴（YUCHAI） | YC6K360LN-D30 | YC6K | 265 kW | 39.5% | 天然气 | 液冷 | 撬装式机组 | 中小型发电项目',
        '- 康明斯（Cummins） | X15N (2024) | X15N | 373 kW | 41% | 天然气 | 液冷 | 撬装式机组 | 重型卡车、发电机组

- 颜巴赫（Jenbacher） | J220 | 2系列 | 360 kW | 40.2% | 天然气 | 液冷 | 撬装式机组 | 煤层气、天然气、沼气等多种燃料

- 威曼（VMAN） | DT22/YDT22 | DT22/YDT22 | 350 kW | 38.0',
        'en',
        array['gasgx', 'product', 'catalog', '500', 'kw', 'https', 'www', 'com', 'products', 'gas', 'power', 'range', '500kw', '道依茨', '道依', '依茨', 'deutz', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '威曼', 'vman', '博杜安', '博杜', '杜安', 'baudouin', '锡柴', 'xichai', '康明斯', '康明', '明斯', 'cummins', '斗山', 'doosan', '上柴', 'shangchai', '天然气', '天然', '然气', '中小型发电机组', '中小', '小型', '型发', '发电', '电机', '机组', '商用车辆', '商用', '用车', '车辆', '发电机组', '小型发电机组', '大型发电机组', '大型', '工程机械', '工程', '程机', '机械', '中小功率发电', '小功', '功率', '率发', '煤层气', '煤层', '层气', '沼气等多种燃料', '沼气', '气等', '等多', '多种', '种燃', '燃料', '中小型', 'chp', '系统', '分布式能源', '分布', '布式']::text[],
        'Representative Models',
        1,
        201,
        '{"path": "/products/gas/power-range/0-500kw/", "snapshot_kind": "gas_engine_catalog", "matched_models": 36}'::jsonb,
        '- 康明斯（Cummins） | X15N (2024) | X15N | 373 kW | 41% | 天然气 | 液冷 | 撬装式机组 | 重型卡车、发电机组

- 颜巴赫（Jenbacher） | J220 | 2系列 | 360 kW | 40.2% | 天然气 | 液冷 | 撬装式机组 | 煤层气、天然气、沼气等多种燃料

- 威曼（VMAN） | DT22/YDT22 | DT22/YDT22 | 350 kW | 38.08% | 天然气 | 液冷 | 撬装式机组 | 中小型分布式能源

- 博杜安（Baudouin） | 6M33 | 6M33 | 350 kW | 39% | 天然气 | 液冷 | 撬装式机组 | 中小型发电机组

- 汉马（HANMA） | CM6T28 | CM6T | 350 kW | 39.5% | 天然气 | 液冷+风冷 | 撬装式机组 | 中小功率发电

- 锡柴（XICHAI） | 6DK1 | 铂威系列 | 320 kW | 38.5% | 天然气 | 液冷 | 撬装式机组 | 商用车辆、发电机组

- 斗山（Doosan） | GV222TI V12 | GV222TI | 315 kW | 39% | 天然气 | 液冷 | 撬装式机组 | 大型发电机组

- 道依茨（Deutz） | TCD 12.0 V6 | TCD 12.0 V6 | 300 kW | 41% | 天然气 | 液冷 | 撬装式机组 | 大型发电机组

- 锡柴（XICHAI） | 6DH1 | 铂威系列 | 293 kW | 38.2% | 天然气 | 液冷 | 撬装式机组 | 商用车辆、发电机组

- 玉柴（YUCHAI） | YC6K360LN-D30 | YC6K | 265 kW | 39.5% | 天然气 | 液冷 | 撬装式机组 | 中小型发电项目 - 康明斯（Cummins） | X15N (2024) | X15N | 373 kW | 41% | 天然气 | 液冷 | 撬装式机组 | 重型卡车、发电机组

- 颜巴赫（Jenbacher） | J220 | 2系列 | 360 kW | 40.2% | 天然气 | 液冷 | 撬装式机组 | 煤层气、天然气、沼气等多种燃料

- 威曼（VMAN） | DT22/YDT22 | DT22/YDT22 | 350 kW | 38.0 gasgx product catalog 500 kw https www com products gas power range 500kw 道依茨 道依 依茨 deutz 潍柴动力 潍柴 柴动 动力 weichai 威曼 vman 博杜安 博杜 杜安 baudouin 锡柴 xichai 康明斯 康明 明斯 cummins 斗山 doosan 上柴 shangchai 天然气 天然 然气 中小型发电机组 中小 小型 型发 发电 电机 机组 商用车辆 商用 用车 车辆 发电机组 小型发电机组 大型发电机组 大型 工程机械 工程 程机 机械 中小功率发电 小功 功率 率发 煤层气 煤层 层气 沼气等多种燃料 沼气 气等 等多 多种 种燃 燃料 中小型 chp 系统 分布式能源 分布 布式'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/power-range/1mw-plus/' limit 1),
        '# GasGx Product Catalog | 1 MW+

GasGx public gas-engine catalog snapshot for `/products/gas/power-range/1mw-plus/`.

Page scope: 1 MW+.

## Portfolio Summary

- Matched models: 39

- Power range: 1000 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组

- Brand origins: 海外生产, 中国生产

- Representative brands: 贝克休斯（Baker Hughes）, 西门子（Siemens）, 瓦克夏（Waukesha）, 曼海姆（MWM）, 威曼（VMAN）, 颜巴赫（Jenbacher）, 卡特彼勒（Caterpillar）, 潍柴动力（WEICHAI）, MTU（罗罗动力）, 玉柴（YUCHAI）

- Common applications: 工业发电, 高压力条件下运行，多种燃料灵活使用, 煤层气、天然气、沼气、伴生气等多种燃料, 大型发电机组, 集装箱式电站，空间受限场景, 大型电站专用, 天然气专用, 中小型CHP系统

- Main series: HND重载系列, 275GL+, Series 4000, VHP, 4系列, 6系列

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '# GasGx Product Catalog | 1 MW+

GasGx public gas-engine catalog snapshot for `/products/gas/power-range/1mw-plus/`.

Page scope: 1 MW+.

## Portfolio Summary

- Matched models: 39

- Power range: 1000 kW to 132000 kW

-',
        'en',
        array['gasgx', 'product', 'catalog', 'mw', 'https', 'www', 'com', 'products', 'gas', 'power', 'range', '1mw', 'plus', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '西门子', '西门', '门子', 'siemens', '瓦克夏', '瓦克', '克夏', 'waukesha', '曼海姆', '曼海', '海姆', 'mwm', '威曼', 'vman', '颜巴赫', '颜巴', '巴赫', 'jenbacher', '卡特彼勒', '卡特', '特彼', '彼勒', 'caterpillar', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '煤层气', '煤层', '层气', '沼气', '伴生气等多种燃料', '伴生', '生气', '气等', '等多', '大型发电机组']::text[],
        'Representative Models',
        0,
        267,
        '{"path": "/products/gas/power-range/1mw-plus/", "snapshot_kind": "gas_engine_catalog", "matched_models": 39}'::jsonb,
        '# GasGx Product Catalog | 1 MW+

GasGx public gas-engine catalog snapshot for `/products/gas/power-range/1mw-plus/`.

Page scope: 1 MW+.

## Portfolio Summary

- Matched models: 39

- Power range: 1000 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组

- Brand origins: 海外生产, 中国生产

- Representative brands: 贝克休斯（Baker Hughes）, 西门子（Siemens）, 瓦克夏（Waukesha）, 曼海姆（MWM）, 威曼（VMAN）, 颜巴赫（Jenbacher）, 卡特彼勒（Caterpillar）, 潍柴动力（WEICHAI）, MTU（罗罗动力）, 玉柴（YUCHAI）

- Common applications: 工业发电, 高压力条件下运行，多种燃料灵活使用, 煤层气、天然气、沼气、伴生气等多种燃料, 大型发电机组, 集装箱式电站，空间受限场景, 大型电站专用, 天然气专用, 中小型CHP系统

- Main series: HND重载系列, 275GL+, Series 4000, VHP, 4系列, 6系列

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电 # GasGx Product Catalog | 1 MW+

GasGx public gas-engine catalog snapshot for `/products/gas/power-range/1mw-plus/`.

Page scope: 1 MW+.

## Portfolio Summary

- Matched models: 39

- Power range: 1000 kW to 132000 kW

- gasgx product catalog mw https www com products gas power range 1mw plus 贝克休斯 贝克 克休 休斯 baker hughes 西门子 西门 门子 siemens 瓦克夏 瓦克 克夏 waukesha 曼海姆 曼海 海姆 mwm 威曼 vman 颜巴赫 颜巴 巴赫 jenbacher 卡特彼勒 卡特 特彼 彼勒 caterpillar 潍柴动力 潍柴 柴动 动力 weichai 天然气 天然 然气 工业发电 工业 业发 发电 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 煤层气 煤层 层气 沼气 伴生气等多种燃料 伴生 生气 气等 等多 大型发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/power-range/1mw-plus/' limit 1),
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT',
        'en',
        array['gasgx', 'product', 'catalog', 'mw', 'https', 'www', 'com', 'products', 'gas', 'power', 'range', '1mw', 'plus', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '西门子', '西门', '门子', 'siemens', '瓦克夏', '瓦克', '克夏', 'waukesha', '曼海姆', '曼海', '海姆', 'mwm', '威曼', 'vman', '颜巴赫', '颜巴', '巴赫', 'jenbacher', '卡特彼勒', '卡特', '特彼', '彼勒', 'caterpillar', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '煤层气', '煤层', '层气', '沼气', '伴生气等多种燃料', '伴生', '生气', '气等', '等多', '大型发电机组']::text[],
        'Representative Models',
        1,
        214,
        '{"path": "/products/gas/power-range/1mw-plus/", "snapshot_kind": "gas_engine_catalog", "matched_models": 39}'::jsonb,
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电 - 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT gasgx product catalog mw https www com products gas power range 1mw plus 贝克休斯 贝克 克休 休斯 baker hughes 西门子 西门 门子 siemens 瓦克夏 瓦克 克夏 waukesha 曼海姆 曼海 海姆 mwm 威曼 vman 颜巴赫 颜巴 巴赫 jenbacher 卡特彼勒 卡特 特彼 彼勒 caterpillar 潍柴动力 潍柴 柴动 动力 weichai 天然气 天然 然气 工业发电 工业 业发 发电 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 煤层气 煤层 层气 沼气 伴生气等多种燃料 伴生 生气 气等 等多 大型发电机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/power-range/500-1000kw/' limit 1),
        '# GasGx Product Catalog | 500-1000 kW

GasGx public gas-engine catalog snapshot for `/products/gas/power-range/500-1000kw/`.

Page scope: 500-1000 kW.

## Portfolio Summary

- Matched models: 14

- Power range: 500 kW to 900 kW

- Efficiency range: 38.08% to 43.5%

- Main gas sources: 天然气

- Cooling methods: 液冷

- Deployment types: 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 曼海姆（MWM）, 威曼（VMAN）, 博杜安（Baudouin）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）, 康明斯（Cummins）, 卡特彼勒（Caterpillar）, 潍柴动力（WEICHAI）, 上柴（SHANGCHAI）, 西门子（Siemens）

- Common applications: 大型发电机组, 中小型CHP系统, 同缸径平台旗舰型号, 高压力条件下运行，多种燃料灵活使用, 煤层气、天然气、沼气、伴生气、丙烷等多种燃料, 中型电站项目, 中小型工业备电, 大功率发电项目

- Main series: TCG 3016, VGF, 3系列, DT30/YDT30, DT30+/YDT30, K38N

## Representative Models

- 康明斯（Cummins） | K38N-G8 | K38N | 900 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 中型电站项目

- 瓦克夏（Waukesha） | VGF | VGF | 800 kW | 41.2% | 天然气 | 液冷 | 一体化机组AIS | 高压力条件下运行，多种燃料灵活使用

- 曼海姆（MWM） | TCG 3016 V16 | TCG 3016 | 800 kW | 43.5% | 天然气 | 液冷 | 一体化机组AIS | 中小型CHP系统

- 卡特彼勒（Caterpillar） | CG132B-16 | CG132B | 800 kW | 43.5% | 天然气 | 液冷 | 一体化机组AIS | 中小型工业备电',
        '# GasGx Product Catalog | 500-1000 kW

GasGx public gas-engine catalog snapshot for `/products/gas/power-range/500-1000kw/`.

Page scope: 500-1000 kW.

## Portfolio Summary

- Matched models: 14

- Power range: 500 kW to',
        'en',
        array['gasgx', 'product', 'catalog', '500', '1000', 'kw', 'https', 'www', 'com', 'products', 'gas', 'power', 'range', '1000kw', '曼海姆', '曼海', '海姆', 'mwm', '威曼', 'vman', '博杜安', '博杜', '杜安', 'baudouin', '瓦克夏', '瓦克', '克夏', 'waukesha', '颜巴赫', '颜巴', '巴赫', 'jenbacher', '康明斯', '康明', '明斯', 'cummins', '卡特彼勒', '卡特', '特彼', '彼勒', 'caterpillar', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '天然气', '天然', '然气', '大型发电机组', '大型', '型发', '发电', '电机', '机组', '中小型', '中小', '小型', 'chp', '系统', '同缸径平台旗舰型号', '同缸', '缸径', '径平', '平台', '台旗', '旗舰', '舰型', '型号', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃']::text[],
        'Representative Models',
        0,
        272,
        '{"path": "/products/gas/power-range/500-1000kw/", "snapshot_kind": "gas_engine_catalog", "matched_models": 14}'::jsonb,
        '# GasGx Product Catalog | 500-1000 kW

GasGx public gas-engine catalog snapshot for `/products/gas/power-range/500-1000kw/`.

Page scope: 500-1000 kW.

## Portfolio Summary

- Matched models: 14

- Power range: 500 kW to 900 kW

- Efficiency range: 38.08% to 43.5%

- Main gas sources: 天然气

- Cooling methods: 液冷

- Deployment types: 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 曼海姆（MWM）, 威曼（VMAN）, 博杜安（Baudouin）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）, 康明斯（Cummins）, 卡特彼勒（Caterpillar）, 潍柴动力（WEICHAI）, 上柴（SHANGCHAI）, 西门子（Siemens）

- Common applications: 大型发电机组, 中小型CHP系统, 同缸径平台旗舰型号, 高压力条件下运行，多种燃料灵活使用, 煤层气、天然气、沼气、伴生气、丙烷等多种燃料, 中型电站项目, 中小型工业备电, 大功率发电项目

- Main series: TCG 3016, VGF, 3系列, DT30/YDT30, DT30+/YDT30, K38N

## Representative Models

- 康明斯（Cummins） | K38N-G8 | K38N | 900 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 中型电站项目

- 瓦克夏（Waukesha） | VGF | VGF | 800 kW | 41.2% | 天然气 | 液冷 | 一体化机组AIS | 高压力条件下运行，多种燃料灵活使用

- 曼海姆（MWM） | TCG 3016 V16 | TCG 3016 | 800 kW | 43.5% | 天然气 | 液冷 | 一体化机组AIS | 中小型CHP系统

- 卡特彼勒（Caterpillar） | CG132B-16 | CG132B | 800 kW | 43.5% | 天然气 | 液冷 | 一体化机组AIS | 中小型工业备电 # GasGx Product Catalog | 500-1000 kW

GasGx public gas-engine catalog snapshot for `/products/gas/power-range/500-1000kw/`.

Page scope: 500-1000 kW.

## Portfolio Summary

- Matched models: 14

- Power range: 500 kW to gasgx product catalog 500 1000 kw https www com products gas power range 1000kw 曼海姆 曼海 海姆 mwm 威曼 vman 博杜安 博杜 杜安 baudouin 瓦克夏 瓦克 克夏 waukesha 颜巴赫 颜巴 巴赫 jenbacher 康明斯 康明 明斯 cummins 卡特彼勒 卡特 特彼 彼勒 caterpillar 潍柴动力 潍柴 柴动 动力 weichai 天然气 天然 然气 大型发电机组 大型 型发 发电 电机 机组 中小型 中小 小型 chp 系统 同缸径平台旗舰型号 同缸 缸径 径平 平台 台旗 旗舰 舰型 型号 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/gas/power-range/500-1000kw/' limit 1),
        '- 潍柴动力（WEICHAI） | WPG1000*7NG | M33系列 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 博杜安（Baudouin） | 12M33 | 12M33 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 颜巴赫（Jenbacher） | J320 | 3系列 | 795 kW | 40.7% | 天然气 | 液冷 | 一体化机组AIS | 煤层气、天然气、沼气、伴生气、丙烷等多种燃料

- 斗山（Doosan） | DP222CA V12 | DP222CA | 727 kW | 40% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 曼海姆（MWM） | TCG 3016 V12 | TCG 3016 | 600 kW | 43.2% | 天然气 | 液冷 | 一体化机组AIS | 中小型CHP系统

- 上柴（SHANGCHAI） | SC27G | G系列 | 600 kW | 40% | 天然气 | 液冷 | 一体化机组AIS | 大功率发电项目

- 博杜安（Baudouin） | 12M26 | 12M26 | 600 kW | 39.5% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 威曼（VMAN） | DT30+/YDT30 | DT30+/YDT30 | 550 kW | 40.04% | 天然气 | 液冷 | 一体化机组AIS | 同缸径平台旗舰型号

- 西门子（Siemens） | SGE-24HM | SGE-24HM | 520 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 中小型发电机组

- 威曼（VMAN） | DT30/YDT30 | DT30/YDT30 | 500 kW | 38.08% | 天然气 | 液冷 | 一体化机组AIS | 同缸径平台旗舰型号',
        '- 潍柴动力（WEICHAI） | WPG1000*7NG | M33系列 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 博杜安（Baudouin） | 12M33 | 12M33 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 颜巴赫（Jenbacher） | J320 | 3系列 | 795 kW | 40.7% | 天然气 | 液',
        'en',
        array['gasgx', 'product', 'catalog', '500', '1000', 'kw', 'https', 'www', 'com', 'products', 'gas', 'power', 'range', '1000kw', '曼海姆', '曼海', '海姆', 'mwm', '威曼', 'vman', '博杜安', '博杜', '杜安', 'baudouin', '瓦克夏', '瓦克', '克夏', 'waukesha', '颜巴赫', '颜巴', '巴赫', 'jenbacher', '康明斯', '康明', '明斯', 'cummins', '卡特彼勒', '卡特', '特彼', '彼勒', 'caterpillar', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '天然气', '天然', '然气', '大型发电机组', '大型', '型发', '发电', '电机', '机组', '中小型', '中小', '小型', 'chp', '系统', '同缸径平台旗舰型号', '同缸', '缸径', '径平', '平台', '台旗', '旗舰', '舰型', '型号', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃']::text[],
        'Representative Models',
        1,
        213,
        '{"path": "/products/gas/power-range/500-1000kw/", "snapshot_kind": "gas_engine_catalog", "matched_models": 14}'::jsonb,
        '- 潍柴动力（WEICHAI） | WPG1000*7NG | M33系列 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 博杜安（Baudouin） | 12M33 | 12M33 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 颜巴赫（Jenbacher） | J320 | 3系列 | 795 kW | 40.7% | 天然气 | 液冷 | 一体化机组AIS | 煤层气、天然气、沼气、伴生气、丙烷等多种燃料

- 斗山（Doosan） | DP222CA V12 | DP222CA | 727 kW | 40% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 曼海姆（MWM） | TCG 3016 V12 | TCG 3016 | 600 kW | 43.2% | 天然气 | 液冷 | 一体化机组AIS | 中小型CHP系统

- 上柴（SHANGCHAI） | SC27G | G系列 | 600 kW | 40% | 天然气 | 液冷 | 一体化机组AIS | 大功率发电项目

- 博杜安（Baudouin） | 12M26 | 12M26 | 600 kW | 39.5% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 威曼（VMAN） | DT30+/YDT30 | DT30+/YDT30 | 550 kW | 40.04% | 天然气 | 液冷 | 一体化机组AIS | 同缸径平台旗舰型号

- 西门子（Siemens） | SGE-24HM | SGE-24HM | 520 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 中小型发电机组

- 威曼（VMAN） | DT30/YDT30 | DT30/YDT30 | 500 kW | 38.08% | 天然气 | 液冷 | 一体化机组AIS | 同缸径平台旗舰型号 - 潍柴动力（WEICHAI） | WPG1000*7NG | M33系列 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 博杜安（Baudouin） | 12M33 | 12M33 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 颜巴赫（Jenbacher） | J320 | 3系列 | 795 kW | 40.7% | 天然气 | 液 gasgx product catalog 500 1000 kw https www com products gas power range 1000kw 曼海姆 曼海 海姆 mwm 威曼 vman 博杜安 博杜 杜安 baudouin 瓦克夏 瓦克 克夏 waukesha 颜巴赫 颜巴 巴赫 jenbacher 康明斯 康明 明斯 cummins 卡特彼勒 卡特 特彼 彼勒 caterpillar 潍柴动力 潍柴 柴动 动力 weichai 天然气 天然 然气 大型发电机组 大型 型发 发电 电机 机组 中小型 中小 小型 chp 系统 同缸径平台旗舰型号 同缸 缸径 径平 平台 台旗 旗舰 舰型 型号 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/power-range/0-500kw/' limit 1),
        '# GasGx Product Catalog | 0-500 kW

GasGx public gas-engine catalog snapshot for `/products/power-range/0-500kw/`.

Page scope: 0-500 kW.

## Portfolio Summary

- Matched models: 36

- Power range: 41.5 kW to 450 kW

- Efficiency range: 37.8% to 42.9%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 撬装式机组

- Brand origins: 海外生产, 中国生产

- Representative brands: 道依茨（Deutz）, 潍柴动力（WEICHAI）, 威曼（VMAN）, 博杜安（Baudouin）, 锡柴（XICHAI）, 康明斯（Cummins）, 斗山（Doosan）, 上柴（SHANGCHAI）, 汉马（HANMA）, 颜巴赫（Jenbacher）

- Common applications: 中小型发电机组, 商用车辆、发电机组, 小型发电机组, 大型发电机组, 小型发电机组、工程机械, 中小功率发电, 煤层气、天然气、沼气等多种燃料, 中小型CHP系统

- Main series: WP系列, 铂威系列, TCG 2015, CM6T, G 2.2 L3, 2系列

## Representative Models

- 康明斯（Cummins） | K19N-G4 | K19N | 450 kW | 40% | 天然气 | 液冷 | 撬装式机组 | 油田伴生气发电

- 曼海姆（MWM） | TCG 3016 V08 | TCG 3016 | 400 kW | 42.9% | 天然气 | 液冷 | 撬装式机组 | 中小型CHP系统

- 潍柴动力（WEICHAI） | WPG500*7NG | M33系列 | 400 kW | 40% | 天然气 | 液冷 | 撬装式机组 | 中型发电机组

- 博杜安（Baudouin） | 6M26 | 6M26 | 400 kW | 38.5% | 天然气 | 液冷 | 撬装式机组 | 中小型发电机组',
        '# GasGx Product Catalog | 0-500 kW

GasGx public gas-engine catalog snapshot for `/products/power-range/0-500kw/`.

Page scope: 0-500 kW.

## Portfolio Summary

- Matched models: 36

- Power range: 41.5 kW to 450 kW

- E',
        'en',
        array['gasgx', 'product', 'catalog', '500', 'kw', 'https', 'www', 'com', 'products', 'power', 'range', '500kw', '道依茨', '道依', '依茨', 'deutz', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '威曼', 'vman', '博杜安', '博杜', '杜安', 'baudouin', '锡柴', 'xichai', '康明斯', '康明', '明斯', 'cummins', '斗山', 'doosan', '上柴', 'shangchai', '天然气', '天然', '然气', '中小型发电机组', '中小', '小型', '型发', '发电', '电机', '机组', '商用车辆', '商用', '用车', '车辆', '发电机组', '小型发电机组', '大型发电机组', '大型', '工程机械', '工程', '程机', '机械', '中小功率发电', '小功', '功率', '率发', '煤层气', '煤层', '层气', '沼气等多种燃料', '沼气', '气等', '等多', '多种', '种燃', '燃料', '中小型', 'chp', '系统', '分布式能源', '分布', '布式', '式能']::text[],
        'Representative Models',
        0,
        254,
        '{"path": "/products/power-range/0-500kw/", "snapshot_kind": "gas_engine_catalog", "matched_models": 36}'::jsonb,
        '# GasGx Product Catalog | 0-500 kW

GasGx public gas-engine catalog snapshot for `/products/power-range/0-500kw/`.

Page scope: 0-500 kW.

## Portfolio Summary

- Matched models: 36

- Power range: 41.5 kW to 450 kW

- Efficiency range: 37.8% to 42.9%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 撬装式机组

- Brand origins: 海外生产, 中国生产

- Representative brands: 道依茨（Deutz）, 潍柴动力（WEICHAI）, 威曼（VMAN）, 博杜安（Baudouin）, 锡柴（XICHAI）, 康明斯（Cummins）, 斗山（Doosan）, 上柴（SHANGCHAI）, 汉马（HANMA）, 颜巴赫（Jenbacher）

- Common applications: 中小型发电机组, 商用车辆、发电机组, 小型发电机组, 大型发电机组, 小型发电机组、工程机械, 中小功率发电, 煤层气、天然气、沼气等多种燃料, 中小型CHP系统

- Main series: WP系列, 铂威系列, TCG 2015, CM6T, G 2.2 L3, 2系列

## Representative Models

- 康明斯（Cummins） | K19N-G4 | K19N | 450 kW | 40% | 天然气 | 液冷 | 撬装式机组 | 油田伴生气发电

- 曼海姆（MWM） | TCG 3016 V08 | TCG 3016 | 400 kW | 42.9% | 天然气 | 液冷 | 撬装式机组 | 中小型CHP系统

- 潍柴动力（WEICHAI） | WPG500*7NG | M33系列 | 400 kW | 40% | 天然气 | 液冷 | 撬装式机组 | 中型发电机组

- 博杜安（Baudouin） | 6M26 | 6M26 | 400 kW | 38.5% | 天然气 | 液冷 | 撬装式机组 | 中小型发电机组 # GasGx Product Catalog | 0-500 kW

GasGx public gas-engine catalog snapshot for `/products/power-range/0-500kw/`.

Page scope: 0-500 kW.

## Portfolio Summary

- Matched models: 36

- Power range: 41.5 kW to 450 kW

- E gasgx product catalog 500 kw https www com products power range 500kw 道依茨 道依 依茨 deutz 潍柴动力 潍柴 柴动 动力 weichai 威曼 vman 博杜安 博杜 杜安 baudouin 锡柴 xichai 康明斯 康明 明斯 cummins 斗山 doosan 上柴 shangchai 天然气 天然 然气 中小型发电机组 中小 小型 型发 发电 电机 机组 商用车辆 商用 用车 车辆 发电机组 小型发电机组 大型发电机组 大型 工程机械 工程 程机 机械 中小功率发电 小功 功率 率发 煤层气 煤层 层气 沼气等多种燃料 沼气 气等 等多 多种 种燃 燃料 中小型 chp 系统 分布式能源 分布 布式 式能'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/power-range/0-500kw/' limit 1),
        '- 康明斯（Cummins） | X15N (2024) | X15N | 373 kW | 41% | 天然气 | 液冷 | 撬装式机组 | 重型卡车、发电机组

- 颜巴赫（Jenbacher） | J220 | 2系列 | 360 kW | 40.2% | 天然气 | 液冷 | 撬装式机组 | 煤层气、天然气、沼气等多种燃料

- 威曼（VMAN） | DT22/YDT22 | DT22/YDT22 | 350 kW | 38.08% | 天然气 | 液冷 | 撬装式机组 | 中小型分布式能源

- 博杜安（Baudouin） | 6M33 | 6M33 | 350 kW | 39% | 天然气 | 液冷 | 撬装式机组 | 中小型发电机组

- 汉马（HANMA） | CM6T28 | CM6T | 350 kW | 39.5% | 天然气 | 液冷+风冷 | 撬装式机组 | 中小功率发电

- 锡柴（XICHAI） | 6DK1 | 铂威系列 | 320 kW | 38.5% | 天然气 | 液冷 | 撬装式机组 | 商用车辆、发电机组

- 斗山（Doosan） | GV222TI V12 | GV222TI | 315 kW | 39% | 天然气 | 液冷 | 撬装式机组 | 大型发电机组

- 道依茨（Deutz） | TCD 12.0 V6 | TCD 12.0 V6 | 300 kW | 41% | 天然气 | 液冷 | 撬装式机组 | 大型发电机组

- 锡柴（XICHAI） | 6DH1 | 铂威系列 | 293 kW | 38.2% | 天然气 | 液冷 | 撬装式机组 | 商用车辆、发电机组

- 玉柴（YUCHAI） | YC6K360LN-D30 | YC6K | 265 kW | 39.5% | 天然气 | 液冷 | 撬装式机组 | 中小型发电项目',
        '- 康明斯（Cummins） | X15N (2024) | X15N | 373 kW | 41% | 天然气 | 液冷 | 撬装式机组 | 重型卡车、发电机组

- 颜巴赫（Jenbacher） | J220 | 2系列 | 360 kW | 40.2% | 天然气 | 液冷 | 撬装式机组 | 煤层气、天然气、沼气等多种燃料

- 威曼（VMAN） | DT22/YDT22 | DT22/YDT22 | 350 kW | 38.0',
        'en',
        array['gasgx', 'product', 'catalog', '500', 'kw', 'https', 'www', 'com', 'products', 'power', 'range', '500kw', '道依茨', '道依', '依茨', 'deutz', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '威曼', 'vman', '博杜安', '博杜', '杜安', 'baudouin', '锡柴', 'xichai', '康明斯', '康明', '明斯', 'cummins', '斗山', 'doosan', '上柴', 'shangchai', '天然气', '天然', '然气', '中小型发电机组', '中小', '小型', '型发', '发电', '电机', '机组', '商用车辆', '商用', '用车', '车辆', '发电机组', '小型发电机组', '大型发电机组', '大型', '工程机械', '工程', '程机', '机械', '中小功率发电', '小功', '功率', '率发', '煤层气', '煤层', '层气', '沼气等多种燃料', '沼气', '气等', '等多', '多种', '种燃', '燃料', '中小型', 'chp', '系统', '分布式能源', '分布', '布式', '式能']::text[],
        'Representative Models',
        1,
        201,
        '{"path": "/products/power-range/0-500kw/", "snapshot_kind": "gas_engine_catalog", "matched_models": 36}'::jsonb,
        '- 康明斯（Cummins） | X15N (2024) | X15N | 373 kW | 41% | 天然气 | 液冷 | 撬装式机组 | 重型卡车、发电机组

- 颜巴赫（Jenbacher） | J220 | 2系列 | 360 kW | 40.2% | 天然气 | 液冷 | 撬装式机组 | 煤层气、天然气、沼气等多种燃料

- 威曼（VMAN） | DT22/YDT22 | DT22/YDT22 | 350 kW | 38.08% | 天然气 | 液冷 | 撬装式机组 | 中小型分布式能源

- 博杜安（Baudouin） | 6M33 | 6M33 | 350 kW | 39% | 天然气 | 液冷 | 撬装式机组 | 中小型发电机组

- 汉马（HANMA） | CM6T28 | CM6T | 350 kW | 39.5% | 天然气 | 液冷+风冷 | 撬装式机组 | 中小功率发电

- 锡柴（XICHAI） | 6DK1 | 铂威系列 | 320 kW | 38.5% | 天然气 | 液冷 | 撬装式机组 | 商用车辆、发电机组

- 斗山（Doosan） | GV222TI V12 | GV222TI | 315 kW | 39% | 天然气 | 液冷 | 撬装式机组 | 大型发电机组

- 道依茨（Deutz） | TCD 12.0 V6 | TCD 12.0 V6 | 300 kW | 41% | 天然气 | 液冷 | 撬装式机组 | 大型发电机组

- 锡柴（XICHAI） | 6DH1 | 铂威系列 | 293 kW | 38.2% | 天然气 | 液冷 | 撬装式机组 | 商用车辆、发电机组

- 玉柴（YUCHAI） | YC6K360LN-D30 | YC6K | 265 kW | 39.5% | 天然气 | 液冷 | 撬装式机组 | 中小型发电项目 - 康明斯（Cummins） | X15N (2024) | X15N | 373 kW | 41% | 天然气 | 液冷 | 撬装式机组 | 重型卡车、发电机组

- 颜巴赫（Jenbacher） | J220 | 2系列 | 360 kW | 40.2% | 天然气 | 液冷 | 撬装式机组 | 煤层气、天然气、沼气等多种燃料

- 威曼（VMAN） | DT22/YDT22 | DT22/YDT22 | 350 kW | 38.0 gasgx product catalog 500 kw https www com products power range 500kw 道依茨 道依 依茨 deutz 潍柴动力 潍柴 柴动 动力 weichai 威曼 vman 博杜安 博杜 杜安 baudouin 锡柴 xichai 康明斯 康明 明斯 cummins 斗山 doosan 上柴 shangchai 天然气 天然 然气 中小型发电机组 中小 小型 型发 发电 电机 机组 商用车辆 商用 用车 车辆 发电机组 小型发电机组 大型发电机组 大型 工程机械 工程 程机 机械 中小功率发电 小功 功率 率发 煤层气 煤层 层气 沼气等多种燃料 沼气 气等 等多 多种 种燃 燃料 中小型 chp 系统 分布式能源 分布 布式 式能'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/power-range/1mw-plus/' limit 1),
        '# GasGx Product Catalog | 1 MW+

GasGx public gas-engine catalog snapshot for `/products/power-range/1mw-plus/`.

Page scope: 1 MW+.

## Portfolio Summary

- Matched models: 39

- Power range: 1000 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组

- Brand origins: 海外生产, 中国生产

- Representative brands: 贝克休斯（Baker Hughes）, 西门子（Siemens）, 瓦克夏（Waukesha）, 曼海姆（MWM）, 威曼（VMAN）, 颜巴赫（Jenbacher）, 卡特彼勒（Caterpillar）, 潍柴动力（WEICHAI）, MTU（罗罗动力）, 玉柴（YUCHAI）

- Common applications: 工业发电, 高压力条件下运行，多种燃料灵活使用, 煤层气、天然气、沼气、伴生气等多种燃料, 大型发电机组, 集装箱式电站，空间受限场景, 大型电站专用, 天然气专用, 中小型CHP系统

- Main series: HND重载系列, 275GL+, Series 4000, VHP, 4系列, 6系列

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '# GasGx Product Catalog | 1 MW+

GasGx public gas-engine catalog snapshot for `/products/power-range/1mw-plus/`.

Page scope: 1 MW+.

## Portfolio Summary

- Matched models: 39

- Power range: 1000 kW to 132000 kW

- Eff',
        'en',
        array['gasgx', 'product', 'catalog', 'mw', 'https', 'www', 'com', 'products', 'power', 'range', '1mw', 'plus', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '西门子', '西门', '门子', 'siemens', '瓦克夏', '瓦克', '克夏', 'waukesha', '曼海姆', '曼海', '海姆', 'mwm', '威曼', 'vman', '颜巴赫', '颜巴', '巴赫', 'jenbacher', '卡特彼勒', '卡特', '特彼', '彼勒', 'caterpillar', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '煤层气', '煤层', '层气', '沼气', '伴生气等多种燃料', '伴生', '生气', '气等', '等多', '大型发电机组', '大型']::text[],
        'Representative Models',
        0,
        266,
        '{"path": "/products/power-range/1mw-plus/", "snapshot_kind": "gas_engine_catalog", "matched_models": 39}'::jsonb,
        '# GasGx Product Catalog | 1 MW+

GasGx public gas-engine catalog snapshot for `/products/power-range/1mw-plus/`.

Page scope: 1 MW+.

## Portfolio Summary

- Matched models: 39

- Power range: 1000 kW to 132000 kW

- Efficiency range: 29% to 46.5%

- Main gas sources: 天然气

- Cooling methods: 液冷, 液冷+风冷

- Deployment types: 集装箱机组

- Brand origins: 海外生产, 中国生产

- Representative brands: 贝克休斯（Baker Hughes）, 西门子（Siemens）, 瓦克夏（Waukesha）, 曼海姆（MWM）, 威曼（VMAN）, 颜巴赫（Jenbacher）, 卡特彼勒（Caterpillar）, 潍柴动力（WEICHAI）, MTU（罗罗动力）, 玉柴（YUCHAI）

- Common applications: 工业发电, 高压力条件下运行，多种燃料灵活使用, 煤层气、天然气、沼气、伴生气等多种燃料, 大型发电机组, 集装箱式电站，空间受限场景, 大型电站专用, 天然气专用, 中小型CHP系统

- Main series: HND重载系列, 275GL+, Series 4000, VHP, 4系列, 6系列

## Representative Models

- 贝克休斯（Baker Hughes） | Frame 9/1E | Frame 9/1E | 132000 kW | 34.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | LMS100PB+ | LMS100PB+ | 108000 kW | 43% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 7/1EA | Frame 7/1EA | 91000 kW | 35% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 斗山（Doosan） | DGT-100 | DGT-100 | 90000 kW | 39% | 天然气 | 液冷 | 集装箱机组 | 工业发电 # GasGx Product Catalog | 1 MW+

GasGx public gas-engine catalog snapshot for `/products/power-range/1mw-plus/`.

Page scope: 1 MW+.

## Portfolio Summary

- Matched models: 39

- Power range: 1000 kW to 132000 kW

- Eff gasgx product catalog mw https www com products power range 1mw plus 贝克休斯 贝克 克休 休斯 baker hughes 西门子 西门 门子 siemens 瓦克夏 瓦克 克夏 waukesha 曼海姆 曼海 海姆 mwm 威曼 vman 颜巴赫 颜巴 巴赫 jenbacher 卡特彼勒 卡特 特彼 彼勒 caterpillar 潍柴动力 潍柴 柴动 动力 weichai 天然气 天然 然气 工业发电 工业 业发 发电 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 煤层气 煤层 层气 沼气 伴生气等多种燃料 伴生 生气 气等 等多 大型发电机组 大型'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/power-range/1mw-plus/' limit 1),
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电',
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT',
        'en',
        array['gasgx', 'product', 'catalog', 'mw', 'https', 'www', 'com', 'products', 'power', 'range', '1mw', 'plus', '贝克休斯', '贝克', '克休', '休斯', 'baker', 'hughes', '西门子', '西门', '门子', 'siemens', '瓦克夏', '瓦克', '克夏', 'waukesha', '曼海姆', '曼海', '海姆', 'mwm', '威曼', 'vman', '颜巴赫', '颜巴', '巴赫', 'jenbacher', '卡特彼勒', '卡特', '特彼', '彼勒', 'caterpillar', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '天然气', '天然', '然气', '工业发电', '工业', '业发', '发电', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料', '料灵', '灵活', '活使', '使用', '煤层气', '煤层', '层气', '沼气', '伴生气等多种燃料', '伴生', '生气', '气等', '等多', '大型发电机组', '大型']::text[],
        'Representative Models',
        1,
        214,
        '{"path": "/products/power-range/1mw-plus/", "snapshot_kind": "gas_engine_catalog", "matched_models": 39}'::jsonb,
        '- 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT-700 | 35200 kW | 34% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | Frame 5/2D | Frame 5/2D | 34000 kW | 36% | 天然气 | 液冷 | 集装箱机组 | 机械驱动

- 贝克休斯（Baker Hughes） | Frame 5/2E | Frame 5/2E | 32800 kW | 35.8% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-600 | SGT-600 | 24500 kW | 33.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | NovaLT™16 | NovaLT™16 | 16900 kW | 36.4% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-400 | SGT-400 | 14300 kW | 35.6% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 颜巴赫（Jenbacher） | J920 | 9系列 | 9352 kW | 46.5% | 天然气 | 液冷 | 集装箱机组 | 天然气专用

- 西门子（Siemens） | SGT-300 | SGT-300 | 7900 kW | 33% | 天然气 | 液冷 | 集装箱机组 | 工业发电 - 贝克休斯（Baker Hughes） | LM9000 | LM9000 | 73100 kW | 44.2% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 贝克休斯（Baker Hughes） | PGT25+/LM2500+G5 | PGT25+/LM2500+G5 | 37600 kW | 40.5% | 天然气 | 液冷 | 集装箱机组 | 工业发电

- 西门子（Siemens） | SGT-700 | SGT gasgx product catalog mw https www com products power range 1mw plus 贝克休斯 贝克 克休 休斯 baker hughes 西门子 西门 门子 siemens 瓦克夏 瓦克 克夏 waukesha 曼海姆 曼海 海姆 mwm 威曼 vman 颜巴赫 颜巴 巴赫 jenbacher 卡特彼勒 卡特 特彼 彼勒 caterpillar 潍柴动力 潍柴 柴动 动力 weichai 天然气 天然 然气 工业发电 工业 业发 发电 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料 料灵 灵活 活使 使用 煤层气 煤层 层气 沼气 伴生气等多种燃料 伴生 生气 气等 等多 大型发电机组 大型'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/power-range/500-1000kw/' limit 1),
        '# GasGx Product Catalog | 500-1000 kW

GasGx public gas-engine catalog snapshot for `/products/power-range/500-1000kw/`.

Page scope: 500-1000 kW.

## Portfolio Summary

- Matched models: 14

- Power range: 500 kW to 900 kW

- Efficiency range: 38.08% to 43.5%

- Main gas sources: 天然气

- Cooling methods: 液冷

- Deployment types: 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 曼海姆（MWM）, 威曼（VMAN）, 博杜安（Baudouin）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）, 康明斯（Cummins）, 卡特彼勒（Caterpillar）, 潍柴动力（WEICHAI）, 上柴（SHANGCHAI）, 西门子（Siemens）

- Common applications: 大型发电机组, 中小型CHP系统, 同缸径平台旗舰型号, 高压力条件下运行，多种燃料灵活使用, 煤层气、天然气、沼气、伴生气、丙烷等多种燃料, 中型电站项目, 中小型工业备电, 大功率发电项目

- Main series: TCG 3016, VGF, 3系列, DT30/YDT30, DT30+/YDT30, K38N

## Representative Models

- 康明斯（Cummins） | K38N-G8 | K38N | 900 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 中型电站项目

- 瓦克夏（Waukesha） | VGF | VGF | 800 kW | 41.2% | 天然气 | 液冷 | 一体化机组AIS | 高压力条件下运行，多种燃料灵活使用

- 曼海姆（MWM） | TCG 3016 V16 | TCG 3016 | 800 kW | 43.5% | 天然气 | 液冷 | 一体化机组AIS | 中小型CHP系统

- 卡特彼勒（Caterpillar） | CG132B-16 | CG132B | 800 kW | 43.5% | 天然气 | 液冷 | 一体化机组AIS | 中小型工业备电',
        '# GasGx Product Catalog | 500-1000 kW

GasGx public gas-engine catalog snapshot for `/products/power-range/500-1000kw/`.

Page scope: 500-1000 kW.

## Portfolio Summary

- Matched models: 14

- Power range: 500 kW to 900',
        'en',
        array['gasgx', 'product', 'catalog', '500', '1000', 'kw', 'https', 'www', 'com', 'products', 'power', 'range', '1000kw', '曼海姆', '曼海', '海姆', 'mwm', '威曼', 'vman', '博杜安', '博杜', '杜安', 'baudouin', '瓦克夏', '瓦克', '克夏', 'waukesha', '颜巴赫', '颜巴', '巴赫', 'jenbacher', '康明斯', '康明', '明斯', 'cummins', '卡特彼勒', '卡特', '特彼', '彼勒', 'caterpillar', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '天然气', '天然', '然气', '大型发电机组', '大型', '型发', '发电', '电机', '机组', '中小型', '中小', '小型', 'chp', '系统', '同缸径平台旗舰型号', '同缸', '缸径', '径平', '平台', '台旗', '旗舰', '舰型', '型号', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料']::text[],
        'Representative Models',
        0,
        271,
        '{"path": "/products/power-range/500-1000kw/", "snapshot_kind": "gas_engine_catalog", "matched_models": 14}'::jsonb,
        '# GasGx Product Catalog | 500-1000 kW

GasGx public gas-engine catalog snapshot for `/products/power-range/500-1000kw/`.

Page scope: 500-1000 kW.

## Portfolio Summary

- Matched models: 14

- Power range: 500 kW to 900 kW

- Efficiency range: 38.08% to 43.5%

- Main gas sources: 天然气

- Cooling methods: 液冷

- Deployment types: 一体化机组AIS

- Brand origins: 海外生产, 中国生产

- Representative brands: 曼海姆（MWM）, 威曼（VMAN）, 博杜安（Baudouin）, 瓦克夏（Waukesha）, 颜巴赫（Jenbacher）, 康明斯（Cummins）, 卡特彼勒（Caterpillar）, 潍柴动力（WEICHAI）, 上柴（SHANGCHAI）, 西门子（Siemens）

- Common applications: 大型发电机组, 中小型CHP系统, 同缸径平台旗舰型号, 高压力条件下运行，多种燃料灵活使用, 煤层气、天然气、沼气、伴生气、丙烷等多种燃料, 中型电站项目, 中小型工业备电, 大功率发电项目

- Main series: TCG 3016, VGF, 3系列, DT30/YDT30, DT30+/YDT30, K38N

## Representative Models

- 康明斯（Cummins） | K38N-G8 | K38N | 900 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 中型电站项目

- 瓦克夏（Waukesha） | VGF | VGF | 800 kW | 41.2% | 天然气 | 液冷 | 一体化机组AIS | 高压力条件下运行，多种燃料灵活使用

- 曼海姆（MWM） | TCG 3016 V16 | TCG 3016 | 800 kW | 43.5% | 天然气 | 液冷 | 一体化机组AIS | 中小型CHP系统

- 卡特彼勒（Caterpillar） | CG132B-16 | CG132B | 800 kW | 43.5% | 天然气 | 液冷 | 一体化机组AIS | 中小型工业备电 # GasGx Product Catalog | 500-1000 kW

GasGx public gas-engine catalog snapshot for `/products/power-range/500-1000kw/`.

Page scope: 500-1000 kW.

## Portfolio Summary

- Matched models: 14

- Power range: 500 kW to 900 gasgx product catalog 500 1000 kw https www com products power range 1000kw 曼海姆 曼海 海姆 mwm 威曼 vman 博杜安 博杜 杜安 baudouin 瓦克夏 瓦克 克夏 waukesha 颜巴赫 颜巴 巴赫 jenbacher 康明斯 康明 明斯 cummins 卡特彼勒 卡特 特彼 彼勒 caterpillar 潍柴动力 潍柴 柴动 动力 weichai 天然气 天然 然气 大型发电机组 大型 型发 发电 电机 机组 中小型 中小 小型 chp 系统 同缸径平台旗舰型号 同缸 缸径 径平 平台 台旗 旗舰 舰型 型号 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/products/power-range/500-1000kw/' limit 1),
        '- 潍柴动力（WEICHAI） | WPG1000*7NG | M33系列 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 博杜安（Baudouin） | 12M33 | 12M33 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 颜巴赫（Jenbacher） | J320 | 3系列 | 795 kW | 40.7% | 天然气 | 液冷 | 一体化机组AIS | 煤层气、天然气、沼气、伴生气、丙烷等多种燃料

- 斗山（Doosan） | DP222CA V12 | DP222CA | 727 kW | 40% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 曼海姆（MWM） | TCG 3016 V12 | TCG 3016 | 600 kW | 43.2% | 天然气 | 液冷 | 一体化机组AIS | 中小型CHP系统

- 上柴（SHANGCHAI） | SC27G | G系列 | 600 kW | 40% | 天然气 | 液冷 | 一体化机组AIS | 大功率发电项目

- 博杜安（Baudouin） | 12M26 | 12M26 | 600 kW | 39.5% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 威曼（VMAN） | DT30+/YDT30 | DT30+/YDT30 | 550 kW | 40.04% | 天然气 | 液冷 | 一体化机组AIS | 同缸径平台旗舰型号

- 西门子（Siemens） | SGE-24HM | SGE-24HM | 520 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 中小型发电机组

- 威曼（VMAN） | DT30/YDT30 | DT30/YDT30 | 500 kW | 38.08% | 天然气 | 液冷 | 一体化机组AIS | 同缸径平台旗舰型号',
        '- 潍柴动力（WEICHAI） | WPG1000*7NG | M33系列 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 博杜安（Baudouin） | 12M33 | 12M33 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 颜巴赫（Jenbacher） | J320 | 3系列 | 795 kW | 40.7% | 天然气 | 液',
        'en',
        array['gasgx', 'product', 'catalog', '500', '1000', 'kw', 'https', 'www', 'com', 'products', 'power', 'range', '1000kw', '曼海姆', '曼海', '海姆', 'mwm', '威曼', 'vman', '博杜安', '博杜', '杜安', 'baudouin', '瓦克夏', '瓦克', '克夏', 'waukesha', '颜巴赫', '颜巴', '巴赫', 'jenbacher', '康明斯', '康明', '明斯', 'cummins', '卡特彼勒', '卡特', '特彼', '彼勒', 'caterpillar', '潍柴动力', '潍柴', '柴动', '动力', 'weichai', '天然气', '天然', '然气', '大型发电机组', '大型', '型发', '发电', '电机', '机组', '中小型', '中小', '小型', 'chp', '系统', '同缸径平台旗舰型号', '同缸', '缸径', '径平', '平台', '台旗', '旗舰', '舰型', '型号', '高压力条件下运行', '高压', '压力', '力条', '条件', '件下', '下运', '运行', '多种燃料灵活使用', '多种', '种燃', '燃料']::text[],
        'Representative Models',
        1,
        213,
        '{"path": "/products/power-range/500-1000kw/", "snapshot_kind": "gas_engine_catalog", "matched_models": 14}'::jsonb,
        '- 潍柴动力（WEICHAI） | WPG1000*7NG | M33系列 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 博杜安（Baudouin） | 12M33 | 12M33 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 颜巴赫（Jenbacher） | J320 | 3系列 | 795 kW | 40.7% | 天然气 | 液冷 | 一体化机组AIS | 煤层气、天然气、沼气、伴生气、丙烷等多种燃料

- 斗山（Doosan） | DP222CA V12 | DP222CA | 727 kW | 40% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 曼海姆（MWM） | TCG 3016 V12 | TCG 3016 | 600 kW | 43.2% | 天然气 | 液冷 | 一体化机组AIS | 中小型CHP系统

- 上柴（SHANGCHAI） | SC27G | G系列 | 600 kW | 40% | 天然气 | 液冷 | 一体化机组AIS | 大功率发电项目

- 博杜安（Baudouin） | 12M26 | 12M26 | 600 kW | 39.5% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 威曼（VMAN） | DT30+/YDT30 | DT30+/YDT30 | 550 kW | 40.04% | 天然气 | 液冷 | 一体化机组AIS | 同缸径平台旗舰型号

- 西门子（Siemens） | SGE-24HM | SGE-24HM | 520 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 中小型发电机组

- 威曼（VMAN） | DT30/YDT30 | DT30/YDT30 | 500 kW | 38.08% | 天然气 | 液冷 | 一体化机组AIS | 同缸径平台旗舰型号 - 潍柴动力（WEICHAI） | WPG1000*7NG | M33系列 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 博杜安（Baudouin） | 12M33 | 12M33 | 800 kW | 41% | 天然气 | 液冷 | 一体化机组AIS | 大型发电机组

- 颜巴赫（Jenbacher） | J320 | 3系列 | 795 kW | 40.7% | 天然气 | 液 gasgx product catalog 500 1000 kw https www com products power range 1000kw 曼海姆 曼海 海姆 mwm 威曼 vman 博杜安 博杜 杜安 baudouin 瓦克夏 瓦克 克夏 waukesha 颜巴赫 颜巴 巴赫 jenbacher 康明斯 康明 明斯 cummins 卡特彼勒 卡特 特彼 彼勒 caterpillar 潍柴动力 潍柴 柴动 动力 weichai 天然气 天然 然气 大型发电机组 大型 型发 发电 电机 机组 中小型 中小 小型 chp 系统 同缸径平台旗舰型号 同缸 缸径 径平 平台 台旗 旗舰 舰型 型号 高压力条件下运行 高压 压力 力条 条件 件下 下运 运行 多种燃料灵活使用 多种 种燃 燃料'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/rankings/' limit 1),
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha',
        'en',
        array['gasgx', 'generator', 'rankings', 'https', 'www', 'com', 'comprehensive', 'evaluation', 'system', 'based', 'on', 'real', 'measured', 'data', 'and', 'market', 'models', 'xichai', '6dh1', 'vman', 'dt11', 'ydt11', 'dt30', 'ydt30', 'dt58', 'chg622v16', 'chg622v20', 'waukesha', '16v275gl', 'mwm', 'tcg', '3016', '6dk1', 'dt15', 'ydt15', '12v275gl', 'vgf', '6dld', 'cet13', 'v16', '2032b']::text[],
        'GasGx Generator Rankings',
        0,
        95,
        '{"path": "/rankings/", "snapshot_kind": "site_html"}'::jsonb,
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B # GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha gasgx generator rankings https www com comprehensive evaluation system based on real measured data and market models xichai 6dh1 vman dt11 ydt11 dt30 ydt30 dt58 chg622v16 chg622v20 waukesha 16v275gl mwm tcg 3016 6dk1 dt15 ydt15 12v275gl vgf 6dld cet13 v16 2032b'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/rankings/canada/' limit 1),
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha',
        'en',
        array['gasgx', 'generator', 'rankings', 'https', 'www', 'com', 'canada', 'comprehensive', 'evaluation', 'system', 'based', 'on', 'real', 'measured', 'data', 'and', 'market', 'models', 'xichai', '6dh1', 'vman', 'dt11', 'ydt11', 'dt30', 'ydt30', 'dt58', 'chg622v16', 'chg622v20', 'waukesha', '16v275gl', 'mwm', 'tcg', '3016', '6dk1', 'dt15', 'ydt15', '12v275gl', 'vgf', '6dld', 'cet13', 'v16', '2032b']::text[],
        'GasGx Generator Rankings',
        0,
        95,
        '{"path": "/rankings/canada/", "snapshot_kind": "site_html"}'::jsonb,
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B # GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha gasgx generator rankings https www com canada comprehensive evaluation system based on real measured data and market models xichai 6dh1 vman dt11 ydt11 dt30 ydt30 dt58 chg622v16 chg622v20 waukesha 16v275gl mwm tcg 3016 6dk1 dt15 ydt15 12v275gl vgf 6dld cet13 v16 2032b'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/rankings/control-system/' limit 1),
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha',
        'en',
        array['gasgx', 'generator', 'rankings', 'https', 'www', 'com', 'control', 'system', 'comprehensive', 'evaluation', 'based', 'on', 'real', 'measured', 'data', 'and', 'market', 'models', 'xichai', '6dh1', 'vman', 'dt11', 'ydt11', 'dt30', 'ydt30', 'dt58', 'chg622v16', 'chg622v20', 'waukesha', '16v275gl', 'mwm', 'tcg', '3016', '6dk1', 'dt15', 'ydt15', '12v275gl', 'vgf', '6dld', 'cet13', 'v16', '2032b']::text[],
        'GasGx Generator Rankings',
        0,
        95,
        '{"path": "/rankings/control-system/", "snapshot_kind": "site_html"}'::jsonb,
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B # GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha gasgx generator rankings https www com control system comprehensive evaluation based on real measured data and market models xichai 6dh1 vman dt11 ydt11 dt30 ydt30 dt58 chg622v16 chg622v20 waukesha 16v275gl mwm tcg 3016 6dk1 dt15 ydt15 12v275gl vgf 6dld cet13 v16 2032b'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/rankings/depreciation/' limit 1),
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha',
        'en',
        array['gasgx', 'generator', 'rankings', 'https', 'www', 'com', 'depreciation', 'comprehensive', 'evaluation', 'system', 'based', 'on', 'real', 'measured', 'data', 'and', 'market', 'models', 'xichai', '6dh1', 'vman', 'dt11', 'ydt11', 'dt30', 'ydt30', 'dt58', 'chg622v16', 'chg622v20', 'waukesha', '16v275gl', 'mwm', 'tcg', '3016', '6dk1', 'dt15', 'ydt15', '12v275gl', 'vgf', '6dld', 'cet13', 'v16', '2032b']::text[],
        'GasGx Generator Rankings',
        0,
        95,
        '{"path": "/rankings/depreciation/", "snapshot_kind": "site_html"}'::jsonb,
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B # GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha gasgx generator rankings https www com depreciation comprehensive evaluation system based on real measured data and market models xichai 6dh1 vman dt11 ydt11 dt30 ydt30 dt58 chg622v16 chg622v20 waukesha 16v275gl mwm tcg 3016 6dk1 dt15 ydt15 12v275gl vgf 6dld cet13 v16 2032b'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/rankings/efficiency/' limit 1),
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha',
        'en',
        array['gasgx', 'generator', 'rankings', 'https', 'www', 'com', 'efficiency', 'comprehensive', 'evaluation', 'system', 'based', 'on', 'real', 'measured', 'data', 'and', 'market', 'models', 'xichai', '6dh1', 'vman', 'dt11', 'ydt11', 'dt30', 'ydt30', 'dt58', 'chg622v16', 'chg622v20', 'waukesha', '16v275gl', 'mwm', 'tcg', '3016', '6dk1', 'dt15', 'ydt15', '12v275gl', 'vgf', '6dld', 'cet13', 'v16', '2032b']::text[],
        'GasGx Generator Rankings',
        0,
        95,
        '{"path": "/rankings/efficiency/", "snapshot_kind": "site_html"}'::jsonb,
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B # GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha gasgx generator rankings https www com efficiency comprehensive evaluation system based on real measured data and market models xichai 6dh1 vman dt11 ydt11 dt30 ydt30 dt58 chg622v16 chg622v20 waukesha 16v275gl mwm tcg 3016 6dk1 dt15 ydt15 12v275gl vgf 6dld cet13 v16 2032b'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/rankings/emissions/' limit 1),
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha',
        'en',
        array['gasgx', 'generator', 'rankings', 'https', 'www', 'com', 'emissions', 'comprehensive', 'evaluation', 'system', 'based', 'on', 'real', 'measured', 'data', 'and', 'market', 'models', 'xichai', '6dh1', 'vman', 'dt11', 'ydt11', 'dt30', 'ydt30', 'dt58', 'chg622v16', 'chg622v20', 'waukesha', '16v275gl', 'mwm', 'tcg', '3016', '6dk1', 'dt15', 'ydt15', '12v275gl', 'vgf', '6dld', 'cet13', 'v16', '2032b']::text[],
        'GasGx Generator Rankings',
        0,
        95,
        '{"path": "/rankings/emissions/", "snapshot_kind": "site_html"}'::jsonb,
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B # GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha gasgx generator rankings https www com emissions comprehensive evaluation system based on real measured data and market models xichai 6dh1 vman dt11 ydt11 dt30 ydt30 dt58 chg622v16 chg622v20 waukesha 16v275gl mwm tcg 3016 6dk1 dt15 ydt15 12v275gl vgf 6dld cet13 v16 2032b'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/rankings/engine-efficiency/' limit 1),
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha',
        'en',
        array['gasgx', 'generator', 'rankings', 'https', 'www', 'com', 'engine', 'efficiency', 'comprehensive', 'evaluation', 'system', 'based', 'on', 'real', 'measured', 'data', 'and', 'market', 'models', 'xichai', '6dh1', 'vman', 'dt11', 'ydt11', 'dt30', 'ydt30', 'dt58', 'chg622v16', 'chg622v20', 'waukesha', '16v275gl', 'mwm', 'tcg', '3016', '6dk1', 'dt15', 'ydt15', '12v275gl', 'vgf', '6dld', 'cet13', 'v16', '2032b']::text[],
        'GasGx Generator Rankings',
        0,
        95,
        '{"path": "/rankings/engine-efficiency/", "snapshot_kind": "site_html"}'::jsonb,
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B # GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha gasgx generator rankings https www com engine efficiency comprehensive evaluation system based on real measured data and market models xichai 6dh1 vman dt11 ydt11 dt30 ydt30 dt58 chg622v16 chg622v20 waukesha 16v275gl mwm tcg 3016 6dk1 dt15 ydt15 12v275gl vgf 6dld cet13 v16 2032b'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/rankings/engine-roi/' limit 1),
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha',
        'en',
        array['gasgx', 'generator', 'rankings', 'https', 'www', 'com', 'engine', 'roi', 'comprehensive', 'evaluation', 'system', 'based', 'on', 'real', 'measured', 'data', 'and', 'market', 'models', 'xichai', '6dh1', 'vman', 'dt11', 'ydt11', 'dt30', 'ydt30', 'dt58', 'chg622v16', 'chg622v20', 'waukesha', '16v275gl', 'mwm', 'tcg', '3016', '6dk1', 'dt15', 'ydt15', '12v275gl', 'vgf', '6dld', 'cet13', 'v16', '2032b']::text[],
        'GasGx Generator Rankings',
        0,
        95,
        '{"path": "/rankings/engine-roi/", "snapshot_kind": "site_html"}'::jsonb,
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B # GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha gasgx generator rankings https www com engine roi comprehensive evaluation system based on real measured data and market models xichai 6dh1 vman dt11 ydt11 dt30 ydt30 dt58 chg622v16 chg622v20 waukesha 16v275gl mwm tcg 3016 6dk1 dt15 ydt15 12v275gl vgf 6dld cet13 v16 2032b'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/rankings/gas-consumption/' limit 1),
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha',
        'en',
        array['gasgx', 'generator', 'rankings', 'https', 'www', 'com', 'gas', 'consumption', 'comprehensive', 'evaluation', 'system', 'based', 'on', 'real', 'measured', 'data', 'and', 'market', 'models', 'xichai', '6dh1', 'vman', 'dt11', 'ydt11', 'dt30', 'ydt30', 'dt58', 'chg622v16', 'chg622v20', 'waukesha', '16v275gl', 'mwm', 'tcg', '3016', '6dk1', 'dt15', 'ydt15', '12v275gl', 'vgf', '6dld', 'cet13', 'v16', '2032b']::text[],
        'GasGx Generator Rankings',
        0,
        95,
        '{"path": "/rankings/gas-consumption/", "snapshot_kind": "site_html"}'::jsonb,
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B # GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha gasgx generator rankings https www com gas consumption comprehensive evaluation system based on real measured data and market models xichai 6dh1 vman dt11 ydt11 dt30 ydt30 dt58 chg622v16 chg622v20 waukesha 16v275gl mwm tcg 3016 6dk1 dt15 ydt15 12v275gl vgf 6dld cet13 v16 2032b'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/rankings/generator/' limit 1),
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha',
        'en',
        array['gasgx', 'generator', 'rankings', 'https', 'www', 'com', 'comprehensive', 'evaluation', 'system', 'based', 'on', 'real', 'measured', 'data', 'and', 'market', 'models', 'xichai', '6dh1', 'vman', 'dt11', 'ydt11', 'dt30', 'ydt30', 'dt58', 'chg622v16', 'chg622v20', 'waukesha', '16v275gl', 'mwm', 'tcg', '3016', '6dk1', 'dt15', 'ydt15', '12v275gl', 'vgf', '6dld', 'cet13', 'v16', '2032b']::text[],
        'GasGx Generator Rankings',
        0,
        95,
        '{"path": "/rankings/generator/", "snapshot_kind": "site_html"}'::jsonb,
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B # GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha gasgx generator rankings https www com comprehensive evaluation system based on real measured data and market models xichai 6dh1 vman dt11 ydt11 dt30 ydt30 dt58 chg622v16 chg622v20 waukesha 16v275gl mwm tcg 3016 6dk1 dt15 ydt15 12v275gl vgf 6dld cet13 v16 2032b'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/rankings/lcoe/' limit 1),
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha',
        'en',
        array['gasgx', 'generator', 'rankings', 'https', 'www', 'com', 'lcoe', 'comprehensive', 'evaluation', 'system', 'based', 'on', 'real', 'measured', 'data', 'and', 'market', 'models', 'xichai', '6dh1', 'vman', 'dt11', 'ydt11', 'dt30', 'ydt30', 'dt58', 'chg622v16', 'chg622v20', 'waukesha', '16v275gl', 'mwm', 'tcg', '3016', '6dk1', 'dt15', 'ydt15', '12v275gl', 'vgf', '6dld', 'cet13', 'v16', '2032b']::text[],
        'GasGx Generator Rankings',
        0,
        95,
        '{"path": "/rankings/lcoe/", "snapshot_kind": "site_html"}'::jsonb,
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B # GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha gasgx generator rankings https www com lcoe comprehensive evaluation system based on real measured data and market models xichai 6dh1 vman dt11 ydt11 dt30 ydt30 dt58 chg622v16 chg622v20 waukesha 16v275gl mwm tcg 3016 6dk1 dt15 ydt15 12v275gl vgf 6dld cet13 v16 2032b'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/rankings/maintenance-interval/' limit 1),
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha',
        'en',
        array['gasgx', 'generator', 'rankings', 'https', 'www', 'com', 'maintenance', 'interval', 'comprehensive', 'evaluation', 'system', 'based', 'on', 'real', 'measured', 'data', 'and', 'market', 'models', 'xichai', '6dh1', 'vman', 'dt11', 'ydt11', 'dt30', 'ydt30', 'dt58', 'chg622v16', 'chg622v20', 'waukesha', '16v275gl', 'mwm', 'tcg', '3016', '6dk1', 'dt15', 'ydt15', '12v275gl', 'vgf', '6dld', 'cet13', 'v16', '2032b']::text[],
        'GasGx Generator Rankings',
        0,
        95,
        '{"path": "/rankings/maintenance-interval/", "snapshot_kind": "site_html"}'::jsonb,
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B # GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha gasgx generator rankings https www com maintenance interval comprehensive evaluation system based on real measured data and market models xichai 6dh1 vman dt11 ydt11 dt30 ydt30 dt58 chg622v16 chg622v20 waukesha 16v275gl mwm tcg 3016 6dk1 dt15 ydt15 12v275gl vgf 6dld cet13 v16 2032b'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/rankings/middle-east/' limit 1),
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha',
        'en',
        array['gasgx', 'generator', 'rankings', 'https', 'www', 'com', 'middle', 'east', 'comprehensive', 'evaluation', 'system', 'based', 'on', 'real', 'measured', 'data', 'and', 'market', 'models', 'xichai', '6dh1', 'vman', 'dt11', 'ydt11', 'dt30', 'ydt30', 'dt58', 'chg622v16', 'chg622v20', 'waukesha', '16v275gl', 'mwm', 'tcg', '3016', '6dk1', 'dt15', 'ydt15', '12v275gl', 'vgf', '6dld', 'cet13', 'v16', '2032b']::text[],
        'GasGx Generator Rankings',
        0,
        95,
        '{"path": "/rankings/middle-east/", "snapshot_kind": "site_html"}'::jsonb,
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B # GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha gasgx generator rankings https www com middle east comprehensive evaluation system based on real measured data and market models xichai 6dh1 vman dt11 ydt11 dt30 ydt30 dt58 chg622v16 chg622v20 waukesha 16v275gl mwm tcg 3016 6dk1 dt15 ydt15 12v275gl vgf 6dld cet13 v16 2032b'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/rankings/mtbf/' limit 1),
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha',
        'en',
        array['gasgx', 'generator', 'rankings', 'https', 'www', 'com', 'mtbf', 'comprehensive', 'evaluation', 'system', 'based', 'on', 'real', 'measured', 'data', 'and', 'market', 'models', 'xichai', '6dh1', 'vman', 'dt11', 'ydt11', 'dt30', 'ydt30', 'dt58', 'chg622v16', 'chg622v20', 'waukesha', '16v275gl', 'mwm', 'tcg', '3016', '6dk1', 'dt15', 'ydt15', '12v275gl', 'vgf', '6dld', 'cet13', 'v16', '2032b']::text[],
        'GasGx Generator Rankings',
        0,
        95,
        '{"path": "/rankings/mtbf/", "snapshot_kind": "site_html"}'::jsonb,
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B # GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha gasgx generator rankings https www com mtbf comprehensive evaluation system based on real measured data and market models xichai 6dh1 vman dt11 ydt11 dt30 ydt30 dt58 chg622v16 chg622v20 waukesha 16v275gl mwm tcg 3016 6dk1 dt15 ydt15 12v275gl vgf 6dld cet13 v16 2032b'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/rankings/noise/' limit 1),
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha',
        'en',
        array['gasgx', 'generator', 'rankings', 'https', 'www', 'com', 'noise', 'comprehensive', 'evaluation', 'system', 'based', 'on', 'real', 'measured', 'data', 'and', 'market', 'models', 'xichai', '6dh1', 'vman', 'dt11', 'ydt11', 'dt30', 'ydt30', 'dt58', 'chg622v16', 'chg622v20', 'waukesha', '16v275gl', 'mwm', 'tcg', '3016', '6dk1', 'dt15', 'ydt15', '12v275gl', 'vgf', '6dld', 'cet13', 'v16', '2032b']::text[],
        'GasGx Generator Rankings',
        0,
        95,
        '{"path": "/rankings/noise/", "snapshot_kind": "site_html"}'::jsonb,
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B # GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha gasgx generator rankings https www com noise comprehensive evaluation system based on real measured data and market models xichai 6dh1 vman dt11 ydt11 dt30 ydt30 dt58 chg622v16 chg622v20 waukesha 16v275gl mwm tcg 3016 6dk1 dt15 ydt15 12v275gl vgf 6dld cet13 v16 2032b'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/rankings/performance/' limit 1),
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha',
        'en',
        array['gasgx', 'generator', 'rankings', 'https', 'www', 'com', 'performance', 'comprehensive', 'evaluation', 'system', 'based', 'on', 'real', 'measured', 'data', 'and', 'market', 'models', 'xichai', '6dh1', 'vman', 'dt11', 'ydt11', 'dt30', 'ydt30', 'dt58', 'chg622v16', 'chg622v20', 'waukesha', '16v275gl', 'mwm', 'tcg', '3016', '6dk1', 'dt15', 'ydt15', '12v275gl', 'vgf', '6dld', 'cet13', 'v16', '2032b']::text[],
        'GasGx Generator Rankings',
        0,
        95,
        '{"path": "/rankings/performance/", "snapshot_kind": "site_html"}'::jsonb,
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B # GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha gasgx generator rankings https www com performance comprehensive evaluation system based on real measured data and market models xichai 6dh1 vman dt11 ydt11 dt30 ydt30 dt58 chg622v16 chg622v20 waukesha 16v275gl mwm tcg 3016 6dk1 dt15 ydt15 12v275gl vgf 6dld cet13 v16 2032b'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/rankings/reliability/' limit 1),
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha',
        'en',
        array['gasgx', 'generator', 'rankings', 'https', 'www', 'com', 'reliability', 'comprehensive', 'evaluation', 'system', 'based', 'on', 'real', 'measured', 'data', 'and', 'market', 'models', 'xichai', '6dh1', 'vman', 'dt11', 'ydt11', 'dt30', 'ydt30', 'dt58', 'chg622v16', 'chg622v20', 'waukesha', '16v275gl', 'mwm', 'tcg', '3016', '6dk1', 'dt15', 'ydt15', '12v275gl', 'vgf', '6dld', 'cet13', 'v16', '2032b']::text[],
        'GasGx Generator Rankings',
        0,
        95,
        '{"path": "/rankings/reliability/", "snapshot_kind": "site_html"}'::jsonb,
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B # GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha gasgx generator rankings https www com reliability comprehensive evaluation system based on real measured data and market models xichai 6dh1 vman dt11 ydt11 dt30 ydt30 dt58 chg622v16 chg622v20 waukesha 16v275gl mwm tcg 3016 6dk1 dt15 ydt15 12v275gl vgf 6dld cet13 v16 2032b'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/rankings/roi/' limit 1),
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha',
        'en',
        array['gasgx', 'generator', 'rankings', 'https', 'www', 'com', 'roi', 'comprehensive', 'evaluation', 'system', 'based', 'on', 'real', 'measured', 'data', 'and', 'market', 'models', 'xichai', '6dh1', 'vman', 'dt11', 'ydt11', 'dt30', 'ydt30', 'dt58', 'chg622v16', 'chg622v20', 'waukesha', '16v275gl', 'mwm', 'tcg', '3016', '6dk1', 'dt15', 'ydt15', '12v275gl', 'vgf', '6dld', 'cet13', 'v16', '2032b']::text[],
        'GasGx Generator Rankings',
        0,
        95,
        '{"path": "/rankings/roi/", "snapshot_kind": "site_html"}'::jsonb,
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B # GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha gasgx generator rankings https www com roi comprehensive evaluation system based on real measured data and market models xichai 6dh1 vman dt11 ydt11 dt30 ydt30 dt58 chg622v16 chg622v20 waukesha 16v275gl mwm tcg 3016 6dk1 dt15 ydt15 12v275gl vgf 6dld cet13 v16 2032b'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/rankings/russia/' limit 1),
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha',
        'en',
        array['gasgx', 'generator', 'rankings', 'https', 'www', 'com', 'russia', 'comprehensive', 'evaluation', 'system', 'based', 'on', 'real', 'measured', 'data', 'and', 'market', 'models', 'xichai', '6dh1', 'vman', 'dt11', 'ydt11', 'dt30', 'ydt30', 'dt58', 'chg622v16', 'chg622v20', 'waukesha', '16v275gl', 'mwm', 'tcg', '3016', '6dk1', 'dt15', 'ydt15', '12v275gl', 'vgf', '6dld', 'cet13', 'v16', '2032b']::text[],
        'GasGx Generator Rankings',
        0,
        95,
        '{"path": "/rankings/russia/", "snapshot_kind": "site_html"}'::jsonb,
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B # GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha gasgx generator rankings https www com russia comprehensive evaluation system based on real measured data and market models xichai 6dh1 vman dt11 ydt11 dt30 ydt30 dt58 chg622v16 chg622v20 waukesha 16v275gl mwm tcg 3016 6dk1 dt15 ydt15 12v275gl vgf 6dld cet13 v16 2032b'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/rankings/spare-parts/' limit 1),
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha',
        'en',
        array['gasgx', 'generator', 'rankings', 'https', 'www', 'com', 'spare', 'parts', 'comprehensive', 'evaluation', 'system', 'based', 'on', 'real', 'measured', 'data', 'and', 'market', 'models', 'xichai', '6dh1', 'vman', 'dt11', 'ydt11', 'dt30', 'ydt30', 'dt58', 'chg622v16', 'chg622v20', 'waukesha', '16v275gl', 'mwm', 'tcg', '3016', '6dk1', 'dt15', 'ydt15', '12v275gl', 'vgf', '6dld', 'cet13', 'v16', '2032b']::text[],
        'GasGx Generator Rankings',
        0,
        95,
        '{"path": "/rankings/spare-parts/", "snapshot_kind": "site_html"}'::jsonb,
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B # GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha gasgx generator rankings https www com spare parts comprehensive evaluation system based on real measured data and market models xichai 6dh1 vman dt11 ydt11 dt30 ydt30 dt58 chg622v16 chg622v20 waukesha 16v275gl mwm tcg 3016 6dk1 dt15 ydt15 12v275gl vgf 6dld cet13 v16 2032b'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/rankings/thermal-efficiency/' limit 1),
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha',
        'en',
        array['gasgx', 'generator', 'rankings', 'https', 'www', 'com', 'thermal', 'efficiency', 'comprehensive', 'evaluation', 'system', 'based', 'on', 'real', 'measured', 'data', 'and', 'market', 'models', 'xichai', '6dh1', 'vman', 'dt11', 'ydt11', 'dt30', 'ydt30', 'dt58', 'chg622v16', 'chg622v20', 'waukesha', '16v275gl', 'mwm', 'tcg', '3016', '6dk1', 'dt15', 'ydt15', '12v275gl', 'vgf', '6dld', 'cet13', 'v16', '2032b']::text[],
        'GasGx Generator Rankings',
        0,
        95,
        '{"path": "/rankings/thermal-efficiency/", "snapshot_kind": "site_html"}'::jsonb,
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B # GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha gasgx generator rankings https www com thermal efficiency comprehensive evaluation system based on real measured data and market models xichai 6dh1 vman dt11 ydt11 dt30 ydt30 dt58 chg622v16 chg622v20 waukesha 16v275gl mwm tcg 3016 6dk1 dt15 ydt15 12v275gl vgf 6dld cet13 v16 2032b'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/rankings/usa/' limit 1),
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B',
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha',
        'en',
        array['gasgx', 'generator', 'rankings', 'https', 'www', 'com', 'usa', 'comprehensive', 'evaluation', 'system', 'based', 'on', 'real', 'measured', 'data', 'and', 'market', 'models', 'xichai', '6dh1', 'vman', 'dt11', 'ydt11', 'dt30', 'ydt30', 'dt58', 'chg622v16', 'chg622v20', 'waukesha', '16v275gl', 'mwm', 'tcg', '3016', '6dk1', 'dt15', 'ydt15', '12v275gl', 'vgf', '6dld', 'cet13', 'v16', '2032b']::text[],
        'GasGx Generator Rankings',
        0,
        95,
        '{"path": "/rankings/usa/", "snapshot_kind": "site_html"}'::jsonb,
        '# GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha 16V275GL+

- MWM TCG 3016

- XICHAI 6DK1

- VMAN DT15/YDT15

- Waukesha 12V275GL+

- Waukesha VGF

- XICHAI 6DLD

- VMAN CET13

- MWM TCG 3016 V16

- MWM TCG 2032B # GasGx Generator Rankings

Comprehensive evaluation system based on real measured data and market models.

- XICHAI 6DH1

- VMAN DT11/YDT11

- VMAN DT30/YDT30

- VMAN DT58

- VMAN CHG622V16

- VMAN CHG622V20

- Waukesha gasgx generator rankings https www com usa comprehensive evaluation system based on real measured data and market models xichai 6dh1 vman dt11 ydt11 dt30 ydt30 dt58 chg622v16 chg622v20 waukesha 16v275gl mwm tcg 3016 6dk1 dt15 ydt15 12v275gl vgf 6dld cet13 v16 2032b'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/resources/case-studies/' limit 1),
        '# Global Case Studies

探索全球最具代表性的天然气发电与算力结合项目，涵盖从石油巨头到创新型初创企业的多种合作模式。

### Crusoe & ExxonMobil

北达科他州 Bakken 盆地的 DFM 标杆。每月消耗 1800万立方英尺天然气，燃烧效率 99.9%，正向 AI 云计算转型。

### YPF Luz & GDA

Vaca Muerta 盆地的国企合作案例。7MW 装机，1200 台矿机，预计减少 63% 二氧化碳当量排放。

### LINKMINE 艾伯塔项目

利用艾伯塔省废弃气井（OWA）和离网豁免政策。实现 $0.043/kWh 低成本电力，并预留氢能接口。

### 北美 (North America)

- 德克萨斯 (Texas): ERCOT 市场灵活负载，ExxonMobil 等巨头布局。

- 纽约州 (New York): Greenidge 电厂自用模式，面临环保法规挑战。

- 艾伯塔 (Alberta): 受益于离网自用 (<10MW) 豁免政策，废弃气井利用活跃。

### 南美 (South America)

- 阿根廷 (Argentina): Vaca Muerta 盆地，YPF 将无法出口的天然气“数字货币化”。

### 欧亚与中东 (Eurasia & ME)

- 俄罗斯 (Russia): 西伯利亚伴生气离网挖矿，解决电力短缺。

- 中东 (Middle East): ADNOC 投资布局，LNG 与伴生气挖矿潜力巨大。

### 数字火炬缓解 (DFM)

部署在井口，直接利用伴生气发电。替代燃烧火炬，获取碳信用收益。

### 搁浅气货币化

针对因缺乏管道而关停的气井（Shut-in Wells），就地变现为数字资产。

### 离网自用模式

无需并网，完全独立的电力孤岛。规避复杂的电网审批，快速部署。',
        '# Global Case Studies

探索全球最具代表性的天然气发电与算力结合项目，涵盖从石油巨头到创新型初创企业的多种合作模式。

### Crusoe & ExxonMobil

北达科他州 Bakken 盆地的 DFM 标杆。每月消耗 1800万立方英尺天然气，燃烧效率 99.9%，正向 AI 云计算转型。

### YPF Luz & GDA

Vaca Muerta 盆地的国企合作案例。7MW 装机，1200 台矿机，',
        'zh',
        array['global', 'case', 'studies', 'gasgx', '案例库', '案例', '例库', 'https', 'www', 'com', 'resources', '探索全球最具代表性的天然气发电与算力结合项目', '涵盖从石油巨头到创新型初创企业的多种合作模式', 'crusoe', 'exxonmobil', '北达科他州', '北达', '达科', '科他', '他州', 'bakken', '盆地的', '盆地', '地的', 'dfm', '标杆', '每月消耗', '每月', '月消', '消耗', '1800', '万立方英尺天然气', '万立', '立方', '方英', '英尺', '尺天', '天然', '然气', '燃烧效率', '燃烧', '烧效', '效率', '99', '正向', 'ai', '云计算转型', '云计', '计算', '算转', '转型', 'ypf', 'luz', 'gda', 'vaca', 'muerta', '盆地的国企合作案例', '的国', '国企', '企合', '合作', '作案', '7mw', '装机', '1200', '台矿机', '台矿', '矿机', '预计减少', '预计', '计减', '减少', '63', '二氧化碳当量排放', '二氧', '氧化', '化碳', '碳当', '当量', '量排']::text[],
        '离网自用模式',
        0,
        202,
        '{"path": "/resources/case-studies/", "snapshot_kind": "site_html"}'::jsonb,
        '# Global Case Studies

探索全球最具代表性的天然气发电与算力结合项目，涵盖从石油巨头到创新型初创企业的多种合作模式。

### Crusoe & ExxonMobil

北达科他州 Bakken 盆地的 DFM 标杆。每月消耗 1800万立方英尺天然气，燃烧效率 99.9%，正向 AI 云计算转型。

### YPF Luz & GDA

Vaca Muerta 盆地的国企合作案例。7MW 装机，1200 台矿机，预计减少 63% 二氧化碳当量排放。

### LINKMINE 艾伯塔项目

利用艾伯塔省废弃气井（OWA）和离网豁免政策。实现 $0.043/kWh 低成本电力，并预留氢能接口。

### 北美 (North America)

- 德克萨斯 (Texas): ERCOT 市场灵活负载，ExxonMobil 等巨头布局。

- 纽约州 (New York): Greenidge 电厂自用模式，面临环保法规挑战。

- 艾伯塔 (Alberta): 受益于离网自用 (<10MW) 豁免政策，废弃气井利用活跃。

### 南美 (South America)

- 阿根廷 (Argentina): Vaca Muerta 盆地，YPF 将无法出口的天然气“数字货币化”。

### 欧亚与中东 (Eurasia & ME)

- 俄罗斯 (Russia): 西伯利亚伴生气离网挖矿，解决电力短缺。

- 中东 (Middle East): ADNOC 投资布局，LNG 与伴生气挖矿潜力巨大。

### 数字火炬缓解 (DFM)

部署在井口，直接利用伴生气发电。替代燃烧火炬，获取碳信用收益。

### 搁浅气货币化

针对因缺乏管道而关停的气井（Shut-in Wells），就地变现为数字资产。

### 离网自用模式

无需并网，完全独立的电力孤岛。规避复杂的电网审批，快速部署。 # Global Case Studies

探索全球最具代表性的天然气发电与算力结合项目，涵盖从石油巨头到创新型初创企业的多种合作模式。

### Crusoe & ExxonMobil

北达科他州 Bakken 盆地的 DFM 标杆。每月消耗 1800万立方英尺天然气，燃烧效率 99.9%，正向 AI 云计算转型。

### YPF Luz & GDA

Vaca Muerta 盆地的国企合作案例。7MW 装机，1200 台矿机， global case studies gasgx 案例库 案例 例库 https www com resources 探索全球最具代表性的天然气发电与算力结合项目 涵盖从石油巨头到创新型初创企业的多种合作模式 crusoe exxonmobil 北达科他州 北达 达科 科他 他州 bakken 盆地的 盆地 地的 dfm 标杆 每月消耗 每月 月消 消耗 1800 万立方英尺天然气 万立 立方 方英 英尺 尺天 天然 然气 燃烧效率 燃烧 烧效 效率 99 正向 ai 云计算转型 云计 计算 算转 转型 ypf luz gda vaca muerta 盆地的国企合作案例 的国 国企 企合 合作 作案 7mw 装机 1200 台矿机 台矿 矿机 预计减少 预计 计减 减少 63 二氧化碳当量排放 二氧 氧化 化碳 碳当 当量 量排'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/resources/case-studies/regions/' limit 1),
        '# Global Case Studies

探索全球最具代表性的天然气发电与算力结合项目，涵盖从石油巨头到创新型初创企业的多种合作模式。

### Crusoe & ExxonMobil

北达科他州 Bakken 盆地的 DFM 标杆。每月消耗 1800万立方英尺天然气，燃烧效率 99.9%，正向 AI 云计算转型。

### YPF Luz & GDA

Vaca Muerta 盆地的国企合作案例。7MW 装机，1200 台矿机，预计减少 63% 二氧化碳当量排放。

### LINKMINE 艾伯塔项目

利用艾伯塔省废弃气井（OWA）和离网豁免政策。实现 $0.043/kWh 低成本电力，并预留氢能接口。

### 北美 (North America)

- 德克萨斯 (Texas): ERCOT 市场灵活负载，ExxonMobil 等巨头布局。

- 纽约州 (New York): Greenidge 电厂自用模式，面临环保法规挑战。

- 艾伯塔 (Alberta): 受益于离网自用 (<10MW) 豁免政策，废弃气井利用活跃。

### 南美 (South America)

- 阿根廷 (Argentina): Vaca Muerta 盆地，YPF 将无法出口的天然气“数字货币化”。

### 欧亚与中东 (Eurasia & ME)

- 俄罗斯 (Russia): 西伯利亚伴生气离网挖矿，解决电力短缺。

- 中东 (Middle East): ADNOC 投资布局，LNG 与伴生气挖矿潜力巨大。

### 数字火炬缓解 (DFM)

部署在井口，直接利用伴生气发电。替代燃烧火炬，获取碳信用收益。

### 搁浅气货币化

针对因缺乏管道而关停的气井（Shut-in Wells），就地变现为数字资产。

### 离网自用模式

无需并网，完全独立的电力孤岛。规避复杂的电网审批，快速部署。',
        '# Global Case Studies

探索全球最具代表性的天然气发电与算力结合项目，涵盖从石油巨头到创新型初创企业的多种合作模式。

### Crusoe & ExxonMobil

北达科他州 Bakken 盆地的 DFM 标杆。每月消耗 1800万立方英尺天然气，燃烧效率 99.9%，正向 AI 云计算转型。

### YPF Luz & GDA

Vaca Muerta 盆地的国企合作案例。7MW 装机，1200 台矿机，',
        'zh',
        array['global', 'case', 'studies', 'gasgx', '案例库', '案例', '例库', 'https', 'www', 'com', 'resources', 'regions', '探索全球最具代表性的天然气发电与算力结合项目', '涵盖从石油巨头到创新型初创企业的多种合作模式', 'crusoe', 'exxonmobil', '北达科他州', '北达', '达科', '科他', '他州', 'bakken', '盆地的', '盆地', '地的', 'dfm', '标杆', '每月消耗', '每月', '月消', '消耗', '1800', '万立方英尺天然气', '万立', '立方', '方英', '英尺', '尺天', '天然', '然气', '燃烧效率', '燃烧', '烧效', '效率', '99', '正向', 'ai', '云计算转型', '云计', '计算', '算转', '转型', 'ypf', 'luz', 'gda', 'vaca', 'muerta', '盆地的国企合作案例', '的国', '国企', '企合', '合作', '作案', '7mw', '装机', '1200', '台矿机', '台矿', '矿机', '预计减少', '预计', '计减', '减少', '63', '二氧化碳当量排放', '二氧', '氧化', '化碳', '碳当', '当量']::text[],
        '离网自用模式',
        0,
        202,
        '{"path": "/resources/case-studies/regions/", "snapshot_kind": "site_html"}'::jsonb,
        '# Global Case Studies

探索全球最具代表性的天然气发电与算力结合项目，涵盖从石油巨头到创新型初创企业的多种合作模式。

### Crusoe & ExxonMobil

北达科他州 Bakken 盆地的 DFM 标杆。每月消耗 1800万立方英尺天然气，燃烧效率 99.9%，正向 AI 云计算转型。

### YPF Luz & GDA

Vaca Muerta 盆地的国企合作案例。7MW 装机，1200 台矿机，预计减少 63% 二氧化碳当量排放。

### LINKMINE 艾伯塔项目

利用艾伯塔省废弃气井（OWA）和离网豁免政策。实现 $0.043/kWh 低成本电力，并预留氢能接口。

### 北美 (North America)

- 德克萨斯 (Texas): ERCOT 市场灵活负载，ExxonMobil 等巨头布局。

- 纽约州 (New York): Greenidge 电厂自用模式，面临环保法规挑战。

- 艾伯塔 (Alberta): 受益于离网自用 (<10MW) 豁免政策，废弃气井利用活跃。

### 南美 (South America)

- 阿根廷 (Argentina): Vaca Muerta 盆地，YPF 将无法出口的天然气“数字货币化”。

### 欧亚与中东 (Eurasia & ME)

- 俄罗斯 (Russia): 西伯利亚伴生气离网挖矿，解决电力短缺。

- 中东 (Middle East): ADNOC 投资布局，LNG 与伴生气挖矿潜力巨大。

### 数字火炬缓解 (DFM)

部署在井口，直接利用伴生气发电。替代燃烧火炬，获取碳信用收益。

### 搁浅气货币化

针对因缺乏管道而关停的气井（Shut-in Wells），就地变现为数字资产。

### 离网自用模式

无需并网，完全独立的电力孤岛。规避复杂的电网审批，快速部署。 # Global Case Studies

探索全球最具代表性的天然气发电与算力结合项目，涵盖从石油巨头到创新型初创企业的多种合作模式。

### Crusoe & ExxonMobil

北达科他州 Bakken 盆地的 DFM 标杆。每月消耗 1800万立方英尺天然气，燃烧效率 99.9%，正向 AI 云计算转型。

### YPF Luz & GDA

Vaca Muerta 盆地的国企合作案例。7MW 装机，1200 台矿机， global case studies gasgx 案例库 案例 例库 https www com resources regions 探索全球最具代表性的天然气发电与算力结合项目 涵盖从石油巨头到创新型初创企业的多种合作模式 crusoe exxonmobil 北达科他州 北达 达科 科他 他州 bakken 盆地的 盆地 地的 dfm 标杆 每月消耗 每月 月消 消耗 1800 万立方英尺天然气 万立 立方 方英 英尺 尺天 天然 然气 燃烧效率 燃烧 烧效 效率 99 正向 ai 云计算转型 云计 计算 算转 转型 ypf luz gda vaca muerta 盆地的国企合作案例 的国 国企 企合 合作 作案 7mw 装机 1200 台矿机 台矿 矿机 预计减少 预计 计减 减少 63 二氧化碳当量排放 二氧 氧化 化碳 碳当 当量'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/resources/case-studies/scenarios/' limit 1),
        '# Global Case Studies

探索全球最具代表性的天然气发电与算力结合项目，涵盖从石油巨头到创新型初创企业的多种合作模式。

### Crusoe & ExxonMobil

北达科他州 Bakken 盆地的 DFM 标杆。每月消耗 1800万立方英尺天然气，燃烧效率 99.9%，正向 AI 云计算转型。

### YPF Luz & GDA

Vaca Muerta 盆地的国企合作案例。7MW 装机，1200 台矿机，预计减少 63% 二氧化碳当量排放。

### LINKMINE 艾伯塔项目

利用艾伯塔省废弃气井（OWA）和离网豁免政策。实现 $0.043/kWh 低成本电力，并预留氢能接口。

### 北美 (North America)

- 德克萨斯 (Texas): ERCOT 市场灵活负载，ExxonMobil 等巨头布局。

- 纽约州 (New York): Greenidge 电厂自用模式，面临环保法规挑战。

- 艾伯塔 (Alberta): 受益于离网自用 (<10MW) 豁免政策，废弃气井利用活跃。

### 南美 (South America)

- 阿根廷 (Argentina): Vaca Muerta 盆地，YPF 将无法出口的天然气“数字货币化”。

### 欧亚与中东 (Eurasia & ME)

- 俄罗斯 (Russia): 西伯利亚伴生气离网挖矿，解决电力短缺。

- 中东 (Middle East): ADNOC 投资布局，LNG 与伴生气挖矿潜力巨大。

### 数字火炬缓解 (DFM)

部署在井口，直接利用伴生气发电。替代燃烧火炬，获取碳信用收益。

### 搁浅气货币化

针对因缺乏管道而关停的气井（Shut-in Wells），就地变现为数字资产。

### 离网自用模式

无需并网，完全独立的电力孤岛。规避复杂的电网审批，快速部署。',
        '# Global Case Studies

探索全球最具代表性的天然气发电与算力结合项目，涵盖从石油巨头到创新型初创企业的多种合作模式。

### Crusoe & ExxonMobil

北达科他州 Bakken 盆地的 DFM 标杆。每月消耗 1800万立方英尺天然气，燃烧效率 99.9%，正向 AI 云计算转型。

### YPF Luz & GDA

Vaca Muerta 盆地的国企合作案例。7MW 装机，1200 台矿机，',
        'zh',
        array['global', 'case', 'studies', 'gasgx', '案例库', '案例', '例库', 'https', 'www', 'com', 'resources', 'scenarios', '探索全球最具代表性的天然气发电与算力结合项目', '涵盖从石油巨头到创新型初创企业的多种合作模式', 'crusoe', 'exxonmobil', '北达科他州', '北达', '达科', '科他', '他州', 'bakken', '盆地的', '盆地', '地的', 'dfm', '标杆', '每月消耗', '每月', '月消', '消耗', '1800', '万立方英尺天然气', '万立', '立方', '方英', '英尺', '尺天', '天然', '然气', '燃烧效率', '燃烧', '烧效', '效率', '99', '正向', 'ai', '云计算转型', '云计', '计算', '算转', '转型', 'ypf', 'luz', 'gda', 'vaca', 'muerta', '盆地的国企合作案例', '的国', '国企', '企合', '合作', '作案', '7mw', '装机', '1200', '台矿机', '台矿', '矿机', '预计减少', '预计', '计减', '减少', '63', '二氧化碳当量排放', '二氧', '氧化', '化碳', '碳当', '当量']::text[],
        '离网自用模式',
        0,
        202,
        '{"path": "/resources/case-studies/scenarios/", "snapshot_kind": "site_html"}'::jsonb,
        '# Global Case Studies

探索全球最具代表性的天然气发电与算力结合项目，涵盖从石油巨头到创新型初创企业的多种合作模式。

### Crusoe & ExxonMobil

北达科他州 Bakken 盆地的 DFM 标杆。每月消耗 1800万立方英尺天然气，燃烧效率 99.9%，正向 AI 云计算转型。

### YPF Luz & GDA

Vaca Muerta 盆地的国企合作案例。7MW 装机，1200 台矿机，预计减少 63% 二氧化碳当量排放。

### LINKMINE 艾伯塔项目

利用艾伯塔省废弃气井（OWA）和离网豁免政策。实现 $0.043/kWh 低成本电力，并预留氢能接口。

### 北美 (North America)

- 德克萨斯 (Texas): ERCOT 市场灵活负载，ExxonMobil 等巨头布局。

- 纽约州 (New York): Greenidge 电厂自用模式，面临环保法规挑战。

- 艾伯塔 (Alberta): 受益于离网自用 (<10MW) 豁免政策，废弃气井利用活跃。

### 南美 (South America)

- 阿根廷 (Argentina): Vaca Muerta 盆地，YPF 将无法出口的天然气“数字货币化”。

### 欧亚与中东 (Eurasia & ME)

- 俄罗斯 (Russia): 西伯利亚伴生气离网挖矿，解决电力短缺。

- 中东 (Middle East): ADNOC 投资布局，LNG 与伴生气挖矿潜力巨大。

### 数字火炬缓解 (DFM)

部署在井口，直接利用伴生气发电。替代燃烧火炬，获取碳信用收益。

### 搁浅气货币化

针对因缺乏管道而关停的气井（Shut-in Wells），就地变现为数字资产。

### 离网自用模式

无需并网，完全独立的电力孤岛。规避复杂的电网审批，快速部署。 # Global Case Studies

探索全球最具代表性的天然气发电与算力结合项目，涵盖从石油巨头到创新型初创企业的多种合作模式。

### Crusoe & ExxonMobil

北达科他州 Bakken 盆地的 DFM 标杆。每月消耗 1800万立方英尺天然气，燃烧效率 99.9%，正向 AI 云计算转型。

### YPF Luz & GDA

Vaca Muerta 盆地的国企合作案例。7MW 装机，1200 台矿机， global case studies gasgx 案例库 案例 例库 https www com resources scenarios 探索全球最具代表性的天然气发电与算力结合项目 涵盖从石油巨头到创新型初创企业的多种合作模式 crusoe exxonmobil 北达科他州 北达 达科 科他 他州 bakken 盆地的 盆地 地的 dfm 标杆 每月消耗 每月 月消 消耗 1800 万立方英尺天然气 万立 立方 方英 英尺 尺天 天然 然气 燃烧效率 燃烧 烧效 效率 99 正向 ai 云计算转型 云计 计算 算转 转型 ypf luz gda vaca muerta 盆地的国企合作案例 的国 国企 企合 合作 作案 7mw 装机 1200 台矿机 台矿 矿机 预计减少 预计 计减 减少 63 二氧化碳当量排放 二氧 氧化 化碳 碳当 当量'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/resources/certifications/' limit 1),
        '# Certifications & Compliance

汇集我们在环境、电力、工业安全及数字资产运营方面的核心资质，为全球合作伙伴提供透明的尽职调查依据。

## 1. 环境排放与碳减排认证

核心合规：量化“数字火炬缓解”（DFM）的温室气体减排效益，确保碳资产的“额外性”与可交易性。

### [碳权] Verra VMR0016 认证

采用 Verra 最新 VMR0016 方法学（原 ACM0001）。通过高精度流量计核证每消耗 1 吨甲烷产生的碳信用。

### [排放] EPA Quad O / Quad Oa

符合美国 EPA 对油气设施 VOCs 和甲烷排放的 NSPS 标准。燃气机组配备闭环控制系统，确保破坏效率 >95%。

## 2. 电力接入与电网规范

核心合规：针对“离网自用”与“余电上网”两种模式的合法性文件，规避非法售电风险。

### [加拿大] AUC Rule 007 豁免

针对 <10MW 的小型电厂，符合艾伯塔省 AUC 的自用（Own-Use）豁免条款，无需申请全面电厂牌照。

### [美国] ERCOT 灵活负载注册

在德州 ERCOT 市场注册为可中断负载资源（CLR）。参与辅助服务市场，在电价高企时关机响应。

## 3. 工业安全与设备标准

核心合规：保障高含硫（Sour Gas）及易爆环境下的设备可靠性与人员安全。

### [抗硫] NACE MR0175

针对含硫化氢环境的金属材料抗裂标准。管道及阀门使用316不锈钢，防止硫化物应力开裂。

### [电气] UL 2200 / CSA

集装箱式数据中心及配电柜符合北美 NEC 电气规范，通过现场电气验收。

### [防爆] Class I, Div 2

靠近气源接口的电气设备符合防爆要求，确保甲烷泄漏时不会产生火花。

## 4. 数字资产与运营牌照

核心合规：确保挖矿及资产处置业务在所在国的合法经营权。

### [俄罗斯] 挖矿登记簿

依据《数字货币挖矿法》，法人实体已在联邦税务局（FTS）的挖矿活动登记簿中注册，不仅限于工业配额。

### [哈萨克斯坦] AIFC 牌照

在阿斯塔纳国际金融中心（AIFC）持有数字资产经营牌照，并将部分算力接入国家矿池。',
        '# Certifications & Compliance

汇集我们在环境、电力、工业安全及数字资产运营方面的核心资质，为全球合作伙伴提供透明的尽职调查依据。

## 1. 环境排放与碳减排认证

核心合规：量化“数字火炬缓解”（DFM）的温室气体减排效益，确保碳资产的“额外性”与可交易性。

### [碳权] Verra VMR0016 认证

采用 Verra 最新 VMR0016 方法学（原 ACM0001）。通过高精度流量计核',
        'zh',
        array['certifications', 'compliance', 'gasgx', '认证与合规', '认证', '证与', '与合', '合规', 'https', 'www', 'com', 'resources', '汇集我们在环境', '汇集', '集我', '我们', '们在', '在环', '环境', '电力', '工业安全及数字资产运营方面的核心资质', '为全球合作伙伴提供透明的尽职调查依据', '环境排放与碳减排认证', '境排', '排放', '放与', '与碳', '碳减', '减排', '排认', '核心合规', '核心', '心合', '量化', '数字火炬缓解', '数字', '字火', '火炬', '炬缓', '缓解', 'dfm', '的温室气体减排效益', '的温', '温室', '室气', '气体', '体减', '排效', '效益', '确保碳资产的', '确保', '保碳', '碳资', '资产', '产的', '额外性', '额外', '外性', '与可交易性', '与可', '可交', '交易', '易性', '碳权', 'verra', 'vmr0016', '采用', '最新', '方法学', '方法', '法学', 'acm0001', '通过高精度流量计核证每消耗', '通过', '过高', '高精', '精度', '度流', '流量', '量计']::text[],
        '[哈萨克斯坦] AIFC 牌照',
        0,
        239,
        '{"path": "/resources/certifications/", "snapshot_kind": "site_html"}'::jsonb,
        '# Certifications & Compliance

汇集我们在环境、电力、工业安全及数字资产运营方面的核心资质，为全球合作伙伴提供透明的尽职调查依据。

## 1. 环境排放与碳减排认证

核心合规：量化“数字火炬缓解”（DFM）的温室气体减排效益，确保碳资产的“额外性”与可交易性。

### [碳权] Verra VMR0016 认证

采用 Verra 最新 VMR0016 方法学（原 ACM0001）。通过高精度流量计核证每消耗 1 吨甲烷产生的碳信用。

### [排放] EPA Quad O / Quad Oa

符合美国 EPA 对油气设施 VOCs 和甲烷排放的 NSPS 标准。燃气机组配备闭环控制系统，确保破坏效率 >95%。

## 2. 电力接入与电网规范

核心合规：针对“离网自用”与“余电上网”两种模式的合法性文件，规避非法售电风险。

### [加拿大] AUC Rule 007 豁免

针对 <10MW 的小型电厂，符合艾伯塔省 AUC 的自用（Own-Use）豁免条款，无需申请全面电厂牌照。

### [美国] ERCOT 灵活负载注册

在德州 ERCOT 市场注册为可中断负载资源（CLR）。参与辅助服务市场，在电价高企时关机响应。

## 3. 工业安全与设备标准

核心合规：保障高含硫（Sour Gas）及易爆环境下的设备可靠性与人员安全。

### [抗硫] NACE MR0175

针对含硫化氢环境的金属材料抗裂标准。管道及阀门使用316不锈钢，防止硫化物应力开裂。

### [电气] UL 2200 / CSA

集装箱式数据中心及配电柜符合北美 NEC 电气规范，通过现场电气验收。

### [防爆] Class I, Div 2

靠近气源接口的电气设备符合防爆要求，确保甲烷泄漏时不会产生火花。

## 4. 数字资产与运营牌照

核心合规：确保挖矿及资产处置业务在所在国的合法经营权。

### [俄罗斯] 挖矿登记簿

依据《数字货币挖矿法》，法人实体已在联邦税务局（FTS）的挖矿活动登记簿中注册，不仅限于工业配额。

### [哈萨克斯坦] AIFC 牌照

在阿斯塔纳国际金融中心（AIFC）持有数字资产经营牌照，并将部分算力接入国家矿池。 # Certifications & Compliance

汇集我们在环境、电力、工业安全及数字资产运营方面的核心资质，为全球合作伙伴提供透明的尽职调查依据。

## 1. 环境排放与碳减排认证

核心合规：量化“数字火炬缓解”（DFM）的温室气体减排效益，确保碳资产的“额外性”与可交易性。

### [碳权] Verra VMR0016 认证

采用 Verra 最新 VMR0016 方法学（原 ACM0001）。通过高精度流量计核 certifications compliance gasgx 认证与合规 认证 证与 与合 合规 https www com resources 汇集我们在环境 汇集 集我 我们 们在 在环 环境 电力 工业安全及数字资产运营方面的核心资质 为全球合作伙伴提供透明的尽职调查依据 环境排放与碳减排认证 境排 排放 放与 与碳 碳减 减排 排认 核心合规 核心 心合 量化 数字火炬缓解 数字 字火 火炬 炬缓 缓解 dfm 的温室气体减排效益 的温 温室 室气 气体 体减 排效 效益 确保碳资产的 确保 保碳 碳资 资产 产的 额外性 额外 外性 与可交易性 与可 可交 交易 易性 碳权 verra vmr0016 采用 最新 方法学 方法 法学 acm0001 通过高精度流量计核证每消耗 通过 过高 高精 精度 度流 流量 量计'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/resources/datasheets/' limit 1),
        '# Technical Parameters

从选址规划到电网并联，GasGx 为您提供最详尽的天然气发电挖矿工程参数指南。

### 1. 土地与场地 (Land & Site)

#### 占地面积

- 模块化标准： 1MW 约需 150-200 平方米

- 集装箱尺寸： ISO 20尺 (6m) 或 40尺 (12m)

#### 地面承重

- 基础要求： 硬化地面 > 3000 kg/m²

- 平整度： 坡度 < 5度 (液位传感器要求)

#### 环境距离

- 噪音缓冲区： 居民区距离 > 500米

- 安全距离： 井口高压设备 > 30-50米

### 2. 气源参数 (Gas Source)

#### 甲烷值 (MN)

- 理想值： MN > 80 (运行稳定)

- 低值处理： MN < 65 时需降额运行

#### 热值 (Heating Value)

- 低热值 (LHV)： > 1000 BTU/scf (37 MJ/m³)

#### 杂质耐受

- 硫化氢 (H₂S)： < 200 ppm (直燃); > 500 ppm (需预处理)

- 水分： 需脱水处理 (防止冻结)

### 3. 排放与环保 (Emissions)

#### NOx 排放

- 标准： 1.0 g/bhp-hr (常规); 0.15 g/bhp-hr (严控)

- 技术： 稀薄燃烧 + SCR 后处理

#### 燃烧效率

- 甲烷破坏率： > 99% (火炬仅 91-95%)

### 4. 发电机组参数 (Genset)

#### 电力输出

- 电压： 400V/480V (低压); 10.5kV+ (高压)

- 频率： 50Hz (中/欧/俄) 或 60Hz (美/加)

#### 效率 (Efficiency)

- 电效率： 38% - 44% (例如 MWM TCG 3016)

- 气耗率： 0.24 - 0.30 m³/kWh

#### 冷却方式

- 适应温度： -20°C 至 +40°C

### 5. 挖矿与负载 (Mining Load)

#### 负荷特性

- 类型： 恒定负荷 (Base Load), 24/7 运行

- 功率因数： 需校正至 0.9 - 0.95

#### 矿机耐受性

- 环境： 液冷/浸没式耐受高温及沙尘

- 启动： 需 Load Bank 或软启动控制

### 6. 电网与并网 (Grid)

#### 离网模式

- 无需电网接入，需配备黑启动电池组。',
        '# Technical Parameters

从选址规划到电网并联，GasGx 为您提供最详尽的天然气发电挖矿工程参数指南。

### 1. 土地与场地 (Land & Site)

#### 占地面积

- 模块化标准： 1MW 约需 150-200 平方米

- 集装箱尺寸： ISO 20尺 (6m) 或 40尺 (12m)

#### 地面承重

- 基础要求： 硬化地面 > 3000 kg/m²

- 平整度： 坡度 < 5度',
        'zh',
        array['technical', 'datasheets', 'gasgx', '技术参数表', '技术', '术参', '参数', '数表', 'https', 'www', 'com', 'resources', 'parameters', '从选址规划到电网并联', '从选', '选址', '址规', '规划', '划到', '到电', '电网', '网并', '并联', '为您提供最详尽的天然气发电挖矿工程参数指南', '土地与场地', '土地', '地与', '与场', '场地', 'land', 'site', '占地面积', '占地', '地面', '面积', '模块化标准', '模块', '块化', '化标', '标准', '1mw', '约需', '150', '200', '平方米', '平方', '方米', '集装箱尺寸', '集装', '装箱', '箱尺', '尺寸', 'iso', '20', '6m', '40', '12m', '地面承重', '面承', '承重', '基础要求', '基础', '础要', '要求', '硬化地面', '硬化', '化地', '3000', 'kg', '平整度', '平整', '整度', '坡度', '液位传感器要求', '液位', '位传', '传感', '感器', '器要', '环境距离']::text[],
        '并网模式',
        0,
        273,
        '{"path": "/resources/datasheets/", "snapshot_kind": "site_html"}'::jsonb,
        '# Technical Parameters

从选址规划到电网并联，GasGx 为您提供最详尽的天然气发电挖矿工程参数指南。

### 1. 土地与场地 (Land & Site)

#### 占地面积

- 模块化标准： 1MW 约需 150-200 平方米

- 集装箱尺寸： ISO 20尺 (6m) 或 40尺 (12m)

#### 地面承重

- 基础要求： 硬化地面 > 3000 kg/m²

- 平整度： 坡度 < 5度 (液位传感器要求)

#### 环境距离

- 噪音缓冲区： 居民区距离 > 500米

- 安全距离： 井口高压设备 > 30-50米

### 2. 气源参数 (Gas Source)

#### 甲烷值 (MN)

- 理想值： MN > 80 (运行稳定)

- 低值处理： MN < 65 时需降额运行

#### 热值 (Heating Value)

- 低热值 (LHV)： > 1000 BTU/scf (37 MJ/m³)

#### 杂质耐受

- 硫化氢 (H₂S)： < 200 ppm (直燃); > 500 ppm (需预处理)

- 水分： 需脱水处理 (防止冻结)

### 3. 排放与环保 (Emissions)

#### NOx 排放

- 标准： 1.0 g/bhp-hr (常规); 0.15 g/bhp-hr (严控)

- 技术： 稀薄燃烧 + SCR 后处理

#### 燃烧效率

- 甲烷破坏率： > 99% (火炬仅 91-95%)

### 4. 发电机组参数 (Genset)

#### 电力输出

- 电压： 400V/480V (低压); 10.5kV+ (高压)

- 频率： 50Hz (中/欧/俄) 或 60Hz (美/加)

#### 效率 (Efficiency)

- 电效率： 38% - 44% (例如 MWM TCG 3016)

- 气耗率： 0.24 - 0.30 m³/kWh

#### 冷却方式

- 适应温度： -20°C 至 +40°C

### 5. 挖矿与负载 (Mining Load)

#### 负荷特性

- 类型： 恒定负荷 (Base Load), 24/7 运行

- 功率因数： 需校正至 0.9 - 0.95

#### 矿机耐受性

- 环境： 液冷/浸没式耐受高温及沙尘

- 启动： 需 Load Bank 或软启动控制

### 6. 电网与并网 (Grid)

#### 离网模式

- 无需电网接入，需配备黑启动电池组。 # Technical Parameters

从选址规划到电网并联，GasGx 为您提供最详尽的天然气发电挖矿工程参数指南。

### 1. 土地与场地 (Land & Site)

#### 占地面积

- 模块化标准： 1MW 约需 150-200 平方米

- 集装箱尺寸： ISO 20尺 (6m) 或 40尺 (12m)

#### 地面承重

- 基础要求： 硬化地面 > 3000 kg/m²

- 平整度： 坡度 < 5度 technical datasheets gasgx 技术参数表 技术 术参 参数 数表 https www com resources parameters 从选址规划到电网并联 从选 选址 址规 规划 划到 到电 电网 网并 并联 为您提供最详尽的天然气发电挖矿工程参数指南 土地与场地 土地 地与 与场 场地 land site 占地面积 占地 地面 面积 模块化标准 模块 块化 化标 标准 1mw 约需 150 200 平方米 平方 方米 集装箱尺寸 集装 装箱 箱尺 尺寸 iso 20 6m 40 12m 地面承重 面承 承重 基础要求 基础 础要 要求 硬化地面 硬化 化地 3000 kg 平整度 平整 整度 坡度 液位传感器要求 液位 位传 传感 感器 器要 环境距离'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/resources/datasheets/' limit 1),
        '#### 并网模式

- 需符合电网代码 (Grid Code)，配备同步装置。

- 支持“削峰填谷”收益模式。

### 7. 网络与通讯 (Connectivity)

#### 带宽需求

- 挖矿协议： 数据量极低 (< 50kbps/台)

- 总带宽： 1MW 仅需 10-20 Mbps (含监控)

#### 接入方案

- 首选： Starlink (延迟 30-50ms)

- 备用： 4G/5G LTE 或微波链路',
        '#### 并网模式

- 需符合电网代码 (Grid Code)，配备同步装置。

- 支持“削峰填谷”收益模式。

### 7. 网络与通讯 (Connectivity)

#### 带宽需求

- 挖矿协议： 数据量极低 (< 50kbps/台)

- 总带宽： 1MW 仅需 10-20 Mbps (含监控)

#### 接入方案

- 首选： Starlink (延迟 30-50ms)

- 备用： 4G/5G LTE 或微波链路',
        'zh',
        array['technical', 'datasheets', 'gasgx', '技术参数表', '技术', '术参', '参数', '数表', 'https', 'www', 'com', 'resources', 'parameters', '从选址规划到电网并联', '从选', '选址', '址规', '规划', '划到', '到电', '电网', '网并', '并联', '为您提供最详尽的天然气发电挖矿工程参数指南', '土地与场地', '土地', '地与', '与场', '场地', 'land', 'site', '占地面积', '占地', '地面', '面积', '模块化标准', '模块', '块化', '化标', '标准', '1mw', '约需', '150', '200', '平方米', '平方', '方米', '集装箱尺寸', '集装', '装箱', '箱尺', '尺寸', 'iso', '20', '6m', '40', '12m', '地面承重', '面承', '承重', '基础要求', '基础', '础要', '要求', '硬化地面', '硬化', '化地', '3000', 'kg', '平整度', '平整', '整度', '坡度', '液位传感器要求', '液位', '位传', '传感', '感器', '器要', '环境距离']::text[],
        '接入方案',
        1,
        56,
        '{"path": "/resources/datasheets/", "snapshot_kind": "site_html"}'::jsonb,
        '#### 并网模式

- 需符合电网代码 (Grid Code)，配备同步装置。

- 支持“削峰填谷”收益模式。

### 7. 网络与通讯 (Connectivity)

#### 带宽需求

- 挖矿协议： 数据量极低 (< 50kbps/台)

- 总带宽： 1MW 仅需 10-20 Mbps (含监控)

#### 接入方案

- 首选： Starlink (延迟 30-50ms)

- 备用： 4G/5G LTE 或微波链路 #### 并网模式

- 需符合电网代码 (Grid Code)，配备同步装置。

- 支持“削峰填谷”收益模式。

### 7. 网络与通讯 (Connectivity)

#### 带宽需求

- 挖矿协议： 数据量极低 (< 50kbps/台)

- 总带宽： 1MW 仅需 10-20 Mbps (含监控)

#### 接入方案

- 首选： Starlink (延迟 30-50ms)

- 备用： 4G/5G LTE 或微波链路 technical datasheets gasgx 技术参数表 技术 术参 参数 数表 https www com resources parameters 从选址规划到电网并联 从选 选址 址规 规划 划到 到电 电网 网并 并联 为您提供最详尽的天然气发电挖矿工程参数指南 土地与场地 土地 地与 与场 场地 land site 占地面积 占地 地面 面积 模块化标准 模块 块化 化标 标准 1mw 约需 150 200 平方米 平方 方米 集装箱尺寸 集装 装箱 箱尺 尺寸 iso 20 6m 40 12m 地面承重 面承 承重 基础要求 基础 础要 要求 硬化地面 硬化 化地 3000 kg 平整度 平整 整度 坡度 液位传感器要求 液位 位传 传感 感器 器要 环境距离'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/resources/faq/' limit 1),
        '# Frequently Asked Questions

探索关于天然气发电挖矿的运作原理、经济模型、环保价值及合规路径的深度解答。

## 基础概念与运作原理

这是一种基于“工业共生”理念的能源利用模式，旨在将能源行业的“废料”转化为算力行业的“燃料”。具体做法是在油气田井口部署模块化的天然气发电机组和集装箱式数据中心。利用原本因缺乏管道设施而只能被燃烧（Flaring）或直接排放（Venting）的伴生气（Associated Gas）或搁浅气（Stranded Gas）驱动发电机产生电力，现场直接供给比特币矿机或 AI 服务器进行计算。GasGx 将此称为“数字火炬缓解”（Digital Flare Mitigation, DFM）技术。

主要是由于经济性和基础设施限制：

- 资源浪费规模： 全球每年约有 1450 亿立方米的天然气被燃烧掉，价值超过 300 亿美元。

- 经济痛点： 许多油气田位于偏远地区，建设天然气管道成本极高。如果不进行现场消纳，石油公司为了开采高价值的原油，被迫将其作为废料处理。

- 搁浅定义： 这些无法输送的气体被称为“搁浅气体”，通过现场发电挖矿，省去了昂贵的中游管道运输环节，实现了能源的就地增值。

主要包括五个关键环节：

- 气体捕获与预处理： 包括脱水器和脱硫装置，用于去除水分、硫化氢（H₂S）等杂质。

- 发电机组： 通常采用往复式燃气发电机（如 INNIO Jenbacher、Waukesha 系列）或微型燃气轮机，燃烧效率可达 99% 以上。

- 模块化算力中心： 集成了矿机、配电和冷却系统的集装箱（如 Linkmine 的 MinerPower 气算一体集装箱），支持“插电即开机”。

- 冷却系统： 采用液冷（Hydro-cooling）或浸没式冷却，以适应高密度算力需求。

- 网络连接： 针对偏远地区，通常集成 Starlink 卫星通信或光纤回传。

## 经济效益与成本

优势主要体现在将能源成本（OPEX）与电网价格解耦，成本可降低约 30%-40% 甚至更多。

- 传统电网成本： 工业电价通常在 $0.06 - $0.14/kWh 之间，且面临高峰电价和需量电费的压力。

- 离网发电成本： 气源成本接近零甚至为负（油企付费处理），综合发电成本（LCOE）通常在 $0.02 - $0.05/kWh。LINKMINE 项目实测发电成本可低至 $0.043/kWh。',
        '# Frequently Asked Questions

探索关于天然气发电挖矿的运作原理、经济模型、环保价值及合规路径的深度解答。

## 基础概念与运作原理

这是一种基于“工业共生”理念的能源利用模式，旨在将能源行业的“废料”转化为算力行业的“燃料”。具体做法是在油气田井口部署模块化的天然气发电机组和集装箱式数据中心。利用原本因缺乏管道设施而只能被燃烧（Flaring）或直接排放（Venting）的伴生气（Associated ',
        'zh',
        array['faq', 'gasgx', '常见问题解答', '常见', '见问', '问题', '题解', '解答', 'https', 'www', 'com', 'resources', 'frequently', 'asked', 'questions', '探索关于天然气发电挖矿的运作原理', '探索', '索关', '关于', '于天', '天然', '然气', '气发', '发电', '电挖', '挖矿', '矿的', '的运', '运作', '作原', '原理', '经济模型', '经济', '济模', '模型', '环保价值及合规路径的深度解答', '环保', '保价', '价值', '值及', '及合', '合规', '规路', '路径', '径的', '的深', '深度', '度解', '基础概念与运作原理', '基础', '础概', '概念', '念与', '与运', '这是一种基于', '这是', '是一', '一种', '种基', '基于', '工业共生', '工业', '业共', '共生', '理念的能源利用模式', '理念', '念的', '的能', '能源', '源利', '利用', '用模', '模式', '旨在将能源行业的', '旨在', '在将', '将能', '源行', '行业', '业的']::text[],
        '经济效益与成本',
        0,
        257,
        '{"path": "/resources/faq/", "snapshot_kind": "site_html"}'::jsonb,
        '# Frequently Asked Questions

探索关于天然气发电挖矿的运作原理、经济模型、环保价值及合规路径的深度解答。

## 基础概念与运作原理

这是一种基于“工业共生”理念的能源利用模式，旨在将能源行业的“废料”转化为算力行业的“燃料”。具体做法是在油气田井口部署模块化的天然气发电机组和集装箱式数据中心。利用原本因缺乏管道设施而只能被燃烧（Flaring）或直接排放（Venting）的伴生气（Associated Gas）或搁浅气（Stranded Gas）驱动发电机产生电力，现场直接供给比特币矿机或 AI 服务器进行计算。GasGx 将此称为“数字火炬缓解”（Digital Flare Mitigation, DFM）技术。

主要是由于经济性和基础设施限制：

- 资源浪费规模： 全球每年约有 1450 亿立方米的天然气被燃烧掉，价值超过 300 亿美元。

- 经济痛点： 许多油气田位于偏远地区，建设天然气管道成本极高。如果不进行现场消纳，石油公司为了开采高价值的原油，被迫将其作为废料处理。

- 搁浅定义： 这些无法输送的气体被称为“搁浅气体”，通过现场发电挖矿，省去了昂贵的中游管道运输环节，实现了能源的就地增值。

主要包括五个关键环节：

- 气体捕获与预处理： 包括脱水器和脱硫装置，用于去除水分、硫化氢（H₂S）等杂质。

- 发电机组： 通常采用往复式燃气发电机（如 INNIO Jenbacher、Waukesha 系列）或微型燃气轮机，燃烧效率可达 99% 以上。

- 模块化算力中心： 集成了矿机、配电和冷却系统的集装箱（如 Linkmine 的 MinerPower 气算一体集装箱），支持“插电即开机”。

- 冷却系统： 采用液冷（Hydro-cooling）或浸没式冷却，以适应高密度算力需求。

- 网络连接： 针对偏远地区，通常集成 Starlink 卫星通信或光纤回传。

## 经济效益与成本

优势主要体现在将能源成本（OPEX）与电网价格解耦，成本可降低约 30%-40% 甚至更多。

- 传统电网成本： 工业电价通常在 $0.06 - $0.14/kWh 之间，且面临高峰电价和需量电费的压力。

- 离网发电成本： 气源成本接近零甚至为负（油企付费处理），综合发电成本（LCOE）通常在 $0.02 - $0.05/kWh。LINKMINE 项目实测发电成本可低至 $0.043/kWh。 # Frequently Asked Questions

探索关于天然气发电挖矿的运作原理、经济模型、环保价值及合规路径的深度解答。

## 基础概念与运作原理

这是一种基于“工业共生”理念的能源利用模式，旨在将能源行业的“废料”转化为算力行业的“燃料”。具体做法是在油气田井口部署模块化的天然气发电机组和集装箱式数据中心。利用原本因缺乏管道设施而只能被燃烧（Flaring）或直接排放（Venting）的伴生气（Associated  faq gasgx 常见问题解答 常见 见问 问题 题解 解答 https www com resources frequently asked questions 探索关于天然气发电挖矿的运作原理 探索 索关 关于 于天 天然 然气 气发 发电 电挖 挖矿 矿的 的运 运作 作原 原理 经济模型 经济 济模 模型 环保价值及合规路径的深度解答 环保 保价 价值 值及 及合 合规 规路 路径 径的 的深 深度 度解 基础概念与运作原理 基础 础概 概念 念与 与运 这是一种基于 这是 是一 一种 种基 基于 工业共生 工业 业共 共生 理念的能源利用模式 理念 念的 的能 能源 源利 利用 用模 模式 旨在将能源行业的 旨在 在将 将能 源行 行业 业的'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/resources/faq/' limit 1),
        '- 抗风险能力： 即使在比特币减半周期后，极低的能源成本（$0.02/kWh 左右）能确保项目在币价低迷时仍保持正向现金流。

石油公司可从“负资产”转向“正收益”：

- 规避罚款： 避免因超标燃烧面临的巨额环保罚款（如美国新墨西哥州曾开出 4000 万美元罚单）。

- 资产货币化： 将原本需要花钱处理的废气转化为电力销售收入或特许权使用费。

- ESG 评级提升： 响应世界银行“2030 零常规火炬”倡议，提升企业绿色融资能力。

## 环境影响与 ESG

科学数据支持其为有效的减排手段，即“甲烷减排”。

- 甲烷危害： 甲烷在 20 年内的温室效应是二氧化碳的 84 倍。

- 效率对比： 传统火炬燃烧效率约为 91%，意味着约 9% 的甲烷会逃逸到大气中；而高效燃气发电机组可实现 >99.9% 的甲烷破坏率。

- 减排量化： 理论上，利用搁浅气挖矿可减少全球 23% 的甲烷排放。以 LINKMINE 项目为例，其碳负属性每年可产生约 180 万美元的碳权收益。

是的，该模式与全球去碳化目标高度一致。

- 国际倡议： 完全符合世界银行“2030 年零常规燃烧”（Zero Routine Flaring by 2030）倡议。

- 碳信用认证： 项目可依据 Verra 新标准 VMR0016 开发碳信用（Carbon Credits），将减排量资产化并进行交易。

## 技术挑战与解决方案

可以，但必须克服“酸性气”的技术壁垒。

- 材料要求： 所有管道和阀门需符合 NACE MR0175/ISO 15156 抗硫腐蚀标准。

- 处理工艺： 对于低浓度硫化氢，使用三嗪（Triazine）等化学清除剂；对于高浓度，采用受阻胺（FLEXSORB）工艺进行选择性去除。GasGx 的技术方案已包含针对酸性气的模块化处理单元。

采用工业级防护和先进冷却技术：

- 集装箱化： 使用“Hash Hut”等集装箱设计，防尘、防雨，支持 -40℃ 至 +45℃ 的极端环境运行。

- 液冷技术： 引入 Antminer S21 XP Hydro 等液冷矿机，配合 HydroCooling 水冷矿箱，能效比更佳且隔绝了外部沙尘对芯片的损害。

- 智能负载： 使用 LinkBrain 等 AI 系统实时匹配燃气供应与算力负载，波动率可控制在 ≤2%。

这是一个提升能源利用率的高级阶段。',
        '- 抗风险能力： 即使在比特币减半周期后，极低的能源成本（$0.02/kWh 左右）能确保项目在币价低迷时仍保持正向现金流。

石油公司可从“负资产”转向“正收益”：

- 规避罚款： 避免因超标燃烧面临的巨额环保罚款（如美国新墨西哥州曾开出 4000 万美元罚单）。

- 资产货币化： 将原本需要花钱处理的废气转化为电力销售收入或特许权使用费。

- ESG 评级提升： 响应世界银行“2030 零常规火炬”倡议，提升企业绿色融资能力。',
        'zh',
        array['faq', 'gasgx', '常见问题解答', '常见', '见问', '问题', '题解', '解答', 'https', 'www', 'com', 'resources', 'frequently', 'asked', 'questions', '探索关于天然气发电挖矿的运作原理', '探索', '索关', '关于', '于天', '天然', '然气', '气发', '发电', '电挖', '挖矿', '矿的', '的运', '运作', '作原', '原理', '经济模型', '经济', '济模', '模型', '环保价值及合规路径的深度解答', '环保', '保价', '价值', '值及', '及合', '合规', '规路', '路径', '径的', '的深', '深度', '度解', '基础概念与运作原理', '基础', '础概', '概念', '念与', '与运', '这是一种基于', '这是', '是一', '一种', '种基', '基于', '工业共生', '工业', '业共', '共生', '理念的能源利用模式', '理念', '念的', '的能', '能源', '源利', '利用', '用模', '模式', '旨在将能源行业的', '旨在', '在将', '将能', '源行', '行业', '业的']::text[],
        '技术挑战与解决方案',
        1,
        250,
        '{"path": "/resources/faq/", "snapshot_kind": "site_html"}'::jsonb,
        '- 抗风险能力： 即使在比特币减半周期后，极低的能源成本（$0.02/kWh 左右）能确保项目在币价低迷时仍保持正向现金流。

石油公司可从“负资产”转向“正收益”：

- 规避罚款： 避免因超标燃烧面临的巨额环保罚款（如美国新墨西哥州曾开出 4000 万美元罚单）。

- 资产货币化： 将原本需要花钱处理的废气转化为电力销售收入或特许权使用费。

- ESG 评级提升： 响应世界银行“2030 零常规火炬”倡议，提升企业绿色融资能力。

## 环境影响与 ESG

科学数据支持其为有效的减排手段，即“甲烷减排”。

- 甲烷危害： 甲烷在 20 年内的温室效应是二氧化碳的 84 倍。

- 效率对比： 传统火炬燃烧效率约为 91%，意味着约 9% 的甲烷会逃逸到大气中；而高效燃气发电机组可实现 >99.9% 的甲烷破坏率。

- 减排量化： 理论上，利用搁浅气挖矿可减少全球 23% 的甲烷排放。以 LINKMINE 项目为例，其碳负属性每年可产生约 180 万美元的碳权收益。

是的，该模式与全球去碳化目标高度一致。

- 国际倡议： 完全符合世界银行“2030 年零常规燃烧”（Zero Routine Flaring by 2030）倡议。

- 碳信用认证： 项目可依据 Verra 新标准 VMR0016 开发碳信用（Carbon Credits），将减排量资产化并进行交易。

## 技术挑战与解决方案

可以，但必须克服“酸性气”的技术壁垒。

- 材料要求： 所有管道和阀门需符合 NACE MR0175/ISO 15156 抗硫腐蚀标准。

- 处理工艺： 对于低浓度硫化氢，使用三嗪（Triazine）等化学清除剂；对于高浓度，采用受阻胺（FLEXSORB）工艺进行选择性去除。GasGx 的技术方案已包含针对酸性气的模块化处理单元。

采用工业级防护和先进冷却技术：

- 集装箱化： 使用“Hash Hut”等集装箱设计，防尘、防雨，支持 -40℃ 至 +45℃ 的极端环境运行。

- 液冷技术： 引入 Antminer S21 XP Hydro 等液冷矿机，配合 HydroCooling 水冷矿箱，能效比更佳且隔绝了外部沙尘对芯片的损害。

- 智能负载： 使用 LinkBrain 等 AI 系统实时匹配燃气供应与算力负载，波动率可控制在 ≤2%。

这是一个提升能源利用率的高级阶段。 - 抗风险能力： 即使在比特币减半周期后，极低的能源成本（$0.02/kWh 左右）能确保项目在币价低迷时仍保持正向现金流。

石油公司可从“负资产”转向“正收益”：

- 规避罚款： 避免因超标燃烧面临的巨额环保罚款（如美国新墨西哥州曾开出 4000 万美元罚单）。

- 资产货币化： 将原本需要花钱处理的废气转化为电力销售收入或特许权使用费。

- ESG 评级提升： 响应世界银行“2030 零常规火炬”倡议，提升企业绿色融资能力。 faq gasgx 常见问题解答 常见 见问 问题 题解 解答 https www com resources frequently asked questions 探索关于天然气发电挖矿的运作原理 探索 索关 关于 于天 天然 然气 气发 发电 电挖 挖矿 矿的 的运 运作 作原 原理 经济模型 经济 济模 模型 环保价值及合规路径的深度解答 环保 保价 价值 值及 及合 合规 规路 路径 径的 的深 深度 度解 基础概念与运作原理 基础 础概 概念 念与 与运 这是一种基于 这是 是一 一种 种基 基于 工业共生 工业 业共 共生 理念的能源利用模式 理念 念的 的能 能源 源利 利用 用模 模式 旨在将能源行业的 旨在 在将 将能 源行 行业 业的'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/resources/faq/' limit 1),
        '- 热循环利用： 回收发电机产生的废热，可用于防冻或进一步的工业用途。例如，LINKMINE 计划在三期工程启用热循环系统，将综合能源利用效率从 35% 提升至 60%。

- 余热价值： 除了提升效率，还能通过热能管理降低整体运营成本。

## 全球趋势与监管

- 北美： 美国得克萨斯州（ERCOT 市场）和北达科他州是先行者。加拿大艾伯塔省对 <10MW 的自用离网发电有豁免政策，便于快速部署。

- 南美： 阿根廷 Vaca Muerta 盆地，YPF（国家石油公司）与科技公司合作，利用丰富的页岩气资源挖矿。

- 独联体地区： 俄罗斯和哈萨克斯坦利用伴生气解决电力短缺问题，并逐步完善加密货币挖矿的立法框架。

- AI 算力转型： 随着 AI 数据中心电力需求预计增长 165%，GasGx 模式正从比特币挖矿向高性能计算（HPC）和 AI 训练中心转型，作为稳定的基荷电源。

- 金融化（RWA）： 算力资产和碳信用正在被打包成资产支持证券（ABS）或 REITs，例如 LINKMINE 计划将碳权收益资产证券化。

- 氢能结合： 未来项目将预留氢能副产接口，向综合能源服务商升级。

- 排放合规： 美国 EPA Quad O 法规要求燃烧装置必须达到 95% 以上的破坏效率，这是硬性合规门槛。

- 离网界定： 如加拿大艾伯塔省，需确保发电“仅供自用”（Own-Use）以获得监管豁免，否则需通过复杂的审批。

- 政策波动： 部分国家（如吉尔吉斯斯坦）可能在能源短缺时限制挖矿，但离网伴生气发电通常作为“解决方案”而非“负担”被允许甚至鼓励。',
        '- 热循环利用： 回收发电机产生的废热，可用于防冻或进一步的工业用途。例如，LINKMINE 计划在三期工程启用热循环系统，将综合能源利用效率从 35% 提升至 60%。

- 余热价值： 除了提升效率，还能通过热能管理降低整体运营成本。

## 全球趋势与监管

- 北美： 美国得克萨斯州（ERCOT 市场）和北达科他州是先行者。加拿大艾伯塔省对 <10MW 的自用离网发电有豁免政策，便于快速部署。

- 南美： 阿根廷 Vaca M',
        'zh',
        array['faq', 'gasgx', '常见问题解答', '常见', '见问', '问题', '题解', '解答', 'https', 'www', 'com', 'resources', 'frequently', 'asked', 'questions', '探索关于天然气发电挖矿的运作原理', '探索', '索关', '关于', '于天', '天然', '然气', '气发', '发电', '电挖', '挖矿', '矿的', '的运', '运作', '作原', '原理', '经济模型', '经济', '济模', '模型', '环保价值及合规路径的深度解答', '环保', '保价', '价值', '值及', '及合', '合规', '规路', '路径', '径的', '的深', '深度', '度解', '基础概念与运作原理', '基础', '础概', '概念', '念与', '与运', '这是一种基于', '这是', '是一', '一种', '种基', '基于', '工业共生', '工业', '业共', '共生', '理念的能源利用模式', '理念', '念的', '的能', '能源', '源利', '利用', '用模', '模式', '旨在将能源行业的', '旨在', '在将', '将能', '源行', '行业', '业的']::text[],
        '全球趋势与监管',
        2,
        172,
        '{"path": "/resources/faq/", "snapshot_kind": "site_html"}'::jsonb,
        '- 热循环利用： 回收发电机产生的废热，可用于防冻或进一步的工业用途。例如，LINKMINE 计划在三期工程启用热循环系统，将综合能源利用效率从 35% 提升至 60%。

- 余热价值： 除了提升效率，还能通过热能管理降低整体运营成本。

## 全球趋势与监管

- 北美： 美国得克萨斯州（ERCOT 市场）和北达科他州是先行者。加拿大艾伯塔省对 <10MW 的自用离网发电有豁免政策，便于快速部署。

- 南美： 阿根廷 Vaca Muerta 盆地，YPF（国家石油公司）与科技公司合作，利用丰富的页岩气资源挖矿。

- 独联体地区： 俄罗斯和哈萨克斯坦利用伴生气解决电力短缺问题，并逐步完善加密货币挖矿的立法框架。

- AI 算力转型： 随着 AI 数据中心电力需求预计增长 165%，GasGx 模式正从比特币挖矿向高性能计算（HPC）和 AI 训练中心转型，作为稳定的基荷电源。

- 金融化（RWA）： 算力资产和碳信用正在被打包成资产支持证券（ABS）或 REITs，例如 LINKMINE 计划将碳权收益资产证券化。

- 氢能结合： 未来项目将预留氢能副产接口，向综合能源服务商升级。

- 排放合规： 美国 EPA Quad O 法规要求燃烧装置必须达到 95% 以上的破坏效率，这是硬性合规门槛。

- 离网界定： 如加拿大艾伯塔省，需确保发电“仅供自用”（Own-Use）以获得监管豁免，否则需通过复杂的审批。

- 政策波动： 部分国家（如吉尔吉斯斯坦）可能在能源短缺时限制挖矿，但离网伴生气发电通常作为“解决方案”而非“负担”被允许甚至鼓励。 - 热循环利用： 回收发电机产生的废热，可用于防冻或进一步的工业用途。例如，LINKMINE 计划在三期工程启用热循环系统，将综合能源利用效率从 35% 提升至 60%。

- 余热价值： 除了提升效率，还能通过热能管理降低整体运营成本。

## 全球趋势与监管

- 北美： 美国得克萨斯州（ERCOT 市场）和北达科他州是先行者。加拿大艾伯塔省对 <10MW 的自用离网发电有豁免政策，便于快速部署。

- 南美： 阿根廷 Vaca M faq gasgx 常见问题解答 常见 见问 问题 题解 解答 https www com resources frequently asked questions 探索关于天然气发电挖矿的运作原理 探索 索关 关于 于天 天然 然气 气发 发电 电挖 挖矿 矿的 的运 运作 作原 原理 经济模型 经济 济模 模型 环保价值及合规路径的深度解答 环保 保价 价值 值及 及合 合规 规路 路径 径的 的深 深度 度解 基础概念与运作原理 基础 础概 概念 念与 与运 这是一种基于 这是 是一 一种 种基 基于 工业共生 工业 业共 共生 理念的能源利用模式 理念 念的 的能 能源 源利 利用 用模 模式 旨在将能源行业的 旨在 在将 将能 源行 行业 业的'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/resources/reports/' limit 1),
        '### Contents

## 1. Executive Summary: The Industrial Convergence

In 2026, the boundary between the global digital asset mining industry and the traditional energy sector has completely blurred. With the Bitcoin network hashrate officially breaking the 1 ZettaHash (1,000 EH/s) threshold [1] , and the exponential explosion of power demand from Artificial Intelligence (AI), Gas-to-Compute (GasGx) has evolved from a marginal arbitrage strategy into an indispensable "flexible load" layer of energy infrastructure.

The 2026 market is defined by "High Difficulty" and "High Compliance." While the global crypto mining market size reached approximately $4.6 billion in 2025 with a CAGR of 12% projected towards 2030 [3] , growth is uneven. Traditional grid-connected miners face the dual squeeze of volatile electricity prices and connection backlogs. Conversely, GasGx projects utilizing Stranded Gas and Associated Gas are becoming the new darlings of capital expenditure due to their unique "negative cost energy" attributes and ESG compliance value.

#### Key Driver: The WEC Mandate',
        '### Contents

## 1. Executive Summary: The Industrial Convergence

In 2026, the boundary between the global digital asset mining industry and the traditional energy sector has completely blurred. With the Bitcoin network',
        'en',
        array['gasgx', 'industry', 'report', '2026', 'natural', 'gas', 'power', 'mining', 'https', 'www', 'com', 'resources', 'reports', 'contents', 'executive', 'summary', 'the', 'industrial', 'convergence', 'in', 'boundary', 'between', 'global', 'digital', 'asset', 'and', 'traditional', 'energy', 'sector', 'has', 'completely', 'blurred', 'with', 'bitcoin', 'network', 'hashrate', 'officially', 'breaking', 'zettahash', '000', 'eh', 'threshold', 'exponential', 'explosion', 'of', 'demand', 'from', 'artificial', 'intelligence', 'ai', 'to', 'compute', 'evolved', 'marginal', 'arbitrage', 'strategy', 'into', 'an', 'indispensable', 'flexible', 'load', 'layer', 'infrastructure', 'market', 'is', 'defined', 'by', 'high', 'difficulty', 'compliance', 'while', 'crypto', 'size', 'reached', 'approximately', 'billion', '2025', 'cagr', '12', 'projected']::text[],
        'Key Driver: The WEC Mandate',
        0,
        270,
        '{"path": "/resources/reports/", "snapshot_kind": "site_html"}'::jsonb,
        '### Contents

## 1. Executive Summary: The Industrial Convergence

In 2026, the boundary between the global digital asset mining industry and the traditional energy sector has completely blurred. With the Bitcoin network hashrate officially breaking the 1 ZettaHash (1,000 EH/s) threshold [1] , and the exponential explosion of power demand from Artificial Intelligence (AI), Gas-to-Compute (GasGx) has evolved from a marginal arbitrage strategy into an indispensable "flexible load" layer of energy infrastructure.

The 2026 market is defined by "High Difficulty" and "High Compliance." While the global crypto mining market size reached approximately $4.6 billion in 2025 with a CAGR of 12% projected towards 2030 [3] , growth is uneven. Traditional grid-connected miners face the dual squeeze of volatile electricity prices and connection backlogs. Conversely, GasGx projects utilizing Stranded Gas and Associated Gas are becoming the new darlings of capital expenditure due to their unique "negative cost energy" attributes and ESG compliance value.

#### Key Driver: The WEC Mandate ### Contents

## 1. Executive Summary: The Industrial Convergence

In 2026, the boundary between the global digital asset mining industry and the traditional energy sector has completely blurred. With the Bitcoin network gasgx industry report 2026 natural gas power mining https www com resources reports contents executive summary the industrial convergence in boundary between global digital asset and traditional energy sector has completely blurred with bitcoin network hashrate officially breaking zettahash 000 eh threshold exponential explosion of demand from artificial intelligence ai to compute evolved marginal arbitrage strategy into an indispensable flexible load layer infrastructure market is defined by high difficulty compliance while crypto size reached approximately billion 2025 cagr 12 projected'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/resources/reports/' limit 1),
        'The core driver is the "Waste Emissions Charge" (WEC) from the U.S. Inflation Reduction Act (IRA), fully implemented in 2026. It imposes a punitive fee of $1,500 per ton on excess methane emissions [5] . This policy has fundamentally altered cost structures; deploying onsite mining is no longer just about earning Bitcoin, but about avoiding massive environmental fines.

## 2. Global Macro Energy & Compute Environment (2026)

### 2.1 Global Natural Gas Market Dynamics

Entering 2026, the global natural gas market is in a critical cycle of supply-demand rebalancing. Despite the rise of renewables, the new base load added by data centers and AI clusters has reinforced natural gas''s role as a grid stabilizer.

#### USA Henry Hub & LNG Effects',
        'The core driver is the "Waste Emissions Charge" (WEC) from the U.S. Inflation Reduction Act (IRA), fully implemented in 2026. It imposes a punitive fee of $1,500 per ton on excess methane emissions [5] . This policy has ',
        'en',
        array['gasgx', 'industry', 'report', '2026', 'natural', 'gas', 'power', 'mining', 'https', 'www', 'com', 'resources', 'reports', 'contents', 'executive', 'summary', 'the', 'industrial', 'convergence', 'in', 'boundary', 'between', 'global', 'digital', 'asset', 'and', 'traditional', 'energy', 'sector', 'has', 'completely', 'blurred', 'with', 'bitcoin', 'network', 'hashrate', 'officially', 'breaking', 'zettahash', '000', 'eh', 'threshold', 'exponential', 'explosion', 'of', 'demand', 'from', 'artificial', 'intelligence', 'ai', 'to', 'compute', 'evolved', 'marginal', 'arbitrage', 'strategy', 'into', 'an', 'indispensable', 'flexible', 'load', 'layer', 'infrastructure', 'market', 'is', 'defined', 'by', 'high', 'difficulty', 'compliance', 'while', 'crypto', 'size', 'reached', 'approximately', 'billion', '2025', 'cagr', '12', 'projected']::text[],
        'USA Henry Hub & LNG Effects',
        1,
        187,
        '{"path": "/resources/reports/", "snapshot_kind": "site_html"}'::jsonb,
        'The core driver is the "Waste Emissions Charge" (WEC) from the U.S. Inflation Reduction Act (IRA), fully implemented in 2026. It imposes a punitive fee of $1,500 per ton on excess methane emissions [5] . This policy has fundamentally altered cost structures; deploying onsite mining is no longer just about earning Bitcoin, but about avoiding massive environmental fines.

## 2. Global Macro Energy & Compute Environment (2026)

### 2.1 Global Natural Gas Market Dynamics

Entering 2026, the global natural gas market is in a critical cycle of supply-demand rebalancing. Despite the rise of renewables, the new base load added by data centers and AI clusters has reinforced natural gas''s role as a grid stabilizer.

#### USA Henry Hub & LNG Effects The core driver is the "Waste Emissions Charge" (WEC) from the U.S. Inflation Reduction Act (IRA), fully implemented in 2026. It imposes a punitive fee of $1,500 per ton on excess methane emissions [5] . This policy has  gasgx industry report 2026 natural gas power mining https www com resources reports contents executive summary the industrial convergence in boundary between global digital asset and traditional energy sector has completely blurred with bitcoin network hashrate officially breaking zettahash 000 eh threshold exponential explosion of demand from artificial intelligence ai to compute evolved marginal arbitrage strategy into an indispensable flexible load layer infrastructure market is defined by high difficulty compliance while crypto size reached approximately billion 2025 cagr 12 projected'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/resources/reports/' limit 1),
        'The 2026 average spot price for Henry Hub is projected between $3.46 - $3.85/MMBtu , a significant rebound from the lows of 2024-2025 [17] . For grid-dependent miners, this raises marginal costs. However, for GasGx operators with stranded gas, rising main grid prices actually expand their relative advantage—since stranded gas often has a shadow price near zero (or negative), creating a massive arbitrage opportunity.

#### Canada AECO & Regional Arbitrage

The AECO benchmark price in Alberta is expected to rebound to $3.50-$3.82 CAD/GJ in 2026 [20] . Despite this, remote wells remain physically disconnected from pipelines. Canaan and Aurora AZ Energy''s pilot projects in Calgary utilize this "stranded" gas to bypass pipeline costs and export energy value globally via hashrate [15] .

### 2.2 Bitcoin Network Economics',
        'The 2026 average spot price for Henry Hub is projected between $3.46 - $3.85/MMBtu , a significant rebound from the lows of 2024-2025 [17] . For grid-dependent miners, this raises marginal costs. However, for GasGx opera',
        'en',
        array['gasgx', 'industry', 'report', '2026', 'natural', 'gas', 'power', 'mining', 'https', 'www', 'com', 'resources', 'reports', 'contents', 'executive', 'summary', 'the', 'industrial', 'convergence', 'in', 'boundary', 'between', 'global', 'digital', 'asset', 'and', 'traditional', 'energy', 'sector', 'has', 'completely', 'blurred', 'with', 'bitcoin', 'network', 'hashrate', 'officially', 'breaking', 'zettahash', '000', 'eh', 'threshold', 'exponential', 'explosion', 'of', 'demand', 'from', 'artificial', 'intelligence', 'ai', 'to', 'compute', 'evolved', 'marginal', 'arbitrage', 'strategy', 'into', 'an', 'indispensable', 'flexible', 'load', 'layer', 'infrastructure', 'market', 'is', 'defined', 'by', 'high', 'difficulty', 'compliance', 'while', 'crypto', 'size', 'reached', 'approximately', 'billion', '2025', 'cagr', '12', 'projected']::text[],
        '2.2 Bitcoin Network Economics',
        2,
        207,
        '{"path": "/resources/reports/", "snapshot_kind": "site_html"}'::jsonb,
        'The 2026 average spot price for Henry Hub is projected between $3.46 - $3.85/MMBtu , a significant rebound from the lows of 2024-2025 [17] . For grid-dependent miners, this raises marginal costs. However, for GasGx operators with stranded gas, rising main grid prices actually expand their relative advantage—since stranded gas often has a shadow price near zero (or negative), creating a massive arbitrage opportunity.

#### Canada AECO & Regional Arbitrage

The AECO benchmark price in Alberta is expected to rebound to $3.50-$3.82 CAD/GJ in 2026 [20] . Despite this, remote wells remain physically disconnected from pipelines. Canaan and Aurora AZ Energy''s pilot projects in Calgary utilize this "stranded" gas to bypass pipeline costs and export energy value globally via hashrate [15] .

### 2.2 Bitcoin Network Economics The 2026 average spot price for Henry Hub is projected between $3.46 - $3.85/MMBtu , a significant rebound from the lows of 2024-2025 [17] . For grid-dependent miners, this raises marginal costs. However, for GasGx opera gasgx industry report 2026 natural gas power mining https www com resources reports contents executive summary the industrial convergence in boundary between global digital asset and traditional energy sector has completely blurred with bitcoin network hashrate officially breaking zettahash 000 eh threshold exponential explosion of demand from artificial intelligence ai to compute evolved marginal arbitrage strategy into an indispensable flexible load layer infrastructure market is defined by high difficulty compliance while crypto size reached approximately billion 2025 cagr 12 projected'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/resources/reports/' limit 1),
        'In 2026, the network has fully digested the 2024 halving impact. With hashrate over 1 ZH/s, mining difficulty has surged 36% year-over-year. This growth is driven by hardware efficiency (computing inflation) rather than just price action. Miners with older generation hardware (>30 J/TH) have been flushed out.

### 2.3 The Regulatory Storm

## 3. Technical Infrastructure Evolution

### 3.1 Hardware: The Moore''s Law of 15 J/TH

Mainstream ASIC miners in 2026 have achieved a generational leap in efficiency, compressing from 20+ J/TH in 2024 to 15-16 J/TH [9] . Canaan''s Avalon A15 Pro series has become a star product, specifically optimized for the unstable voltage environments of oil fields.

### 3.2 Cooling Revolution: Immersion Dominance

Immersion Cooling is the 2026 industry standard for GasGx.

- Environment: Completely isolates chips from desert dust or arctic cold [27] .

- Overclocking: Safely boosts hash rate output by 40% due to high specific heat capacity of fluids [11] .

- ROI: Despite higher CAPEX (~$375k/MW), the ROI beats air cooling within 12-18 months [30] .',
        'In 2026, the network has fully digested the 2024 halving impact. With hashrate over 1 ZH/s, mining difficulty has surged 36% year-over-year. This growth is driven by hardware efficiency (computing inflation) rather than ',
        'en',
        array['gasgx', 'industry', 'report', '2026', 'natural', 'gas', 'power', 'mining', 'https', 'www', 'com', 'resources', 'reports', 'contents', 'executive', 'summary', 'the', 'industrial', 'convergence', 'in', 'boundary', 'between', 'global', 'digital', 'asset', 'and', 'traditional', 'energy', 'sector', 'has', 'completely', 'blurred', 'with', 'bitcoin', 'network', 'hashrate', 'officially', 'breaking', 'zettahash', '000', 'eh', 'threshold', 'exponential', 'explosion', 'of', 'demand', 'from', 'artificial', 'intelligence', 'ai', 'to', 'compute', 'evolved', 'marginal', 'arbitrage', 'strategy', 'into', 'an', 'indispensable', 'flexible', 'load', 'layer', 'infrastructure', 'market', 'is', 'defined', 'by', 'high', 'difficulty', 'compliance', 'while', 'crypto', 'size', 'reached', 'approximately', 'billion', '2025', 'cagr', '12', 'projected']::text[],
        '3.3 Modular Generation',
        3,
        271,
        '{"path": "/resources/reports/", "snapshot_kind": "site_html"}'::jsonb,
        'In 2026, the network has fully digested the 2024 halving impact. With hashrate over 1 ZH/s, mining difficulty has surged 36% year-over-year. This growth is driven by hardware efficiency (computing inflation) rather than just price action. Miners with older generation hardware (>30 J/TH) have been flushed out.

### 2.3 The Regulatory Storm

## 3. Technical Infrastructure Evolution

### 3.1 Hardware: The Moore''s Law of 15 J/TH

Mainstream ASIC miners in 2026 have achieved a generational leap in efficiency, compressing from 20+ J/TH in 2024 to 15-16 J/TH [9] . Canaan''s Avalon A15 Pro series has become a star product, specifically optimized for the unstable voltage environments of oil fields.

### 3.2 Cooling Revolution: Immersion Dominance

Immersion Cooling is the 2026 industry standard for GasGx.

- Environment: Completely isolates chips from desert dust or arctic cold [27] .

- Overclocking: Safely boosts hash rate output by 40% due to high specific heat capacity of fluids [11] .

- ROI: Despite higher CAPEX (~$375k/MW), the ROI beats air cooling within 12-18 months [30] . In 2026, the network has fully digested the 2024 halving impact. With hashrate over 1 ZH/s, mining difficulty has surged 36% year-over-year. This growth is driven by hardware efficiency (computing inflation) rather than  gasgx industry report 2026 natural gas power mining https www com resources reports contents executive summary the industrial convergence in boundary between global digital asset and traditional energy sector has completely blurred with bitcoin network hashrate officially breaking zettahash 000 eh threshold exponential explosion of demand from artificial intelligence ai to compute evolved marginal arbitrage strategy into an indispensable flexible load layer infrastructure market is defined by high difficulty compliance while crypto size reached approximately billion 2025 cagr 12 projected'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/resources/reports/' limit 1),
        '### 3.3 Modular Generation

LoadSync technology (patent by Upstream Data) allows millisecond-level synchronization between miner load and generator output, preventing downtime during gas flow fluctuations [31] .

## 4. Business Model & Economic Analysis

### 4.1 Cost Structure (LCOE Analysis)

In stranded gas scenarios, fuel cost is effectively $0. The All-in electricity cost (including O&M) is approximately $0.02 - $0.03/kWh . Compared to the Texas industrial grid rate of $0.05-$0.07/kWh, off-grid GasGx maintains a >50% cost advantage [36] .

Table: 1MW Off-Grid Immersion CAPEX

### 4.2 Revenue Stacking: Carbon Credits

#### Avoiding WEC Fines

For a facility venting 1,000 tons of methane, the fine is $1.5M/year . GasGx eliminates this fine, creating a "negative cost" baseline [30] .

#### TIER Credits (Alberta)

A 1MW project reduces ~12k tons of CO2e annually. At ~$95 CAD/ton, this yields ~$1.2M CAD/year in credit revenue, covering almost all OPEX [15] .

### 4.3 Profitability Sensitivity',
        '### 3.3 Modular Generation

LoadSync technology (patent by Upstream Data) allows millisecond-level synchronization between miner load and generator output, preventing downtime during gas flow fluctuations [31] .

## 4. B',
        'en',
        array['gasgx', 'industry', 'report', '2026', 'natural', 'gas', 'power', 'mining', 'https', 'www', 'com', 'resources', 'reports', 'contents', 'executive', 'summary', 'the', 'industrial', 'convergence', 'in', 'boundary', 'between', 'global', 'digital', 'asset', 'and', 'traditional', 'energy', 'sector', 'has', 'completely', 'blurred', 'with', 'bitcoin', 'network', 'hashrate', 'officially', 'breaking', 'zettahash', '000', 'eh', 'threshold', 'exponential', 'explosion', 'of', 'demand', 'from', 'artificial', 'intelligence', 'ai', 'to', 'compute', 'evolved', 'marginal', 'arbitrage', 'strategy', 'into', 'an', 'indispensable', 'flexible', 'load', 'layer', 'infrastructure', 'market', 'is', 'defined', 'by', 'high', 'difficulty', 'compliance', 'while', 'crypto', 'size', 'reached', 'approximately', 'billion', '2025', 'cagr', '12', 'projected']::text[],
        '4.3 Profitability Sensitivity',
        4,
        251,
        '{"path": "/resources/reports/", "snapshot_kind": "site_html"}'::jsonb,
        '### 3.3 Modular Generation

LoadSync technology (patent by Upstream Data) allows millisecond-level synchronization between miner load and generator output, preventing downtime during gas flow fluctuations [31] .

## 4. Business Model & Economic Analysis

### 4.1 Cost Structure (LCOE Analysis)

In stranded gas scenarios, fuel cost is effectively $0. The All-in electricity cost (including O&M) is approximately $0.02 - $0.03/kWh . Compared to the Texas industrial grid rate of $0.05-$0.07/kWh, off-grid GasGx maintains a >50% cost advantage [36] .

Table: 1MW Off-Grid Immersion CAPEX

### 4.2 Revenue Stacking: Carbon Credits

#### Avoiding WEC Fines

For a facility venting 1,000 tons of methane, the fine is $1.5M/year . GasGx eliminates this fine, creating a "negative cost" baseline [30] .

#### TIER Credits (Alberta)

A 1MW project reduces ~12k tons of CO2e annually. At ~$95 CAD/ton, this yields ~$1.2M CAD/year in credit revenue, covering almost all OPEX [15] .

### 4.3 Profitability Sensitivity ### 3.3 Modular Generation

LoadSync technology (patent by Upstream Data) allows millisecond-level synchronization between miner load and generator output, preventing downtime during gas flow fluctuations [31] .

## 4. B gasgx industry report 2026 natural gas power mining https www com resources reports contents executive summary the industrial convergence in boundary between global digital asset and traditional energy sector has completely blurred with bitcoin network hashrate officially breaking zettahash 000 eh threshold exponential explosion of demand from artificial intelligence ai to compute evolved marginal arbitrage strategy into an indispensable flexible load layer infrastructure market is defined by high difficulty compliance while crypto size reached approximately billion 2025 cagr 12 projected'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/resources/reports/' limit 1),
        'In the 2026 baseline scenario (BTC $90k, Difficulty 1.1 ZH/s), pure mining payback is 8-10 months. When stacking carbon credits or WEC fine avoidance, payback drops to 4-6 months .

Interactive: Analyze Daily Profit based on BTC Price (Y) vs Energy Cost (X)

## 5. Competitive Landscape

The settlement of the patent dispute between Crusoe Energy and Upstream Data [13] has eliminated the legal sword of Damocles, leading to an explosion of modular solutions.

#### Canaan

Transitioning from hardware sales to vertical integration. Partnering with Aurora AZ Energy to operate sites directly, trading "equipment for hashrate" [15] .

#### Crusoe Energy

Pivoting to AI Cloud. Upgrading the narrative to "Green AI Infrastructure" and solving fiber connectivity challenges to attract sovereign fund investment [13] .

#### Greenidge

Hybrid model. Selling power to the grid during peak prices and self-mining during troughs, while introducing AI inference loads [42] .

## 6. From Bitcoin to AI: The Second Curve',
        'In the 2026 baseline scenario (BTC $90k, Difficulty 1.1 ZH/s), pure mining payback is 8-10 months. When stacking carbon credits or WEC fine avoidance, payback drops to 4-6 months .

Interactive: Analyze Daily Profit base',
        'en',
        array['gasgx', 'industry', 'report', '2026', 'natural', 'gas', 'power', 'mining', 'https', 'www', 'com', 'resources', 'reports', 'contents', 'executive', 'summary', 'the', 'industrial', 'convergence', 'in', 'boundary', 'between', 'global', 'digital', 'asset', 'and', 'traditional', 'energy', 'sector', 'has', 'completely', 'blurred', 'with', 'bitcoin', 'network', 'hashrate', 'officially', 'breaking', 'zettahash', '000', 'eh', 'threshold', 'exponential', 'explosion', 'of', 'demand', 'from', 'artificial', 'intelligence', 'ai', 'to', 'compute', 'evolved', 'marginal', 'arbitrage', 'strategy', 'into', 'an', 'indispensable', 'flexible', 'load', 'layer', 'infrastructure', 'market', 'is', 'defined', 'by', 'high', 'difficulty', 'compliance', 'while', 'crypto', 'size', 'reached', 'approximately', 'billion', '2025', 'cagr', '12', 'projected']::text[],
        '6. From Bitcoin to AI: The Second Curve',
        5,
        251,
        '{"path": "/resources/reports/", "snapshot_kind": "site_html"}'::jsonb,
        'In the 2026 baseline scenario (BTC $90k, Difficulty 1.1 ZH/s), pure mining payback is 8-10 months. When stacking carbon credits or WEC fine avoidance, payback drops to 4-6 months .

Interactive: Analyze Daily Profit based on BTC Price (Y) vs Energy Cost (X)

## 5. Competitive Landscape

The settlement of the patent dispute between Crusoe Energy and Upstream Data [13] has eliminated the legal sword of Damocles, leading to an explosion of modular solutions.

#### Canaan

Transitioning from hardware sales to vertical integration. Partnering with Aurora AZ Energy to operate sites directly, trading "equipment for hashrate" [15] .

#### Crusoe Energy

Pivoting to AI Cloud. Upgrading the narrative to "Green AI Infrastructure" and solving fiber connectivity challenges to attract sovereign fund investment [13] .

#### Greenidge

Hybrid model. Selling power to the grid during peak prices and self-mining during troughs, while introducing AI inference loads [42] .

## 6. From Bitcoin to AI: The Second Curve In the 2026 baseline scenario (BTC $90k, Difficulty 1.1 ZH/s), pure mining payback is 8-10 months. When stacking carbon credits or WEC fine avoidance, payback drops to 4-6 months .

Interactive: Analyze Daily Profit base gasgx industry report 2026 natural gas power mining https www com resources reports contents executive summary the industrial convergence in boundary between global digital asset and traditional energy sector has completely blurred with bitcoin network hashrate officially breaking zettahash 000 eh threshold exponential explosion of demand from artificial intelligence ai to compute evolved marginal arbitrage strategy into an indispensable flexible load layer infrastructure market is defined by high difficulty compliance while crypto size reached approximately billion 2025 cagr 12 projected'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/resources/reports/' limit 1),
        'While AI/HPC offers 3-5x the revenue potential per MWh compared to Bitcoin mining, physical constraints limit deployment at remote wells [41] .

- Network Latency: AI training requires fiber optics, which Starlink cannot replace for large clusters.

- The 2026 Reality - Inference at the Edge: GasGx AI attempts focus on Inference and batch rendering. These tasks tolerate higher latency and are suitable for edge gas power plants.

## 7. Future Outlook & Risks

- Regulatory Risk: Despite WEC benefits, environmental groups still challenge GasGx for extending the fossil fuel lifecycle [44] .

- Depletion Risk: Associated gas volume declines over time, necessitating Skid-mounted (mobile) solutions.

- Obsolescence: 30 J/TH machines are effectively e-waste in 2026.

### Conclusion: Distributed Compute Utilities

2026 marks the "Industrial Year One" for GasGx. In 3-5 years, we will see the rise of Distributed Compute Utilities—companies that produce neither oil nor grid electricity, but convert geological energy directly into digital intelligence.

Primary Sources Index',
        'While AI/HPC offers 3-5x the revenue potential per MWh compared to Bitcoin mining, physical constraints limit deployment at remote wells [41] .

- Network Latency: AI training requires fiber optics, which Starlink cannot',
        'en',
        array['gasgx', 'industry', 'report', '2026', 'natural', 'gas', 'power', 'mining', 'https', 'www', 'com', 'resources', 'reports', 'contents', 'executive', 'summary', 'the', 'industrial', 'convergence', 'in', 'boundary', 'between', 'global', 'digital', 'asset', 'and', 'traditional', 'energy', 'sector', 'has', 'completely', 'blurred', 'with', 'bitcoin', 'network', 'hashrate', 'officially', 'breaking', 'zettahash', '000', 'eh', 'threshold', 'exponential', 'explosion', 'of', 'demand', 'from', 'artificial', 'intelligence', 'ai', 'to', 'compute', 'evolved', 'marginal', 'arbitrage', 'strategy', 'into', 'an', 'indispensable', 'flexible', 'load', 'layer', 'infrastructure', 'market', 'is', 'defined', 'by', 'high', 'difficulty', 'compliance', 'while', 'crypto', 'size', 'reached', 'approximately', 'billion', '2025', 'cagr', '12', 'projected']::text[],
        'Conclusion: Distributed Compute Utilities',
        6,
        270,
        '{"path": "/resources/reports/", "snapshot_kind": "site_html"}'::jsonb,
        'While AI/HPC offers 3-5x the revenue potential per MWh compared to Bitcoin mining, physical constraints limit deployment at remote wells [41] .

- Network Latency: AI training requires fiber optics, which Starlink cannot replace for large clusters.

- The 2026 Reality - Inference at the Edge: GasGx AI attempts focus on Inference and batch rendering. These tasks tolerate higher latency and are suitable for edge gas power plants.

## 7. Future Outlook & Risks

- Regulatory Risk: Despite WEC benefits, environmental groups still challenge GasGx for extending the fossil fuel lifecycle [44] .

- Depletion Risk: Associated gas volume declines over time, necessitating Skid-mounted (mobile) solutions.

- Obsolescence: 30 J/TH machines are effectively e-waste in 2026.

### Conclusion: Distributed Compute Utilities

2026 marks the "Industrial Year One" for GasGx. In 3-5 years, we will see the rise of Distributed Compute Utilities—companies that produce neither oil nor grid electricity, but convert geological energy directly into digital intelligence.

Primary Sources Index While AI/HPC offers 3-5x the revenue potential per MWh compared to Bitcoin mining, physical constraints limit deployment at remote wells [41] .

- Network Latency: AI training requires fiber optics, which Starlink cannot gasgx industry report 2026 natural gas power mining https www com resources reports contents executive summary the industrial convergence in boundary between global digital asset and traditional energy sector has completely blurred with bitcoin network hashrate officially breaking zettahash 000 eh threshold exponential explosion of demand from artificial intelligence ai to compute evolved marginal arbitrage strategy into an indispensable flexible load layer infrastructure market is defined by high difficulty compliance while crypto size reached approximately billion 2025 cagr 12 projected'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/resources/reports/' limit 1),
        '[1] The Block: 2026 Bitcoin Mining Outlook

[3] Grand View Research: Mining Market Outlook

[5] Biden White House: Methane Emissions Reduction Action Plan

[7] Alberta.ca: TIER Regulation

[9] Canaan Avalon A15 Technical Specs

[13] Blockspace Media: Crusoe vs Upstream Patent Dispute

[15] PR Newswire: Canaan Inc. Gas-to-Computing Pilot

[30] QuoteColo: Immersion Cooling ROI Analysis

[31] Upstream Data: LoadSync Technology

[36] Earthjustice: Subsidizing Crypto Mining',
        '[1] The Block: 2026 Bitcoin Mining Outlook

[3] Grand View Research: Mining Market Outlook

[5] Biden White House: Methane Emissions Reduction Action Plan

[7] Alberta.ca: TIER Regulation

[9] Canaan Avalon A15 Technical',
        'en',
        array['gasgx', 'industry', 'report', '2026', 'natural', 'gas', 'power', 'mining', 'https', 'www', 'com', 'resources', 'reports', 'contents', 'executive', 'summary', 'the', 'industrial', 'convergence', 'in', 'boundary', 'between', 'global', 'digital', 'asset', 'and', 'traditional', 'energy', 'sector', 'has', 'completely', 'blurred', 'with', 'bitcoin', 'network', 'hashrate', 'officially', 'breaking', 'zettahash', '000', 'eh', 'threshold', 'exponential', 'explosion', 'of', 'demand', 'from', 'artificial', 'intelligence', 'ai', 'to', 'compute', 'evolved', 'marginal', 'arbitrage', 'strategy', 'into', 'an', 'indispensable', 'flexible', 'load', 'layer', 'infrastructure', 'market', 'is', 'defined', 'by', 'high', 'difficulty', 'compliance', 'while', 'crypto', 'size', 'reached', 'approximately', 'billion', '2025', 'cagr', '12', 'projected']::text[],
        'Conclusion: Distributed Compute Utilities',
        7,
        117,
        '{"path": "/resources/reports/", "snapshot_kind": "site_html"}'::jsonb,
        '[1] The Block: 2026 Bitcoin Mining Outlook

[3] Grand View Research: Mining Market Outlook

[5] Biden White House: Methane Emissions Reduction Action Plan

[7] Alberta.ca: TIER Regulation

[9] Canaan Avalon A15 Technical Specs

[13] Blockspace Media: Crusoe vs Upstream Patent Dispute

[15] PR Newswire: Canaan Inc. Gas-to-Computing Pilot

[30] QuoteColo: Immersion Cooling ROI Analysis

[31] Upstream Data: LoadSync Technology

[36] Earthjustice: Subsidizing Crypto Mining [1] The Block: 2026 Bitcoin Mining Outlook

[3] Grand View Research: Mining Market Outlook

[5] Biden White House: Methane Emissions Reduction Action Plan

[7] Alberta.ca: TIER Regulation

[9] Canaan Avalon A15 Technical gasgx industry report 2026 natural gas power mining https www com resources reports contents executive summary the industrial convergence in boundary between global digital asset and traditional energy sector has completely blurred with bitcoin network hashrate officially breaking zettahash 000 eh threshold exponential explosion of demand from artificial intelligence ai to compute evolved marginal arbitrage strategy into an indispensable flexible load layer infrastructure market is defined by high difficulty compliance while crypto size reached approximately billion 2025 cagr 12 projected'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/resources/videos/' limit 1),
        '# Video & Tutorial Library

从“商业模式扫盲”到“深度技术实操”，为您提供完整的视觉化学习路径。深入理解数字火炬缓解 (DFM) 的核心价值。

## 入门必看：商业模式与愿景

### Turning Fireballs into Bitcoin

Crusoe Energy 创始人 Cully Cavness 的经典演讲。通俗易懂地解释了如何利用油田废气解决两大全球难题：能源浪费与高能耗计算。

#### 它是如何运作的？

从井口采气、预处理（脱水/脱硫）、发电机发电到矿箱计算的全流程解构。

## 实地考察：全球项目案例

### 德克萨斯油田的比特币矿场

深入西德克萨斯油田，实拍燃气发电机组与矿箱的连接细节。展示如何在野外环境处理伴生气。

### 阿根廷 Vaca Muerta 的能源主权

聚焦 YPF（阿根廷国家石油公司）如何利用 Vaca Muerta 盆地的搁浅气进行挖矿，实现能源出口。

## 技术深度与实操教程

#### Jenbacher 发电机操作指南

INNIO Jenbacher 燃气引擎的手动启停与基础维护逻辑。

#### 酸性气处理系统演示

胺液（Amine）脱硫塔的设计与工作原理，解决高含硫气体难题。

#### Hash Hut 部署概览

模块化矿箱（Mining Container）的内部结构与快速部署方案。

## 内部培训模块 (Coming Soon)

#### 财务测算模型

LCOE 与 ROI 计算器实操，针对投资人与 CFO。

#### 合规申报指南

艾伯塔省离网豁免申请与 AUC Rule 007 解读。

#### HSE 安全演练

含硫气井 H₂S 泄漏应急演练与呼吸器使用规范。',
        '# Video & Tutorial Library

从“商业模式扫盲”到“深度技术实操”，为您提供完整的视觉化学习路径。深入理解数字火炬缓解 (DFM) 的核心价值。

## 入门必看：商业模式与愿景

### Turning Fireballs into Bitcoin

Crusoe Energy 创始人 Cully Cavness 的经典演讲。通俗易懂地解释了如何利用油田废气解决两大全球难题：能源浪费与高能耗计算。

####',
        'zh',
        array['videos', 'tutorials', 'gasgx', '视频资源库', '视频', '频资', '资源', '源库', 'https', 'www', 'com', 'resources', 'video', 'tutorial', 'library', '商业模式扫盲', '商业', '业模', '模式', '式扫', '扫盲', '深度技术实操', '深度', '度技', '技术', '术实', '实操', '为您提供完整的视觉化学习路径', '为您', '您提', '提供', '供完', '完整', '整的', '的视', '视觉', '觉化', '化学', '学习', '习路', '路径', '深入理解数字火炬缓解', '深入', '入理', '理解', '解数', '数字', '字火', '火炬', '炬缓', '缓解', 'dfm', '的核心价值', '的核', '核心', '心价', '价值', '入门必看', '入门', '门必', '必看', '商业模式与愿景', '式与', '与愿', '愿景', 'turning', 'fireballs', 'into', 'bitcoin', 'crusoe', 'energy', '创始人', '创始', '始人', 'cully', 'cavness', '的经典演讲', '的经', '经典', '典演']::text[],
        'HSE 安全演练',
        0,
        186,
        '{"path": "/resources/videos/", "snapshot_kind": "site_html"}'::jsonb,
        '# Video & Tutorial Library

从“商业模式扫盲”到“深度技术实操”，为您提供完整的视觉化学习路径。深入理解数字火炬缓解 (DFM) 的核心价值。

## 入门必看：商业模式与愿景

### Turning Fireballs into Bitcoin

Crusoe Energy 创始人 Cully Cavness 的经典演讲。通俗易懂地解释了如何利用油田废气解决两大全球难题：能源浪费与高能耗计算。

#### 它是如何运作的？

从井口采气、预处理（脱水/脱硫）、发电机发电到矿箱计算的全流程解构。

## 实地考察：全球项目案例

### 德克萨斯油田的比特币矿场

深入西德克萨斯油田，实拍燃气发电机组与矿箱的连接细节。展示如何在野外环境处理伴生气。

### 阿根廷 Vaca Muerta 的能源主权

聚焦 YPF（阿根廷国家石油公司）如何利用 Vaca Muerta 盆地的搁浅气进行挖矿，实现能源出口。

## 技术深度与实操教程

#### Jenbacher 发电机操作指南

INNIO Jenbacher 燃气引擎的手动启停与基础维护逻辑。

#### 酸性气处理系统演示

胺液（Amine）脱硫塔的设计与工作原理，解决高含硫气体难题。

#### Hash Hut 部署概览

模块化矿箱（Mining Container）的内部结构与快速部署方案。

## 内部培训模块 (Coming Soon)

#### 财务测算模型

LCOE 与 ROI 计算器实操，针对投资人与 CFO。

#### 合规申报指南

艾伯塔省离网豁免申请与 AUC Rule 007 解读。

#### HSE 安全演练

含硫气井 H₂S 泄漏应急演练与呼吸器使用规范。 # Video & Tutorial Library

从“商业模式扫盲”到“深度技术实操”，为您提供完整的视觉化学习路径。深入理解数字火炬缓解 (DFM) 的核心价值。

## 入门必看：商业模式与愿景

### Turning Fireballs into Bitcoin

Crusoe Energy 创始人 Cully Cavness 的经典演讲。通俗易懂地解释了如何利用油田废气解决两大全球难题：能源浪费与高能耗计算。

#### videos tutorials gasgx 视频资源库 视频 频资 资源 源库 https www com resources video tutorial library 商业模式扫盲 商业 业模 模式 式扫 扫盲 深度技术实操 深度 度技 技术 术实 实操 为您提供完整的视觉化学习路径 为您 您提 提供 供完 完整 整的 的视 视觉 觉化 化学 学习 习路 路径 深入理解数字火炬缓解 深入 入理 理解 解数 数字 字火 火炬 炬缓 缓解 dfm 的核心价值 的核 核心 心价 价值 入门必看 入门 门必 必看 商业模式与愿景 式与 与愿 愿景 turning fireballs into bitcoin crusoe energy 创始人 创始 始人 cully cavness 的经典演讲 的经 经典 典演'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/resources/whitepapers/' limit 1),
        '# Stranded Energy Reshaping Global Computation

Transforming 151 billion cubic meters of wasted natural gas into the backbone of the decentralized digital economy and AI infrastructure.

## The Energy-Compute Paradox

We face a dual crisis: The energy sector burns billions of dollars in "stranded gas" due to lack of pipeline infrastructure. Simultaneously, the digital economy—driven by Bitcoin mining and explosive AI growth—is starving for low-cost, reliable power. GasGx bridges this gap through Industrial Symbiosis.

### Market Misalignment

- Wasted Resources Global flaring has returned to 2007 highs. This gas is trapped geographically, making pipeline transport economically unviable.

- Rising Compute Costs Post-halving Bitcoin mining requires electricity under $0.04/kWh. Grid prices often exceed $0.07-$0.12/kWh.

- The GasGx Solution Deploying mobile "Hash Huts" directly to the wellhead. We bring the consumer to the energy, eliminating transmission costs.

#### Global Flaring Leaders vs. Mining Potential

Volume of wasted gas (BCM) by country',
        '# Stranded Energy Reshaping Global Computation

Transforming 151 billion cubic meters of wasted natural gas into the backbone of the decentralized digital economy and AI infrastructure.

## The Energy-Compute Paradox

We',
        'en',
        array['gasgx', 'natural', 'gas', 'power', 'generation', 'mining', 'whitepaper', 'https', 'www', 'com', 'resources', 'whitepapers', 'stranded', 'energy', 'reshaping', 'global', 'computation', 'transforming', '151', 'billion', 'cubic', 'meters', 'of', 'wasted', 'into', 'the', 'backbone', 'decentralized', 'digital', 'economy', 'and', 'ai', 'infrastructure', 'compute', 'paradox', 'we', 'face', 'dual', 'crisis', 'sector', 'burns', 'billions', 'dollars', 'in', 'due', 'to', 'lack', 'pipeline', 'simultaneously', 'driven', 'by', 'bitcoin', 'explosive', 'growth', 'is', 'starving', 'for', 'low', 'cost', 'reliable', 'bridges', 'this', 'gap', 'through', 'industrial', 'symbiosis', 'market', 'misalignment', 'flaring', 'has', 'returned', '2007', 'highs', 'trapped', 'geographically', 'making', 'transport', 'economically', 'unviable', 'rising']::text[],
        'Digital Flare Mitigation Architecture',
        0,
        265,
        '{"path": "/resources/whitepapers/", "snapshot_kind": "site_html"}'::jsonb,
        '# Stranded Energy Reshaping Global Computation

Transforming 151 billion cubic meters of wasted natural gas into the backbone of the decentralized digital economy and AI infrastructure.

## The Energy-Compute Paradox

We face a dual crisis: The energy sector burns billions of dollars in "stranded gas" due to lack of pipeline infrastructure. Simultaneously, the digital economy—driven by Bitcoin mining and explosive AI growth—is starving for low-cost, reliable power. GasGx bridges this gap through Industrial Symbiosis.

### Market Misalignment

- Wasted Resources Global flaring has returned to 2007 highs. This gas is trapped geographically, making pipeline transport economically unviable.

- Rising Compute Costs Post-halving Bitcoin mining requires electricity under $0.04/kWh. Grid prices often exceed $0.07-$0.12/kWh.

- The GasGx Solution Deploying mobile "Hash Huts" directly to the wellhead. We bring the consumer to the energy, eliminating transmission costs.

#### Global Flaring Leaders vs. Mining Potential

Volume of wasted gas (BCM) by country # Stranded Energy Reshaping Global Computation

Transforming 151 billion cubic meters of wasted natural gas into the backbone of the decentralized digital economy and AI infrastructure.

## The Energy-Compute Paradox

We gasgx natural gas power generation mining whitepaper https www com resources whitepapers stranded energy reshaping global computation transforming 151 billion cubic meters of wasted into the backbone decentralized digital economy and ai infrastructure compute paradox we face dual crisis sector burns billions dollars in due to lack pipeline simultaneously driven by bitcoin explosive growth is starving for low cost reliable bridges this gap through industrial symbiosis market misalignment flaring has returned 2007 highs trapped geographically making transport economically unviable rising'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/resources/whitepapers/' limit 1),
        '## Digital Flare Mitigation Architecture

A modular, mobile infrastructure converting hazardous waste into high-performance compute.

### Stranded Gas

Associated petroleum gas (APG) from oil wells or landfill methane is captured instead of burned.

### Generation Unit

Gas flows into reciprocating generators (e.g., MP-500WF) with acid gas treatment capabilities.

### Hash Huts

Electricity powers on-site containerized ASICs or AI GPUs using hydro-cooling (PUE < 1.05).

### Value Output

Output includes Bitcoin rewards, carbon credits (ERUs), and AI inference results.

## Economic Feasibility

The core advantage of GasGx is energy arbitrage . By utilizing "free" or negative-cost fuel (where producers pay to remove gas), the Levelized Cost of Electricity (LCOE) drops significantly below grid parity.

63% Savings

*Based on 2025-2026 projections for North American deployment (Texas/Alberta) using 10MW modular sites.

#### Cost Composition: Grid vs. GasGx Off-Grid

### Profitability Sensitivity Surface

Interactive analysis of Daily Profit based on BTC Price and Energy Cost.',
        '## Digital Flare Mitigation Architecture

A modular, mobile infrastructure converting hazardous waste into high-performance compute.

### Stranded Gas

Associated petroleum gas (APG) from oil wells or landfill methane is',
        'en',
        array['gasgx', 'natural', 'gas', 'power', 'generation', 'mining', 'whitepaper', 'https', 'www', 'com', 'resources', 'whitepapers', 'stranded', 'energy', 'reshaping', 'global', 'computation', 'transforming', '151', 'billion', 'cubic', 'meters', 'of', 'wasted', 'into', 'the', 'backbone', 'decentralized', 'digital', 'economy', 'and', 'ai', 'infrastructure', 'compute', 'paradox', 'we', 'face', 'dual', 'crisis', 'sector', 'burns', 'billions', 'dollars', 'in', 'due', 'to', 'lack', 'pipeline', 'simultaneously', 'driven', 'by', 'bitcoin', 'explosive', 'growth', 'is', 'starving', 'for', 'low', 'cost', 'reliable', 'bridges', 'this', 'gap', 'through', 'industrial', 'symbiosis', 'market', 'misalignment', 'flaring', 'has', 'returned', '2007', 'highs', 'trapped', 'geographically', 'making', 'transport', 'economically', 'unviable', 'rising']::text[],
        'ESG & Carbon Credits',
        1,
        269,
        '{"path": "/resources/whitepapers/", "snapshot_kind": "site_html"}'::jsonb,
        '## Digital Flare Mitigation Architecture

A modular, mobile infrastructure converting hazardous waste into high-performance compute.

### Stranded Gas

Associated petroleum gas (APG) from oil wells or landfill methane is captured instead of burned.

### Generation Unit

Gas flows into reciprocating generators (e.g., MP-500WF) with acid gas treatment capabilities.

### Hash Huts

Electricity powers on-site containerized ASICs or AI GPUs using hydro-cooling (PUE < 1.05).

### Value Output

Output includes Bitcoin rewards, carbon credits (ERUs), and AI inference results.

## Economic Feasibility

The core advantage of GasGx is energy arbitrage . By utilizing "free" or negative-cost fuel (where producers pay to remove gas), the Levelized Cost of Electricity (LCOE) drops significantly below grid parity.

63% Savings

*Based on 2025-2026 projections for North American deployment (Texas/Alberta) using 10MW modular sites.

#### Cost Composition: Grid vs. GasGx Off-Grid

### Profitability Sensitivity Surface

Interactive analysis of Daily Profit based on BTC Price and Energy Cost. ## Digital Flare Mitigation Architecture

A modular, mobile infrastructure converting hazardous waste into high-performance compute.

### Stranded Gas

Associated petroleum gas (APG) from oil wells or landfill methane is gasgx natural gas power generation mining whitepaper https www com resources whitepapers stranded energy reshaping global computation transforming 151 billion cubic meters of wasted into the backbone decentralized digital economy and ai infrastructure compute paradox we face dual crisis sector burns billions dollars in due to lack pipeline simultaneously driven by bitcoin explosive growth is starving for low cost reliable bridges this gap through industrial symbiosis market misalignment flaring has returned 2007 highs trapped geographically making transport economically unviable rising'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/resources/whitepapers/' limit 1),
        '## ESG & Carbon Credits

### The Methane Multiplier Effect

Methane (CH4) is 84x more potent than CO2 over a 20-year period. Venting or inefficient flaring releases vast amounts of CH4.

By using high-efficiency reciprocating engines, GasGx achieves 99.9% combustion efficiency . We convert the methane into CO2 and water vapor. While CO2 is still a greenhouse gas, the net reduction in Global Warming Potential (GWP) is over 63%.

#### World Bank Initiative

Directly supports the "Zero Routine Flaring by 2030" initiative, allowing oil producers to monetize waste while complying with strict EPA and global regulations.

## Future Horizon: From BTC to AI

The infrastructure built for Bitcoin mining today is the foundation for the AI data centers of tomorrow.

### Global Expansion

Expanding beyond North America to Vaca Muerta (Argentina) and Central Asia (Kazakhstan), navigating regulatory landscapes to unlock gigawatts of power.

### AI Transition

Retrofitting sites with HPC GPUs. GasGx sites provide the baseload power stability required for AI inference, unlike intermittent renewables.',
        '## ESG & Carbon Credits

### The Methane Multiplier Effect

Methane (CH4) is 84x more potent than CO2 over a 20-year period. Venting or inefficient flaring releases vast amounts of CH4.

By using high-efficiency reciproc',
        'en',
        array['gasgx', 'natural', 'gas', 'power', 'generation', 'mining', 'whitepaper', 'https', 'www', 'com', 'resources', 'whitepapers', 'stranded', 'energy', 'reshaping', 'global', 'computation', 'transforming', '151', 'billion', 'cubic', 'meters', 'of', 'wasted', 'into', 'the', 'backbone', 'decentralized', 'digital', 'economy', 'and', 'ai', 'infrastructure', 'compute', 'paradox', 'we', 'face', 'dual', 'crisis', 'sector', 'burns', 'billions', 'dollars', 'in', 'due', 'to', 'lack', 'pipeline', 'simultaneously', 'driven', 'by', 'bitcoin', 'explosive', 'growth', 'is', 'starving', 'for', 'low', 'cost', 'reliable', 'bridges', 'this', 'gap', 'through', 'industrial', 'symbiosis', 'market', 'misalignment', 'flaring', 'has', 'returned', '2007', 'highs', 'trapped', 'geographically', 'making', 'transport', 'economically', 'unviable', 'rising']::text[],
        'Financialization',
        2,
        275,
        '{"path": "/resources/whitepapers/", "snapshot_kind": "site_html"}'::jsonb,
        '## ESG & Carbon Credits

### The Methane Multiplier Effect

Methane (CH4) is 84x more potent than CO2 over a 20-year period. Venting or inefficient flaring releases vast amounts of CH4.

By using high-efficiency reciprocating engines, GasGx achieves 99.9% combustion efficiency . We convert the methane into CO2 and water vapor. While CO2 is still a greenhouse gas, the net reduction in Global Warming Potential (GWP) is over 63%.

#### World Bank Initiative

Directly supports the "Zero Routine Flaring by 2030" initiative, allowing oil producers to monetize waste while complying with strict EPA and global regulations.

## Future Horizon: From BTC to AI

The infrastructure built for Bitcoin mining today is the foundation for the AI data centers of tomorrow.

### Global Expansion

Expanding beyond North America to Vaca Muerta (Argentina) and Central Asia (Kazakhstan), navigating regulatory landscapes to unlock gigawatts of power.

### AI Transition

Retrofitting sites with HPC GPUs. GasGx sites provide the baseload power stability required for AI inference, unlike intermittent renewables. ## ESG & Carbon Credits

### The Methane Multiplier Effect

Methane (CH4) is 84x more potent than CO2 over a 20-year period. Venting or inefficient flaring releases vast amounts of CH4.

By using high-efficiency reciproc gasgx natural gas power generation mining whitepaper https www com resources whitepapers stranded energy reshaping global computation transforming 151 billion cubic meters of wasted into the backbone decentralized digital economy and ai infrastructure compute paradox we face dual crisis sector burns billions dollars in due to lack pipeline simultaneously driven by bitcoin explosive growth is starving for low cost reliable bridges this gap through industrial symbiosis market misalignment flaring has returned 2007 highs trapped geographically making transport economically unviable rising'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/resources/whitepapers/' limit 1),
        '### Financialization

Tokenization of Real World Assets (RWA). GasGx aims to create asset-backed securities based on the hash rate and carbon credits generated.

#### Projected Global Power Demand (2024-2030)

### Snapshot Generated!

Full page captured successfully.',
        '### Financialization

Tokenization of Real World Assets (RWA). GasGx aims to create asset-backed securities based on the hash rate and carbon credits generated.

#### Projected Global Power Demand (2024-2030)

### Snapsh',
        'en',
        array['gasgx', 'natural', 'gas', 'power', 'generation', 'mining', 'whitepaper', 'https', 'www', 'com', 'resources', 'whitepapers', 'stranded', 'energy', 'reshaping', 'global', 'computation', 'transforming', '151', 'billion', 'cubic', 'meters', 'of', 'wasted', 'into', 'the', 'backbone', 'decentralized', 'digital', 'economy', 'and', 'ai', 'infrastructure', 'compute', 'paradox', 'we', 'face', 'dual', 'crisis', 'sector', 'burns', 'billions', 'dollars', 'in', 'due', 'to', 'lack', 'pipeline', 'simultaneously', 'driven', 'by', 'bitcoin', 'explosive', 'growth', 'is', 'starving', 'for', 'low', 'cost', 'reliable', 'bridges', 'this', 'gap', 'through', 'industrial', 'symbiosis', 'market', 'misalignment', 'flaring', 'has', 'returned', '2007', 'highs', 'trapped', 'geographically', 'making', 'transport', 'economically', 'unviable', 'rising']::text[],
        'Snapshot Generated!',
        3,
        66,
        '{"path": "/resources/whitepapers/", "snapshot_kind": "site_html"}'::jsonb,
        '### Financialization

Tokenization of Real World Assets (RWA). GasGx aims to create asset-backed securities based on the hash rate and carbon credits generated.

#### Projected Global Power Demand (2024-2030)

### Snapshot Generated!

Full page captured successfully. ### Financialization

Tokenization of Real World Assets (RWA). GasGx aims to create asset-backed securities based on the hash rate and carbon credits generated.

#### Projected Global Power Demand (2024-2030)

### Snapsh gasgx natural gas power generation mining whitepaper https www com resources whitepapers stranded energy reshaping global computation transforming 151 billion cubic meters of wasted into the backbone decentralized digital economy and ai infrastructure compute paradox we face dual crisis sector burns billions dollars in due to lack pipeline simultaneously driven by bitcoin explosive growth is starving for low cost reliable bridges this gap through industrial symbiosis market misalignment flaring has returned 2007 highs trapped geographically making transport economically unviable rising'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/solutions/' limit 1),
        '# Efficiency Beyond Electricity (80%+)

Don''t just burn gas for power. Capture the heat. Transform waste into steam, cooling, or carbon-negative agriculture, boosting system efficiency from 35% to over 80%.

### System Efficiency Comparison

## Technology Path

We deploy advanced thermal capture systems tailored to your engine type and mining setup.

- HRSG (Exhaust Gas) Heat Recovery Steam Generators capture 400°C+ exhaust to produce high-pressure steam for industrial use.

#### HRSG (Exhaust Gas)

Heat Recovery Steam Generators capture 400°C+ exhaust to produce high-pressure steam for industrial use.

- Liquid Cooling Loops Plate heat exchangers recycle 60°C hot water from hydro-cooled miners for greenhouse heating or district warming.

#### Liquid Cooling Loops

Plate heat exchangers recycle 60°C hot water from hydro-cooled miners for greenhouse heating or district warming.

## Triple Revenue Streams

Monetize the Electron (Mining), the Molecule (Gas), and the Thermal Unit (Heat).

### Industrial Steam',
        '# Efficiency Beyond Electricity (80%+)

Don''t just burn gas for power. Capture the heat. Transform waste into steam, cooling, or carbon-negative agriculture, boosting system efficiency from 35% to over 80%.

### System E',
        'en',
        array['chp', 'heat', 'recovery', 'solutions', 'gasgx', 'https', 'www', 'com', 'efficiency', 'beyond', 'electricity', '80', 'don', 'just', 'burn', 'gas', 'for', 'power', 'capture', 'the', 'transform', 'waste', 'into', 'steam', 'cooling', 'or', 'carbon', 'negative', 'agriculture', 'boosting', 'system', 'from', '35', 'to', 'over', 'comparison', 'technology', 'path', 'we', 'deploy', 'advanced', 'thermal', 'systems', 'tailored', 'your', 'engine', 'type', 'and', 'mining', 'setup', 'hrsg', 'exhaust', 'generators', '400', 'produce', 'high', 'pressure', 'industrial', 'use', 'liquid', 'loops', 'plate', 'exchangers', 'recycle', '60', 'hot', 'water', 'hydro', 'cooled', 'miners', 'greenhouse', 'heating', 'district', 'warming', 'triple', 'revenue', 'streams', 'monetize', 'electron', 'molecule']::text[],
        'Industrial Steam',
        0,
        254,
        '{"path": "/solutions/", "snapshot_kind": "site_html"}'::jsonb,
        '# Efficiency Beyond Electricity (80%+)

Don''t just burn gas for power. Capture the heat. Transform waste into steam, cooling, or carbon-negative agriculture, boosting system efficiency from 35% to over 80%.

### System Efficiency Comparison

## Technology Path

We deploy advanced thermal capture systems tailored to your engine type and mining setup.

- HRSG (Exhaust Gas) Heat Recovery Steam Generators capture 400°C+ exhaust to produce high-pressure steam for industrial use.

#### HRSG (Exhaust Gas)

Heat Recovery Steam Generators capture 400°C+ exhaust to produce high-pressure steam for industrial use.

- Liquid Cooling Loops Plate heat exchangers recycle 60°C hot water from hydro-cooled miners for greenhouse heating or district warming.

#### Liquid Cooling Loops

Plate heat exchangers recycle 60°C hot water from hydro-cooled miners for greenhouse heating or district warming.

## Triple Revenue Streams

Monetize the Electron (Mining), the Molecule (Gas), and the Thermal Unit (Heat).

### Industrial Steam # Efficiency Beyond Electricity (80%+)

Don''t just burn gas for power. Capture the heat. Transform waste into steam, cooling, or carbon-negative agriculture, boosting system efficiency from 35% to over 80%.

### System E chp heat recovery solutions gasgx https www com efficiency beyond electricity 80 don just burn gas for power capture the transform waste into steam cooling or carbon negative agriculture boosting system from 35 to over comparison technology path we deploy advanced thermal systems tailored your engine type and mining setup hrsg exhaust generators 400 produce high pressure industrial use liquid loops plate exchangers recycle 60 hot water hydro cooled miners greenhouse heating district warming triple revenue streams monetize electron molecule'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/solutions/' limit 1),
        'Sell process steam to nearby factories (paper, chemical, food processing). Steam is often priced equivalent to ~$0.04/kWh, creating a stable third revenue stream independent of crypto prices.

### Carbon Sink Agriculture

"Heat-Power-Carbon" Loop. Waste heat warms greenhouses, while scrubbed CO2 from exhaust is piped in to boost photosynthesis by 30%. Ref: Genesis Digital Assets Projects.

### District Cooling (CCHP)

Combined Cooling, Heat and Power. Use Absorption Chillers to convert waste heat into cooling for the data center itself or nearby buildings, significantly lowering the PUE (Power Usage Effectiveness).',
        'Sell process steam to nearby factories (paper, chemical, food processing). Steam is often priced equivalent to ~$0.04/kWh, creating a stable third revenue stream independent of crypto prices.

### Carbon Sink Agriculture',
        'en',
        array['chp', 'heat', 'recovery', 'solutions', 'gasgx', 'https', 'www', 'com', 'efficiency', 'beyond', 'electricity', '80', 'don', 'just', 'burn', 'gas', 'for', 'power', 'capture', 'the', 'transform', 'waste', 'into', 'steam', 'cooling', 'or', 'carbon', 'negative', 'agriculture', 'boosting', 'system', 'from', '35', 'to', 'over', 'comparison', 'technology', 'path', 'we', 'deploy', 'advanced', 'thermal', 'systems', 'tailored', 'your', 'engine', 'type', 'and', 'mining', 'setup', 'hrsg', 'exhaust', 'generators', '400', 'produce', 'high', 'pressure', 'industrial', 'use', 'liquid', 'loops', 'plate', 'exchangers', 'recycle', '60', 'hot', 'water', 'hydro', 'cooled', 'miners', 'greenhouse', 'heating', 'district', 'warming', 'triple', 'revenue', 'streams', 'monetize', 'electron', 'molecule']::text[],
        'District Cooling (CCHP)',
        1,
        155,
        '{"path": "/solutions/", "snapshot_kind": "site_html"}'::jsonb,
        'Sell process steam to nearby factories (paper, chemical, food processing). Steam is often priced equivalent to ~$0.04/kWh, creating a stable third revenue stream independent of crypto prices.

### Carbon Sink Agriculture

"Heat-Power-Carbon" Loop. Waste heat warms greenhouses, while scrubbed CO2 from exhaust is piped in to boost photosynthesis by 30%. Ref: Genesis Digital Assets Projects.

### District Cooling (CCHP)

Combined Cooling, Heat and Power. Use Absorption Chillers to convert waste heat into cooling for the data center itself or nearby buildings, significantly lowering the PUE (Power Usage Effectiveness). Sell process steam to nearby factories (paper, chemical, food processing). Steam is often priced equivalent to ~$0.04/kWh, creating a stable third revenue stream independent of crypto prices.

### Carbon Sink Agriculture chp heat recovery solutions gasgx https www com efficiency beyond electricity 80 don just burn gas for power capture the transform waste into steam cooling or carbon negative agriculture boosting system from 35 to over comparison technology path we deploy advanced thermal systems tailored your engine type and mining setup hrsg exhaust generators 400 produce high pressure industrial use liquid loops plate exchangers recycle 60 hot water hydro cooled miners greenhouse heating district warming triple revenue streams monetize electron molecule'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/solutions/chp/' limit 1),
        '# Efficiency Beyond Electricity (80%+)

Don''t just burn gas for power. Capture the heat. Transform waste into steam, cooling, or carbon-negative agriculture, boosting system efficiency from 35% to over 80%.

### System Efficiency Comparison

## Technology Path

We deploy advanced thermal capture systems tailored to your engine type and mining setup.

- HRSG (Exhaust Gas) Heat Recovery Steam Generators capture 400°C+ exhaust to produce high-pressure steam for industrial use.

#### HRSG (Exhaust Gas)

Heat Recovery Steam Generators capture 400°C+ exhaust to produce high-pressure steam for industrial use.

- Liquid Cooling Loops Plate heat exchangers recycle 60°C hot water from hydro-cooled miners for greenhouse heating or district warming.

#### Liquid Cooling Loops

Plate heat exchangers recycle 60°C hot water from hydro-cooled miners for greenhouse heating or district warming.

## Triple Revenue Streams

Monetize the Electron (Mining), the Molecule (Gas), and the Thermal Unit (Heat).

### Industrial Steam',
        '# Efficiency Beyond Electricity (80%+)

Don''t just burn gas for power. Capture the heat. Transform waste into steam, cooling, or carbon-negative agriculture, boosting system efficiency from 35% to over 80%.

### System E',
        'en',
        array['chp', 'heat', 'recovery', 'solutions', 'gasgx', 'https', 'www', 'com', 'efficiency', 'beyond', 'electricity', '80', 'don', 'just', 'burn', 'gas', 'for', 'power', 'capture', 'the', 'transform', 'waste', 'into', 'steam', 'cooling', 'or', 'carbon', 'negative', 'agriculture', 'boosting', 'system', 'from', '35', 'to', 'over', 'comparison', 'technology', 'path', 'we', 'deploy', 'advanced', 'thermal', 'systems', 'tailored', 'your', 'engine', 'type', 'and', 'mining', 'setup', 'hrsg', 'exhaust', 'generators', '400', 'produce', 'high', 'pressure', 'industrial', 'use', 'liquid', 'loops', 'plate', 'exchangers', 'recycle', '60', 'hot', 'water', 'hydro', 'cooled', 'miners', 'greenhouse', 'heating', 'district', 'warming', 'triple', 'revenue', 'streams', 'monetize', 'electron', 'molecule']::text[],
        'Industrial Steam',
        0,
        254,
        '{"path": "/solutions/chp/", "snapshot_kind": "site_html"}'::jsonb,
        '# Efficiency Beyond Electricity (80%+)

Don''t just burn gas for power. Capture the heat. Transform waste into steam, cooling, or carbon-negative agriculture, boosting system efficiency from 35% to over 80%.

### System Efficiency Comparison

## Technology Path

We deploy advanced thermal capture systems tailored to your engine type and mining setup.

- HRSG (Exhaust Gas) Heat Recovery Steam Generators capture 400°C+ exhaust to produce high-pressure steam for industrial use.

#### HRSG (Exhaust Gas)

Heat Recovery Steam Generators capture 400°C+ exhaust to produce high-pressure steam for industrial use.

- Liquid Cooling Loops Plate heat exchangers recycle 60°C hot water from hydro-cooled miners for greenhouse heating or district warming.

#### Liquid Cooling Loops

Plate heat exchangers recycle 60°C hot water from hydro-cooled miners for greenhouse heating or district warming.

## Triple Revenue Streams

Monetize the Electron (Mining), the Molecule (Gas), and the Thermal Unit (Heat).

### Industrial Steam # Efficiency Beyond Electricity (80%+)

Don''t just burn gas for power. Capture the heat. Transform waste into steam, cooling, or carbon-negative agriculture, boosting system efficiency from 35% to over 80%.

### System E chp heat recovery solutions gasgx https www com efficiency beyond electricity 80 don just burn gas for power capture the transform waste into steam cooling or carbon negative agriculture boosting system from 35 to over comparison technology path we deploy advanced thermal systems tailored your engine type and mining setup hrsg exhaust generators 400 produce high pressure industrial use liquid loops plate exchangers recycle 60 hot water hydro cooled miners greenhouse heating district warming triple revenue streams monetize electron molecule'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/solutions/chp/' limit 1),
        'Sell process steam to nearby factories (paper, chemical, food processing). Steam is often priced equivalent to ~$0.04/kWh, creating a stable third revenue stream independent of crypto prices.

### Carbon Sink Agriculture

"Heat-Power-Carbon" Loop. Waste heat warms greenhouses, while scrubbed CO2 from exhaust is piped in to boost photosynthesis by 30%. Ref: Genesis Digital Assets Projects.

### District Cooling (CCHP)

Combined Cooling, Heat and Power. Use Absorption Chillers to convert waste heat into cooling for the data center itself or nearby buildings, significantly lowering the PUE (Power Usage Effectiveness).',
        'Sell process steam to nearby factories (paper, chemical, food processing). Steam is often priced equivalent to ~$0.04/kWh, creating a stable third revenue stream independent of crypto prices.

### Carbon Sink Agriculture',
        'en',
        array['chp', 'heat', 'recovery', 'solutions', 'gasgx', 'https', 'www', 'com', 'efficiency', 'beyond', 'electricity', '80', 'don', 'just', 'burn', 'gas', 'for', 'power', 'capture', 'the', 'transform', 'waste', 'into', 'steam', 'cooling', 'or', 'carbon', 'negative', 'agriculture', 'boosting', 'system', 'from', '35', 'to', 'over', 'comparison', 'technology', 'path', 'we', 'deploy', 'advanced', 'thermal', 'systems', 'tailored', 'your', 'engine', 'type', 'and', 'mining', 'setup', 'hrsg', 'exhaust', 'generators', '400', 'produce', 'high', 'pressure', 'industrial', 'use', 'liquid', 'loops', 'plate', 'exchangers', 'recycle', '60', 'hot', 'water', 'hydro', 'cooled', 'miners', 'greenhouse', 'heating', 'district', 'warming', 'triple', 'revenue', 'streams', 'monetize', 'electron', 'molecule']::text[],
        'District Cooling (CCHP)',
        1,
        155,
        '{"path": "/solutions/chp/", "snapshot_kind": "site_html"}'::jsonb,
        'Sell process steam to nearby factories (paper, chemical, food processing). Steam is often priced equivalent to ~$0.04/kWh, creating a stable third revenue stream independent of crypto prices.

### Carbon Sink Agriculture

"Heat-Power-Carbon" Loop. Waste heat warms greenhouses, while scrubbed CO2 from exhaust is piped in to boost photosynthesis by 30%. Ref: Genesis Digital Assets Projects.

### District Cooling (CCHP)

Combined Cooling, Heat and Power. Use Absorption Chillers to convert waste heat into cooling for the data center itself or nearby buildings, significantly lowering the PUE (Power Usage Effectiveness). Sell process steam to nearby factories (paper, chemical, food processing). Steam is often priced equivalent to ~$0.04/kWh, creating a stable third revenue stream independent of crypto prices.

### Carbon Sink Agriculture chp heat recovery solutions gasgx https www com efficiency beyond electricity 80 don just burn gas for power capture the transform waste into steam cooling or carbon negative agriculture boosting system from 35 to over comparison technology path we deploy advanced thermal systems tailored your engine type and mining setup hrsg exhaust generators 400 produce high pressure industrial use liquid loops plate exchangers recycle 60 hot water hydro cooled miners greenhouse heating district warming triple revenue streams monetize electron molecule'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/solutions/industrial/' limit 1),
        '# Independent Power Behind the Meter

Bypass grid delays and volatility. Deploy gas-powered microgrids with flexible loads to secure 24/7 power for AI and industrial parks.

### Power Demand Forecast

Data Centers Power Demand Growth (2030)

Grid capacity cannot keep up. Behind-the-meter generation is the only viable bridge for rapid deployment.

## Behind-the-Meter & Microgrids

Solving the interconnection queue and pricing volatility with autonomous energy infrastructure.

### Baseload Power Security

Renewables are intermittent. Natural gas engines provide dispatchable, 24/7 baseload power essential for AI data centers and industrial processes, bridging the gap when sun and wind fail.

- 99% Availability

- Grid Independence

### Flex Load Management

Deploy Bitcoin miners as "interruptible load". During peak grid demand or high prices, miners shut down instantly, releasing power back to the park or selling to the grid (Demand Response).

- Economic Optimization

- Grid Balancing Service

### Infrastructure Avoidance',
        '# Independent Power Behind the Meter

Bypass grid delays and volatility. Deploy gas-powered microgrids with flexible loads to secure 24/7 power for AI and industrial parks.

### Power Demand Forecast

Data Centers Power ',
        'en',
        array['industrial', 'power', 'microgrids', 'gasgx', 'https', 'www', 'com', 'solutions', 'independent', 'behind', 'the', 'meter', 'bypass', 'grid', 'delays', 'and', 'volatility', 'deploy', 'gas', 'powered', 'with', 'flexible', 'loads', 'to', 'secure', '24', 'for', 'ai', 'parks', 'demand', 'forecast', 'data', 'centers', 'growth', '2030', 'capacity', 'cannot', 'keep', 'up', 'generation', 'is', 'only', 'viable', 'bridge', 'rapid', 'deployment', 'solving', 'interconnection', 'queue', 'pricing', 'autonomous', 'energy', 'infrastructure', 'baseload', 'security', 'renewables', 'are', 'intermittent', 'natural', 'engines', 'provide', 'dispatchable', 'essential', 'processes', 'bridging', 'gap', 'when', 'sun', 'wind', 'fail', '99', 'availability', 'independence', 'flex', 'load', 'management', 'bitcoin', 'miners', 'as', 'interruptible']::text[],
        'Infrastructure Avoidance',
        0,
        256,
        '{"path": "/solutions/industrial/", "snapshot_kind": "site_html"}'::jsonb,
        '# Independent Power Behind the Meter

Bypass grid delays and volatility. Deploy gas-powered microgrids with flexible loads to secure 24/7 power for AI and industrial parks.

### Power Demand Forecast

Data Centers Power Demand Growth (2030)

Grid capacity cannot keep up. Behind-the-meter generation is the only viable bridge for rapid deployment.

## Behind-the-Meter & Microgrids

Solving the interconnection queue and pricing volatility with autonomous energy infrastructure.

### Baseload Power Security

Renewables are intermittent. Natural gas engines provide dispatchable, 24/7 baseload power essential for AI data centers and industrial processes, bridging the gap when sun and wind fail.

- 99% Availability

- Grid Independence

### Flex Load Management

Deploy Bitcoin miners as "interruptible load". During peak grid demand or high prices, miners shut down instantly, releasing power back to the park or selling to the grid (Demand Response).

- Economic Optimization

- Grid Balancing Service

### Infrastructure Avoidance # Independent Power Behind the Meter

Bypass grid delays and volatility. Deploy gas-powered microgrids with flexible loads to secure 24/7 power for AI and industrial parks.

### Power Demand Forecast

Data Centers Power  industrial power microgrids gasgx https www com solutions independent behind the meter bypass grid delays and volatility deploy gas powered with flexible loads to secure 24 for ai parks demand forecast data centers growth 2030 capacity cannot keep up generation is only viable bridge rapid deployment solving interconnection queue pricing autonomous energy infrastructure baseload security renewables are intermittent natural engines provide dispatchable essential processes bridging gap when sun wind fail 99 availability independence flex load management bitcoin miners as interruptible'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/solutions/industrial/' limit 1),
        'Bypass the multi-year wait for transmission line permits. "Gas-Compute Direct Connection" locates computing power directly at the fuel source, eliminating transmission congestion.

- Speed to Market

- No Transmission Loss

#### Riot Platforms (Texas)

## Turning Energy into an Asset

Riot Platforms utilizes a massive flexible load strategy in Texas (ERCOT). By curtailing mining operations during heatwaves, they return hundreds of megawatts to the grid.

" Through demand response programs, miners act as a virtual battery, stabilizing the grid while earning significant energy credits. "',
        'Bypass the multi-year wait for transmission line permits. "Gas-Compute Direct Connection" locates computing power directly at the fuel source, eliminating transmission congestion.

- Speed to Market

- No Transmission Lo',
        'en',
        array['industrial', 'power', 'microgrids', 'gasgx', 'https', 'www', 'com', 'solutions', 'independent', 'behind', 'the', 'meter', 'bypass', 'grid', 'delays', 'and', 'volatility', 'deploy', 'gas', 'powered', 'with', 'flexible', 'loads', 'to', 'secure', '24', 'for', 'ai', 'parks', 'demand', 'forecast', 'data', 'centers', 'growth', '2030', 'capacity', 'cannot', 'keep', 'up', 'generation', 'is', 'only', 'viable', 'bridge', 'rapid', 'deployment', 'solving', 'interconnection', 'queue', 'pricing', 'autonomous', 'energy', 'infrastructure', 'baseload', 'security', 'renewables', 'are', 'intermittent', 'natural', 'engines', 'provide', 'dispatchable', 'essential', 'processes', 'bridging', 'gap', 'when', 'sun', 'wind', 'fail', '99', 'availability', 'independence', 'flex', 'load', 'management', 'bitcoin', 'miners', 'as', 'interruptible']::text[],
        'Turning Energy into an Asset',
        1,
        148,
        '{"path": "/solutions/industrial/", "snapshot_kind": "site_html"}'::jsonb,
        'Bypass the multi-year wait for transmission line permits. "Gas-Compute Direct Connection" locates computing power directly at the fuel source, eliminating transmission congestion.

- Speed to Market

- No Transmission Loss

#### Riot Platforms (Texas)

## Turning Energy into an Asset

Riot Platforms utilizes a massive flexible load strategy in Texas (ERCOT). By curtailing mining operations during heatwaves, they return hundreds of megawatts to the grid.

" Through demand response programs, miners act as a virtual battery, stabilizing the grid while earning significant energy credits. " Bypass the multi-year wait for transmission line permits. "Gas-Compute Direct Connection" locates computing power directly at the fuel source, eliminating transmission congestion.

- Speed to Market

- No Transmission Lo industrial power microgrids gasgx https www com solutions independent behind the meter bypass grid delays and volatility deploy gas powered with flexible loads to secure 24 for ai parks demand forecast data centers growth 2030 capacity cannot keep up generation is only viable bridge rapid deployment solving interconnection queue pricing autonomous energy infrastructure baseload security renewables are intermittent natural engines provide dispatchable essential processes bridging gap when sun wind fail 99 availability independence flex load management bitcoin miners as interruptible'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/solutions/mining/' limit 1),
        '# From Mining to High-Density AI

Transition from Bitcoin mining to High Performance Computing (HPC). Secure low-cost off-grid power for the next generation of liquid-cooled ASIC and AI infrastructure.

### 2025 Grid Reality

High Volatility Risk

### GasGx Off-Grid Solution

Survival Mode & AI Ready

### Power Cost Arbitrage

Grid rates kill profitability. With commercial grid mining costs hitting ~$130k/BTC, off-grid natural gas generation is the only way to lock in low OPEX, survive halving cycles, and pivot infrastructure to AI.

### Hydro & Immersion Cooling

Supporting the heat density of Antminer S21 XP Hydro and AI servers. Liquid cooling enables operation in 50°C+ desert oilfields while keeping chips stable for overclocking or continuous training loads.

### Connectivity Upgrade

Mining works on Starlink, but AI demands low latency. Our site selection now prioritizes fiber proximity or microwave links to enable real-time inference and high-speed model training data transfer.

#### Gas → Power → Compute

## The AI Infrastructure Play',
        '# From Mining to High-Density AI

Transition from Bitcoin mining to High Performance Computing (HPC). Secure low-cost off-grid power for the next generation of liquid-cooled ASIC and AI infrastructure.

### 2025 Grid Rea',
        'en',
        array['mining', 'ai', 'power', 'solutions', 'gasgx', 'https', 'www', 'com', 'from', 'to', 'high', 'density', 'transition', 'bitcoin', 'performance', 'computing', 'hpc', 'secure', 'low', 'cost', 'off', 'grid', 'for', 'the', 'next', 'generation', 'of', 'liquid', 'cooled', 'asic', 'and', 'infrastructure', '2025', 'reality', 'volatility', 'risk', 'solution', 'survival', 'mode', 'ready', 'arbitrage', 'rates', 'kill', 'profitability', 'with', 'commercial', 'costs', 'hitting', '130k', 'btc', 'natural', 'gas', 'is', 'only', 'way', 'lock', 'in', 'opex', 'survive', 'halving', 'cycles', 'pivot', 'hydro', 'immersion', 'cooling', 'supporting', 'heat', 'antminer', 's21', 'xp', 'servers', 'enables', 'operation', '50', 'desert', 'oilfields', 'while', 'keeping', 'chips', 'stable']::text[],
        'The AI Infrastructure Play',
        0,
        263,
        '{"path": "/solutions/mining/", "snapshot_kind": "site_html"}'::jsonb,
        '# From Mining to High-Density AI

Transition from Bitcoin mining to High Performance Computing (HPC). Secure low-cost off-grid power for the next generation of liquid-cooled ASIC and AI infrastructure.

### 2025 Grid Reality

High Volatility Risk

### GasGx Off-Grid Solution

Survival Mode & AI Ready

### Power Cost Arbitrage

Grid rates kill profitability. With commercial grid mining costs hitting ~$130k/BTC, off-grid natural gas generation is the only way to lock in low OPEX, survive halving cycles, and pivot infrastructure to AI.

### Hydro & Immersion Cooling

Supporting the heat density of Antminer S21 XP Hydro and AI servers. Liquid cooling enables operation in 50°C+ desert oilfields while keeping chips stable for overclocking or continuous training loads.

### Connectivity Upgrade

Mining works on Starlink, but AI demands low latency. Our site selection now prioritizes fiber proximity or microwave links to enable real-time inference and high-speed model training data transfer.

#### Gas → Power → Compute

## The AI Infrastructure Play # From Mining to High-Density AI

Transition from Bitcoin mining to High Performance Computing (HPC). Secure low-cost off-grid power for the next generation of liquid-cooled ASIC and AI infrastructure.

### 2025 Grid Rea mining ai power solutions gasgx https www com from to high density transition bitcoin performance computing hpc secure low cost off grid for the next generation of liquid cooled asic and infrastructure 2025 reality volatility risk solution survival mode ready arbitrage rates kill profitability with commercial costs hitting 130k btc natural gas is only way lock in opex survive halving cycles pivot hydro immersion cooling supporting heat antminer s21 xp servers enables operation 50 desert oilfields while keeping chips stable'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/solutions/mining/' limit 1),
        'The bear market for mining is the bull market for AI infrastructure. Your natural gas generators don''t care if they are powering SHA-256 hashes or LLM training.

- Flexible Strategy Start with mining to monetize gas immediately. Upgrade to Tier 3/4 containerized data centers for AI clients when fiber arrives.',
        'The bear market for mining is the bull market for AI infrastructure. Your natural gas generators don''t care if they are powering SHA-256 hashes or LLM training.

- Flexible Strategy Start with mining to monetize gas imme',
        'en',
        array['mining', 'ai', 'power', 'solutions', 'gasgx', 'https', 'www', 'com', 'from', 'to', 'high', 'density', 'transition', 'bitcoin', 'performance', 'computing', 'hpc', 'secure', 'low', 'cost', 'off', 'grid', 'for', 'the', 'next', 'generation', 'of', 'liquid', 'cooled', 'asic', 'and', 'infrastructure', '2025', 'reality', 'volatility', 'risk', 'solution', 'survival', 'mode', 'ready', 'arbitrage', 'rates', 'kill', 'profitability', 'with', 'commercial', 'costs', 'hitting', '130k', 'btc', 'natural', 'gas', 'is', 'only', 'way', 'lock', 'in', 'opex', 'survive', 'halving', 'cycles', 'pivot', 'hydro', 'immersion', 'cooling', 'supporting', 'heat', 'antminer', 's21', 'xp', 'servers', 'enables', 'operation', '50', 'desert', 'oilfields', 'while', 'keeping', 'chips', 'stable']::text[],
        'The AI Infrastructure Play',
        1,
        77,
        '{"path": "/solutions/mining/", "snapshot_kind": "site_html"}'::jsonb,
        'The bear market for mining is the bull market for AI infrastructure. Your natural gas generators don''t care if they are powering SHA-256 hashes or LLM training.

- Flexible Strategy Start with mining to monetize gas immediately. Upgrade to Tier 3/4 containerized data centers for AI clients when fiber arrives. The bear market for mining is the bull market for AI infrastructure. Your natural gas generators don''t care if they are powering SHA-256 hashes or LLM training.

- Flexible Strategy Start with mining to monetize gas imme mining ai power solutions gasgx https www com from to high density transition bitcoin performance computing hpc secure low cost off grid for the next generation of liquid cooled asic and infrastructure 2025 reality volatility risk solution survival mode ready arbitrage rates kill profitability with commercial costs hitting 130k btc natural gas is only way lock in opex survive halving cycles pivot hydro immersion cooling supporting heat antminer s21 xp servers enables operation 50 desert oilfields while keeping chips stable'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/solutions/oilfield/' limit 1),
        '# Turn Flared Gas into Digital Gold

Deploy modular data centers directly at the wellhead. Zero routine flaring, 99.9% combustion efficiency, and monetized energy.

## Digital Flare Mitigation (DFM)

A three-step engineered process to convert stranded gas liabilities into high-performance computing assets.

### 1. Capture & Treatment

Separators collect associated gas at the wellhead. For sour gas (H₂S), we utilize chemical scavengers (Triazine) or amine systems (FLEXSORB™) to dehydrate and sweeten the gas, preventing engine corrosion.

### 2. Power Generation

Treated gas fuels modular reciprocating engines. Achieving 99.9% combustion efficiency compared to ~91% for open flares, drastically reducing methane slip and VOC emissions.

### 3. Compute Consumption

Electricity is routed directly to on-site mobile data centers (Hash Huts/Smartboxes). The load is consistent and flexible, providing immediate monetization without grid interconnection.

### Superior Economics',
        '# Turn Flared Gas into Digital Gold

Deploy modular data centers directly at the wellhead. Zero routine flaring, 99.9% combustion efficiency, and monetized energy.

## Digital Flare Mitigation (DFM)

A three-step enginee',
        'en',
        array['oil', 'gas', 'power', 'solutions', 'gasgx', 'https', 'www', 'com', 'oilfield', 'turn', 'flared', 'into', 'digital', 'gold', 'deploy', 'modular', 'data', 'centers', 'directly', 'at', 'the', 'wellhead', 'zero', 'routine', 'flaring', '99', 'combustion', 'efficiency', 'and', 'monetized', 'energy', 'flare', 'mitigation', 'dfm', 'three', 'step', 'engineered', 'process', 'to', 'convert', 'stranded', 'liabilities', 'high', 'performance', 'computing', 'assets', 'capture', 'treatment', 'separators', 'collect', 'associated', 'for', 'sour', 'we', 'utilize', 'chemical', 'scavengers', 'triazine', 'or', 'amine', 'systems', 'flexsorb', 'dehydrate', 'sweeten', 'preventing', 'engine', 'corrosion', 'generation', 'treated', 'fuels', 'reciprocating', 'engines', 'achieving', 'compared', '91', 'open', 'flares', 'drastically', 'reducing', 'methane']::text[],
        'Superior Economics',
        0,
        245,
        '{"path": "/solutions/oilfield/", "snapshot_kind": "site_html"}'::jsonb,
        '# Turn Flared Gas into Digital Gold

Deploy modular data centers directly at the wellhead. Zero routine flaring, 99.9% combustion efficiency, and monetized energy.

## Digital Flare Mitigation (DFM)

A three-step engineered process to convert stranded gas liabilities into high-performance computing assets.

### 1. Capture & Treatment

Separators collect associated gas at the wellhead. For sour gas (H₂S), we utilize chemical scavengers (Triazine) or amine systems (FLEXSORB™) to dehydrate and sweeten the gas, preventing engine corrosion.

### 2. Power Generation

Treated gas fuels modular reciprocating engines. Achieving 99.9% combustion efficiency compared to ~91% for open flares, drastically reducing methane slip and VOC emissions.

### 3. Compute Consumption

Electricity is routed directly to on-site mobile data centers (Hash Huts/Smartboxes). The load is consistent and flexible, providing immediate monetization without grid interconnection.

### Superior Economics # Turn Flared Gas into Digital Gold

Deploy modular data centers directly at the wellhead. Zero routine flaring, 99.9% combustion efficiency, and monetized energy.

## Digital Flare Mitigation (DFM)

A three-step enginee oil gas power solutions gasgx https www com oilfield turn flared into digital gold deploy modular data centers directly at the wellhead zero routine flaring 99 combustion efficiency and monetized energy flare mitigation dfm three step engineered process to convert stranded liabilities high performance computing assets capture treatment separators collect associated for sour we utilize chemical scavengers triazine or amine systems flexsorb dehydrate sweeten preventing engine corrosion generation treated fuels reciprocating engines achieving compared 91 open flares drastically reducing methane'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/solutions/oilfield/' limit 1),
        '- Ultra-Low LCOE Generate power at $0.02 - $0.04/kWh using free waste gas, ensuring mining profitability even post-halving.

- Modular Scaling Scale from 500kW to 10MW+ rapidly. Assets are mobile and can move to new wells as depletion occurs.

### Environmental Compliance

- Zero Routine Flaring Align with World Bank 2030 initiatives. Eliminate visible flames and smoke, improving community relations.

- Emission Reduction Reduce CO2e by up to 63% by converting methane (CH4) to CO2 efficiently through controlled combustion.

## Success Stories

### YPF & GDA

State oil giant YPF piloted 1MW gas-to-compute project. Exported gas constraints were solved by onsite mining, reducing 30% of flare volumes in the pilot block.

### Crusoe Energy

The pioneer of DFM deployed hundreds of modular data centers across the Bakken shale, capturing millions of cubic feet of gas daily and powering high-performance cloud computing.',
        '- Ultra-Low LCOE Generate power at $0.02 - $0.04/kWh using free waste gas, ensuring mining profitability even post-halving.

- Modular Scaling Scale from 500kW to 10MW+ rapidly. Assets are mobile and can move to new well',
        'en',
        array['oil', 'gas', 'power', 'solutions', 'gasgx', 'https', 'www', 'com', 'oilfield', 'turn', 'flared', 'into', 'digital', 'gold', 'deploy', 'modular', 'data', 'centers', 'directly', 'at', 'the', 'wellhead', 'zero', 'routine', 'flaring', '99', 'combustion', 'efficiency', 'and', 'monetized', 'energy', 'flare', 'mitigation', 'dfm', 'three', 'step', 'engineered', 'process', 'to', 'convert', 'stranded', 'liabilities', 'high', 'performance', 'computing', 'assets', 'capture', 'treatment', 'separators', 'collect', 'associated', 'for', 'sour', 'we', 'utilize', 'chemical', 'scavengers', 'triazine', 'or', 'amine', 'systems', 'flexsorb', 'dehydrate', 'sweeten', 'preventing', 'engine', 'corrosion', 'generation', 'treated', 'fuels', 'reciprocating', 'engines', 'achieving', 'compared', '91', 'open', 'flares', 'drastically', 'reducing', 'methane']::text[],
        'Crusoe Energy',
        1,
        231,
        '{"path": "/solutions/oilfield/", "snapshot_kind": "site_html"}'::jsonb,
        '- Ultra-Low LCOE Generate power at $0.02 - $0.04/kWh using free waste gas, ensuring mining profitability even post-halving.

- Modular Scaling Scale from 500kW to 10MW+ rapidly. Assets are mobile and can move to new wells as depletion occurs.

### Environmental Compliance

- Zero Routine Flaring Align with World Bank 2030 initiatives. Eliminate visible flames and smoke, improving community relations.

- Emission Reduction Reduce CO2e by up to 63% by converting methane (CH4) to CO2 efficiently through controlled combustion.

## Success Stories

### YPF & GDA

State oil giant YPF piloted 1MW gas-to-compute project. Exported gas constraints were solved by onsite mining, reducing 30% of flare volumes in the pilot block.

### Crusoe Energy

The pioneer of DFM deployed hundreds of modular data centers across the Bakken shale, capturing millions of cubic feet of gas daily and powering high-performance cloud computing. - Ultra-Low LCOE Generate power at $0.02 - $0.04/kWh using free waste gas, ensuring mining profitability even post-halving.

- Modular Scaling Scale from 500kW to 10MW+ rapidly. Assets are mobile and can move to new well oil gas power solutions gasgx https www com oilfield turn flared into digital gold deploy modular data centers directly at the wellhead zero routine flaring 99 combustion efficiency and monetized energy flare mitigation dfm three step engineered process to convert stranded liabilities high performance computing assets capture treatment separators collect associated for sour we utilize chemical scavengers triazine or amine systems flexsorb dehydrate sweeten preventing engine corrosion generation treated fuels reciprocating engines achieving compared 91 open flares drastically reducing methane'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/support/network/' limit 1),
        '# Global Energy & Compute Network

从北美的页岩气田到中亚的广阔草原，GasGx 在全球关键能源节点部署了分布式算力与服务中心，为您提供本地化的 EPC 建设与 7x24 小时运维支持。

### R&D & Compliance

技术研发总部与 EPA 合规中心。专注于高硫气处理技术 (Sour Gas) 与模块化机组设计。

### Operations Base

全球最大的算力托管基地。具备极寒天气运维经验，提供低成本电力接入与矿场建设。

### Financial Hub

资本运作与设备采购中心。链接全球主权财富基金，提供供应链金融与碳信用交易服务。

### Emerging Projects

Vaca Muerta 盆地战略节点。专注于伴生天然气（APG）消纳与离网电力货币化试点。

### 24/7 Network Operations Center

我们的分布式云端监控系统链接全球所有节点。实时监测发电机组热效率、矿机算力波动及现场安全，确保 99.9% 的正常运行时间。

## Delivery Workflow

从气源评估到算力收益，标准化的四步交付流程。

#### Audit & Design

气组分分析、ROI 测算与设备选型 (1-2 Weeks)

#### Logistics & EPC

全球供应链发货，现场土建与模块化组装 (4-8 Weeks)

#### Commissioning

并网测试、算力加载与压力测试 (1 Week)

#### O&M & Profit

7x24 运维托管，每日BTC收益结算 (Ongoing)

Our global teams usually respond within 24 hours.',
        '# Global Energy & Compute Network

从北美的页岩气田到中亚的广阔草原，GasGx 在全球关键能源节点部署了分布式算力与服务中心，为您提供本地化的 EPC 建设与 7x24 小时运维支持。

### R&D & Compliance

技术研发总部与 EPA 合规中心。专注于高硫气处理技术 (Sour Gas) 与模块化机组设计。

### Operations Base

全球最大的算力托管基地。具备极',
        'zh',
        array['global', 'network', 'gasgx', '全球服务网络', '全球', '球服', '服务', '务网', '网络', 'https', 'www', 'com', 'support', 'energy', 'compute', '从北美的页岩气田到中亚的广阔草原', '从北', '北美', '美的', '的页', '页岩', '岩气', '气田', '田到', '到中', '中亚', '亚的', '的广', '广阔', '阔草', '草原', '在全球关键能源节点部署了分布式算力与服务中心', '为您提供本地化的', '为您', '您提', '提供', '供本', '本地', '地化', '化的', 'epc', '建设与', '建设', '设与', '7x24', '小时运维支持', '小时', '时运', '运维', '维支', '支持', 'compliance', '技术研发总部与', '技术', '术研', '研发', '发总', '总部', '部与', 'epa', '合规中心', '合规', '规中', '中心', '专注于高硫气处理技术', '专注', '注于', '于高', '高硫', '硫气', '气处', '处理', '理技', 'sour', 'gas', '与模块化机组设计', '与模', '模块', '块化', '化机']::text[],
        'O&M & Profit',
        0,
        192,
        '{"path": "/support/network/", "snapshot_kind": "site_html"}'::jsonb,
        '# Global Energy & Compute Network

从北美的页岩气田到中亚的广阔草原，GasGx 在全球关键能源节点部署了分布式算力与服务中心，为您提供本地化的 EPC 建设与 7x24 小时运维支持。

### R&D & Compliance

技术研发总部与 EPA 合规中心。专注于高硫气处理技术 (Sour Gas) 与模块化机组设计。

### Operations Base

全球最大的算力托管基地。具备极寒天气运维经验，提供低成本电力接入与矿场建设。

### Financial Hub

资本运作与设备采购中心。链接全球主权财富基金，提供供应链金融与碳信用交易服务。

### Emerging Projects

Vaca Muerta 盆地战略节点。专注于伴生天然气（APG）消纳与离网电力货币化试点。

### 24/7 Network Operations Center

我们的分布式云端监控系统链接全球所有节点。实时监测发电机组热效率、矿机算力波动及现场安全，确保 99.9% 的正常运行时间。

## Delivery Workflow

从气源评估到算力收益，标准化的四步交付流程。

#### Audit & Design

气组分分析、ROI 测算与设备选型 (1-2 Weeks)

#### Logistics & EPC

全球供应链发货，现场土建与模块化组装 (4-8 Weeks)

#### Commissioning

并网测试、算力加载与压力测试 (1 Week)

#### O&M & Profit

7x24 运维托管，每日BTC收益结算 (Ongoing)

Our global teams usually respond within 24 hours. # Global Energy & Compute Network

从北美的页岩气田到中亚的广阔草原，GasGx 在全球关键能源节点部署了分布式算力与服务中心，为您提供本地化的 EPC 建设与 7x24 小时运维支持。

### R&D & Compliance

技术研发总部与 EPA 合规中心。专注于高硫气处理技术 (Sour Gas) 与模块化机组设计。

### Operations Base

全球最大的算力托管基地。具备极 global network gasgx 全球服务网络 全球 球服 服务 务网 网络 https www com support energy compute 从北美的页岩气田到中亚的广阔草原 从北 北美 美的 的页 页岩 岩气 气田 田到 到中 中亚 亚的 的广 广阔 阔草 草原 在全球关键能源节点部署了分布式算力与服务中心 为您提供本地化的 为您 您提 提供 供本 本地 地化 化的 epc 建设与 建设 设与 7x24 小时运维支持 小时 时运 运维 维支 支持 compliance 技术研发总部与 技术 术研 研发 发总 总部 部与 epa 合规中心 合规 规中 中心 专注于高硫气处理技术 专注 注于 于高 高硫 硫气 气处 处理 理技 sour gas 与模块化机组设计 与模 模块 块化 化机'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/support/service/' limit 1),
        '# Total Care Solution

GasGx 提供覆盖全生命周期的综合服务体系。从基础的定期保养到基于数字监控的预测性维护，我们致力于降低您的总拥有成本 (TCO) 并延长设备寿命。

### Routine Maintenance

确保机组运行的基础。严格遵循运行小时数 (Operating Hours) 计划。

- 耗材更换: Waukesha VHP 5系列机油/火花塞更换间隔可达 4,000 小时。

- 流体分析 (S•O•S℠): 分析废油/冷却液样本，精准确定组件状态，优化换油间隔。

### Overhaul & Replacement

随着运行时间积累进行的深度维修，包括顶部大修与全面大修。

- 大修周期: Jenbacher 6系列/MWM TCG2032 大修间隔可达 60,000-80,000 小时。

- X-Change 计划: 使用工厂翻新部件替代现场维修，节省 75% 停机时间。

### Digital Solutions

从“被动维修”向“预测性维护”转变，实时掌握资产绩效。

- APM 平台: 集成 myplant 与 TPEM 系统，远程跟踪性能与故障预警。

- 绕组监测: 实时监控发电机轴承与绕组温度，防止电机过热损坏。

#### Spare Parts & Logistics

我们强调使用 OEM 原厂备件以确保可靠性。依托卡特彼勒全球 1,600+ 经销商网络及 MWM 德国物流中心，确保关键备件的快速供应，减少停机损失。

#### Upgrades & Retrofits

针对老旧机组进行技术更新。提供 25H2-Kit 套件（混燃 25% 氢气升级）及 SCR 尾气后处理系统加装，满足德国 44. BImSchV 等严苛排放法规。

### Training & Support

授人以渔。我们提供操作员与服务技术人员培训，涵盖点火系统、控制逻辑及故障排除。同时开放 "Do it the smart way" 视频教程库与电子维修手册。

### Service Agreements (LTSA)

锁定全生命周期成本。长期服务协议 (LTSA) 涵盖计划内/外维护、备件供应及性能保证。部分原厂认证再制造引擎（如 reUp 计划）提供与新机相同的 1 年质保。',
        '# Total Care Solution

GasGx 提供覆盖全生命周期的综合服务体系。从基础的定期保养到基于数字监控的预测性维护，我们致力于降低您的总拥有成本 (TCO) 并延长设备寿命。

### Routine Maintenance

确保机组运行的基础。严格遵循运行小时数 (Operating Hours) 计划。

- 耗材更换: Waukesha VHP 5系列机油/火花塞更换间隔可达 4,000 小时。

- 流体分',
        'zh',
        array['service', 'maintenance', 'gasgx', '售后服务体系', '售后', '后服', '服务', '务体', '体系', 'https', 'www', 'com', 'support', 'total', 'care', 'solution', '提供覆盖全生命周期的综合服务体系', '提供', '供覆', '覆盖', '盖全', '全生', '生命', '命周', '周期', '期的', '的综', '综合', '合服', '从基础的定期保养到基于数字监控的预测性维护', '我们致力于降低您的总拥有成本', '我们', '们致', '致力', '力于', '于降', '降低', '低您', '您的', '的总', '总拥', '拥有', '有成', '成本', 'tco', '并延长设备寿命', '并延', '延长', '长设', '设备', '备寿', '寿命', 'routine', '确保机组运行的基础', '确保', '保机', '机组', '组运', '运行', '行的', '的基', '基础', '严格遵循运行小时数', '严格', '格遵', '遵循', '循运', '行小', '小时', '时数', 'operating', 'hours', '计划', '耗材更换', '耗材', '材更', '更换', 'waukesha', 'vhp', '系列机油']::text[],
        'Service Agreements (LTSA)',
        0,
        246,
        '{"path": "/support/service/", "snapshot_kind": "site_html"}'::jsonb,
        '# Total Care Solution

GasGx 提供覆盖全生命周期的综合服务体系。从基础的定期保养到基于数字监控的预测性维护，我们致力于降低您的总拥有成本 (TCO) 并延长设备寿命。

### Routine Maintenance

确保机组运行的基础。严格遵循运行小时数 (Operating Hours) 计划。

- 耗材更换: Waukesha VHP 5系列机油/火花塞更换间隔可达 4,000 小时。

- 流体分析 (S•O•S℠): 分析废油/冷却液样本，精准确定组件状态，优化换油间隔。

### Overhaul & Replacement

随着运行时间积累进行的深度维修，包括顶部大修与全面大修。

- 大修周期: Jenbacher 6系列/MWM TCG2032 大修间隔可达 60,000-80,000 小时。

- X-Change 计划: 使用工厂翻新部件替代现场维修，节省 75% 停机时间。

### Digital Solutions

从“被动维修”向“预测性维护”转变，实时掌握资产绩效。

- APM 平台: 集成 myplant 与 TPEM 系统，远程跟踪性能与故障预警。

- 绕组监测: 实时监控发电机轴承与绕组温度，防止电机过热损坏。

#### Spare Parts & Logistics

我们强调使用 OEM 原厂备件以确保可靠性。依托卡特彼勒全球 1,600+ 经销商网络及 MWM 德国物流中心，确保关键备件的快速供应，减少停机损失。

#### Upgrades & Retrofits

针对老旧机组进行技术更新。提供 25H2-Kit 套件（混燃 25% 氢气升级）及 SCR 尾气后处理系统加装，满足德国 44. BImSchV 等严苛排放法规。

### Training & Support

授人以渔。我们提供操作员与服务技术人员培训，涵盖点火系统、控制逻辑及故障排除。同时开放 "Do it the smart way" 视频教程库与电子维修手册。

### Service Agreements (LTSA)

锁定全生命周期成本。长期服务协议 (LTSA) 涵盖计划内/外维护、备件供应及性能保证。部分原厂认证再制造引擎（如 reUp 计划）提供与新机相同的 1 年质保。 # Total Care Solution

GasGx 提供覆盖全生命周期的综合服务体系。从基础的定期保养到基于数字监控的预测性维护，我们致力于降低您的总拥有成本 (TCO) 并延长设备寿命。

### Routine Maintenance

确保机组运行的基础。严格遵循运行小时数 (Operating Hours) 计划。

- 耗材更换: Waukesha VHP 5系列机油/火花塞更换间隔可达 4,000 小时。

- 流体分 service maintenance gasgx 售后服务体系 售后 后服 服务 务体 体系 https www com support total care solution 提供覆盖全生命周期的综合服务体系 提供 供覆 覆盖 盖全 全生 生命 命周 周期 期的 的综 综合 合服 从基础的定期保养到基于数字监控的预测性维护 我们致力于降低您的总拥有成本 我们 们致 致力 力于 于降 降低 低您 您的 的总 总拥 拥有 有成 成本 tco 并延长设备寿命 并延 延长 长设 设备 备寿 寿命 routine 确保机组运行的基础 确保 保机 机组 组运 运行 行的 的基 基础 严格遵循运行小时数 严格 格遵 遵循 循运 行小 小时 时数 operating hours 计划 耗材更换 耗材 材更 更换 waukesha vhp 系列机油'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/support/tech/' limit 1),
        '# Technical Support

从燃气发电机组的 ECU 标定到矿场算力的集群优化，我们的技术工程师团队为您提供软硬件一体化的专业支持。

### Remote Diagnostics

- Log analysis & Fault code clearing

- Network latency optimization

- ECU firmware remote flash

### Genset Engineering

- Air/Fuel ratio tuning (High Sulfur)

- Lubrication system analysis

- Overhaul parts consultation

### Mining Optimization

- Immersion cooling parameters

- ASIC firmware upgrade (S19/S21)

- Hashrate fluctuation troubleshooting

## Resource Center

## Submit Support Ticket

Please provide details about your equipment. Our engineers will analyze your logs and reply via email.',
        '# Technical Support

从燃气发电机组的 ECU 标定到矿场算力的集群优化，我们的技术工程师团队为您提供软硬件一体化的专业支持。

### Remote Diagnostics

- Log analysis & Fault code clearing

- Network latency optimization

- ECU firmware remote flash

### Genset Engineering',
        'zh',
        array['tech', 'support', 'gasgx', '技术支持中心', '技术', '术支', '支持', '持中', '中心', 'https', 'www', 'com', 'technical', '从燃气发电机组的', '从燃', '燃气', '气发', '发电', '电机', '机组', '组的', 'ecu', '标定到矿场算力的集群优化', '标定', '定到', '到矿', '矿场', '场算', '算力', '力的', '的集', '集群', '群优', '优化', '我们的技术工程师团队为您提供软硬件一体化的专业支持', 'remote', 'diagnostics', 'log', 'analysis', 'fault', 'code', 'clearing', 'network', 'latency', 'optimization', 'firmware', 'flash', 'genset', 'engineering', 'air', 'fuel', 'ratio', 'tuning', 'high', 'sulfur', 'lubrication', 'system', 'overhaul', 'parts', 'consultation', 'mining', 'immersion', 'cooling', 'parameters', 'asic', 'upgrade', 's19', 's21', 'hashrate', 'fluctuation', 'troubleshooting', 'resource', 'center', 'submit', 'ticket', 'please', 'provide', 'details', 'about', 'your']::text[],
        'Submit Support Ticket',
        0,
        150,
        '{"path": "/support/tech/", "snapshot_kind": "site_html"}'::jsonb,
        '# Technical Support

从燃气发电机组的 ECU 标定到矿场算力的集群优化，我们的技术工程师团队为您提供软硬件一体化的专业支持。

### Remote Diagnostics

- Log analysis & Fault code clearing

- Network latency optimization

- ECU firmware remote flash

### Genset Engineering

- Air/Fuel ratio tuning (High Sulfur)

- Lubrication system analysis

- Overhaul parts consultation

### Mining Optimization

- Immersion cooling parameters

- ASIC firmware upgrade (S19/S21)

- Hashrate fluctuation troubleshooting

## Resource Center

## Submit Support Ticket

Please provide details about your equipment. Our engineers will analyze your logs and reply via email. # Technical Support

从燃气发电机组的 ECU 标定到矿场算力的集群优化，我们的技术工程师团队为您提供软硬件一体化的专业支持。

### Remote Diagnostics

- Log analysis & Fault code clearing

- Network latency optimization

- ECU firmware remote flash

### Genset Engineering tech support gasgx 技术支持中心 技术 术支 支持 持中 中心 https www com technical 从燃气发电机组的 从燃 燃气 气发 发电 电机 机组 组的 ecu 标定到矿场算力的集群优化 标定 定到 到矿 矿场 场算 算力 力的 的集 集群 群优 优化 我们的技术工程师团队为您提供软硬件一体化的专业支持 remote diagnostics log analysis fault code clearing network latency optimization firmware flash genset engineering air fuel ratio tuning high sulfur lubrication system overhaul parts consultation mining immersion cooling parameters asic upgrade s19 s21 hashrate fluctuation troubleshooting resource center submit ticket please provide details about your'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/use-cases/' limit 1),
        '# CHP 热电联供解决方案

不仅是电力，更是能源的极致利用。回收发电废热，将综合效率从传统的 40% 提升至 80% 以上，创造第三重收入流。

### 工业供汽与区域供暖

利用余热锅炉回收燃气机组排气热量。在生产比特币和电力的同时，向周边工业设施或居民社区销售蒸汽与热水。

- 能效跃升 从单一发电的 35%-40% 效率提升至热电联产的 80%+。

- 多重收入流 电力销售 + 算力收益 + 热力销售 (Steam/Heat Sales)。

### 现代农业与碳汇温室

将天然气清洁燃烧产生的热量和 CO₂ 输送至温室，打造“热+碳”协同的现代农业生态。

#### 碳汇农业

利用 CO₂ 促进植物光合作用，实现碳捕获的同时增加农作物产量。Genesis Digital Assets (GDA) 已成功落地此类项目。

#### 经济效益

以 LINKMINE 模式为例，通过温室农业碳汇分成，预计每年可为项目增收 200 万美元。

## 驱动制冷 (CCHP)

#### 冷热电三联供

利用废热驱动吸收式制冷机 (Absorption Chillers)。将原本排放的热能转化为冷能，为数据中心或矿场本身提供冷却。

## 最大化您的能源价值

不仅仅是发电。探索如何通过 CHP 系统将废热转化为利润。',
        '# CHP 热电联供解决方案

不仅是电力，更是能源的极致利用。回收发电废热，将综合效率从传统的 40% 提升至 80% 以上，创造第三重收入流。

### 工业供汽与区域供暖

利用余热锅炉回收燃气机组排气热量。在生产比特币和电力的同时，向周边工业设施或居民社区销售蒸汽与热水。

- 能效跃升 从单一发电的 35%-40% 效率提升至热电联产的 80%+。

- 多重收入流 电力销售 + 算力收益 + 热力销售 (Steam/Heat',
        'zh',
        array['chp', 'cchp', 'cogeneration', 'solutions', 'gasgx', 'https', 'www', 'com', 'use', 'cases', '热电联供解决方案', '热电', '电联', '联供', '供解', '解决', '决方', '方案', '不仅是电力', '不仅', '仅是', '是电', '电力', '更是能源的极致利用', '更是', '是能', '能源', '源的', '的极', '极致', '致利', '利用', '回收发电废热', '回收', '收发', '发电', '电废', '废热', '将综合效率从传统的', '将综', '综合', '合效', '效率', '率从', '从传', '传统', '统的', '40', '提升至', '提升', '升至', '80', '以上', '创造第三重收入流', '创造', '造第', '第三', '三重', '重收', '收入', '入流', '工业供汽与区域供暖', '工业', '业供', '供汽', '汽与', '与区', '区域', '域供', '供暖', '利用余热锅炉回收燃气机组排气热量', '用余', '余热', '热锅', '锅炉', '炉回', '收燃', '燃气', '气机', '机组']::text[],
        '最大化您的能源价值',
        0,
        143,
        '{"path": "/use-cases/", "snapshot_kind": "site_html"}'::jsonb,
        '# CHP 热电联供解决方案

不仅是电力，更是能源的极致利用。回收发电废热，将综合效率从传统的 40% 提升至 80% 以上，创造第三重收入流。

### 工业供汽与区域供暖

利用余热锅炉回收燃气机组排气热量。在生产比特币和电力的同时，向周边工业设施或居民社区销售蒸汽与热水。

- 能效跃升 从单一发电的 35%-40% 效率提升至热电联产的 80%+。

- 多重收入流 电力销售 + 算力收益 + 热力销售 (Steam/Heat Sales)。

### 现代农业与碳汇温室

将天然气清洁燃烧产生的热量和 CO₂ 输送至温室，打造“热+碳”协同的现代农业生态。

#### 碳汇农业

利用 CO₂ 促进植物光合作用，实现碳捕获的同时增加农作物产量。Genesis Digital Assets (GDA) 已成功落地此类项目。

#### 经济效益

以 LINKMINE 模式为例，通过温室农业碳汇分成，预计每年可为项目增收 200 万美元。

## 驱动制冷 (CCHP)

#### 冷热电三联供

利用废热驱动吸收式制冷机 (Absorption Chillers)。将原本排放的热能转化为冷能，为数据中心或矿场本身提供冷却。

## 最大化您的能源价值

不仅仅是发电。探索如何通过 CHP 系统将废热转化为利润。 # CHP 热电联供解决方案

不仅是电力，更是能源的极致利用。回收发电废热，将综合效率从传统的 40% 提升至 80% 以上，创造第三重收入流。

### 工业供汽与区域供暖

利用余热锅炉回收燃气机组排气热量。在生产比特币和电力的同时，向周边工业设施或居民社区销售蒸汽与热水。

- 能效跃升 从单一发电的 35%-40% 效率提升至热电联产的 80%+。

- 多重收入流 电力销售 + 算力收益 + 热力销售 (Steam/Heat chp cchp cogeneration solutions gasgx https www com use cases 热电联供解决方案 热电 电联 联供 供解 解决 决方 方案 不仅是电力 不仅 仅是 是电 电力 更是能源的极致利用 更是 是能 能源 源的 的极 极致 致利 利用 回收发电废热 回收 收发 发电 电废 废热 将综合效率从传统的 将综 综合 合效 效率 率从 从传 传统 统的 40 提升至 提升 升至 80 以上 创造第三重收入流 创造 造第 第三 三重 重收 收入 入流 工业供汽与区域供暖 工业 业供 供汽 汽与 与区 区域 域供 供暖 利用余热锅炉回收燃气机组排气热量 用余 余热 热锅 锅炉 炉回 收燃 燃气 气机 机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/use-cases/chp/' limit 1),
        '# CHP 热电联供解决方案

不仅是电力，更是能源的极致利用。回收发电废热，将综合效率从传统的 40% 提升至 80% 以上，创造第三重收入流。

### 工业供汽与区域供暖

利用余热锅炉回收燃气机组排气热量。在生产比特币和电力的同时，向周边工业设施或居民社区销售蒸汽与热水。

- 能效跃升 从单一发电的 35%-40% 效率提升至热电联产的 80%+。

- 多重收入流 电力销售 + 算力收益 + 热力销售 (Steam/Heat Sales)。

### 现代农业与碳汇温室

将天然气清洁燃烧产生的热量和 CO₂ 输送至温室，打造“热+碳”协同的现代农业生态。

#### 碳汇农业

利用 CO₂ 促进植物光合作用，实现碳捕获的同时增加农作物产量。Genesis Digital Assets (GDA) 已成功落地此类项目。

#### 经济效益

以 LINKMINE 模式为例，通过温室农业碳汇分成，预计每年可为项目增收 200 万美元。

## 驱动制冷 (CCHP)

#### 冷热电三联供

利用废热驱动吸收式制冷机 (Absorption Chillers)。将原本排放的热能转化为冷能，为数据中心或矿场本身提供冷却。

## 最大化您的能源价值

不仅仅是发电。探索如何通过 CHP 系统将废热转化为利润。',
        '# CHP 热电联供解决方案

不仅是电力，更是能源的极致利用。回收发电废热，将综合效率从传统的 40% 提升至 80% 以上，创造第三重收入流。

### 工业供汽与区域供暖

利用余热锅炉回收燃气机组排气热量。在生产比特币和电力的同时，向周边工业设施或居民社区销售蒸汽与热水。

- 能效跃升 从单一发电的 35%-40% 效率提升至热电联产的 80%+。

- 多重收入流 电力销售 + 算力收益 + 热力销售 (Steam/Heat',
        'en',
        array['chp', 'cchp', 'cogeneration', 'solutions', 'gasgx', 'https', 'www', 'com', 'use', 'cases', '热电联供解决方案', '热电', '电联', '联供', '供解', '解决', '决方', '方案', '不仅是电力', '不仅', '仅是', '是电', '电力', '更是能源的极致利用', '更是', '是能', '能源', '源的', '的极', '极致', '致利', '利用', '回收发电废热', '回收', '收发', '发电', '电废', '废热', '将综合效率从传统的', '将综', '综合', '合效', '效率', '率从', '从传', '传统', '统的', '40', '提升至', '提升', '升至', '80', '以上', '创造第三重收入流', '创造', '造第', '第三', '三重', '重收', '收入', '入流', '工业供汽与区域供暖', '工业', '业供', '供汽', '汽与', '与区', '区域', '域供', '供暖', '利用余热锅炉回收燃气机组排气热量', '用余', '余热', '热锅', '锅炉', '炉回', '收燃', '燃气', '气机', '机组']::text[],
        '最大化您的能源价值',
        0,
        143,
        '{"path": "/use-cases/chp/", "snapshot_kind": "site_html"}'::jsonb,
        '# CHP 热电联供解决方案

不仅是电力，更是能源的极致利用。回收发电废热，将综合效率从传统的 40% 提升至 80% 以上，创造第三重收入流。

### 工业供汽与区域供暖

利用余热锅炉回收燃气机组排气热量。在生产比特币和电力的同时，向周边工业设施或居民社区销售蒸汽与热水。

- 能效跃升 从单一发电的 35%-40% 效率提升至热电联产的 80%+。

- 多重收入流 电力销售 + 算力收益 + 热力销售 (Steam/Heat Sales)。

### 现代农业与碳汇温室

将天然气清洁燃烧产生的热量和 CO₂ 输送至温室，打造“热+碳”协同的现代农业生态。

#### 碳汇农业

利用 CO₂ 促进植物光合作用，实现碳捕获的同时增加农作物产量。Genesis Digital Assets (GDA) 已成功落地此类项目。

#### 经济效益

以 LINKMINE 模式为例，通过温室农业碳汇分成，预计每年可为项目增收 200 万美元。

## 驱动制冷 (CCHP)

#### 冷热电三联供

利用废热驱动吸收式制冷机 (Absorption Chillers)。将原本排放的热能转化为冷能，为数据中心或矿场本身提供冷却。

## 最大化您的能源价值

不仅仅是发电。探索如何通过 CHP 系统将废热转化为利润。 # CHP 热电联供解决方案

不仅是电力，更是能源的极致利用。回收发电废热，将综合效率从传统的 40% 提升至 80% 以上，创造第三重收入流。

### 工业供汽与区域供暖

利用余热锅炉回收燃气机组排气热量。在生产比特币和电力的同时，向周边工业设施或居民社区销售蒸汽与热水。

- 能效跃升 从单一发电的 35%-40% 效率提升至热电联产的 80%+。

- 多重收入流 电力销售 + 算力收益 + 热力销售 (Steam/Heat chp cchp cogeneration solutions gasgx https www com use cases 热电联供解决方案 热电 电联 联供 供解 解决 决方 方案 不仅是电力 不仅 仅是 是电 电力 更是能源的极致利用 更是 是能 能源 源的 的极 极致 致利 利用 回收发电废热 回收 收发 发电 电废 废热 将综合效率从传统的 将综 综合 合效 效率 率从 从传 传统 统的 40 提升至 提升 升至 80 以上 创造第三重收入流 创造 造第 第三 三重 重收 收入 入流 工业供汽与区域供暖 工业 业供 供汽 汽与 与区 区域 域供 供暖 利用余热锅炉回收燃气机组排气热量 用余 余热 热锅 锅炉 炉回 收燃 燃气 气机 机组'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/use-cases/industrial/' limit 1),
        '# 工业园区与分布式能源

针对电网连接延迟与电价波动，提供“表后发电”与“灵活负载”平衡方案。规避电网瓶颈，实现气算直连。

### 规避电网瓶颈

随着 AI 数据中心需求预计到 2030 年增长 165%，电网扩容和输电许可往往需要数年时间。

- 跳过排队周期 无需等待漫长的电网接入审批，直接部署园区内燃气发电设施。

- 气算直连 在负荷中心直接发电，减少输电损耗，提高能源利用率。

### 灵活负载与需求响应

在园区内部署比特币矿机作为“可中断负载” (Interruptible Load)。将原本固定的工业用电转化为可调节的智能电网节点。

#### 削峰填谷

在电价飙升或电网负荷高峰期，矿机自动关机，将电力释放给园区关键生产线或卖回电网。

#### 监管合规与自用豁免

利用 <10MW 自用豁免条款（如加拿大艾伯塔省）加速落地，同时需严谨设计法律架构，规避违规售电风险。

## 应用案例

#### Riot Platforms (ERCOT)

通过参与 ERCOT 的需求响应计划，在电价高峰期主动削减负荷，单月获得巨额能源信用，大幅降低综合电力成本。

#### Regulatory Compliance: Self-Use

针对 Link Global 曾因未获审批运营受罚的案例，强调在艾伯塔省利用 10MW 以下“自用发电”豁免权的重要性与法律界限。

## 工业园区电力优化

面对电网容量不足或电费过高？了解我们的模块化燃气发电方案。',
        '# 工业园区与分布式能源

针对电网连接延迟与电价波动，提供“表后发电”与“灵活负载”平衡方案。规避电网瓶颈，实现气算直连。

### 规避电网瓶颈

随着 AI 数据中心需求预计到 2030 年增长 165%，电网扩容和输电许可往往需要数年时间。

- 跳过排队周期 无需等待漫长的电网接入审批，直接部署园区内燃气发电设施。

- 气算直连 在负荷中心直接发电，减少输电损耗，提高能源利用率。

### 灵活负载与需求响应

在园区内部署',
        'en',
        array['industrial', 'park', 'power', 'solutions', 'gasgx', 'https', 'www', 'com', 'use', 'cases', '工业园区与分布式能源', '工业', '业园', '园区', '区与', '与分', '分布', '布式', '式能', '能源', '针对电网连接延迟与电价波动', '针对', '对电', '电网', '网连', '连接', '接延', '延迟', '迟与', '与电', '电价', '价波', '波动', '提供', '表后发电', '表后', '后发', '发电', '灵活负载', '灵活', '活负', '负载', '平衡方案', '平衡', '衡方', '方案', '规避电网瓶颈', '规避', '避电', '网瓶', '瓶颈', '实现气算直连', '实现', '现气', '气算', '算直', '直连', '随着', 'ai', '数据中心需求预计到', '数据', '据中', '中心', '心需', '需求', '求预', '预计', '计到', '2030', '年增长', '年增', '增长', '165', '电网扩容和输电许可往往需要数年时间', '跳过排队周期', '跳过', '过排', '排队', '队周', '周期']::text[],
        '工业园区电力优化',
        0,
        159,
        '{"path": "/use-cases/industrial/", "snapshot_kind": "site_html"}'::jsonb,
        '# 工业园区与分布式能源

针对电网连接延迟与电价波动，提供“表后发电”与“灵活负载”平衡方案。规避电网瓶颈，实现气算直连。

### 规避电网瓶颈

随着 AI 数据中心需求预计到 2030 年增长 165%，电网扩容和输电许可往往需要数年时间。

- 跳过排队周期 无需等待漫长的电网接入审批，直接部署园区内燃气发电设施。

- 气算直连 在负荷中心直接发电，减少输电损耗，提高能源利用率。

### 灵活负载与需求响应

在园区内部署比特币矿机作为“可中断负载” (Interruptible Load)。将原本固定的工业用电转化为可调节的智能电网节点。

#### 削峰填谷

在电价飙升或电网负荷高峰期，矿机自动关机，将电力释放给园区关键生产线或卖回电网。

#### 监管合规与自用豁免

利用 <10MW 自用豁免条款（如加拿大艾伯塔省）加速落地，同时需严谨设计法律架构，规避违规售电风险。

## 应用案例

#### Riot Platforms (ERCOT)

通过参与 ERCOT 的需求响应计划，在电价高峰期主动削减负荷，单月获得巨额能源信用，大幅降低综合电力成本。

#### Regulatory Compliance: Self-Use

针对 Link Global 曾因未获审批运营受罚的案例，强调在艾伯塔省利用 10MW 以下“自用发电”豁免权的重要性与法律界限。

## 工业园区电力优化

面对电网容量不足或电费过高？了解我们的模块化燃气发电方案。 # 工业园区与分布式能源

针对电网连接延迟与电价波动，提供“表后发电”与“灵活负载”平衡方案。规避电网瓶颈，实现气算直连。

### 规避电网瓶颈

随着 AI 数据中心需求预计到 2030 年增长 165%，电网扩容和输电许可往往需要数年时间。

- 跳过排队周期 无需等待漫长的电网接入审批，直接部署园区内燃气发电设施。

- 气算直连 在负荷中心直接发电，减少输电损耗，提高能源利用率。

### 灵活负载与需求响应

在园区内部署 industrial park power solutions gasgx https www com use cases 工业园区与分布式能源 工业 业园 园区 区与 与分 分布 布式 式能 能源 针对电网连接延迟与电价波动 针对 对电 电网 网连 连接 接延 延迟 迟与 与电 电价 价波 波动 提供 表后发电 表后 后发 发电 灵活负载 灵活 活负 负载 平衡方案 平衡 衡方 方案 规避电网瓶颈 规避 避电 网瓶 瓶颈 实现气算直连 实现 现气 气算 算直 直连 随着 ai 数据中心需求预计到 数据 据中 中心 心需 需求 求预 预计 计到 2030 年增长 年增 增长 165 电网扩容和输电许可往往需要数年时间 跳过排队周期 跳过 过排 排队 队周 周期'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/use-cases/mining/' limit 1),
        '# 从比特币挖矿到 AI 算力基荷

为高价值计算提供 24/7 稳定电力。相比间歇性新能源，天然气发电是 AI 数据中心最可靠的能源桥梁。

### AI 数据中心的基荷电源

AI 训练对电力中断零容忍。天然气发电提供了太阳能和风能无法企及的持续性，是目前填补数据中心电力缺口的关键资源。

- 24/7 稳定运行 区别于可中断的挖矿负载，AI 训练需要持续稳定的基荷电力 (Baseload Power)。

- 独立供能岛 在电网容量受限区域，建立独立的天然气微电网，保障 HPC 集群算力不掉线。

### 极端环境与高密度部署

适应西伯利亚寒冬或德州酷暑，集成液冷与浸没式技术，为 S21 XP Hydro 等大算力设备提供最佳运行环境。

#### 液冷与浸没式技术

大幅降低 PUE，提升算力密度，无惧沙尘与极端温差。

#### 废热利用

配合 CHP 系统，将芯片废热用于供暖或工业流程，进一步摊薄能源成本。

## 全球地理套利

#### 成本驱动迁移

比特币减半后，美国电网挖矿成本飙升至 $130k/BTC (部分地区)。矿工正被迫寻找新的能源洼地。

#### 俄罗斯与中亚

利用西伯利亚丰富的搁浅天然气和哈萨克斯坦（后 AIFC 垄断时代）的政策窗口，实现极低成本挖矿。

#### 南美洲机遇

阿根廷与巴拉圭等地的水电与天然气资源，正在成为全球算力迁移的新热土。

## 算力基础设施升级

无论是比特币挖矿选址，还是 AI 数据中心供能，我们提供从气源分析到电力交付的一站式方案。',
        '# 从比特币挖矿到 AI 算力基荷

为高价值计算提供 24/7 稳定电力。相比间歇性新能源，天然气发电是 AI 数据中心最可靠的能源桥梁。

### AI 数据中心的基荷电源

AI 训练对电力中断零容忍。天然气发电提供了太阳能和风能无法企及的持续性，是目前填补数据中心电力缺口的关键资源。

- 24/7 稳定运行 区别于可中断的挖矿负载，AI 训练需要持续稳定的基荷电力 (Baseload Power)。

- 独立供能岛 在电网容',
        'en',
        array['mining', 'ai', 'data', 'center', 'power', 'gasgx', 'https', 'www', 'com', 'use', 'cases', '从比特币挖矿到', '从比', '比特', '特币', '币挖', '挖矿', '矿到', '算力基荷', '算力', '力基', '基荷', '为高价值计算提供', '为高', '高价', '价值', '值计', '计算', '算提', '提供', '24', '稳定电力', '稳定', '定电', '电力', '相比间歇性新能源', '相比', '比间', '间歇', '歇性', '性新', '新能', '能源', '天然气发电是', '天然', '然气', '气发', '发电', '电是', '数据中心最可靠的能源桥梁', '数据', '据中', '中心', '心最', '最可', '可靠', '靠的', '的能', '源桥', '桥梁', '数据中心的基荷电源', '心的', '的基', '荷电', '电源', '训练对电力中断零容忍', '训练', '练对', '对电', '力中', '中断', '断零', '零容', '容忍', '天然气发电提供了太阳能和风能无法企及的持续性', '是目前填补数据中心电力缺口的关键资源', '稳定运行', '定运', '运行', '区别于可中断的挖矿负载']::text[],
        '算力基础设施升级',
        0,
        165,
        '{"path": "/use-cases/mining/", "snapshot_kind": "site_html"}'::jsonb,
        '# 从比特币挖矿到 AI 算力基荷

为高价值计算提供 24/7 稳定电力。相比间歇性新能源，天然气发电是 AI 数据中心最可靠的能源桥梁。

### AI 数据中心的基荷电源

AI 训练对电力中断零容忍。天然气发电提供了太阳能和风能无法企及的持续性，是目前填补数据中心电力缺口的关键资源。

- 24/7 稳定运行 区别于可中断的挖矿负载，AI 训练需要持续稳定的基荷电力 (Baseload Power)。

- 独立供能岛 在电网容量受限区域，建立独立的天然气微电网，保障 HPC 集群算力不掉线。

### 极端环境与高密度部署

适应西伯利亚寒冬或德州酷暑，集成液冷与浸没式技术，为 S21 XP Hydro 等大算力设备提供最佳运行环境。

#### 液冷与浸没式技术

大幅降低 PUE，提升算力密度，无惧沙尘与极端温差。

#### 废热利用

配合 CHP 系统，将芯片废热用于供暖或工业流程，进一步摊薄能源成本。

## 全球地理套利

#### 成本驱动迁移

比特币减半后，美国电网挖矿成本飙升至 $130k/BTC (部分地区)。矿工正被迫寻找新的能源洼地。

#### 俄罗斯与中亚

利用西伯利亚丰富的搁浅天然气和哈萨克斯坦（后 AIFC 垄断时代）的政策窗口，实现极低成本挖矿。

#### 南美洲机遇

阿根廷与巴拉圭等地的水电与天然气资源，正在成为全球算力迁移的新热土。

## 算力基础设施升级

无论是比特币挖矿选址，还是 AI 数据中心供能，我们提供从气源分析到电力交付的一站式方案。 # 从比特币挖矿到 AI 算力基荷

为高价值计算提供 24/7 稳定电力。相比间歇性新能源，天然气发电是 AI 数据中心最可靠的能源桥梁。

### AI 数据中心的基荷电源

AI 训练对电力中断零容忍。天然气发电提供了太阳能和风能无法企及的持续性，是目前填补数据中心电力缺口的关键资源。

- 24/7 稳定运行 区别于可中断的挖矿负载，AI 训练需要持续稳定的基荷电力 (Baseload Power)。

- 独立供能岛 在电网容 mining ai data center power gasgx https www com use cases 从比特币挖矿到 从比 比特 特币 币挖 挖矿 矿到 算力基荷 算力 力基 基荷 为高价值计算提供 为高 高价 价值 值计 计算 算提 提供 24 稳定电力 稳定 定电 电力 相比间歇性新能源 相比 比间 间歇 歇性 性新 新能 能源 天然气发电是 天然 然气 气发 发电 电是 数据中心最可靠的能源桥梁 数据 据中 中心 心最 最可 可靠 靠的 的能 源桥 桥梁 数据中心的基荷电源 心的 的基 荷电 电源 训练对电力中断零容忍 训练 练对 对电 力中 中断 断零 零容 容忍 天然气发电提供了太阳能和风能无法企及的持续性 是目前填补数据中心电力缺口的关键资源 稳定运行 定运 运行 区别于可中断的挖矿负载'
    ),
    (
        (select id from public.knowledge_documents where canonical_url = 'https://www.gasgx.com/use-cases/oilfield/' limit 1),
        '# 油气井伴生气发电解决方案

将原本被燃烧或排放的“废气”转化为高性能计算电力。零边际成本能源，为算力基础设施提供最强动力。

### 搁浅气体货币化

在偏远油气井口，利用模块化燃气发电机组直接消耗伴生气。产生的电力不并网，直接供给集装箱式数据中心（矿箱）。

- 负资产转正 消除燃烧罚款，将废气转化为正向现金流。

- 极低电力成本 综合成本低至 $0.02 - $0.04/kWh，远低于工业电网价格。

### 酸性气 (Sour Gas) 处理技术

面对含高浓度硫化氢 (H₂S) 的劣质气源，我们提供完整的预处理与抗腐蚀发电方案，解锁原本无法利用的能源储备。

#### 化学清除与胺处理

使用三嗪或胺液高效脱硫，保护发电机组。

#### 设备防腐保护

防止硫化物应力开裂，延长设备MTBF。

## 典型落地案例

#### YPF Luz & Genesis Digital Assets

在 Vaca Muerta 油田，利用 Bajo del Toro 热电厂的搁浅气体为 1,200 台矿机供电。

#### Crusoe Energy & ExxonMobil

利用页岩油田伴生气驱动模块化数据中心，通过 Digital Flare Mitigation 技术大幅减少甲烷排放。

## 准备好计算您的收益了吗？

使用我们的 ROI 计算器，输入您的气量参数，立即估算挖矿回本周期。',
        '# 油气井伴生气发电解决方案

将原本被燃烧或排放的“废气”转化为高性能计算电力。零边际成本能源，为算力基础设施提供最强动力。

### 搁浅气体货币化

在偏远油气井口，利用模块化燃气发电机组直接消耗伴生气。产生的电力不并网，直接供给集装箱式数据中心（矿箱）。

- 负资产转正 消除燃烧罚款，将废气转化为正向现金流。

- 极低电力成本 综合成本低至 $0.02 - $0.04/kWh，远低于工业电网价格。

### 酸性气 (Sou',
        'en',
        array['oil', 'gas', 'digital', 'flare', 'mitigation', 'gasgx', 'https', 'www', 'com', 'use', 'cases', 'oilfield', '油气井伴生气发电解决方案', '油气', '气井', '井伴', '伴生', '生气', '气发', '发电', '电解', '解决', '决方', '方案', '将原本被燃烧或排放的', '将原', '原本', '本被', '被燃', '燃烧', '烧或', '或排', '排放', '放的', '废气', '转化为高性能计算电力', '转化', '化为', '为高', '高性', '性能', '能计', '计算', '算电', '电力', '零边际成本能源', '零边', '边际', '际成', '成本', '本能', '能源', '为算力基础设施提供最强动力', '为算', '算力', '力基', '基础', '础设', '设施', '施提', '提供', '供最', '最强', '强动', '动力', '搁浅气体货币化', '搁浅', '浅气', '气体', '体货', '货币', '币化', '在偏远油气井口', '在偏', '偏远', '远油', '井口', '利用模块化燃气发电机组直接消耗伴生气', '产生的电力不并网', '产生']::text[],
        '准备好计算您的收益了吗？',
        0,
        151,
        '{"path": "/use-cases/oilfield/", "snapshot_kind": "site_html"}'::jsonb,
        '# 油气井伴生气发电解决方案

将原本被燃烧或排放的“废气”转化为高性能计算电力。零边际成本能源，为算力基础设施提供最强动力。

### 搁浅气体货币化

在偏远油气井口，利用模块化燃气发电机组直接消耗伴生气。产生的电力不并网，直接供给集装箱式数据中心（矿箱）。

- 负资产转正 消除燃烧罚款，将废气转化为正向现金流。

- 极低电力成本 综合成本低至 $0.02 - $0.04/kWh，远低于工业电网价格。

### 酸性气 (Sour Gas) 处理技术

面对含高浓度硫化氢 (H₂S) 的劣质气源，我们提供完整的预处理与抗腐蚀发电方案，解锁原本无法利用的能源储备。

#### 化学清除与胺处理

使用三嗪或胺液高效脱硫，保护发电机组。

#### 设备防腐保护

防止硫化物应力开裂，延长设备MTBF。

## 典型落地案例

#### YPF Luz & Genesis Digital Assets

在 Vaca Muerta 油田，利用 Bajo del Toro 热电厂的搁浅气体为 1,200 台矿机供电。

#### Crusoe Energy & ExxonMobil

利用页岩油田伴生气驱动模块化数据中心，通过 Digital Flare Mitigation 技术大幅减少甲烷排放。

## 准备好计算您的收益了吗？

使用我们的 ROI 计算器，输入您的气量参数，立即估算挖矿回本周期。 # 油气井伴生气发电解决方案

将原本被燃烧或排放的“废气”转化为高性能计算电力。零边际成本能源，为算力基础设施提供最强动力。

### 搁浅气体货币化

在偏远油气井口，利用模块化燃气发电机组直接消耗伴生气。产生的电力不并网，直接供给集装箱式数据中心（矿箱）。

- 负资产转正 消除燃烧罚款，将废气转化为正向现金流。

- 极低电力成本 综合成本低至 $0.02 - $0.04/kWh，远低于工业电网价格。

### 酸性气 (Sou oil gas digital flare mitigation gasgx https www com use cases oilfield 油气井伴生气发电解决方案 油气 气井 井伴 伴生 生气 气发 发电 电解 解决 决方 方案 将原本被燃烧或排放的 将原 原本 本被 被燃 燃烧 烧或 或排 排放 放的 废气 转化为高性能计算电力 转化 化为 为高 高性 性能 能计 计算 算电 电力 零边际成本能源 零边 边际 际成 成本 本能 能源 为算力基础设施提供最强动力 为算 算力 力基 基础 础设 设施 施提 提供 供最 最强 强动 动力 搁浅气体货币化 搁浅 浅气 气体 体货 货币 币化 在偏远油气井口 在偏 偏远 远油 井口 利用模块化燃气发电机组直接消耗伴生气 产生的电力不并网 产生'
    );
