// ---------------------------------------------------------------------------
// Flywheel Metrics — Types
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §10
// ---------------------------------------------------------------------------

/** The 5 Dream Hub services */
export type ServiceId = "brain" | "planner" | "place" | "store" | "cafe";

export const ALL_SERVICES: ServiceId[] = [
  "brain",
  "planner",
  "place",
  "store",
  "cafe",
];

// ═══════════════════════════════════════════════════════════════════════════
// Network Value (§10.1, §10.2)
// ═══════════════════════════════════════════════════════════════════════════

export interface NetworkValueResult {
  model: "metcalfe" | "odlyzko" | "reed" | "beckstrom";
  value: number;
  activeUsers?: number;
}

/** A single transaction for Beckstrom's Law calculation */
export interface Transaction {
  /** Gross benefit of the transaction */
  benefit: number;
  /** Cost of the transaction */
  cost: number;
  /** Discount rate (annual, e.g., 0.1 for 10%) */
  rate: number;
  /** Time period in years for discounting */
  time: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// Cross-Elasticity (§10.3)
// ═══════════════════════════════════════════════════════════════════════════

/** A single data point in a time series for cross-elasticity */
export interface UsageDataPoint {
  date: string;
  serviceAUsage: number;
  serviceBUsage: number;
}

export interface CrossElasticityResult {
  serviceA: ServiceId;
  serviceB: ServiceId;
  elasticity: number;
  interpretation: "complement" | "substitute" | "independent";
  description: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Ecosystem Health Score (§10.5)
// ═══════════════════════════════════════════════════════════════════════════

export interface EcosystemMetrics {
  /** Daily Active Users */
  dau: number;
  /** Monthly Active Users */
  mau: number;
  /** Average number of Dream Hub services used per user */
  avgServicesPerUser: number;
  /** Count of events that span multiple services */
  crossServiceEvents: number;
  /** Total event count */
  totalEvents: number;
  /** 90-day retention rate (0 to 1) */
  retention90d: number;
  /** Viral coefficient (K-factor): avg invites × conversion rate */
  viralCoefficient: number;
  /** Net Promoter Score (-100 to 100) */
  nps: number;
}

export interface EcosystemHealthWeights {
  dauMauRatio: number;
  serviceAdoption: number;
  crossServiceRatio: number;
  retention: number;
  viral: number;
  nps: number;
}

export interface EcosystemHealthResult {
  score: number;
  components: {
    dauMauRatio: number;
    serviceAdoption: number;
    crossServiceRatio: number;
    retention: number;
    viral: number;
    nps: number;
  };
  weights: EcosystemHealthWeights;
}

// ═══════════════════════════════════════════════════════════════════════════
// Two-Sided Market (§10.4)
// ═══════════════════════════════════════════════════════════════════════════

export interface MarketSideData {
  /** Number of participants on this side */
  participants: number;
  /** Standalone value (ω^s) — value derived without the other side */
  standaloneValue: number;
  /** Cross-side interaction value (ω^i) — marginal value per other-side user */
  interactionValue: number;
  /** Price charged to this side */
  price: number;
}

export interface TwoSidedMarketResult {
  /** Utility for supply side: u_supply = ω^s + ω^i × N_demand - p */
  supplyUtility: number;
  /** Utility for demand side: u_demand = ω^s + ω^i × N_supply - p */
  demandUtility: number;
  /** Cross-side effect parameter α = ω_supply^i × ω_demand^i */
  alpha: number;
  /** Whether market tipping can occur (α > 1) */
  tippingPossible: boolean;
  /** Which side to subsidize (lower price) to grow the market */
  subsidizeRecommendation: "supply" | "demand" | "balanced";
  /** Explanation of the recommendation */
  reasoning: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Flywheel Report (Dashboard)
// ═══════════════════════════════════════════════════════════════════════════

export interface FlywheelReport {
  generatedAt: string;
  networkValue: {
    metcalfe: NetworkValueResult;
    odlyzko: NetworkValueResult;
    reed: NetworkValueResult;
    beckstrom: NetworkValueResult;
  };
  crossElasticities: CrossElasticityResult[];
  ecosystemHealth: EcosystemHealthResult;
  marketAnalysis: TwoSidedMarketResult;
  recommendations: string[];
}
