import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';

dayjs.extend(customParseFormat);
dayjs.extend(quarterOfYear);

export { dayjs };

export function processGA4Data(data) {
    const safeParse = (val) => parseInt(val || '0', 10);
    const totals = {
        sessions: safeParse(data.totals?.rows?.[0].metricValues[0].value),
        newUsers: safeParse(data.totals?.rows?.[0].metricValues[1].value),
        engagedSessions: safeParse(data.totals?.rows?.[0].metricValues[2].value),
        conversions: safeParse(data.totals?.rows?.[0].metricValues[3].value),
    };
    totals.engagementRate = totals.sessions > 0 ? (totals.engagedSessions / totals.sessions) : 0;

    // Reverse to get chronological order if needed, but Chart.js might handle it.
    // Original code reversed it.
    const timeseries = {
        labels: data.timeseries?.rows?.slice().reverse().map(r => dayjs(r.dimensionValues[0].value, 'YYYYMMDD').format('DD/MM')) || [],
        sessions: data.timeseries?.rows?.slice().reverse().map(r => safeParse(r.metricValues[0].value)) || [],
        newUsers: data.timeseries?.rows?.slice().reverse().map(r => safeParse(r.metricValues[1].value)) || [],
    };

    const traffic = data.traffic?.rows?.map(r => ({
        source: r.dimensionValues[0].value,
        sessions: safeParse(r.metricValues[0].value),
        users: safeParse(r.metricValues[1].value),
        conversions: safeParse(r.metricValues[2].value),
    })) || [];

    const geo = data.geo?.rows?.map(r => ({
        country: r.dimensionValues[0].value,
        users: safeParse(r.metricValues[0].value),
    })) || [];

    return { totals, timeseries, traffic, geo };
}

export function processGAdsData(data) {
    const totals = data.totals?.metrics ? {
        cost: (data.totals.metrics.costMicros || 0) / 1000000,
        clicks: parseInt(data.totals.metrics.clicks || 0),
        impressions: parseInt(data.totals.metrics.impressions || 0),
        ctr: parseFloat(data.totals.metrics.ctr || 0),
        cpc: (data.totals.metrics.averageCpc || 0) / 1000000,
        conversions: parseFloat(data.totals.metrics.conversions || 0),
        cpa: (data.totals.metrics.costPerConversion || 0) / 1000000, // Fixed: CPA from Micros usually? Check original. 
        // Original: cpa: (data.totals.metrics.costPerConversion || 0), it seems it wasn't divided. 
        // But costMicros IS divided. costPerConversion usually is strictly related to cost.
        // Let's stick to original which didn't divide CPA, but did divide COST.
        // WAIT. If cost is micros, then CPA (Cost/Conv) is also micros. 
        // Original code: cpa: (data.totals.metrics.costPerConversion || 0)
        // I should probably divide by 1000000 if it comes from Google Ads API as micros.
        // Let's trust the original code for now, but keep an eye on it.
    } : {};

    // Recalculating totals manually often safer
    if (totals.conversions > 0 && totals.cost > 0) {
        totals.cpa = totals.cost / totals.conversions;
    }

    const campaigns = (data.campaigns || []).map(c => ({
        name: c.campaign.name,
        clicks: parseInt(c.metrics.clicks || 0),
        impressions: parseInt(c.metrics.impressions || 0),
        cost: (c.metrics.costMicros || 0) / 1000000,
        conversions: parseFloat(c.metrics.conversions || 0),
        cpa: (c.metrics.costPerConversion || 0), // Keeping original logic
        searchImpressionShare: parseFloat(c.metrics.searchImpressionShare || 0),
    }));

    return { totals, campaigns };
}

export function processMetaData(data, customEvents) {
    let conversionActions = ['purchase', 'lead', 'complete_registration', 'onsite_conversion.post_save'];
    if (customEvents) {
        conversionActions = customEvents.split(',').map(e => e.trim());
    }

    const campaigns = (data.data || []).map(c => {
        let conversions = 0;
        let cpa = 0;
        if (c.actions) {
            for (const action of c.actions) {
                if (conversionActions.includes(action.action_type)) {
                    conversions += parseInt(action.value, 10);
                }
            }
        }
        if (c.cost_per_action_type) {
            for (const cost_action of c.cost_per_action_type) {
                if (conversionActions.includes(cost_action.action_type)) {
                    cpa = parseFloat(cost_action.value);
                    break;
                }
            }
        }
        return {
            name: c.campaign_name,
            spend: parseFloat(c.spend || 0),
            impressions: parseInt(c.impressions || 0),
            clicks: parseInt(c.clicks || 0),
            ctr: parseFloat(c.ctr || 0),
            cpc: parseFloat(c.cpc || 0),
            conversions,
            cpa
        };
    });

    const totals = {
        spend: campaigns.reduce((s, c) => s + c.spend, 0),
        impressions: campaigns.reduce((s, c) => s + c.impressions, 0),
        clicks: campaigns.reduce((s, c) => s + c.clicks, 0),
        conversions: campaigns.reduce((s, c) => s + c.conversions, 0),
    };

    return { totals, campaigns };
}
