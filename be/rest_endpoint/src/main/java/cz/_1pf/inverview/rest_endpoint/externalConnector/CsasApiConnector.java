package cz._1pf.inverview.rest_endpoint.externalConnector;

import cz._1pf.inverview.rest_endpoint.api.exception.ApiConnectionException;
import cz._1pf.inverview.rest_endpoint.externalConnector.dto.ExchangeRateDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
public class CsasApiConnector {
    private final WebClient webClient;
    private final String apiKey;
    private final String baseUrl;

    public CsasApiConnector(
        WebClient.Builder webClientBuilder,
        @Value("${api.key}") String apiKey,
        @Value("${api.url}") String baseUrl
    ) {
        this.webClient = webClientBuilder.build();
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    public List<ExchangeRateDto> fetchRates() throws ApiConnectionException {
        try {
            return webClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path(baseUrl)
                    .queryParam("web-api-key", apiKey)
                    .build()
                )
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<ExchangeRateDto>>() {})
                .block();
        } catch (Exception ex) {
            throw new ApiConnectionException("Failed to fetch exchange rates from CSAS API", ex);
        }
    }
}
