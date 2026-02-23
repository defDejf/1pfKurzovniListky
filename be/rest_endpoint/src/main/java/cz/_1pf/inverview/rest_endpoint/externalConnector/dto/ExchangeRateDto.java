package cz._1pf.inverview.rest_endpoint.externalConnector.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ExchangeRateDto {

    private String shortName;
    private LocalDateTime validFrom;
    private String name;
    private String country;

    private BigDecimal move;
    private int amount;

    private BigDecimal valBuy;
    private BigDecimal valSell;
    private BigDecimal valMid;

    private BigDecimal currBuy;
    private BigDecimal currSell;
    private BigDecimal currMid;

    private int version;
    private BigDecimal cnbMid;
    private BigDecimal ecbMid;
}
