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
}
