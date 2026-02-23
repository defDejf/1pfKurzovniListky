package cz._1pf.inverview.rest_endpoint.api.controller;

import cz._1pf.inverview.rest_endpoint.api.exception.ApiConnectionException;
import cz._1pf.inverview.rest_endpoint.api.exception.ExchangeRateNotFoundException;
import cz._1pf.inverview.rest_endpoint.service.ExchangeRateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/exchange-rates")
@RequiredArgsConstructor
public class ExchangeRateController {

    private final ExchangeRateService exchangeRateService;

    @GetMapping
    public ResponseEntity<?> getExchangeRates(
        @RequestParam(required = false, defaultValue = "false") boolean refresh,
        @RequestParam(required = false) String shortName
    ) {
        try {
            return ResponseEntity.ok(
                exchangeRateService.getExchangeRates(refresh, shortName)
            );

        } catch (ExchangeRateNotFoundException e) {
            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(e.getMessage());

        } catch (ApiConnectionException e) {
            return ResponseEntity
                .status(HttpStatus.BAD_GATEWAY)
                .body(e.getMessage());

        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Nastala neznámá chyba.");
        }
    }
}
