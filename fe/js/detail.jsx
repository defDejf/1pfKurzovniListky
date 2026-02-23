import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

const useLocalEndpoint = String(process.env.useLocalEndpoint || '').toLowerCase() === 'true';
const EXCHANGE_RATES_ENDPOINT = useLocalEndpoint ? process.env.REACT_APP_CSAS_URL : process.env.BASE_URL;
const API_KEY = process.env.API_KEY;
const OVERVIEW_RATES_STORAGE_KEY = 'overviewRates';
const OVERVIEW_RATES_TTL_MS = 5 * 60 * 1000;

function getCurrencyCode(item) {
    return item?.shortName;
}

const formatDateCZ = (dateString) => {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(dateString));
};

function DetailApp() {
    const currencyCode = useMemo(() => {
        const searchParams = new URLSearchParams(window.location.search);
        return (searchParams.get('curr') || '').trim().toUpperCase();
    }, []);

    const [state, setState] = useState({ status: 'loading', data: null, message: '' });

    useEffect(() => {
        const backButton = document.getElementById('back-button');

        const handleBack = () => {
            window.location.href = 'index.html';
        };

        const refreshButton = document.getElementById('refresh-button');

        if (!useLocalEndpoint && refreshButton) {
            refreshButton.remove();
        }

        const handleRefresh = async () => {
            try {
                if (!EXCHANGE_RATES_ENDPOINT) {
                    throw new Error('Endpoint URL is missing.');
                }

                const refreshUrl = new URL(EXCHANGE_RATES_ENDPOINT);
                refreshUrl.searchParams.set('usedb', 'true');
                refreshUrl.searchParams.set('curr', currencyCode);

                if (!useLocalEndpoint) {
                    refreshUrl.searchParams.set('web-api-key', API_KEY);
                }

                const response = await fetch(refreshUrl);

                if (!response.ok) {
                    throw new Error(`Unable to refresh exchange rates (HTTP ${response.status}).`);
                }

                sessionStorage.removeItem(OVERVIEW_RATES_STORAGE_KEY);
                window.location.reload();
            } catch (error) {
                alert(error.message || 'Unknown refresh error.');
            }
        }

        if (backButton) {
            backButton.addEventListener('click', handleBack);
        }

        refreshButton?.addEventListener('click', handleRefresh);

        if (!currencyCode) {
            setState({ status: 'error', data: null, message: 'Missing currency query parameter.' });
            return () => {
                if (backButton) {
                    backButton.removeEventListener('click', handleBack);
                }
                refreshButton?.removeEventListener('click', handleRefresh);
            };
        }

        let cancelled = false;

         const parseCachedRates = () => {
            const rawValue = sessionStorage.getItem(OVERVIEW_RATES_STORAGE_KEY);

            if (!rawValue) {
                return null;
            }

            try {
                return JSON.parse(rawValue);
            } catch {
                sessionStorage.removeItem(OVERVIEW_RATES_STORAGE_KEY);
                return null;
            }
        };

        const isCacheFresh = (cachedValue) => {
            const storedAt = Number(cachedValue?.storedAt);
            return Number.isFinite(storedAt) && Date.now() - storedAt <= OVERVIEW_RATES_TTL_MS;
        };

        const getCachedCurrency = () => {
            const cachedRates = parseCachedRates();

            if (!cachedRates || !isCacheFresh(cachedRates) || !Array.isArray(cachedRates?.data)) {
                return null;
            }

            return cachedRates.data.find((item) => String(getCurrencyCode(item) || '').toUpperCase() === currencyCode) || null;
        };

        async function loadDetail() {
            try {
                const cachedCurrency = getCachedCurrency();

                if (cachedCurrency) {
                    setState({ status: 'success', data: cachedCurrency, message: '' });
                    return;
                }

               if (!EXCHANGE_RATES_ENDPOINT) {
                    throw new Error('Endpoint URL is missing.');
                }

                const detailUrl = new URL(EXCHANGE_RATES_ENDPOINT);
                detailUrl.searchParams.set('curr', currencyCode);
                if (!useLocalEndpoint) {
                    detailUrl.searchParams.set('web-api-key', API_KEY);
                }

                const response = await fetch(detailUrl);


                if (!response.ok) {
                    throw new Error(`Unable to load exchange rates (HTTP ${response.status}).`);
                }

                const payload = await response.json();
                const rates = Array.isArray(payload)
                    ? payload
                    : Array.isArray(payload?.data)
                      ? payload.data
                      : [payload?.data || payload].filter(Boolean);

                const record = rates.find((item) => String(getCurrencyCode(item) || '').toUpperCase() === currencyCode);

                if (cancelled) {
                    return;
                }

                if (!record) {
                    setState({ status: 'not-found', data: null, message: '' });
                    return;
                }

                setState({ status: 'success', data: record, message: '' });
            } catch (error) {
                if (!cancelled) {
                    setState({ status: 'error', data: null, message: error.message || 'Unknown error.' });
                }
            }
        }

        loadDetail();

        return () => {
            cancelled = true;
            if (backButton) {
                backButton.removeEventListener('click', handleBack);
            }
            refreshButton?.removeEventListener('click', handleRefresh);
        };
    }, [currencyCode]);

    if (state.status === 'loading') {
        return React.createElement('p', null, 'Načítám detail kurzu...');
    }

    if (state.status === 'error') {
        return React.createElement('p', { role: 'alert' }, `Chyba: ${state.message}`);
    }

    if (state.status === 'not-found') {
        return React.createElement('p', null, `Měna ${currencyCode} nebyla nalezena.`);
    }

    const detail = state.data;
    const currency = getCurrencyCode(detail) || currencyCode;
    const name = detail?.name || 'N/A';
    const country = detail?.country || 'N/A';
    const buyRateCash = detail?.valBuy ?? 'N/A';
    const sellRateCash = detail?.valSell ?? 'N/A';
    const midCash = detail?.valMid ?? 'N/A';
    const buyRateCard = detail?.currBuy ?? 'N/A';
    const sellRateCard = detail?.currSell ?? 'N/A';
    const midCard = detail?.currMid ?? 'N/A';
    const midRef = detail?.valMid ?? 'N/A';
    const validityDate = detail?.validFrom ?? null;
    const change = detail?.move ?? 'N/A';

    return React.createElement(
        React.Fragment,
        null,
        React.createElement('h1', null, `Detail měny: ${name} (${currency}) - ${country}`),
        validityDate ? React.createElement('p', null, `Kurz platný od: ${formatDateCZ(validityDate)}`) : null,
        React.createElement(
            'div',
            { className: 'detail-sections' },
            React.createElement(
                'section',
                null,
                React.createElement('h2', null, "Hotovostní převody"),
                React.createElement('p', null, `Nákup: ${buyRateCash} CZK`),
                React.createElement('p', null, `Prodej: ${sellRateCash} CZK`),
                React.createElement('p', null, `Střední hodnota: ${midCash} CZK`)
            ),
            React.createElement(
                'section',
                null,
                React.createElement('h2', null, "Bezhotovostní převody"),
                React.createElement('p', null, `Nákup: ${buyRateCard} CZK`),
                React.createElement('p', null, `Prodej: ${sellRateCard} CZK`),
                React.createElement('p', null, `Střední hodnota: ${midCard} CZK`)
            ),
            React.createElement(
                'section',
                null,
                React.createElement('h2', null, "Další informace"),
                React.createElement('p', null, `Střední hodnota ČNB: ${midRef} CZK`),
                React.createElement('p', null, `Změna za 24h: ${change}%`)
            )
        ),
    );

}

const rootElement = document.getElementById('detail-root');

if (rootElement) {
    createRoot(rootElement).render(React.createElement(DetailApp));
}
