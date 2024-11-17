import { Fingerprint } from "./types/Fingerprint";

interface Credentials {
    orgId: string;
    domain: string;
}

class DeviceFingerprintSDK {
    private static orgId: string;
    private static domain: string;

    public static setCredentials(orgId: string, domain: string): Credentials {
        if (!orgId) {
            throw new Error('Organization ID cannot be empty');
        }
        if (!domain || !this.isValidDomain(domain)) {
            throw new Error('Please provide a valid domain');
        }
        this.orgId = orgId;
        this.domain = domain;
        try {
            localStorage.setItem('device_fingerprint_org_id', orgId);
            localStorage.setItem('device_fingerprint_domain', domain);
        } catch (error) {
            throw new Error('Failed to store credentials');
        }
        return { orgId, domain };
    }

    private static isValidDomain(domain: string): boolean {
        const pattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
        return pattern.test(domain);
    }

    public static getCredentials(): Credentials {
        try {
            return {
                orgId: localStorage.getItem('device_fingerprint_org_id') || '',
                domain: localStorage.getItem('device_fingerprint_domain') || ''
            };
        } catch (error) {
            throw new Error('Failed to retrieve credentials');
        }
    }

    public static async generateFingerprint(): Promise<Fingerprint> {
        const { orgId, domain } = this.getCredentials();
        if (!orgId || !domain) {
            throw new Error('Please set Organization ID and Domain first');
        }

        try {
            const response = await fetch(`https://ip-reputation-checker.checkiprep.workers.dev/api/checkIPReputation`, {
                headers: {
                    'x-org-id': orgId,
                    'x-domain': domain
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to generate fingerprint: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error instanceof Error ? error : new Error('Unknown error occurred');
        }
    }
}

export default DeviceFingerprintSDK;
