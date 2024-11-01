import { Fingerprint } from "./types/Fingerprint";
  class DeviceFingerprintSDK {
      private static orgId: string;
      private static domain: string;

      public static setCredentials(orgId: string, domain: string) {
          if (!orgId) {
              throw new Error('Organization ID cannot be empty');
          }
          if (!domain) {
              throw new Error('Domain cannot be empty');
          }
          this.orgId = orgId;
          this.domain = domain;
          localStorage.setItem('device_fingerprint_org_id', orgId);
          localStorage.setItem('device_fingerprint_domain', domain);
          return { orgId, domain };
      }

      public static getCredentials() {
          return {
              orgId: localStorage.getItem('device_fingerprint_org_id') || '',
              domain: localStorage.getItem('device_fingerprint_domain') || ''
          };
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
                  throw new Error('Failed to generate fingerprint');
              }

              return await response.json();
          } catch (error) {
              console.error('Error:', error);
              throw error;
          }
      }
}export default DeviceFingerprintSDK;
