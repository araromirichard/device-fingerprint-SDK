export default {
    async fetch(request, env) {
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, x-org-id'
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const ip = request.headers.get('cf-connecting-ip');
        const orgId = request.headers.get('x-org-id');
        const userAgent = request.headers.get('user-agent');
        const baseHeaders = {
            'Content-Type': 'application/json',
            ...corsHeaders
        };

        try {
            // Handle POST request to update advance status
            if (request.method === 'POST' && new URL(request.url).pathname === '/api/updateAdvance') {
                const { advance } = await request.json();
                await env.DB.prepare(
                    "UPDATE organizations SET advance = ? WHERE org_id = ?"
                ).bind(advance, orgId).run();
                
                return new Response(JSON.stringify({ success: true }), {
                    headers: baseHeaders
                });
            }

            // Rest of your existing code...
            let org = await env.DB.prepare(
                "SELECT * FROM organizations WHERE org_id = ?"
            ).bind(orgId).first();

            if (!org) {
                org = await env.DB.prepare(
                    "INSERT INTO organizations (org_id, usage_count, advance) VALUES (?, 0, false) RETURNING *"
                ).bind(orgId).first();
            }

            // Update usage count
            await env.DB.prepare(
                "UPDATE organizations SET usage_count = usage_count + 1 WHERE org_id = ?"
            ).bind(orgId).run();

            // Generate device fingerprint components
            const deviceData = {
                userAgent,
                acceptLanguage: request.headers.get('accept-language'),
                platform: request.headers.get('sec-ch-ua-platform'),
                mobile: request.headers.get('sec-ch-ua-mobile'),
                vendor: request.headers.get('sec-ch-ua-vendor'),
                screen: request.headers.get('sec-ch-viewport-width'),
                colorDepth: request.headers.get('sec-ch-color-depth'),
                timezone: request.headers.get('sec-ch-timezone'),
                languages: request.headers.get('accept-language'),
                ip
            };

            // Generate unique fingerprint hash
            const encoder = new TextEncoder();
            const data = encoder.encode(JSON.stringify(deviceData));
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const fingerprintHash = Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, '0')).join('');

            let fingerprint = {
                fingerprintHash,
                ipAddress: ip,
                isEmulator: deviceData.userAgent.toLowerCase().includes('emulator')
            };

            // Add IP reputation data if org has advanced access
            if (org.advance) {
                const IPQS_API_KEY = env.IPQS_API_KEY;
                const ipData = await fetch(
                    `https://www.ipqualityscore.com/api/json/ip/${IPQS_API_KEY}/${ip}`
                ).then(r => r.json());

                fingerprint = {
                    ...fingerprint,
                    comfirmIP: ipData.ip,
                    geoLocation: {
                        country_code: ipData.country_code,
                        country: ipData.country,
                        city: ipData.city,
                    },
                    isVPN: ipData.vpn,
                    isTor: ipData.tor,
                    isProxy: ipData.proxy,
                    isBot: ipData.bot_status,
                    isDatacenter: ipData.is_datacenter
                };
            }

            return new Response(JSON.stringify({
                organization: {
                    orgId: org.org_id,
                    usageCount: org.usage_count,
                    advance: org.advance
                },
                fingerprint
            }), {
                headers: baseHeaders
            });

        } catch (error) {
            return new Response(JSON.stringify({ error: "Failed to generate fingerprint" }), {
                status: 500,
                headers: baseHeaders
            });
        }
    }
}