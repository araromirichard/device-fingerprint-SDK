import { Fingerprint } from "./types/Fingerprint";

class DeviceFingerprintSDK {
    private static orgId: string;

    private static generateOrgId(): string {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 8);
        return `${timestamp}-${randomStr}`;
    }

    public static initialize() {
        this.orgId = this.generateOrgId();
        return this.orgId;
    }

    public static getOrgId(): string {
        return this.orgId;
    }

    public static async generateFingerprint(): Promise<Fingerprint> {
        if (!this.orgId) {
            this.initialize();
        }

        try {
            const response = await fetch(`https://ip-reputation-checker.checkiprep.workers.dev/api/checkIPReputation`, {
                headers: {
                    'x-org-id': this.orgId
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to generate fingerprint');
            }

            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
}

export default DeviceFingerprintSDK;
