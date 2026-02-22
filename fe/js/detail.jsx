import React, { useEffect, useMemo, useState } from 'https://esm.sh/react@18.3.1';
import { createRoot } from 'https://esm.sh/react-dom@18.3.1/client';

const EXCHANGE_RATES_ENDPOINT = process.env.REACT_APP_CSAS_URL;
const API_KEY = process.env.REACT_APP_CSAS_API_KEY;

function getCurrencyCode(item) {
    return item?.shortName;
}

function DetailApp() {
    const currencyCode = useMemo(() => {
        const searchParams = new URLSearchParams(window.location.search);
        return (searchParams.get('currency') || '').trim().toUpperCase();
    }, []);

    const [state, setState] = useState({ status: 'loading', data: null, message: '' });

    useEffect(() => {
        const backButton = document.getElementById('back-button');

        const handleBack = () => {
            window.location.href = 'index.html';
        };

        if (backButton) {
            backButton.addEventListener('click', handleBack);
        }

        if (!currencyCode) {
            setState({ status: 'error', data: null, message: 'Missing currency query parameter.' });
            return () => {
                if (backButton) {
                    backButton.removeEventListener('click', handleBack);
                }
            };
        }

        let cancelled = false;

        async function loadDetail() {
            try {
                const detailUrl = new URL(EXCHANGE_RATES_ENDPOINT);
                detailUrl.searchParams.set('curr', currencyCode);
                detailUrl.searchParams.set('web-api-key', API_KEY);

                const response = await fetch(detailUrl, {
                    headers: {
                        'web-api-key': WEB_API_KEY,
                    },
                });

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
    const buyRate = detail?.currBuy ?? 'N/A';
    const sellRate = detail?.currSell ?? 'N/A';
    const validityDate = detail?.validFrom ?? null;

    return React.createElement(
        React.Fragment,
        null,
        React.createElement('h1', null, currency),
        React.createElement(
            'section',
            null,
            React.createElement('h2', null, `Detail měny: ${name}`),
            React.createElement('p', null, `Zkratka: ${currency}`),
            React.createElement('p', null, `Země: ${country}`),
            React.createElement('p', null, `Nákup: ${buyRate}`),
            React.createElement('p', null, `Prodej: ${sellRate}`),
            validityDate ? React.createElement('p', null, `Kurz platný od: ${validityDate}`) : null,
        ),
    );
}

const rootElement = document.getElementById('detail-root');

if (rootElement) {
    createRoot(rootElement).render(React.createElement(DetailApp));
}
