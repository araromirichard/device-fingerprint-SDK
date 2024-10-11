export { };

declare global {
  interface Window {
    generateDeviceFingerprint: () => Promise<Fingerprint>;
    chrome?: {
      runtime: {
        id?: string;
      };
    };
    browser?: {
      runtime: {
        id?: string;
      };
    };
    RequestFileSystem?: any;
    webkitRequestFileSystem?: any;
    TEMPORARY?: number;
  }
  
  interface IPReputationResponse {
    proxy?: boolean;
    vpn?: boolean;
    tor?: boolean;
    threat?: boolean;
    country?: string;
    city?: string;
    isp?: string;
    latitude?: number;
    longitude?: number;
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
}
