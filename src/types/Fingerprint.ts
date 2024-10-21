export interface GeoLocation {
    country: string;
    city: string;
    country_code: string;
}

export interface IPReputationResponse {

    ip: string;
    iso_code: string;
    country: string;
    city: string;
    is_proxy: boolean;
    is_vpn: boolean;
    is_tor: boolean;
    is_bot: boolean;
    is_datacenter: boolean;
}

export interface Fingerprint {
    fingerprintHash: string;
    ipAddress: string;
    comfirmIP: string;
    geoLocation: GeoLocation;
    isVPN: boolean;
    isTor: boolean;
    isProxy: boolean;
    isBot: boolean;
    isDatacenter: boolean;
    isEmulator: boolean;
    ipChanged: boolean;
    canvasFingerprint: string;
    webGLFingerprint: string;
    audioFingerprint: string;
}


export type EnhancedIPReputationResponse = IPReputationResponse & {
    [key: string]: any;
};
