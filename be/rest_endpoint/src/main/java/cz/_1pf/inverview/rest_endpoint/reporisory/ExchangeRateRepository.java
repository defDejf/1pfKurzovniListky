package cz._1pf.inverview.rest_endpoint.reporisory;

import cz._1pf.inverview.rest_endpoint.api.model.ExchangeRate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExchangeRateRepository extends JpaRepository<ExchangeRate, Long> {
    Optional<ExchangeRate> findByShortName(String shortName);
}
