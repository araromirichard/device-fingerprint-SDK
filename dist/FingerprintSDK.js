class DeviceFingerprintSDK {
    static cache = new Map();
    static async fetchFromAPI(url) {
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
    static async getPublicIP() {
        try {
            const response = await fetch("https://api64.ipify.org?format=json", { cache: "no-cache" });
            const data = await response.json();
            console.log("ipify :", JSON.stringify(data, null, 2));
            return data?.ip || null;
        }
        catch (error) {
            console.error("Error fetching public IP:", error);
            return null;
        }
    }
    static async checkIPReputation(ip) {
        const apiKey = "28b1c552844847a1bdbfc7fd8f49de38";
        const url = `https://vpnapi.io/api/${ip}?key=${apiKey}`;
        const response = await this.fetchFromAPI(url);
        console.log(JSON.stringify(response, null, 2));
        return {
            ip: response?.ip || ip,
            security: {
                vpn: response?.security?.vpn || false,
                proxy: response?.security?.proxy || false,
                tor: response?.security?.tor || false,
                relay: response?.security?.relay || false
            },
            location: response?.location || {},
            network: response?.network || {}
        };
    }
    static getBrowserMetadata() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${screen.width}x${screen.height}`,
            colorDepth: screen.colorDepth,
            hardwareConcurrency: navigator.hardwareConcurrency,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
    }
    static async detectIncognitoMode() {
        const checks = [
            this.checkFileSystem,
            this.checkIndexedDB,
            this.checkLocalStorage,
            this.checkWebRTC,
            this.checkPersistentStorage,
            this.checkTemporaryStorage,
            this.checkCookiesEnabled,
            this.checkPDFViewerEnabled,
            this.checkPluginsLength
        ];
        const results = await Promise.all(checks.map(check => check()));
        console.log("checks :", results);
        // Count the number of checks that indicate incognito mode
        const incognitoCount = results.filter(result => result === true).length;
        // Consider it incognito if more than half of the checks indicate so
        return incognitoCount > checks.length / 2;
    }
    static async checkFileSystem() {
        return new Promise(resolve => {
            if ('webkitRequestFileSystem' in window) {
                window.webkitRequestFileSystem(window.TEMPORARY, 100, () => resolve(false), () => resolve(true));
            }
            else {
                resolve(false);
            }
        });
    }
    static async checkIndexedDB() {
        try {
            const db = await window.indexedDB.open('test');
            db.onerror = () => true;
            return false;
        }
        catch {
            return true;
        }
    }
    static checkLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return false;
        }
        catch {
            return true;
        }
    }
    static async checkWebRTC() {
        if (!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices)) {
            return false;
        }
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return !devices.length;
        }
        catch {
            return true;
        }
    }
    static checkCookiesEnabled() {
        try {
            document.cookie = "testcookie=1";
            const result = document.cookie.indexOf("testcookie=") !== -1;
            document.cookie = "testcookie=1; expires=Thu, 01-Jan-1970 00:00:01 GMT";
            return !result;
        }
        catch {
            return true;
        }
    }
    static checkPDFViewerEnabled() {
        const pdfViewerIndicators = [
            'PDFViewer' in window,
            'WebKitPDFViewer' in window,
            'MozPDFViewer' in window,
            'PDFDocument' in window
        ];
        return !pdfViewerIndicators.some(indicator => !!indicator);
    }
    static checkPluginsLength() {
        return navigator.plugins.length === 0;
    }
    static async checkPersistentStorage() {
        if ('storage' in navigator && 'persist' in navigator.storage) {
            const persisted = await navigator.storage.persist();
            return !persisted;
        }
        return false;
    }
    static async checkTemporaryStorage() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const { quota } = await navigator.storage.estimate();
            return quota === 120000000; // Chrome's incognito quota is usually 120MB
        }
        return false;
    }
    static async detectEmulator() {
        const userAgent = navigator.userAgent.toLowerCase();
        const emulatorKeywords = ['emulator', 'android sdk built for x86', 'google_sdk'];
        return emulatorKeywords.some(keyword => userAgent.includes(keyword));
    }
    static async hasIPChanged() {
        const currentIP = await this.getPublicIP();
        const initialIP = localStorage.getItem("initialIp");
        return currentIP !== initialIP;
    }
    static getCanvasFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return '';
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("Hello, world!", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("Hello, world!", 4, 17);
        return canvas.toDataURL();
    }
    static getWebGLFingerprint() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl)
            return '';
        const webgl = gl;
        const debugInfo = webgl.getExtension('WEBGL_debug_renderer_info');
        if (!debugInfo)
            return '';
        return webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    }
    static async getAudioFingerprint() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const analyser = audioContext.createAnalyser();
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0;
            oscillator.connect(analyser);
            analyser.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.start();
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray);
            oscillator.stop();
            audioContext.close();
            return dataArray.join(',');
        }
        catch {
            return '';
        }
    }
    static async hashString(input) {
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    static async measureLatency(url) {
        const start = performance.now();
        try {
            await fetch(url, { mode: 'no-cors', cache: 'no-store' });
        }
        catch { }
        return Math.round(performance.now() - start);
    }
    static async getCachedOrFetch(key, fetchFn) {
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        const result = await fetchFn();
        this.cache.set(key, result);
        return result;
    }
    static async getGeolocation() {
        return new Promise((resolve) => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                    const data = await response.json();
                    resolve({
                        country: data.countryName,
                        region: data.principalSubdivision,
                        city: data.city,
                        latitude: latitude.toString(),
                        longitude: longitude.toString()
                    });
                }, () => resolve('unknown'), { timeout: 5000, maximumAge: 0 });
            }
            else {
                resolve('unknown');
            }
        });
    }
    static async generateDeviceFingerprint() {
        try {
            const metadata = this.getBrowserMetadata();
            const fingerprintComponents = { ...metadata };
            const currentIP = await this.getPublicIP();
            const proxyData = currentIP ? await this.checkIPReputation(currentIP) : null;
            const isVPN = proxyData?.security.vpn;
            fingerprintComponents.ipAddress = currentIP || "unknown";
            fingerprintComponents.isVPN = isVPN;
            fingerprintComponents.isIncognito = await this.detectIncognitoMode();
            fingerprintComponents.isEmulator = await this.detectEmulator();
            fingerprintComponents.ipChanged = await this.hasIPChanged();
            fingerprintComponents.geoLocation = await this.getGeolocation();
            fingerprintComponents.canvasFingerprint = this.getCanvasFingerprint();
            fingerprintComponents.webGLFingerprint = this.getWebGLFingerprint();
            fingerprintComponents.audioFingerprint = await this.getAudioFingerprint();
            const fingerprintHash = await this.hashString(JSON.stringify(fingerprintComponents));
            fingerprintComponents.fingerprintHash = fingerprintHash;
            fingerprintComponents.latency = await this.measureLatency(window.location.href);
            console.log('Device fingerprint generated successfully');
            return {
                fingerprintHash,
                ipAddress: fingerprintComponents.ipAddress,
                geoLocation: fingerprintComponents.geoLocation,
                isVPN: fingerprintComponents.isVPN,
                isTor: fingerprintComponents.isTor || false,
                isEmulator: fingerprintComponents.isEmulator,
                isIncognito: fingerprintComponents.isIncognito,
                latency: fingerprintComponents.latency,
                ipChanged: fingerprintComponents.ipChanged,
                dnsLeak: fingerprintComponents.dnsLeak || false,
                canvasFingerprint: fingerprintComponents.canvasFingerprint,
                webGLFingerprint: fingerprintComponents.webGLFingerprint,
                audioFingerprint: fingerprintComponents.audioFingerprint,
            };
        }
        catch (error) {
            console.error("Error generating device fingerprint:", error);
            throw new Error('Failed to generate device fingerprint');
        }
    }
}
export default DeviceFingerprintSDK;
