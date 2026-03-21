(function (window) {
    "use strict";

    const DEFAULTS = Object.freeze({
        storageKey: "gasgx-main-auth",
        signInUrl: "/account/user.html",
        accountUrl: "/account/account.html",
        signOutRedirectUrl: "/account/user.html",
        returnUrlStorageKey: "gx_main_return_url",
        supabaseUrl: "https://mkpcliytqudclkwtewru.supabase.co",
        supabaseKey: "sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw",
        providerRollout: {
            twitter: false,
            linkedin: false
        }
    });

    function getSourceConfig(sourceConfig) {
        if (sourceConfig && typeof sourceConfig === "object") {
            return sourceConfig;
        }
        return window.GASGX_SITE_SHELL_CONFIG?.site?.mainAuth || {};
    }

    function pickString(sourceConfig, key, fallback) {
        const candidate = typeof sourceConfig?.[key] === "string" ? sourceConfig[key].trim() : "";
        return candidate || fallback;
    }

    function resolveConfig(sourceConfig, overrides) {
        const source = getSourceConfig(sourceConfig);
        const resolved = {
            storageKey: pickString(source, "storageKey", DEFAULTS.storageKey),
            signInUrl: pickString(source, "signInUrl", DEFAULTS.signInUrl),
            accountUrl: pickString(source, "accountUrl", DEFAULTS.accountUrl),
            signOutRedirectUrl: pickString(source, "signOutRedirectUrl", DEFAULTS.signOutRedirectUrl),
            returnUrlStorageKey: pickString(source, "returnUrlStorageKey", DEFAULTS.returnUrlStorageKey),
            supabaseUrl: pickString(source, "supabaseUrl", DEFAULTS.supabaseUrl),
            supabaseKey: pickString(source, "supabaseKey", DEFAULTS.supabaseKey),
            providerRollout: {
                twitter: Boolean(source?.providerRollout?.twitter === true),
                linkedin: Boolean(source?.providerRollout?.linkedin === true)
            }
        };

        if (!overrides || typeof overrides !== "object") {
            return resolved;
        }

        Object.keys(resolved).forEach((key) => {
            if (key === "providerRollout") return;
            if (typeof overrides[key] === "string" && overrides[key].trim()) {
                resolved[key] = overrides[key].trim();
            }
        });

        if (overrides.providerRollout && typeof overrides.providerRollout === "object") {
            resolved.providerRollout = {
                twitter: Boolean(overrides.providerRollout.twitter === true || resolved.providerRollout.twitter),
                linkedin: Boolean(overrides.providerRollout.linkedin === true || resolved.providerRollout.linkedin)
            };
        }

        return resolved;
    }

    function createClient(supabaseSdk, sourceConfig, authOverrides) {
        if (!supabaseSdk || typeof supabaseSdk.createClient !== "function") {
            return null;
        }

        const runtimeConfig = resolveConfig(sourceConfig);
        return supabaseSdk.createClient(runtimeConfig.supabaseUrl, runtimeConfig.supabaseKey, {
            auth: Object.assign({
                storageKey: runtimeConfig.storageKey,
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }, authOverrides || {})
        });
    }

    function getStorageKeys(sourceConfig) {
        const runtimeConfig = resolveConfig(sourceConfig);
        return [
            runtimeConfig.storageKey,
            `${runtimeConfig.storageKey}-code-verifier`
        ];
    }

    function clearStorage(sourceConfig) {
        getStorageKeys(sourceConfig).forEach((key) => {
            try {
                window.localStorage.removeItem(key);
            } catch (error) {
                console.warn("Main auth localStorage cleanup warning:", error);
            }
            try {
                window.sessionStorage.removeItem(key);
            } catch (error) {
                console.warn("Main auth sessionStorage cleanup warning:", error);
            }
        });
    }

    async function signOut(options) {
        const settings = options && typeof options === "object" ? options : {};
        const runtimeConfig = resolveConfig(settings.runtimeConfig);
        const redirectTo = typeof settings.redirectTo === "string" && settings.redirectTo.trim()
            ? settings.redirectTo.trim()
            : runtimeConfig.signOutRedirectUrl;

        try {
            if (settings.client?.auth?.signOut) {
                await settings.client.auth.signOut({ scope: "global" });
            }
        } catch (error) {
            if (typeof settings.onError === "function") {
                settings.onError(error);
            } else {
                console.error(settings.errorLabel || "Main auth sign-out failed:", error);
            }
        } finally {
            clearStorage(runtimeConfig);
            if (typeof settings.onComplete === "function") {
                settings.onComplete();
            }
            if (settings.skipRedirect !== true && redirectTo) {
                window.location.replace(redirectTo);
            }
        }
    }

    function isAuthCallbackUrl(locationLike) {
        const target = locationLike || window.location;
        const hash = String(target?.hash || "");
        const search = new URLSearchParams(String(target?.search || ""));
        return Boolean(
            hash.includes("access_token") ||
            search.has("code") ||
            search.has("error") ||
            search.has("error_description")
        );
    }

    function normalizeExcludedPaths(runtimeConfig, excludedPaths) {
        if (Array.isArray(excludedPaths) && excludedPaths.length) {
            return excludedPaths;
        }
        return [runtimeConfig.signInUrl, runtimeConfig.accountUrl];
    }

    function saveReturnUrl(options) {
        const settings = options && typeof options === "object" ? options : {};
        const runtimeConfig = resolveConfig(settings.runtimeConfig);
        const storage = settings.storage || window.sessionStorage;
        const locationLike = settings.location || window.location;
        const referrer = typeof settings.referrer === "string" ? settings.referrer : document.referrer;
        const excludedPaths = normalizeExcludedPaths(runtimeConfig, settings.excludePaths);

        if (isAuthCallbackUrl(locationLike) || !referrer || !referrer.startsWith(window.location.origin)) {
            return null;
        }

        try {
            const refUrl = new URL(referrer);
            if (excludedPaths.includes(refUrl.pathname)) {
                return null;
            }
            const value = `${refUrl.pathname}${refUrl.search}${refUrl.hash}`;
            storage.setItem(runtimeConfig.returnUrlStorageKey, value);
            return value;
        } catch (error) {
            return null;
        }
    }

    function consumeReturnUrl(options) {
        const settings = options && typeof options === "object" ? options : {};
        const runtimeConfig = resolveConfig(settings.runtimeConfig);
        const storage = settings.storage || window.sessionStorage;
        const fallbackPath = typeof settings.fallbackPath === "string" && settings.fallbackPath.trim()
            ? settings.fallbackPath.trim()
            : runtimeConfig.accountUrl;

        try {
            const savedUrl = storage.getItem(runtimeConfig.returnUrlStorageKey);
            if (savedUrl && savedUrl.startsWith("/")) {
                storage.removeItem(runtimeConfig.returnUrlStorageKey);
                return savedUrl;
            }
        } catch (error) {
            return fallbackPath;
        }

        return fallbackPath;
    }

    window.GasGxMainAuthShared = {
        defaults: DEFAULTS,
        resolveConfig,
        createClient,
        getStorageKeys,
        clearStorage,
        signOut,
        isAuthCallbackUrl,
        saveReturnUrl,
        consumeReturnUrl
    };
})(window);
