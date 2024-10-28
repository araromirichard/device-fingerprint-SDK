class DeviceFingerprintSDK {
    static orgId;
    static generateOrgId() {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 8);
        return `${timestamp}-${randomStr}`;
    }
    static initialize() {
        this.orgId = this.generateOrgId();
        return this.orgId;
    }
    static getOrgId() {
        return this.orgId;
    }
    static async generateFingerprint() {
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
        }
        catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
}
export default DeviceFingerprintSDK;
