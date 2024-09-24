import generateDeviceFingerprint from './fingerprintSDK';

async function main() {
  try {
    const fingerprint = await generateDeviceFingerprint();
    console.log('Device Fingerprint:', fingerprint);
  } catch (error) {
    console.error('Error generating device fingerprint:', error);
  }
}

// Expose it globally if needed
(window as any).generateDeviceFingerprint = generateDeviceFingerprint;

main();
