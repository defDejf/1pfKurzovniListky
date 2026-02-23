package cz._1pf.inverview.rest_endpoint.service;

import cz._1pf.inverview.rest_endpoint.api.exception.ApiConnectionException;
import cz._1pf.inverview.rest_endpoint.api.exception.ExchangeRateNotFoundException;
import cz._1pf.inverview.rest_endpoint.externalConnector.CsasApiConnector;
import cz._1pf.inverview.rest_endpoint.externalConnector.dto.ExchangeRateDto;
import cz._1pf.inverview.rest_endpoint.reporisory.ExchangeRateRepository;
import cz._1pf.inverview.rest_endpoint.api.model.ExchangeRate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExchangeRateService {

    private final ExchangeRateRepository repository;
    private final CsasApiConnector csasApiConnector;

    public List<ExchangeRate> getExchangeRates(boolean refresh, String shortName) throws ApiConnectionException, ExchangeRateNotFoundException {

        if (refresh || repository.count() == 0) refreshRates();

        if (shortName != null && !shortName.isBlank()) {
            return List.of(
                repository.findByShortName(shortName)
                    .orElseThrow(() -> new ExchangeRateNotFoundException(shortName))
            );
        }

        return repository.findAll();
    }

    public void refreshRates() {
        List<ExchangeRateDto> dtos = csasApiConnector.fetchRates();

        List<ExchangeRate> entities = dtos.stream()
            .map(this::mapToEntity)
            .toList();

        repository.deleteAllInBatch();
        repository.saveAll(entities);
    }

    private ExchangeRate mapToEntity(ExchangeRateDto dto) {
        return new ExchangeRate(
            dto.getShortName(),
            dto.getValidFrom().toLocalDate(),
            dto.getName(),
            dto.getCountry(),
            dto.getValBuy(),
            dto.getValSell(),
            dto.getValMid(),
            dto.getCurrBuy(),
            dto.getCurrSell(),
            dto.getCurrMid(),
            dto.getMove(),
            dto.getCnbMid(),
            dto.getVersion()
        );
    }
}
