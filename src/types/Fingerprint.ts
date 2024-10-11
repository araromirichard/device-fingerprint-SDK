export interface GeoLocation {
    country: string;
    region: string;
    city: string;
    latitude: string;
    longitude: string;
}

export interface ProxyDataEntry {
    asn: string;
    range: string;
    provider: string;
    organisation: string;
    continent: string;
    continentcode: string;
    country: string;
    isocode: string;
    region: string;
    regioncode: string;
    timezone: string;
    city: string;
    latitude: number;
    longitude: number;
    currency: {
        code: string;
        name: string;
        symbol: string;
    };
    proxy: string;
    type: string;
    risk: number;
    tor?: 'yes' | 'no' | 'unknown';
}

export interface ProxyData {
    status: string;
    [ip: string]: ProxyDataEntry | string;
}

export interface Fingerprint {
    fingerprintHash: string;
    ipAddress: string;
    geoLocation: GeoLocation | 'unknown';
    isVPN: boolean;
    isTor: boolean;
    isEmulator: boolean;
    //isIncognito: boolean;
    latency: number;
    ipChanged: boolean;
    dnsLeak: boolean;
    canvasFingerprint: string;
    webGLFingerprint: string;
    audioFingerprint: string;
}