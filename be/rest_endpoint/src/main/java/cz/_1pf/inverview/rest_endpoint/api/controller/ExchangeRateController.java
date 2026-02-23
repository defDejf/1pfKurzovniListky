package cz._1pf.inverview.rest_endpoint.api.controller;

import cz._1pf.inverview.rest_endpoint.api.exception.ApiConnectionException;
import cz._1pf.inverview.rest_endpoint.api.exception.ExchangeRateNotFoundException;
import cz._1pf.inverview.rest_endpoint.service.ExchangeRateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/exchange-rates")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:*")
public class ExchangeRateController {

    private final ExchangeRateService exchangeRateService;

    @GetMapping
    public ResponseEntity<?> getExchangeRates(
        @RequestParam(required = false, defaultValue = "false") boolean usedb,
        @RequestParam(required = false) String curr) {
        System.out.println(">>> CONTROLLER HIT");
        try {
            return ResponseEntity.ok(
                // originally called it refresh, inverted cause i dont want to rewrite it further down
                exchangeRateService.getExchangeRates(!usedb, curr)
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
