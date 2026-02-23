package cz._1pf.inverview.rest_endpoint.api.exception;

public class ExchangeRateNotFoundException extends RuntimeException{
    public ExchangeRateNotFoundException(String shortName) {
        super("Měna: " + shortName + " nebyla nalezena.");
    }
}
