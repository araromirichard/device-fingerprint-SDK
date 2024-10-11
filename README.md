# Device Fingerprint SDK

A lightweight JavaScript SDK for generating device fingerprints using various browser features like Canvas, WebGL, and Audio APIs.

## Usage Example

```<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SDK Test</title>


</head>

<body>
    <h1>Device Fingerprint Test</h1>
    <script type="module">
        import DeviceFingerprintSDK from 'https://device-fingerprint-sdk.netlify.app/dist/FingerprintSDK.js';
        DeviceFingerprintSDK.generateDeviceFingerprint().then(fingerprint => {
            console.log(JSON.stringify(fingerprint, null, 2))
        }).catch(error => {
            console.error('Error generating fingerprint:', error);
        });
    </script>

</body>

</html>
```


## LINK   

   https://device-fingerprint-sdk.netlify.app

