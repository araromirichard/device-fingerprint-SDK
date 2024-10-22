class DeviceFingerprintSDK {
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
            return data?.ip || null;
        }
        catch (error) {
            console.error("Error fetching public IP:", error);
            return null;
        }
    }
    // private static async checkIPReputation(ip: string): Promise<any> {
    //   const apiKey = "7807676e46014601a1350b9b04bc86c8";
    //   const url = `https://api.focsec.com/v1/ip/${ip}?api_key=${apiKey}`;
    //   const response = await this.fetchFromAPI(url);
    //   console.log(response);
    //   return {
    //     ip: response?.ip || '',
    //     country_code: response?.iso_code || '',
    //     country: response?.country || '',
    //     city: response?.city || '',
    //     proxy: response?.is_proxy || false,
    //     vpn: response?.is_vpn || false,
    //     tor: response?.is_tor || false,
    //     bot: response?.is_bot || false,
    //     datacenter: response?.is_datacenter || false,
    //   };
    // }
    static async checkIP(ip) {
        try {
            const response = await fetch(`/.netlify/functions/checkIPReputation?ip=${ip}`);
            const data = await response.json();
            return {
                ip: data?.ip || '',
                country_code: data?.iso_code || '',
                country: data?.country || '',
                city: data?.city || '',
                proxy: data?.is_proxy || false,
                vpn: data?.is_vpn || false,
                tor: data?.is_tor || false,
                bot: data?.is_bot || false,
                datacenter: data?.is_datacenter || false,
            };
        }
        catch (error) {
            console.error('Error:', error);
        }
    }
    static async detectEmulator() {
        const userAgent = navigator.userAgent.toLowerCase();
        return ['emulator', 'android sdk built for x86', 'google_sdk'].some(keyword => userAgent.includes(keyword));
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
        if (!gl || !(gl instanceof WebGLRenderingContext))
            return '';
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (!debugInfo)
            return '';
        return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    }
    static async getAudioFingerprint() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const analyser = audioContext.createAnalyser();
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0;
            oscillator.connect(gainNode);
            gainNode.connect(analyser);
            analyser.connect(audioContext.destination);
            oscillator.start();
            const fingerprint = await new Promise((resolve) => {
                oscillator.stop();
                const buffer = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(buffer);
                resolve(buffer.toString());
            });
            return fingerprint;
        }
        catch (e) {
            return '';
        }
    }
    static async generateUniqueFingerprint() {
        const canvasFingerprint = this.getCanvasFingerprint();
        const webGLFingerprint = this.getWebGLFingerprint();
        const audioFingerprint = await this.getAudioFingerprint();
        const uniqueFingerprint = `${canvasFingerprint}${webGLFingerprint}${audioFingerprint}`;
        // Hash the unique fingerprint using SHA-256
        const encoder = new TextEncoder();
        const data = encoder.encode(uniqueFingerprint);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }
    static async generateFingerprint() {
        const ip = await this.getPublicIP();
        const ipReputation = ip ? await this.checkIP(ip) : null;
        return {
            fingerprintHash: await this.generateUniqueFingerprint(),
            ipAddress: ip || '',
            comfirmIP: ipReputation?.ip || '',
            geoLocation: {
                country_code: ipReputation?.country_code || 'unknown',
                country: ipReputation?.country || 'unknown',
                city: ipReputation?.city || 'unknown',
            },
            isVPN: ipReputation?.vpn || false,
            isTor: ipReputation?.tor || false,
            isProxy: ipReputation?.proxy || false,
            isBot: ipReputation?.bot || false,
            isDatacenter: ipReputation?.datacenter || false,
            isEmulator: await this.detectEmulator(),
            ipChanged: await this.hasIPChanged(),
            canvasFingerprint: this.getCanvasFingerprint(),
            webGLFingerprint: this.getWebGLFingerprint(),
            audioFingerprint: await this.getAudioFingerprint(),
        };
    }
}
export default DeviceFingerprintSDK;
