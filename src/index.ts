import generateDeviceFingerprint from './fingerprintSDK';

async function main() {
  try {
    const fingerprint = new generateDeviceFingerprint();
    console.log('Device Fingerprint:', fingerprint);
  } catch (error) {
    console.error('Error generating device fingerprint:', error);
  }
}

main();

export { generateDeviceFingerprint };
