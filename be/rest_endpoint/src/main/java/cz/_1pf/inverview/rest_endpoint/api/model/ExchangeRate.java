package cz._1pf.inverview.rest_endpoint.api.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ExchangeRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String shortName;
    private LocalDate validFrom;
    private String name;
    private String country;

    private BigDecimal valBuy;
    private BigDecimal valSell;
    private BigDecimal valMid;

    private BigDecimal currBuy;
    private BigDecimal currSell;
    private BigDecimal currMid;

    private BigDecimal move;
    private BigDecimal cnbMid;
    private int version;

    public ExchangeRate(String shortName,
                        LocalDate validFrom,
                        String name,
                        String country,
                        BigDecimal valBuy,
                        BigDecimal valSell,
                        BigDecimal valMid,
                        BigDecimal currBuy,
                        BigDecimal currSell,
                        BigDecimal currMid,
                        BigDecimal move,
                        BigDecimal cnbMid,
                        int version) {
        this.shortName = shortName;
        this.validFrom = validFrom;
        this.name = name;
        this.country = country;
        this.valBuy = valBuy;
        this.valSell = valSell;
        this.valMid = valMid;
        this.currBuy = currBuy;
        this.currSell = currSell;
        this.currMid = currMid;
        this.move = move;
        this.cnbMid = cnbMid;
        this.version = version;
    }
}
