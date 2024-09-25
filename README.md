# Device Fingerprint SDK

A lightweight JavaScript SDK for generating device fingerprints using various browser features like Canvas, WebGL, and Audio APIs.

## Usage Example

```<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SDK Test</title>
    <script type="module" src="./dist/index.js" defer></script>

</head>
<body>
    <h1>Device Fingerprint Test</h1>
    <script type="module">
        import generateDeviceFingerprint from './dist/FingerprintSDK.js';
        generateDeviceFingerprint().then(fingerprint => {
            console.log('Device Fingerprint:', fingerprint);
        }).catch(error => {
            console.error('Error generating fingerprint:', error);
        });
    </script>
    
</body>
</html>
```


## LINK   

   https://device-fingerprint-sdk.netlify.app

