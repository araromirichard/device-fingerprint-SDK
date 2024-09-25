import generateDeviceFingerprint from './fingerprintSDK'; // Import the function
async function main() {
    try {
        const fingerprint = await generateDeviceFingerprint();
        console.log('Device Fingerprint:', fingerprint);
    }
    catch (error) {
        console.error('Error generating device fingerprint:', error);
    }
}
main(); // Call the main function to execute
