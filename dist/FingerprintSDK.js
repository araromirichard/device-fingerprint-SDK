async function generateDeviceFingerprint() {
    const apiKey = "l00e81-23y8l5-r6r808-66u7pf";
    const currentPageURL = window.location.href;
    const homeRoute = window.location.origin;
    async function fetchFromAPI(url) {
        try {
            const response = await fetch(url);
            if (!response.ok)
                throw new Error("Network response was not ok");
            return await response.json();
        }
        catch {
            return null;
        }
    }
    async function hashString(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
    }
    function getBrowserMetadata() {
        const { userAgent, language, platform, languages } = navigator;
        const screenResolution = `${screen.width}x${screen.height}`;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";
        const hardwareConcurrency = navigator.hardwareConcurrency || "unknown";
        const deviceMemory = navigator.deviceMemory || "unknown";
        const colorDepth = screen.colorDepth || "unknown";
        const devicePixelRatio = window.devicePixelRatio || "unknown";
        return {
            userAgent,
            language,
            languages: languages.join(","),
            platform,
            screenResolution,
            timezone,
            hardwareConcurrency,
            deviceMemory,
            colorDepth,
            devicePixelRatio,
        };
    }
    async function getPublicIP() {
        try {
            const response = await fetch("https://api64.ipify.org?format=json", { cache: "no-cache" });
            const data = await response.json();
            return data?.ip || null;
        }
        catch (error) {
            console.error("Error fetching public IP:", error);
            return null;
        }
    }
    async function checkIPReputation(ip) {
        const url = `https://proxycheck.io/v2/${ip}?key=${apiKey}&vpn=1&asn=1&threat=1&risk=1`;
        return await fetchFromAPI(url);
    }
    async function checkDNSLeak() {
        const dnsLeakCheckUrl = `https://cloudflare-dns.com/dns-query?name=${homeRoute}&type=A`;
        const dnsData = await fetch(dnsLeakCheckUrl, {
            headers: { Accept: "application/dns-json" },
        })
            .then((response) => response.json())
            .catch(() => null);
        if (!dnsData || !dnsData.Answer)
            return false;
        const dnsServer = dnsData.Answer[0].data;
        const knownPublicDNS = ["8.8.8.8", "1.1.1.1", "9.9.9.9", "208.67.222.222"];
        return knownPublicDNS.includes(dnsServer);
    }
    async function detectIncognitoMode() {
        return new Promise((resolve) => {
            const fs = window.RequestFileSystem ||
                window.webkitRequestFileSystem;
            if (!fs) {
                resolve(false);
                return;
            }
            fs(window.TEMPORARY, 100, () => resolve(false), () => resolve(true));
        });
    }
    async function measureLatency(endpoint) {
        const start = performance.now();
        const response = await fetch(endpoint, { cache: "no-cache" });
        const end = performance.now();
        return response.ok ? end - start : Infinity;
    }
    async function hasIPChanged(initialIP) {
        const currentIP = await getPublicIP();
        return currentIP !== initialIP;
    }
    async function detectEmulator() {
        const userAgent = navigator.userAgent.toLowerCase();
        return /emulator|virtual|sdk|bot|crawler|spider|phantom/i.test(userAgent);
    }
    // Canvas Fingerprint Generation
    function getCanvasFingerprint() {
        try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            // Check if the context is null
            if (!ctx) {
                return "canvas_context_error";
            }
            ctx.textBaseline = "top";
            ctx.font = "14px Arial";
            ctx.fillStyle = "#f60";
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = "#069";
            ctx.fillText("Fingerprinting Test", 2, 15);
            return canvas.toDataURL();
        }
        catch (e) {
            return "canvas_fingerprint_error";
        }
    }
    // WebGL Fingerprint Generation
    function getWebGLFingerprint() {
        try {
            const canvas = document.createElement("canvas");
            // Get the WebGL context with type assertion
            const gl = canvas.getContext("webgl") ||
                canvas.getContext("experimental-webgl");
            // Check if the WebGL context is available
            if (!gl) {
                return "webgl_unavailable";
            }
            // Check for the WEBGL_debug_renderer_info extension
            const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
            const renderer = debugInfo
                ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
                : "unknown_renderer";
            const vendor = debugInfo
                ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
                : "unknown_vendor";
            return `${renderer}-${vendor}`;
        }
        catch (e) {
            return "webgl_fingerprint_error";
        }
    }
    // Audio Fingerprint Generation
    async function getAudioFingerprint() {
        return new Promise((resolve) => {
            try {
                const audioCtx = new window.OfflineAudioContext(1, 44100, 44100);
                const oscillator = audioCtx.createOscillator();
                const compressor = audioCtx.createDynamicsCompressor();
                oscillator.type = "triangle";
                oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime); // 1000 Hz
                oscillator.connect(compressor);
                compressor.connect(audioCtx.destination);
                oscillator.start(0);
                oscillator.stop(0.1);
                audioCtx
                    .startRendering()
                    .then((renderedBuffer) => {
                    const fingerprint = renderedBuffer
                        .getChannelData(0)
                        .slice(0, 100)
                        .reduce((acc, val) => acc + Math.abs(val), 0)
                        .toString();
                    resolve(fingerprint);
                })
                    .catch(() => {
                    resolve("audio_rendering_error");
                });
            }
            catch (e) {
                resolve("audio_fingerprint_error");
            }
        });
    }
    async function initializeFingerprint(endpoint) {
        try {
            const metadata = getBrowserMetadata();
            const fingerprintComponents = { ...metadata };
            const initialIP = await getPublicIP();
            const proxyData = initialIP
                ? await checkIPReputation(initialIP)
                : null;
            const ipEntry = proxyData && initialIP ? proxyData[initialIP] : null;
            const isVPN = ipEntry && typeof ipEntry !== "string"
                ? ipEntry.proxy === "yes"
                : false;
            fingerprintComponents.ipAddress = initialIP || "unknown";
            fingerprintComponents.isVPN = isVPN;
            fingerprintComponents.isIncognito = await detectIncognitoMode();
            fingerprintComponents.isEmulator = await detectEmulator();
            fingerprintComponents.ipChanged = await hasIPChanged(initialIP);
            // Add fingerprints from canvas, WebGL, and audio
            fingerprintComponents.canvasFingerprint = getCanvasFingerprint();
            fingerprintComponents.webGLFingerprint = getWebGLFingerprint();
            fingerprintComponents.audioFingerprint = await getAudioFingerprint();
            const fingerprintHash = await hashString(JSON.stringify(fingerprintComponents));
            fingerprintComponents.fingerprintHash = fingerprintHash;
            fingerprintComponents.latency = await measureLatency(endpoint || currentPageURL);
            fingerprintComponents.dnsLeak = await checkDNSLeak();
            console.log(JSON.stringify(proxyData, null, 2));
            return {
                fingerprintHash,
                ipAddress: fingerprintComponents.ipAddress,
                geoLocation: ipEntry && typeof ipEntry !== "string"
                    ? {
                        country: ipEntry.country || "unknown",
                        region: ipEntry.region || "unknown",
                        city: ipEntry.city || "unknown",
                        latitude: ipEntry.latitude.toString() || "unknown",
                        longitude: ipEntry.longitude.toString() || "unknown",
                    }
                    : {
                        country: "unknown",
                        region: "unknown",
                        city: "unknown",
                        latitude: "unknown",
                        longitude: "unknown",
                    },
                isVPN,
                isTor: ipEntry && typeof ipEntry !== "string" ? ipEntry.tor === "1" : false,
                isEmulator: fingerprintComponents.isEmulator,
                isIncognito: fingerprintComponents.isIncognito,
                latency: fingerprintComponents.latency,
                ipChanged: fingerprintComponents.ipChanged,
                dnsLeak: fingerprintComponents.dnsLeak,
                canvasFingerprint: fingerprintComponents.canvasFingerprint,
                webGLFingerprint: fingerprintComponents.webGLFingerprint,
                audioFingerprint: fingerprintComponents.audioFingerprint,
            };
        }
        catch (error) {
            console.error("Error initializing fingerprint:", error);
            throw error;
        }
    }
    return await initializeFingerprint();
}
export default generateDeviceFingerprint;
