export interface Valuation {
    domainName: string;
    estimatedValue: number;
    justification: string;
}

export interface BatchValuationResult {
    valuations: Valuation[];
    methodology: string;
    resources: string[];
}

export interface DetailedValuation {
    domainName: string;
    currentValue: number;
    futureProjections: {
        threeMonth: number;
        sixMonth: number;
        twelveMonth: number;
    };
    coreInfluencers: {
        keywordValue: string;
        searchVolume: string;
        salesHistory: string;
        marketTrend: string;
    };
    growthPotential: {
        opportunity: number;
    };
}

export interface HistoricalDataPoint {
    month: string;
    value: number;
}

export interface DomainAvailability {
    available: boolean;
    registrar: string | null;
    purchasePrice?: number | null;
}

export interface DomainRecommendation {
    domainName: string;
    estimatedValue: number;
    reason: string;
}

export interface DomainRecommendationResult {
    recommendations: DomainRecommendation[];
}