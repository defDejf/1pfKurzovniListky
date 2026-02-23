package cz._1pf.inverview.rest_endpoint.api.exception;

public class ApiConnectionException extends RuntimeException{
    public ApiConnectionException(String message, Throwable cause) {
        super(message, cause);
    }
}
