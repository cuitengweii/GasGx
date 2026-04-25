(function () {
    const TRANSLATIONS = {
        "GasGx: Natural Gas Power Generation & Mining Whitepaper": "GasGx\uff1a\u5929\u7136\u6c14\u53d1\u7535\u4e0e\u7b97\u529b\u767d\u76ae\u4e66",
        "GasGx Industry Report 2026: Natural Gas Power & Mining": "GasGx 2026 \u884c\u4e1a\u62a5\u544a\uff1a\u5929\u7136\u6c14\u7535\u529b\u4e0e\u7b97\u529b",
        "2026 Whitepaper": "2026 \u767d\u76ae\u4e66",
        "Stranded Energy": "\u6ede\u7559\u80fd\u6e90",
        "Reshaping Global Computation": "\u91cd\u5851\u5168\u7403\u7b97\u529b",
        "Transforming 151 billion cubic meters of wasted natural gas into the backbone of the decentralized digital economy and AI infrastructure.": "\u5c06 1510 \u4ebf\u7acb\u65b9\u7c73\u88ab\u6d6a\u8d39\u7684\u5929\u7136\u6c14\u8f6c\u5316\u4e3a\u53bb\u4e2d\u5fc3\u5316\u6570\u5b57\u7ecf\u6d4e\u4e0e AI \u57fa\u7840\u8bbe\u65bd\u7684\u80fd\u6e90\u5e95\u5ea7\u3002",
        "Gas Flared Globally": "\u5168\u7403\u653e\u7a7a\u71c3\u70e7\u5929\u7136\u6c14",
        "Lost Economic Value": "\u635f\u5931\u7ecf\u6d4e\u4ef7\u503c",
        "CO2e Emissions": "\u4e8c\u6c27\u5316\u78b3\u5f53\u91cf\u6392\u653e",
        "The Energy-Compute Paradox": "\u80fd\u6e90\u4e0e\u7b97\u529b\u6096\u8bba",
        "Market Misalignment": "\u5e02\u573a\u9519\u914d",
        "Wasted Resources": "\u8d44\u6e90\u6d6a\u8d39",
        "Rising Compute Costs": "\u7b97\u529b\u6210\u672c\u4e0a\u5347",
        "The GasGx Solution": "GasGx \u89e3\u51b3\u65b9\u6848",
        "Global Flaring Leaders vs. Mining Potential": "\u5168\u7403\u653e\u7a7a\u71c3\u70e7\u4e3b\u8981\u56fd\u5bb6\u4e0e\u6316\u77ff\u6f5c\u529b",
        "Digital Flare Mitigation Architecture": "\u6570\u5b57\u5316\u706b\u70ac\u51cf\u6392\u67b6\u6784",
        "Stranded Gas": "\u6ede\u7559\u5929\u7136\u6c14",
        "Generation Unit": "\u53d1\u7535\u5355\u5143",
        "Hash Huts": "\u7b97\u529b\u8231",
        "Value Output": "\u4ef7\u503c\u8f93\u51fa",
        "Economic Feasibility": "\u7ecf\u6d4e\u53ef\u884c\u6027",
        "Profitability Sensitivity Surface": "\u76c8\u5229\u654f\u611f\u6027\u66f2\u9762",
        "ESG & Carbon Credits": "ESG \u4e0e\u78b3\u4fe1\u7528",
        "The Methane Multiplier Effect": "\u7532\u70f7\u500d\u589e\u6548\u5e94",
        "Future Horizon: From BTC to AI": "\u672a\u6765\u5c55\u671b\uff1a\u4ece BTC \u5230 AI",
        "Global Expansion": "\u5168\u7403\u6269\u5f20",
        "AI Transition": "AI \u8f6c\u578b",
        "Financialization": "\u91d1\u878d\u5316",
        "GasGx Strategic Report": "GasGx \u6218\u7565\u62a5\u544a",
        "GasGx Industry Report 2026:": "GasGx 2026 \u884c\u4e1a\u62a5\u544a\uff1a",
        "Industrial Convergence of Energy & Compute": "\u80fd\u6e90\u4e0e\u7b97\u529b\u7684\u4ea7\u4e1a\u878d\u5408",
        "Market dynamics, technical evolution, regulatory reshaping, and economic models in the 1 ZettaHash era.": "\u805a\u7126 1 ZettaHash \u65f6\u4ee3\u7684\u5e02\u573a\u52a8\u6001\u3001\u6280\u672f\u6f14\u8fdb\u3001\u76d1\u7ba1\u91cd\u5851\u4e0e\u7ecf\u6d4e\u6a21\u578b\u3002",
        "Jan 20, 2026": "2026 \u5e74 1 \u6708 20 \u65e5",
        "169 Source Index": "169 \u9879\u6765\u6e90\u7d22\u5f15",
        "1,000 EH/s Milestone": "1,000 EH/s \u91cc\u7a0b\u7891",
        "Contents": "\u76ee\u5f55",
        "1. Executive Summary": "1. \u6267\u884c\u6458\u8981",
        "2. Macro Environment": "2. \u5b8f\u89c2\u73af\u5883",
        "2.1 Gas Market Dynamics": "2.1 \u5929\u7136\u6c14\u5e02\u573a\u52a8\u6001",
        "2.2 Bitcoin Economics": "2.2 \u6bd4\u7279\u5e01\u7ecf\u6d4e\u6a21\u578b",
        "2.3 Regulatory Storm": "2.3 \u76d1\u7ba1\u98ce\u66b4",
        "3. Technical Evolution": "3. \u6280\u672f\u6f14\u8fdb",
        "3.1 Hardware: 15 J/TH": "3.1 \u786c\u4ef6\uff1a15 J/TH",
        "3.2 Immersion Cooling": "3.2 \u6d78\u6ca1\u5f0f\u51b7\u5374",
        "4. Business Model": "4. \u5546\u4e1a\u6a21\u5f0f",
        "4.1 LCOE Analysis": "4.1 \u5e73\u51c6\u5316\u7535\u529b\u6210\u672c\u5206\u6790",
        "4.2 Carbon Credits": "4.2 \u78b3\u4fe1\u7528",
        "5. Competition": "5. \u7ade\u4e89\u683c\u5c40",
        "6. From BTC to AI": "6. \u4ece BTC \u5230 AI",
        "7. Outlook & Risks": "7. \u5c55\u671b\u4e0e\u98ce\u9669",
        "References": "\u53c2\u8003\u8d44\u6599",
        "1. Executive Summary: The Industrial Convergence": "1. \u6267\u884c\u6458\u8981\uff1a\u4ea7\u4e1a\u878d\u5408",
        "Key Driver: The WEC Mandate": "\u6838\u5fc3\u9a71\u52a8\uff1aWEC \u5f3a\u5236\u7ea6\u675f",
        "2. Global Macro Energy & Compute Environment (2026)": "2. \u5168\u7403\u5b8f\u89c2\u80fd\u6e90\u4e0e\u7b97\u529b\u73af\u5883\uff082026\uff09",
        "2.1 Global Natural Gas Market Dynamics": "2.1 \u5168\u7403\u5929\u7136\u6c14\u5e02\u573a\u52a8\u6001",
        "USA Henry Hub & LNG Effects": "\u7f8e\u56fd Henry Hub \u4e0e LNG \u5f71\u54cd",
        "Canada AECO & Regional Arbitrage": "\u52a0\u62ff\u5927 AECO \u4e0e\u533a\u57df\u5957\u5229",
        "2.2 Bitcoin Network Economics": "2.2 \u6bd4\u7279\u5e01\u7f51\u7edc\u7ecf\u6d4e\u6a21\u578b",
        "2.3 The Regulatory Storm": "2.3 \u76d1\u7ba1\u98ce\u66b4",
        "3. Technical Infrastructure Evolution": "3. \u6280\u672f\u57fa\u7840\u8bbe\u65bd\u6f14\u8fdb",
        "3.1 Hardware: The Moore's Law of 15 J/TH": "3.1 \u786c\u4ef6\uff1a15 J/TH \u7684\u6469\u5c14\u5b9a\u5f8b",
        "3.2 Cooling Revolution: Immersion Dominance": "3.2 \u51b7\u5374\u9769\u547d\uff1a\u6d78\u6ca1\u5f0f\u4e3b\u5bfc",
        "3.3 Modular Generation": "3.3 \u6a21\u5757\u5316\u53d1\u7535",
        "4. Business Model & Economic Analysis": "4. \u5546\u4e1a\u6a21\u5f0f\u4e0e\u7ecf\u6d4e\u5206\u6790",
        "4.1 Cost Structure (LCOE Analysis)": "4.1 \u6210\u672c\u7ed3\u6784\uff08LCOE \u5206\u6790\uff09",
        "4.2 Revenue Stacking: Carbon Credits": "4.2 \u6536\u76ca\u53e0\u52a0\uff1a\u78b3\u4fe1\u7528",
        "Avoiding WEC Fines": "\u89c4\u907f WEC \u7f5a\u91d1",
        "TIER Credits (Alberta)": "TIER \u4fe1\u7528\uff08\u963f\u5c14\u4f2f\u5854\uff09",
        "4.3 Profitability Sensitivity": "4.3 \u76c8\u5229\u654f\u611f\u6027",
        "5. Competitive Landscape": "5. \u7ade\u4e89\u683c\u5c40",
        "6. From Bitcoin to AI: The Second Curve": "6. \u4ece\u6bd4\u7279\u5e01\u5230 AI\uff1a\u7b2c\u4e8c\u589e\u957f\u66f2\u7ebf",
        "7. Future Outlook & Risks": "7. \u672a\u6765\u5c55\u671b\u4e0e\u98ce\u9669",
        "Conclusion: Distributed Compute Utilities": "\u7ed3\u8bba\uff1a\u5206\u5e03\u5f0f\u7b97\u529b\u516c\u7528\u4e8b\u4e1a"
    };

    const ORIGINALS = new WeakMap();
    const NORMALIZED_TRANSLATIONS = Object.fromEntries(
        Object.entries(TRANSLATIONS).map(([key, value]) => [key.replace(/\s+/g, " ").trim(), value])
    );

    function getLang() {
        const stored = window.localStorage.getItem("gasgx-lang") || window.localStorage.getItem("gas_lang");
        return String(stored || document.documentElement.lang || "en").toLowerCase().startsWith("zh") ? "zh" : "en";
    }

    function restoreTitle() {
        const original = Object.entries(TRANSLATIONS).find(([, value]) => value === document.title);
        if (original) document.title = original[0];
    }

    function translateNode(node, lang) {
        if (!ORIGINALS.has(node)) ORIGINALS.set(node, node.nodeValue);
        const original = ORIGINALS.get(node);
        const trimmed = original.trim();
        if (!trimmed) return;
        if (lang !== "zh") {
            node.nodeValue = original;
            return;
        }
        const translated = TRANSLATIONS[trimmed] || NORMALIZED_TRANSLATIONS[trimmed.replace(/\s+/g, " ").trim()];
        if (translated) node.nodeValue = original.replace(trimmed, translated);
    }

    function applyResourceI18n() {
        const lang = getLang();
        document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
        if (lang === "zh" && TRANSLATIONS[document.title]) document.title = TRANSLATIONS[document.title];
        if (lang !== "zh") restoreTitle();

        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                const parent = node.parentElement;
                if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach((node) => translateNode(node, lang));
    }

    document.addEventListener("DOMContentLoaded", applyResourceI18n);
    document.addEventListener("gasgx:shared-ui-ready", applyResourceI18n);
    document.addEventListener("gasgx:lang-changed", applyResourceI18n);
    window.GGXApplyResourceI18n = applyResourceI18n;
})();
