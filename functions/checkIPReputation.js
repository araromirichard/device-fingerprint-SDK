export default {
    async fetch(request, env) {
        const { searchParams } = new URL(request.url);
        const ip = searchParams.get('ip');

        if (!ip) {
            return new Response(JSON.stringify({ error: "IP address is required" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        try {
            const IPQS_API_KEY = env.IPQS_API_KEY;
            const url = `https://www.ipqualityscore.com/api/json/ip/${IPQS_API_KEY}/${ip}`;

            const response = await fetch(url);
            const data = await response.json();
            console.log(JSON.stringify(data, null, 2));
            return new Response(JSON.stringify({
                ip: data.ip,
                iso_code: data.country_code,
                country: data.country,
                city: data.city,
                is_proxy: data.proxy,
                is_vpn: data.vpn,
                is_tor: data.tor,
                is_bot: data.bot_status,
                is_datacenter: data.is_datacenter
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: "Failed to check IP reputation" }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
}