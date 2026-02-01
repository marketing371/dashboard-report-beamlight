import { processGA4Data, processGAdsData, processMetaData } from '../lib/transformers';

export async function fetchDashboardData(config, authToken, dateRange) {
    if (!config || !authToken || !dateRange.start) return null;

    const { workerUrl, clients } = config; // We need the selected CLIENT, not the whole config...
    // Adjusting signature to accept specific client data
    return null;
}

export async function fetchClientData(workerUrl, authToken, clientData, dateRange) {
    if (!workerUrl || !authToken || !clientData || !dateRange.start) return null;

    const dateParams = `&startDate=${dateRange.start.format('YYYY-MM-DD')}&endDate=${dateRange.end.format('YYYY-MM-DD')}`;
    const promises = [];

    if (clientData.ga4PropertyId) {
        const ga4Params = `?propertyId=${clientData.ga4PropertyId}${dateParams}`;
        promises.push(fetch(`${workerUrl}/ga4${ga4Params}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        }));
    } else {
        promises.push(Promise.resolve(null));
    }

    if (clientData.gAdsCustomerId) {
        promises.push(fetch(`${workerUrl}/google-ads?customerId=${clientData.gAdsCustomerId}${dateParams}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        }));
    } else {
        promises.push(Promise.resolve(null));
    }

    if (clientData.metaAdAccountId) {
        let metaUrl = `${workerUrl}/meta-ads?adAccountId=${clientData.metaAdAccountId}${dateParams}`;
        if (clientData.metaConversionEvents) metaUrl += `&events=${encodeURIComponent(clientData.metaConversionEvents)}`;
        promises.push(fetch(metaUrl));
    } else {
        promises.push(Promise.resolve(null));
    }

    try {
        const [ga4Res, gAdsRes, metaRes] = await Promise.all(promises);

        const ga4Data = ga4Res ? (ga4Res.ok ? await ga4Res.json() : { error: await ga4Res.text() }) : {};
        const gAdsData = gAdsRes ? (gAdsRes.ok ? await gAdsRes.json() : { error: await gAdsRes.text() }) : {};
        const metaData = metaRes ? (metaRes.ok ? await metaRes.json() : { error: await metaRes.text() }) : {};

        return {
            ga4: processGA4Data(ga4Data),
            gads: processGAdsData(gAdsData),
            meta: processMetaData(metaData, clientData.metaConversionEvents),
            gadsSandbox: gAdsData.sandbox,
            gadsSandboxReason: gAdsData.sandbox_reason,
            metaSandbox: metaData.sandbox,
            metaSandboxReason: metaData.sandbox_reason,
        };
    } catch (error) {
        console.error("Error fetching data", error);
        throw error;
    }
}
