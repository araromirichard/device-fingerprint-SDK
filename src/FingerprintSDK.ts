import { Fingerprint, GeoLocation, ProxyData } from "./types";

interface Window {
  RequestFileSystem?: any;
  webkitRequestFileSystem?: any;
  TEMPORARY?: number;
}

interface IPReputationResponse {
  proxy?: boolean;
}

interface BrowserMetadata {
  userAgent: string;
  platform: string;
  language: string;
  screenResolution: string;
  colorDepth: number;
  hardwareConcurrency: number;
  timezone: string;
}

class DeviceFingerprintSDK {
  private static cache: Map<string, any> = new Map();

  private static async fetchFromAPI(url: string): Promise<any | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch {
      return null;
    }
  }

  private static async getPublicIP(): Promise<string | null> {
    try {
      const response = await fetch("https://api64.ipify.org?format=json", { cache: "no-cache" });
      const data = await response.json();
      return data?.ip || null;
    } catch (error) {
      console.error("Error fetching public IP:", error);
      return null;
    }
  }

  private static async checkIPReputation(ip: string): Promise<IPReputationResponse | null> {
    const apiKey = "c59f3700615cd3e49a129e9503d03bc2";
    const url = `https://api.ipapi.com/${ip}?access_key=${apiKey}`;
    return await this.fetchFromAPI(url);
  }

  private static getBrowserMetadata(): BrowserMetadata {
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

  private static async detectIncognitoMode(): Promise<boolean> {
    try {
      const fs = (window as any).RequestFileSystem || (window as any).webkitRequestFileSystem;
      if (!fs) return false;

      return new Promise((resolve) => {
        fs((window as any).TEMPORARY, 100, () => resolve(false), () => resolve(true));
      });
    } catch {
      return false;
    }
  }

  private static async detectEmulator(): Promise<boolean> {
    const userAgent = navigator.userAgent.toLowerCase();
    const emulatorKeywords = ['emulator', 'android sdk built for x86', 'google_sdk'];
    return emulatorKeywords.some(keyword => userAgent.includes(keyword));
  }

  private static async hasIPChanged(): Promise<boolean> {
    const currentIP = await this.getPublicIP();
    const initialIP = localStorage.getItem("initialIp");
    return currentIP !== initialIP;
  }

  private static getCanvasFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
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

  private static getWebGLFingerprint(): string {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return '';

    const webgl = gl as WebGLRenderingContext;

    const debugInfo = webgl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return '';

    return webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
  }
  private static async getAudioFingerprint(): Promise<string> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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
    } catch {
      return '';
    }
  }

  private static async hashString(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private static async measureLatency(url: string): Promise<number> {
    const start = performance.now();
    try {
      await fetch(url, { mode: 'no-cors', cache: 'no-store' });
    } catch {}
    return Math.round(performance.now() - start);
  }

  private static async getCachedOrFetch<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    if (this.cache.has(key)) {
      return this.cache.get(key) as T;
    }
    const result = await fetchFn();
    this.cache.set(key, result);
    return result;
  }
  
  private static async getGeolocation(): Promise<GeoLocation | 'unknown'> {
    return new Promise((resolve) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
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
          },
          () => resolve('unknown'),
          { timeout: 5000, maximumAge: 0 }
        );
      } else {
        resolve('unknown');
      }
    });
  }

  public static async generateDeviceFingerprint(): Promise<Fingerprint> {
    try {
      const metadata = this.getBrowserMetadata();
      const fingerprintComponents: any = { ...metadata };

      const currentIP = await this.getCachedOrFetch('publicIP', this.getPublicIP);
      const proxyData = currentIP ? await this.getCachedOrFetch(`proxyData_${currentIP}`, () => this.checkIPReputation(currentIP)) : null;

      const isVPN = proxyData && proxyData.proxy === true;
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
    } catch (error) {
      console.error("Error generating device fingerprint:", error);
      throw new Error('Failed to generate device fingerprint');
    }
  }
}

export default DeviceFingerprintSDK;