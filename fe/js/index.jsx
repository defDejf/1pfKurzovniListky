import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

const API_URL = process.env.BASE_URL;
const API_KEY = process.env.API_KEY;
const OVERVIEW_RATES_STORAGE_KEY = 'overviewRates';
const OVERVIEW_RATES_TTL_MS = 5 * 60 * 1000;

function IndexTableRows() {
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderBy, setOrderBy] = useState(() => document.getElementById('order')?.value ?? 'name');
    const [orderDirection, setOrderDirection] = useState(() => document.getElementById('ascendecny')?.value ?? 'asc');

    useEffect(() => {
        const orderSelect = document.getElementById('order');
        const directionSelect = document.getElementById('ascendecny');

        if (!orderSelect || !directionSelect) {
            return undefined;
        }

        const handleOrderChange = (event) => {
            setOrderBy(event.target.value);
        };

        const handleDirectionChange = (event) => {
            setOrderDirection(event.target.value);
        };

        orderSelect.addEventListener('change', handleOrderChange);
        directionSelect.addEventListener('change', handleDirectionChange);

        return () => {
            orderSelect.removeEventListener('change', handleOrderChange);
            directionSelect.removeEventListener('change', handleDirectionChange);
        };
    }, []);


    useEffect(() => {
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

        const getRatesFromCache = () => {
            const cachedValue = parseCachedRates();
            if (!cachedValue || !isCacheFresh(cachedValue) || !Array.isArray(cachedValue?.data)) {
                return null;
            }
            return cachedValue.data;
        };

        async function loadRates() {
            try {
                const cachedRates = getRatesFromCache();

                if (cachedRates) {
                    setRates(cachedRates);
                    setLoading(false);
                    return;
                }

                const overviewURL = new URL(API_URL);
                overviewURL.searchParams.set('web-api-key', API_KEY);

                const response = await fetch(overviewURL, {
                    headers: {
                        'web-api-key': API_KEY,
                    },
                });


                if (!response.ok) {
                    throw new Error(`Nepodařilo se načíst data: ${response.status}`);
                }

                const payload = await response.json();
                const exchangeRates = Array.isArray(payload)
                    ? payload
                    : Array.isArray(payload?.rates)
                        ? payload.rates
                        : [];

                sessionStorage.setItem(
                    OVERVIEW_RATES_STORAGE_KEY,
                    JSON.stringify({
                        data: exchangeRates,
                        storedAt: Date.now(),
                    }),
                );

                setRates(exchangeRates);
            } catch (fetchError) {
                setError(fetchError instanceof Error ? fetchError.message : 'Neznámá chyba při načítání.');
            } finally {
                setLoading(false);
            }
        }

        loadRates();
    }, []);

    if (loading) {
        return (
            <tr>
                <td colSpan="4">Načítám kurzovní lístek...</td>
            </tr>
        );
    }

    if (error) {
        return (
            <tr>
                <td colSpan="4">{error}</td>
            </tr>
        );
    }

    if (rates.length === 0) {
        return (
            <tr>
                <td colSpan="4">Nebyla nalezena žádná data.</td>
            </tr>
        );
    }


    const sortedRates = [...rates].sort((a, b) => {
        const directionFactor = orderDirection === 'desc' ? -1 : 1;

        const normalizeNumber = (value) => {
            const parsed = Number(value);
            return Number.isNaN(parsed) ? 0 : parsed;
        };

        const compareText = (valueA, valueB) => valueA.localeCompare(valueB, 'cs', { sensitivity: 'base' });

        switch (orderBy) {
            case 'buy_price':
                return (normalizeNumber(a?.currBuy) - normalizeNumber(b?.currBuy)) * directionFactor;
            case 'sell_price':
                return (normalizeNumber(a?.currSell) - normalizeNumber(b?.currSell)) * directionFactor;
            case 'change':
                return (normalizeNumber(a?.move) - normalizeNumber(b?.move)) * directionFactor;
            case 'name':
            default:
                return compareText(a?.name ?? '', b?.name ?? '') * directionFactor;
        }
    });

    return sortedRates.map((rate) => {

        const currencyName = rate?.name ?? '';
        const currencyCode = rate?.shortName ?? '';
        const buyRate = rate?.currBuy ?? '-';
        const sellRate = rate?.currSell ?? '-';
        const change = rate?.move ?? '-';

        const navigateToDetail = () => {
            window.location.href = `detail.html?curr=${encodeURIComponent(currencyCode)}`;
        };


        return (
            <tr
                key={currencyCode}
                role="button"
                tabIndex={0}
                onClick={navigateToDetail}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        navigateToDetail();
                    }
                }}
            >
                <td>{currencyName}</td>
                <td>{currencyCode}</td>
                <td>{buyRate}</td>
                <td>{sellRate}</td>
                <td>{change}%</td>
            </tr>
        );
    });
}

const rootElement = document.getElementById('index-root');

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(<IndexTableRows />);
}
