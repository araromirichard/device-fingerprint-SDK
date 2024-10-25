class DeviceFingerprintSDK {
    static orgId;
    static setOrgId(id) {
        this.orgId = id;
    }
    static async generateFingerprint() {
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
