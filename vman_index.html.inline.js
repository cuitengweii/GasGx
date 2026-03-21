
    // --- 鍥介檯鍖栧瓧鍏?---
    const dict = {
        zh: {
            title: `VMAN Engineering 产品报价总览`,
            supplier: "供应商：",
            sender: "发件人：",
            receiver: "收件人：",
            validity: "有效期：",
            update: "SYS_TIME_SYNC",
            part1_line1: "[ BLOCK 01 ]",
            part1_line2: "燃气发电 + 矿机机位模块方案",
            part2_line1: "[ BLOCK 02 ]",
            part2_line2: "独立燃气发电集装箱系统",
            included: "包含",
            sysTotal: "系统预估总价 / EST. SYSTEM TOTAL",
            headers: ["SEQ", "模块描述 (DESCRIPTION)", "规格 (BRAND)", "QTY", "RMB (¥)", "USD ($)", "EUR (€)", "CAD (C$)", "RUB (₽)"],
            fetchSuccess: "全球实时汇率在线",
            refresh: "刷新汇率",
            emailPlaceholder: "请填入客户邮箱号",
            footerText: "<span class=\"text-[var(--gas-green-light)] font-bold\">///</span> 本报价基于全球实时汇率智能生成。最终价格以双方签订的正式商业合同为准。 VMAN Engineering 保留最终解释权。",
            btnSend: "发送",
            btnShare: "分享",
            menuShareLink: "创建分享链接",
            menuImg: "生成长图",
            menuPdf: "导出 PDF",
            shareTitle: "创建分享链接",
            shareDesc: "设置链接有效期后生成访问链接。管理员登录状态下始终可打开页面。",
            shareExpiryLabel: "链接有效期",
            shareExpiry1d: "1天后过期",
            shareExpiry3d: "3天后过期",
            shareExpiry7d: "7天后过期",
            shareExpiryNever: "永不过期",
            shareExpiryCustom: "自定义时间",
            shareCustomLabel: "自定义到期时间",
            shareAdminHint: "后台管理员登录状态不受分享时间限制。",
            shareLinkLabel: "分享链接",
            shareLinkPlaceholder: "点击下方按钮生成分享链接",
            shareGenerate: "生成并复制链接",
            shareClose: "关闭",
            sharePreviewDefault: "默认生成 3 天有效链接。",
            sharePreviewAdmin: "管理员登录后仍可直接打开，不受外链过期限制。",
            shareCopySuccess: "链接已复制到剪贴板",
            shareCopyFallback: "已生成链接，请手动复制。",
            shareAdminOnly: "只有后台管理员登录后才可以创建分享链接。",
            shareCustomRequired: "请先选择一个有效的自定义到期时间。",
            shareCustomExpired: "自定义到期时间必须晚于当前时间。",
            shareGenerateError: "分享链接生成失败，请稍后重试。",
            validityAdmin: "ADMIN-ALWAYS",
            validityNever: "NEVER",
            accessCheckingTitle: "正在验证访问权限...",
            accessCheckingMessage: "正在检查分享链接和管理员登录状态，请稍候。",
            accessAllowedTitle: "访问已授权",
            accessAllowedAdmin: "已识别后台管理员登录状态，正在进入页面。",
            accessAllowedShare: "分享链接校验通过，正在进入页面。",
            accessDeniedTitle: "链接不可用",
            accessDeniedMissing: "当前页面需要有效的分享链接，或使用后台管理员账号登录后打开。",
            accessDeniedExpired: "这个分享链接已经过期。管理员登录后仍可继续访问。",
            accessDeniedInvalid: "分享链接参数无效或已损坏，请重新生成。",
            accessDeniedGeneric: "无法确认当前访问权限，请重新获取分享链接。",
            accessMetaAdmin: "访问模式：admin-session",
            accessMetaShare: "访问模式:share-link",
            accessMetaExpired: "失效时间: ",
            accessMetaNever: "永不过期",
            accessLogin: "管理员登录",
            accessRefresh: "重新检测",
            loading: "处理中...",
            overlayGen: "正在生成高清文档..."
        },
        en: {
            title: `VMAN Engineering Product Quotation Overview`,
            supplier: "SUPPLIER:",
            sender: "SENDER:",
            receiver: "RECEIVER:",
            validity: "VALIDITY:",
            update: "SYS_TIME_SYNC",
            part1_line1: "[ BLOCK 01 ]",
            part1_line2: "GAS GENSET + MINER RACK MODULE",
            part2_line1: "[ BLOCK 02 ]",
            part2_line2: "INDEPENDENT GAS POWER SYSTEM",
            included: "Included",
            sysTotal: "EST. SYSTEM TOTAL PRICE",
            headers: ["SEQ", "DESCRIPTION", "BRAND", "QTY", "RMB (¥)", "USD ($)", "EUR (€)", "CAD (C$)", "RUB (₽)"],
            fetchSuccess: "GLOBAL LIVE RATES",
            refresh: "REFRESH",
            emailPlaceholder: "Enter customer email",
            footerText: "<span class=\"text-[var(--gas-green-light)] font-bold\">///</span> This quotation is generated based on real-time exchange rates. Final prices are subject to the official commercial contract. VMAN Engineering reserves the right of final interpretation.",
            btnSend: "Send",
            btnShare: "Share",
            menuShareLink: "Create Share Link",
            menuImg: "Export Image",
            menuPdf: "Export PDF",
            shareTitle: "Create Share Link",
            shareDesc: "Generate a controlled access link with an expiration. Logged-in admins can always open this page.",
            shareExpiryLabel: "Link expiry",
            shareExpiry1d: "Expire in 1 day",
            shareExpiry3d: "Expire in 3 days",
            shareExpiry7d: "Expire in 7 days",
            shareExpiryNever: "Never expire",
            shareExpiryCustom: "Custom time",
            shareCustomLabel: "Custom expiration time",
            shareAdminHint: "Admin sessions from the site backend always bypass link expiry.",
            shareLinkLabel: "Share link",
            shareLinkPlaceholder: "Generate a link below",
            shareGenerate: "Generate & Copy Link",
            shareClose: "Close",
            sharePreviewDefault: "Default output is a 3-day share link.",
            sharePreviewAdmin: "Logged-in admins can still open the page after link expiry.",
            shareCopySuccess: "Link copied to clipboard",
            shareCopyFallback: "Link generated. Copy it manually.",
            shareAdminOnly: "Only signed-in site admins can create new share links.",
            shareCustomRequired: "Choose a valid custom expiration time first.",
            shareCustomExpired: "The custom expiration time must be later than now.",
            shareGenerateError: "Failed to generate the share link. Try again later.",
            validityAdmin: "ADMIN-ALWAYS",
            validityNever: "NEVER",
            accessCheckingTitle: "Checking access...",
            accessCheckingMessage: "Verifying share token and admin session. Please wait.",
            accessAllowedTitle: "Access granted",
            accessAllowedAdmin: "Admin session detected. Opening the page now.",
            accessAllowedShare: "Share link verified. Opening the page now.",
            accessDeniedTitle: "Link unavailable",
            accessDeniedMissing: "This page requires a valid share link, or a logged-in admin session from the site backend.",
            accessDeniedExpired: "This share link has expired. Admin users can still open the page.",
            accessDeniedInvalid: "The share parameter is invalid or corrupted. Generate a new one.",
            accessDeniedGeneric: "Unable to confirm access for this page. Request a new share link.",
            accessMetaAdmin: "Mode: admin-session",
            accessMetaShare: "Mode: share-link",
            accessMetaExpired: "Expires at: ",
            accessMetaNever: "Never expires",
            accessLogin: "Admin Login",
            accessRefresh: "Check Again",
            loading: "Loading...",
            overlayGen: "GENERATING HD DOCUMENT..."
        },
        ru: {
            title: `Обзор продукции и цен VMAN Engineering`,
            supplier: "ПОСТАВЩИК:",
            sender: "ОТПРАВИТЕЛЬ:",
            receiver: "ПОЛУЧАТЕЛЬ:",
            validity: "СРОК ДЕЙСТВИЯ:",
            update: "СИНХРОНИЗАЦИЯ",
            part1_line1: "[ БЛОК 01 ]",
            part1_line2: "ГАЗОГЕНЕРАТОР + МОДУЛЬ МАЙНИНГ-СТОЕК",
            part2_line1: "[ БЛОК 02 ]",
            part2_line2: "ГАЗОВАЯ ЭЛЕКТРОСТАНЦИЯ",
            included: "Вкл.",
            sysTotal: "ОБЩАЯ СТОИМОСТЬ СИСТЕМЫ",
            headers: ["№", "ОПИСАНИЕ", "БРЕНД", "КОЛ", "RMB (¥)", "USD ($)", "EUR (€)", "CAD (C$)", "RUB (₽)"],
            fetchSuccess: "ГЛОБАЛЬНЫЕ КУРСЫ",
            refresh: "ОБНОВИТЬ",
            emailPlaceholder: "Введите email клиента",
            footerText: "<span class=\"text-[var(--gas-green-light)] font-bold\">///</span> Данное предложение создано на основе курсов валют в реальном времени. Окончательные цены определяются официальным коммерческим контрактом. VMAN Engineering.",
            btnSend: "Отправить",
            btnShare: "Поделиться",
            menuShareLink: "Создать ссылку",
            menuImg: "Экспорт изображения",
            menuPdf: "Экспорт PDF",
            shareTitle: "Создать ссылку",
            shareDesc: "Сформируйте ссылку с ограниченным сроком действия. Администратор сайта может открыть страницу в любой момент.",
            shareExpiryLabel: "Срок действия ссылки",
            shareExpiry1d: "Истекает через 1 день",
            shareExpiry3d: "Истекает через 3 дня",
            shareExpiry7d: "Истекает через 7 дней",
            shareExpiryNever: "Без срока",
            shareExpiryCustom: "Своя дата",
            shareCustomLabel: "Своя дата истечения",
            shareAdminHint: "Сессия администратора сайта не ограничивается сроком действия ссылки.",
            shareLinkLabel: "Ссылка",
            shareLinkPlaceholder: "Сначала создайте ссылку",
            shareGenerate: "Создать и скопировать",
            shareClose: "Закрыть",
            sharePreviewDefault: "По умолчанию создается ссылка на 3 дня.",
            sharePreviewAdmin: "Администратор может открыть страницу даже после истечения ссылки.",
            shareCopySuccess: "Ссылка скопирована",
            shareCopyFallback: "Ссылка создана. Скопируйте ее вручную.",
            shareAdminOnly: "Создавать новые ссылки может только вошедший администратор сайта.",
            shareCustomRequired: "Сначала выберите корректное время истечения.",
            shareCustomExpired: "Время истечения должно быть позже текущего времени.",
            shareGenerateError: "Не удалось создать ссылку. Повторите попытку позже.",
            validityAdmin: "ADMIN-ALWAYS",
            validityNever: "NEVER",
            accessCheckingTitle: "Проверка доступа...",
            accessCheckingMessage: "Проверяем ссылку и сессию администратора. Подождите.",
            accessAllowedTitle: "Доступ разрешен",
            accessAllowedAdmin: "Обнаружена сессия администратора. Открываем страницу.",
            accessAllowedShare: "Ссылка подтверждена. Открываем страницу.",
            accessDeniedTitle: "Ссылка недоступна",
            accessDeniedMissing: "Для этой страницы нужна действующая ссылка или активная сессия администратора сайта.",
            accessDeniedExpired: "Срок действия ссылки истек. Администратор сайта все еще может открыть страницу.",
            accessDeniedInvalid: "Параметр ссылки поврежден или недействителен. Создайте новую ссылку.",
            accessDeniedGeneric: "Не удалось подтвердить доступ к странице. Запросите новую ссылку.",
            accessMetaAdmin: "Режим: admin-session",
            accessMetaShare: "Режим: share-link",
            accessMetaExpired: "Истекает: ",
            accessMetaNever: "Без срока",
            accessLogin: "Вход админа",
            accessRefresh: "Проверить снова",
            loading: "Загрузка...",
            overlayGen: "СОЗДАНИЕ HD ДОКУМЕНТА..."
        }
    };

    // --- 数据模型 ---
    let appData = {
        part1: {
            desc: { zh: "HTM+ 500kW Gas Genset & Miner Rack Module", en: "HTM+ 500kW Gas Genset & Miner Rack Module", ru: "HTM+ 500kW Gas Genset & Miner Rack Module" },
            items1: [
                { id:"01", brand:"HTM+", qty:"1", price:607200, n:{ zh:"HTM+ Gas Engine 250kW*2 Set", en:"HTM+ Gas Engine 250kW*2 Set", ru:"HTM+ Gas Engine 250kW*2 Set" } },
                { id:"02", brand:"EvoTec", qty:"1", price:47026, n:{ zh:"EvoTec Alternator", en:"EvoTec Alternator", ru:"EvoTec Alternator" } },
                { id:"03", brand:"Woodward", qty:"1", price:66000, n:{ zh:"Woodward Control System", en:"Woodward Control System", ru:"Woodward Control System" } },
                { id:"04", brand:"-", qty:"1", price:-1, n:{ zh:"Smart Breaker", en:"Smart Breaker", ru:"Smart Breaker" } },
                { id:"05", brand:"-", qty:"1", price:-1, n:{ zh:"Exhaust Explosion-proof Valve", en:"Exhaust Explosion-proof Valve", ru:"Exhaust Explosion-proof Valve" } },
                { id:"06", brand:"Dungs", qty:"1", price:-1, n:{ zh:"Gas Supply Valve Dungs", en:"Gas Supply Valve Dungs", ru:"Gas Supply Valve Dungs" } },
                { id:"07", brand:"-", qty:"1", price:-1, n:{ zh:"Jacket Water Heater", en:"Jacket Water Heater", ru:"Jacket Water Heater" } },
                { id:"08", brand:"-", qty:"1", price:-1, n:{ zh:"Alternator Water Tank", en:"Alternator Water Tank", ru:"Alternator Water Tank" } },
                { id:"09", brand:"-", qty:"1", price:-1, n:{ zh:"Alternator Cooling Skid", en:"Alternator Cooling Skid", ru:"Alternator Cooling Skid" } },
                { id:"10", brand:"-", qty:"1", price:-1, n:{ zh:"Mounting Frame & Materials", en:"Mounting Frame & Materials", ru:"Mounting Frame & Materials" } },
                { id:"11", brand:"-", qty:"1", price:361200, n:{ zh:"Liquid Cooling Miner Module", en:"Liquid Cooling Miner Module", ru:"Liquid Cooling Miner Module" } },
                { id:"12", brand:"-", qty:"1", price:127200, n:{ zh:"40HQ Special Container", en:"40HQ Special Container", ru:"40HQ Special Container" } },
                { id:"13", brand:"-", qty:"1", price:6000, n:{ zh:"Integration Transfer Fee", en:"Integration Transfer Fee", ru:"Integration Transfer Fee" } },
                { id:"14", brand:"-", qty:"1", price:30000, n:{ zh:"Installation & Testing Fee", en:"Installation & Testing Fee", ru:"Installation & Testing Fee" } }
            ],
            desc2: { zh: "DT30+ 550kW Gas Genset & Miner Rack Module", en: "DT30+ 550kW Gas Genset & Miner Rack Module", ru: "DT30+ 550kW Gas Genset & Miner Rack Module" },
            items2: [
                { id:"01", brand:"Vman", qty:"1", price:418646, n:{ zh:"DT30+ Gas Engine 550kW", en:"DT30+ Gas Engine 550kW", ru:"DT30+ Gas Engine 550kW" } },
                { id:"02", brand:"Leroy-Somer", qty:"1", price:95026, n:{ zh:"Leroy-Somer LSA49.3 Alternator", en:"Leroy-Somer LSA49.3 Alternator", ru:"Leroy-Somer LSA49.3 Alternator" } },
                { id:"03", brand:"Leroy-Somer", qty:"1", price:3919, n:{ zh:"AVR Upgrade to D350", en:"AVR Upgrade to D350", ru:"AVR Upgrade to D350" } },
                { id:"04", brand:"-", qty:"1", price:133560, n:{ zh:"Control System", en:"Control System", ru:"Control System" } },
                { id:"05", brand:"ABB", qty:"1", price:16800, n:{ zh:"ABB Smart Breaker", en:"ABB Smart Breaker", ru:"ABB Smart Breaker" } },
                { id:"06", brand:"-", qty:"1", price:936, n:{ zh:"ATS Switch", en:"ATS Switch", ru:"ATS Switch" } },
                { id:"07", brand:"-", qty:"1", price:12360, n:{ zh:"Exhaust Valve & Effector", en:"Exhaust Valve & Effector", ru:"Exhaust Valve & Effector" } },
                { id:"08", brand:"Dungs", qty:"1", price:38390, n:{ zh:"Gas Supply Valve Dungs", en:"Gas Supply Valve Dungs", ru:"Gas Supply Valve Dungs" } },
                { id:"09", brand:"-", qty:"1", price:5400, n:{ zh:"Jacket Water Heater", en:"Jacket Water Heater", ru:"Jacket Water Heater" } },
                { id:"10", brand:"-", qty:"1", price:54000, n:{ zh:"Water Tank", en:"Water Tank", ru:"Water Tank" } },
                { id:"11", brand:"-", qty:"1", price:37114, n:{ zh:"Cooling Skid", en:"Cooling Skid", ru:"Cooling Skid" } },
                { id:"12", brand:"-", qty:"1", price:39510, n:{ zh:"Mounting Frame & Materials", en:"Mounting Frame & Materials", ru:"Mounting Frame & Materials" } },
                { id:"13", brand:"-", qty:"1", price:361200, n:{ zh:"Liquid Cooling Miner Module", en:"Liquid Cooling Miner Module", ru:"Liquid Cooling Miner Module" } },
                { id:"14", brand:"-", qty:"1", price:151200, n:{ zh:"40HQ Special Container", en:"40HQ Special Container", ru:"40HQ Special Container" } },
                { id:"15", brand:"-", qty:"1", price:6000, n:{ zh:"Integration Transfer Fee", en:"Integration Transfer Fee", ru:"Integration Transfer Fee" } },
                { id:"16", brand:"-", qty:"1", price:36000, n:{ zh:"Installation Fee", en:"Installation Fee", ru:"Installation Fee" } }
            ]
        },
        part2: {
            desc: { zh: "P1200GF（1200kW | 400V/50HZ）独立燃气发电系统", en: "P1200GF (1200kW | 400V/50HZ)", ru: "P1200GF (1200 кВт | 400В/50Гц) автономная газовая электростанция" },
            items1: [
                { id:"-", brand:"-", qty:"-", price:1476200, isHeader:true, n:{ zh:"基础发电机组", en:"Basic GenSet", ru:"Базовый генераторный агрегат" } },
                { id:"I-1", brand:"Vman", qty:"1", price:-1, n:{ zh:"VMAN DT58 燃气发动机", en:"VMAN DT58 Gas Engine", ru:"Газовый двигатель VMAN DT58" } },
                { id:"I-2", brand:"Vman", qty:"1", price:-1, n:{ zh:"HEINZMANN 控制系统", en:"HEINZMANN control system", ru:"Система управления HEINZMANN" } },
                { id:"I-3", brand:"ABB", qty:"1", price:-1, n:{ zh:"ABB 涡轮增压器", en:"ABB Turbocharger", ru:"Турбокомпрессор ABB" } },
                { id:"I-4", brand:"Vman", qty:"1", price:-1, n:{ zh:"安装底架", en:"Mounting frame", ru:"Монтажная рама" } },
                { id:"I-5", brand:"VULKAN", qty:"1", price:-1, n:{ zh:"弹性联轴器", en:"Elastic coupling", ru:"Эластичная муфта" } },
                { id:"I-6", brand:"Leroy-Somer", qty:"1", price:-1, n:{ zh:"400V 发电机 LSA50.2 L8", en:"400V Alternator LSA50.2 L8", ru:"Альтернатор 400В LSA50.2 L8" } },
                { id:"-", brand:"-", qty:"-", price:1131100, isHeader:true, n:{ zh:"系统配置", en:"System Options", ru:"Системные опции" } },
                { id:"II-1", brand:"Galanz/Wilo/Siemens", qty:"1", price:224000, n:{ zh:"冷却系统", en:"Cooling system", ru:"Система охлаждения" } },
                { id:"II-2", brand:"V-Corelink 1200", qty:"1", price:135000, n:{ zh:"机组控制系统", en:"Genset control system", ru:"Система управления генератором" } },
                { id:"II-3a", brand:"Schneider", qty:"1", price:100000, n:{ zh:"高压开关柜", en:"High Voltage Switch Cabinet", ru:"Высоковольтный шкаф" } },
                { id:"II-3b", brand:"ABB", qty:"1", price:0, n:{ zh:"低压开关柜", en:"Low Voltage Switch Cabinet", ru:"Низковольтный шкаф" } },
                { id:"II-4a", brand:"Vman DN250", qty:"1", price:20000, n:{ zh:"排气系统-消音器", en:"Exhaust System - Muffler", ru:"Выхлопная система - глушитель" } },
                { id:"II-4b", brand:"Vman", qty:"1", price:4800, n:{ zh:"排气防爆阀", en:"Exhaust explosion-proof valve", ru:"Взрывозащищенный клапан выхлопа" } },
                { id:"II-5a", brand:"Dungs", qty:"1", price:11300, n:{ zh:"燃气阀-过滤器", en:"Gas valve - Filter", ru:"Газовый клапан - фильтр" } },
                { id:"II-5b", brand:"Dungs", qty:"1", price:19000, n:{ zh:"燃气阀-电磁阀", en:"Gas valve - Solenoid valve", ru:"Газовый клапан - электромагнитный клапан" } },
                { id:"II-5c", brand:"Dungs", qty:"1", price:9000, n:{ zh:"燃气阀-调压器", en:"Gas valve - Pressure regulator", ru:"Газовый клапан - регулятор давления" } },
                { id:"II-6", brand:"Vman", qty:"1", price:10000, n:{ zh:"专用工具", en:"Special tools", ru:"Специальные инструменты" } },
                { id:"II-7", brand:"Smartgen", qty:"1", price:34000, n:{ zh:"电加热水预热器", en:"Electric Water Preheater", ru:"Электрический предпусковой подогреватель воды" } },
                { id:"II-8", brand:"Vman", qty:"1", price:7600, n:{ zh:"蓄电池（DC24V，4*195Ah）", en:"Battery (DC24V, 4*195Ah)", ru:"Аккумулятор (DC24V, 4*195Ah)" } },
                { id:"II-9a", brand:"Set", qty:"1", price:118500, n:{ zh:"余热回收-热水锅炉", en:"Heat recovery - Hot water boiler", ru:"Утилизация тепла - водогрейный котел" } },
                { id:"II-9b", brand:"Set", qty:"1", price:127500, n:{ zh:"余热回收-蒸汽锅炉", en:"Heat recovery - Steam boiler", ru:"Утилизация тепла - паровой котел" } },
                { id:"II-10", brand:"VULKAN", qty:"8", price:10400, n:{ zh:"弹簧减震器 3200kg", en:"Spring shock absorber 3200kg", ru:"Пружинный амортизатор 3200 кг" } },
                { id:"II-11", brand:"Vman", qty:"1", price:300000, n:{ zh:"40HQ 集装箱", en:"Container 40HQ", ru:"Контейнер 40HQ" } }
            ],
            desc2: { zh: "P2000GF（2000kW | 400V/50HZ）独立燃气发电系统", en: "P2000GF (2000kW | 400V/50HZ)", ru: "P2000GF (2000 кВт | 400В/50Гц) автономная газовая электростанция" },
            items2: [
                { id:"-", brand:"-", qty:"-", price:3290000, isHeader:true, n:{ zh:"基础发电机组", en:"Basic GenSet", ru:"Базовый генераторный агрегат" } },
                { id:"I-1", brand:"Vman", qty:"1", price:-1, n:{ zh:"HND CHG622V20 燃气发动机", en:"HND CHG622V20 Gas Engine", ru:"Газовый двигатель HND CHG622V20" } },
                { id:"I-2", brand:"Vman", qty:"1", price:-1, n:{ zh:"Heinzmann 控制系统柜", en:"Heinzmann control system cabinet", ru:"Шкаф управления Heinzmann" } },
                { id:"I-3", brand:"ABB", qty:"1", price:-1, n:{ zh:"ABB 涡轮增压器", en:"ABB turbocharger", ru:"Турбокомпрессор ABB" } },
                { id:"I-4", brand:"HND", qty:"1", price:-1, n:{ zh:"安装底架", en:"Mounting frame", ru:"Монтажная рама" } },
                { id:"I-5", brand:"VULKAN", qty:"1", price:-1, n:{ zh:"弹性联轴器", en:"Elastic coupling", ru:"Эластичная муфта" } },
                { id:"I-6", brand:"Leroy-Somer", qty:"1", price:-1, n:{ zh:"400V 发电机 LSA52.3 U16", en:"400V Alternator LSA52.3 U16", ru:"Альтернатор 400В LSA52.3 U16" } },
                { id:"-", brand:"-", qty:"-", price:1630115, isHeader:true, n:{ zh:"系统配置", en:"System Options", ru:"Системные опции" } },
                { id:"II-1", brand:"Galanz/Wilo/Siemens", qty:"1", price:305000, n:{ zh:"冷却系统", en:"Cooling system", ru:"Система охлаждения" } },
                { id:"II-2", brand:"V-Corelink2000", qty:"1", price:135000, n:{ zh:"机组控制系统", en:"Genset control system", ru:"Система управления генератором" } },
                { id:"II-3a", brand:"Schneider", qty:"1", price:100000, n:{ zh:"高压开关柜", en:"High Voltage Switch Cabinet", ru:"Высоковольтный шкаф" } },
                { id:"II-3b", brand:"ABB", qty:"1", price:55000, n:{ zh:"低压开关柜", en:"Low Voltage Switch Cabinet", ru:"Низковольтный шкаф" } },
                { id:"II-4a", brand:"HND DN400", qty:"1", price:23000, n:{ zh:"排气系统-消音器", en:"Exhaust System - Muffler", ru:"Выхлопная система - глушитель" } },
                { id:"II-4b", brand:"HND", qty:"1", price:4800, n:{ zh:"排气防爆阀", en:"Exhaust explosion-proof valve", ru:"Взрывозащищенный клапан выхлопа" } },
                { id:"II-5a", brand:"Dungs", qty:"1", price:13500, n:{ zh:"燃气阀-过滤器", en:"Gas valve - Filter", ru:"Газовый клапан - фильтр" } },
                { id:"II-5b", brand:"Dungs", qty:"1", price:27300, n:{ zh:"燃气阀-电磁阀", en:"Gas valve - Solenoid valve", ru:"Газовый клапан - электромагнитный клапан" } },
                { id:"II-5c", brand:"Dungs", qty:"1", price:15515, n:{ zh:"燃气阀-调压器", en:"Gas valve - Pressure regulator", ru:"Газовый клапан - регулятор давления" } },
                { id:"II-6", brand:"HND", qty:"1", price:10000, n:{ zh:"专用工具", en:"Special tools", ru:"Специальные инструменты" } },
                { id:"II-7", brand:"Smartgen", qty:"1", price:34000, n:{ zh:"电加热水预热器", en:"Electric Water Preheater", ru:"Электрический предпусковой подогреватель воды" } },
                { id:"II-8", brand:"HND", qty:"1", price:11400, n:{ zh:"蓄电池（DC24V，6*195Ah）", en:"Battery (DC24V, 6*195Ah)", ru:"Аккумулятор (DC24V, 6*195Ah)" } },
                { id:"II-9a", brand:"Set", qty:"1", price:225000, n:{ zh:"余热回收-热水锅炉", en:"Heat recovery - Hot water boiler", ru:"Утилизация тепла - водогрейный котел" } },
                { id:"II-9b", brand:"Set", qty:"1", price:255000, n:{ zh:"余热回收-蒸汽锅炉", en:"Heat recovery - Steam boiler", ru:"Утилизация тепла - паровой котел" } },
                { id:"II-10", brand:"VULKAN", qty:"12", price:15600, n:{ zh:"弹簧减震器 3200kg", en:"Spring shock absorber 3200kg", ru:"Пружинный амортизатор 3200 кг" } },
                { id:"II-11", brand:"Vman", qty:"1", price:400000, n:{ zh:"13000X3500X3500mm 集装箱", en:"Container 13000X3500X3500mm", ru:"Контейнер 13000X3500X3500мм" } }
            ]
        }
    };

    let currentLang = 'zh';
    let rates = { USD: 0.1398, EUR: 0.1265, CAD: 0.1888, RUB: 12.866 };

    let countdownTarget = Date.now() + 72 * 60 * 60 * 1000;

    window.onload = () => {
        setLang(currentLang);
        fetchRates();
        startClock();
    };

    async function fetchRates(isManual = false) {
        const statusEl = document.getElementById('rate-status');
        if (isManual) {
            statusEl.innerHTML = `<i class="fa-solid fa-rotate fa-spin text-[var(--gas-green-light)] mr-1.5"></i>${currentLang === 'zh' ? '正在刷新...' : currentLang === 'ru' ? 'Обновление...' : 'Refreshing...'}`;
        }
        
        try {
            const res = await fetch('https://open.er-api.com/v6/latest/CNY');
            const data = await res.json();
            if(data && data.rates) {
                rates.USD = data.rates.USD;
                rates.EUR = data.rates.EUR;
                rates.CAD = data.rates.CAD;
                rates.RUB = data.rates.RUB;
                statusEl.innerHTML = `<i class="fa-solid fa-wifi text-[var(--gas-green-light)] mr-1.5"></i>${dict[currentLang].fetchSuccess}`;
            }
        } catch(e) {
            const fallbackText = currentLang === 'zh'
                ? '汇率获取失败，使用基准数据'
                : currentLang === 'ru'
                    ? 'Не удалось получить курс, используются базовые данные'
                    : 'Rate fetch failed, using baseline data';
            statusEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-yellow-500 mr-1.5"></i>${fallbackText}`;
        }
        renderApp();
        triggerSmoothScroll(); 
    }

    function setLang(lang) {
        currentLang = lang;
        ['zh','en','ru'].forEach(l => {
            let btn = document.getElementById('btn-'+l);
            if (l === lang) {
                btn.className = "px-2 md:px-4 py-1 md:py-1.5 rounded transition-all bg-[var(--gas-green-primary)] text-white font-semibold shadow-[0_0_8px_rgba(40,167,69,0.4)]";
            } else {
                btn.className = "px-2 md:px-4 py-1 md:py-1.5 rounded transition-all text-[var(--text-body)] hover:text-white";
            }
        });
        
        document.getElementById('f-title').innerHTML = dict[lang].title;
        document.getElementById('lbl-supplier').innerText = dict[lang].supplier;
        document.getElementById('lbl-sender').innerText = dict[lang].sender;
        document.getElementById('lbl-receiver').innerText = dict[lang].receiver;
        document.getElementById('lbl-validity').innerText = dict[lang].validity;
        document.getElementById('lbl-update').innerHTML = `<span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--gas-green-light)] opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--gas-green-light)]"></span></span> ${dict[lang].update}`;
        document.getElementById('rate-status').innerHTML = `<i class="fa-solid fa-wifi text-[var(--gas-green-light)] mr-1.5"></i> ${dict[lang].fetchSuccess}`;
        
        document.getElementById('val-receiver').setAttribute('data-placeholder', dict[lang].emailPlaceholder);
        document.getElementById('footer-note').innerHTML = dict[lang].footerText;
        document.getElementById('btn-text-send').innerText = dict[lang].btnSend;
        document.getElementById('btn-text-share').innerText = dict[lang].btnShare;
        document.getElementById('btn-menu-img').innerText = dict[lang].menuImg;
        document.getElementById('btn-menu-pdf').innerText = dict[lang].menuPdf;
        document.getElementById('btn-text-refresh').innerText = dict[lang].refresh;
        document.getElementById('export-loading-text').innerText = dict[lang].overlayGen;
        document.title = `${dict[lang].title} - GasGx Green Style`;
        
        renderApp();
    }

    function formatMoney(num) {
        return num.toLocaleString('en-US', {maximumFractionDigits:0});
    }

    function triggerSmoothScroll() {
        const moneyElements = document.querySelectorAll('.money-val');
        moneyElements.forEach(el => {
            if(document.activeElement === el) return;
            
            const finalVal = el.getAttribute('data-val');
            if(!finalVal || finalVal === '-' || finalVal === dict[currentLang].included) return;

            let html = '';
            for(let char of finalVal) {
                if(/[0-9]/.test(char)) {
                    html += `<span class="num-scroll-wrap"><span class="num-scroll-col" data-target="${char}"><span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span></span></span>`;
                } else {
                    html += `<span class="num-scroll-wrap"><span>${char}</span></span>`;
                }
            }
            el.innerHTML = html;
        });

        document.body.offsetHeight;

        moneyElements.forEach(el => {
            const cols = el.querySelectorAll('.num-scroll-col');
            cols.forEach(col => {
                const target = parseInt(col.getAttribute('data-target'));
                col.style.transform = `translateY(-${target * 10}%)`;
            });
        });

        setTimeout(() => {
            moneyElements.forEach(el => {
                if(document.activeElement === el) return;
                const finalVal = el.getAttribute('data-val');
                if(finalVal) el.innerHTML = finalVal;
            });
        }, 500); 
    }

    function renderApp() {
        const d = dict[currentLang];
        let html = '';

        const buildSection = (descStr, itemsList, idx) => {
            let totalRMB = itemsList.filter(i => !i.isHeader && i.price > 0).reduce((sum, i) => sum + i.price, 0);
            
            let secHtml = `
            <div class="mb-10 md:mb-16">
                <h3 class="text-base md:text-lg font-semibold text-[var(--gas-green-light)] mb-4 md:mb-5 flex items-center gap-2 md:gap-3" contenteditable="true">
                    <span class="bg-[var(--gas-green-bg)] border border-[var(--gas-green-primary)] text-[var(--gas-green-light)] w-6 h-6 md:w-7 md:h-7 rounded flex items-center justify-center text-xs md:text-sm font-mono-num flex-shrink-0">${idx}</span>
                    <span class="leading-tight">${descStr[currentLang] || descStr.zh}</span>
                </h3>
                
                <div class="bg-[var(--bg-base)] border border-[var(--border-color)] rounded p-4 md:p-5 mb-4 md:mb-6 flex flex-col md:flex-row md:flex-wrap items-start md:items-center justify-between shadow-inner gap-4">
                    <span class="font-bold text-white tracking-wider text-xs md:text-sm" contenteditable="true">${d.sysTotal}:</span>
                    <div class="flex flex-wrap gap-x-4 md:gap-x-6 gap-y-2 text-sm md:text-[15px]">
                        <span class="flex items-center gap-2"><span class="gas-tag">RMB</span> <span class="text-[var(--gas-green-light)] font-mono-num font-bold money-val" data-val="¥${formatMoney(totalRMB)}">¥${formatMoney(totalRMB)}</span></span>
                        <span class="flex items-center gap-2"><span class="gas-tag">USD</span> <span class="text-[var(--gas-green-light)] font-mono-num font-bold money-val" data-val="$${formatMoney(totalRMB * rates.USD)}">$${formatMoney(totalRMB * rates.USD)}</span></span>
                        <span class="flex items-center gap-2"><span class="gas-tag">EUR</span> <span class="text-[var(--gas-green-light)] font-mono-num font-bold money-val" data-val="€${formatMoney(totalRMB * rates.EUR)}">€${formatMoney(totalRMB * rates.EUR)}</span></span>
                        <span class="flex items-center gap-2"><span class="gas-tag">CAD</span> <span class="text-[var(--gas-green-light)] font-mono-num font-bold money-val" data-val="C$${formatMoney(totalRMB * rates.CAD)}">C$${formatMoney(totalRMB * rates.CAD)}</span></span>
                        <span class="flex items-center gap-2"><span class="gas-tag">RUB</span> <span class="text-[var(--gas-green-light)] font-mono-num font-bold money-val" data-val="₽${formatMoney(totalRMB * rates.RUB)}">₽${formatMoney(totalRMB * rates.RUB)}</span></span>
                    </div>
                </div>

                <div class="table-responsive-wrapper w-full">
                    <table class="industrial-table text-left">
                        <thead>
                            <tr>
                                ${d.headers.map((h, i) => `<th contenteditable="true" class="${i===0?'w-12 text-center whitespace-nowrap':'whitespace-nowrap'}">${h}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
            `;

            itemsList.forEach((item, i) => {
                const isH = item.isHeader;
                const isInc = item.price === -1;
                
                const rawRmb = isInc ? d.included : `¥${formatMoney(item.price)}`;
                const rawUsd = isInc ? "-" : `$${formatMoney(item.price * rates.USD)}`;
                const rawEur = isInc ? "-" : `€${formatMoney(item.price * rates.EUR)}`;
                const rawCad = isInc ? "-" : `C$${formatMoney(item.price * rates.CAD)}`;
                const rawRub = isInc ? "-" : `₽${formatMoney(item.price * rates.RUB)}`;
                
                const htmlRmb = isInc ? `<span class="text-[var(--text-muted)] text-xs">${d.included}</span>` : formatMoney(item.price);
                const htmlUsd = isInc ? `<span class="text-[#333333]">-</span>` : formatMoney(item.price * rates.USD);
                const htmlEur = isInc ? `<span class="text-[#333333]">-</span>` : formatMoney(item.price * rates.EUR);
                const htmlCad = isInc ? `<span class="text-[#333333]">-</span>` : formatMoney(item.price * rates.CAD);
                const htmlRub = isInc ? `<span class="text-[#333333]">-</span>` : formatMoney(item.price * rates.RUB);

                const onEditFn = `onblur="updatePrice('${idx}', '${item.id}', this.innerText)"`;
                
                const priceClass = item.price > 0 ? 'font-mono-num text-[var(--gas-green-light)] font-medium' : '';
                const titleColor = isH ? 'text-[var(--gas-green-light)] font-semibold whitespace-nowrap' : 'text-white min-w-[200px]';
                const baseColor = isH ? 'text-[var(--text-muted)] opacity-50' : 'text-[var(--text-body)]';
                
                const animClass = isInc ? '' : 'money-val';

                secHtml += `
                    <tr style="${isH ? 'background-color: var(--bg-base);' : ''}">
                        <td contenteditable="true" class="${baseColor} text-center text-xs font-mono-num whitespace-nowrap">${item.id}</td>
                        <td contenteditable="true" class="${titleColor}">${item.n[currentLang] || item.n.zh}</td>
                        <td contenteditable="true" class="${baseColor} text-xs whitespace-nowrap">${item.brand}</td>
                        <td contenteditable="true" class="${baseColor} text-center font-mono-num whitespace-nowrap">${item.qty}</td>
                        <td contenteditable="${!isInc}" ${!isInc ? onEditFn : ''} class="${priceClass} ${animClass} whitespace-nowrap" data-val="${rawRmb}">${htmlRmb}</td>
                        <td class="${priceClass} ${animClass} whitespace-nowrap" data-val="${rawUsd}">${htmlUsd}</td>
                        <td class="${priceClass} ${animClass} whitespace-nowrap" data-val="${rawEur}">${htmlEur}</td>
                        <td class="${priceClass} ${animClass} whitespace-nowrap" data-val="${rawCad}">${htmlCad}</td>
                        <td class="${priceClass} ${animClass} whitespace-nowrap" data-val="${rawRub}">${htmlRub}</td>
                    </tr>
                `;
            });

            secHtml += `</tbody></table></div></div>`;
            html += secHtml;
        };

        buildSection(appData.part2.desc, appData.part2.items1, 1);
        buildSection(appData.part2.desc2, appData.part2.items2, 2);

        document.getElementById('content-area').innerHTML = html;
        
        document.getElementById('live-rates-display').innerHTML = `1 CNY <i class="fa-solid fa-arrow-right-arrow-left mx-1 text-white"></i> <span class="text-[var(--gas-green-light)]">${rates.USD.toFixed(4)} USD</span> | <span class="text-[var(--gas-green-light)]">${rates.EUR.toFixed(4)} EUR</span> | <span class="text-[var(--gas-green-light)]">${rates.CAD.toFixed(4)} CAD</span> | <span class="text-[var(--gas-green-light)]">${rates.RUB.toFixed(4)} RUB</span>`;
    }

    window.updatePrice = function(secIdx, itemId, newText) {
        const cleanNum = parseFloat(newText.replace(/[^\d.-]/g, ''));
        if(!isNaN(cleanNum)) {
            let targetArray;
            if(secIdx == 1) targetArray = appData.part1.items1;
            if(secIdx == 2) targetArray = appData.part1.items2;
            if(secIdx == 3) targetArray = appData.part2.items1;
            if(secIdx == 4) targetArray = appData.part2.items2;
            
            const item = targetArray.find(i => i.id === itemId);
            if(item && item.price !== cleanNum) {
                item.price = cleanNum;
                renderApp(); 
                triggerSmoothScroll(); 
            }
        }
    }

    function startClock() {
        setInterval(() => {
            const now = new Date();
            const y = now.getFullYear();
            const m = String(now.getMonth() + 1).padStart(2, '0');
            const d = String(now.getDate()).padStart(2, '0');
            const hh = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            const ss = String(now.getSeconds()).padStart(2, '0');
            
            document.getElementById('live-clock').innerText = `${hh}:${mm}:${ss}`;
            document.getElementById('live-date').innerText = `${y}-${m}-${d}`;
            
            const remaining = Math.max(0, countdownTarget - Date.now());
            const hoursLeft = Math.floor(remaining / (1000 * 60 * 60));
            const minutesLeft = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const secondsLeft = Math.floor((remaining % (1000 * 60)) / 1000);
            
            const validityEl = document.getElementById('val-validity');
            if(validityEl && document.activeElement !== validityEl) {
                validityEl.innerText = `${String(hoursLeft).padStart(2, '0')}:${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;
            }
        }, 1000);
    }

    function getFileName(ext) {
        const titleEl = document.getElementById('f-title');
        const rawText = titleEl ? titleEl.innerText : 'Quotation';
        const title = rawText.replace(/[\n\r]/g, '').trim().replace(/\s+/g, '_');
        const now = new Date();
        const timeStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
        return `${title}_${timeStr}.${ext}`;
    }

    // Capture exact size without using a clone by briefly applying absolute positioning
    async function createDirectCapture() {
        const element = document.getElementById('export-area');
        
        // Save original styles
        const origStyles = {
            position: element.style.position,
            width: element.style.width,
            padding: element.style.padding,
            backgroundColor: element.style.backgroundColor,
            zIndex: element.style.zIndex,
            overflow: element.style.overflow
        };
        
        // Force desktop dimensions while keeping it visible in the document flow
        element.style.width = '1280px';
        element.style.padding = '40px';
        element.style.backgroundColor = '#161B22';
        
        const wrappers = element.querySelectorAll('.table-responsive-wrapper');
        const origWrapperStyles = [];
        wrappers.forEach(w => {
            origWrapperStyles.push(w.style.overflowX);
            w.style.overflowX = 'visible';
        });
        
        // Allow the browser to repaint
        await new Promise(r => setTimeout(r, 100));
        
        const exactHeight = element.scrollHeight; 
        const exactWidth = element.offsetWidth;
        
        const canvas = await html2canvas(element, { 
            scale: 2, 
            useCORS: true, 
            backgroundColor: '#161B22', 
            windowWidth: exactWidth, 
            width: exactWidth 
        });
        
        // Restore original styles
        element.style.position = origStyles.position;
        element.style.width = origStyles.width;
        element.style.padding = origStyles.padding;
        element.style.backgroundColor = origStyles.backgroundColor;
        element.style.zIndex = origStyles.zIndex;
        element.style.overflow = origStyles.overflow;
        
        wrappers.forEach((w, i) => {
            w.style.overflowX = origWrapperStyles[i];
        });
        
        return { canvas, exactWidth, exactHeight };
    }

    function showOverlay() {
        const overlay = document.getElementById('export-overlay');
        overlay.classList.remove('hidden');
        void overlay.offsetWidth;
        overlay.classList.remove('opacity-0');
        overlay.classList.add('opacity-100');
    }

    function hideOverlay() {
        const overlay = document.getElementById('export-overlay');
        overlay.classList.remove('opacity-100');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }

    function updateBackToTop() {
        const button = document.getElementById('back-to-top');
        if(!button) return;

        const shouldShow = window.scrollY > Math.max(320, window.innerHeight * 0.6);
        button.classList.toggle('is-visible', shouldShow);
    }

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function isMobileViewport() {
        return window.matchMedia('(max-width: 767px)').matches;
    }

    function closeShareMenu() {
        const menu = document.getElementById('share-menu');
        const arrow = document.getElementById('icon-share-down');
        if(menu) menu.classList.add('hidden');
        if(arrow) arrow.classList.remove('rotate-180');
    }

    function toggleShareMenu(event) {
        if(!isMobileViewport()) return;

        event.preventDefault();
        event.stopPropagation();

        const menu = document.getElementById('share-menu');
        const arrow = document.getElementById('icon-share-down');
        if(!menu) return;

        const willOpen = menu.classList.contains('hidden');
        menu.classList.toggle('hidden');
        if(arrow) arrow.classList.toggle('rotate-180', willOpen);
    }

    document.addEventListener('click', (event) => {
        const shareGroup = document.getElementById('share-group');
        if(!shareGroup || shareGroup.contains(event.target)) return;
        closeShareMenu();
    });

    window.addEventListener('resize', () => {
        if(!isMobileViewport()) closeShareMenu();
    });

    window.addEventListener('scroll', updateBackToTop, { passive: true });
    window.addEventListener('load', updateBackToTop);

    async function exportPDF() {
        const btn = document.getElementById('btn-share');
        const originalHtml = btn.innerHTML;
        closeShareMenu();
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin md:mr-2"></i> <span class="hidden md:inline">${dict[currentLang].loading}</span>`;
        btn.classList.add('opacity-75', 'cursor-not-allowed');
        btn.disabled = true;

        showOverlay();
        await new Promise(r => setTimeout(r, 400));

        try {
            const { canvas, exactWidth, exactHeight } = await createDirectCapture();

            const opt = {
                margin:       0,
                filename:     getFileName('pdf'),
                image:        { type: 'jpeg', quality: 1 },
                jsPDF:        { unit: 'px', format: [exactWidth, exactHeight], orientation: 'portrait' } 
            };
            
            await html2pdf().set(opt).from(canvas).save();
        } finally {
            btn.innerHTML = originalHtml;
            btn.classList.remove('opacity-75', 'cursor-not-allowed');
            btn.disabled = false;
            hideOverlay();
        }
    }

    async function exportImage() {
        const btn = document.getElementById('btn-share');
        const originalHtml = btn.innerHTML;
        closeShareMenu();
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin md:mr-2" id="icon-share"></i> <span id="btn-text-share" class="hidden md:inline">${dict[currentLang].loading}</span> <i class="fa-solid fa-angle-down ml-2 text-xs" id="icon-share-down"></i>`;
        btn.classList.add('opacity-75', 'cursor-not-allowed');
        
        showOverlay();
        await new Promise(r => setTimeout(r, 400));
        
        try {
            const { canvas } = await createDirectCapture();
            const imgData = canvas.toDataURL('image/png');
            
            const link = document.createElement('a');
            link.download = getFileName('png');
            link.href = imgData;
            link.click();

            setTimeout(() => {
                alert('✅ 高清长图已生成并下载。\n如需发送到微信或 Telegram，可直接使用该图片。');
            }, 500);
        } finally {
            btn.innerHTML = originalHtml;
            btn.classList.remove('opacity-75', 'cursor-not-allowed');
            hideOverlay();
        }
    }

    function sendEmail() {
        const receiver = document.getElementById('val-receiver').innerText.trim();
        if(!receiver) {
            alert("⚠️ 请先填写客户邮箱地址。");
            return;
        }
        const sender = document.getElementById('val-sender').innerText.trim();
        const titleEl = document.getElementById('f-title');
        const title = titleEl ? titleEl.innerText.replace(/[\n\r]/g, '').trim() : 'Quotation';
        
        const subject = encodeURIComponent(`[SYS_DATA] ${title} - VMAN Engineering`);
        const body = encodeURIComponent(`Dear sir/madam,\n\nPlease find our latest technical quotation for the Gas Genset & Miner Rack Module project attached (or refer to the generated document).\n\nBest Regards,\n${sender}`);
        
        window.location.href = `mailto:${receiver}?subject=${subject}&body=${body}`;
    }
