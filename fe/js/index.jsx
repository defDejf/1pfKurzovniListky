import React, { useEffect, useState } from 'https://esm.sh/react@18';
import ReactDOM from 'https://esm.sh/react-dom@18/client';

const API_URL = process.env.REACT_APP_CSAS_URL;
const API_KEY = process.env.REACT_APP_CSAS_API_KEY;

function IndexTableRows() {
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadRates() {
            try {
                const overviewURL = new URL(API_URL);
                overviewURL.searchParams.set('curr', currencyCode);
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


    return rates.map((rate) => {
        const currencyName = rate?.name ?? '';
        const currencyCode = rate?.shortName ?? '';
        const buyRate = rate?.valBuy ?? '-';
        const sellRate = rate?.valSell ?? '-';
        const change = rate?.move ?? '-';

        return (
            <tr
                key={currencyCode}
                role="button"
                tabIndex={0}
                onClick={() => {
                    window.location.href = `detail.html?currency=${encodeURIComponent(currencyCode)}`;
                }}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        window.location.href = `detail.html?currency=${encodeURIComponent(currencyCode)}`;
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
