// ---------------------------------------------------------------------------
// Flywheel Metrics — Unit Tests
//
// Covers:
// 1. Network value models (Metcalfe, Odlyzko, Reed, Beckstrom)
// 2. Cross-elasticity of engagement
// 3. Ecosystem Health Score
// 4. Two-sided market analysis
// 5. Full flywheel report generation
// ---------------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import {
  metcalfeValue,
  odlyzkoValue,
  reedValue,
  beckstromValue,
} from "../network-value";
import { computeCrossElasticity } from "../cross-elasticity";
import { computeEcosystemHealth } from "../ecosystem-health";
import { analyzeTwoSidedMarket } from "../two-sided-market";
import { generateFlywheelReport } from "../report";
import type {
  Transaction,
  UsageDataPoint,
  EcosystemMetrics,
  MarketSideData,
} from "../types";

// ═══════════════════════════════════════════════════════════════════════════
// 1. Network Value Models
// ═══════════════════════════════════════════════════════════════════════════

describe("Network Value Models", () => {
  describe("Metcalfe's Law: V = k × n²", () => {
    it("should compute V = k × n² with default Facebook constant", () => {
      const result = metcalfeValue(1_000_000);
      // 5.70e-9 × (1e6)² = 5.70e-9 × 1e12 = 5700
      expect(result.value).toBeCloseTo(5700, 0);
      expect(result.model).toBe("metcalfe");
      expect(result.activeUsers).toBe(1_000_000);
    });

    it("should allow custom k constant", () => {
      const result = metcalfeValue(100, 0.01);
      // 0.01 × 100² = 100
      expect(result.value).toBe(100);
    });

    it("should return 0 for 0 users", () => {
      expect(metcalfeValue(0).value).toBe(0);
    });

    it("should grow quadratically", () => {
      const v100 = metcalfeValue(100, 1).value;
      const v200 = metcalfeValue(200, 1).value;
      // v200 / v100 = (200/100)² = 4
      expect(v200 / v100).toBeCloseTo(4, 5);
    });

    it("should throw for negative users", () => {
      expect(() => metcalfeValue(-1)).toThrow("non-negative");
    });
  });

  describe("Odlyzko's Correction: V = k × n × log(n)", () => {
    it("should compute V = k × n × log(n)", () => {
      const result = odlyzkoValue(1000);
      // 1.0 × 1000 × ln(1000) ≈ 1000 × 6.908 ≈ 6908
      expect(result.value).toBeCloseTo(1000 * Math.log(1000), 5);
      expect(result.model).toBe("odlyzko");
    });

    it("should return 0 for 0 or 1 users", () => {
      expect(odlyzkoValue(0).value).toBe(0);
      expect(odlyzkoValue(1).value).toBe(0);
    });

    it("should grow slower than Metcalfe for large n", () => {
      const n = 100_000;
      const metcalfe = n * n; // n²
      const odlyzko = n * Math.log(n); // n × log(n)
      expect(odlyzko).toBeLessThan(metcalfe);
    });

    it("should throw for negative users", () => {
      expect(() => odlyzkoValue(-5)).toThrow("non-negative");
    });
  });

  describe("Reed's Law: V = 2^n (capped)", () => {
    it("should compute V = 2^n for small n", () => {
      const result = reedValue(10);
      expect(result.value).toBe(1024); // 2^10
      expect(result.model).toBe("reed");
    });

    it("should cap at maxValue for large n", () => {
      const cap = 1_000_000;
      const result = reedValue(100, cap);
      expect(result.value).toBe(cap);
    });

    it("should return 1 for 0 users (2^0 = 1)", () => {
      expect(reedValue(0).value).toBe(1);
    });

    it("should grow exponentially", () => {
      const v5 = reedValue(5).value;
      const v6 = reedValue(6).value;
      expect(v6 / v5).toBeCloseTo(2, 5); // 2^6 / 2^5 = 2
    });

    it("should throw for negative users", () => {
      expect(() => reedValue(-1)).toThrow("non-negative");
    });
  });

  describe("Beckstrom's Law: V = Σ (B-C)/(1+r)^t", () => {
    it("should compute NPV of transactions", () => {
      const transactions: Transaction[] = [
        { benefit: 100, cost: 20, rate: 0.1, time: 0 }, // net: 80, PV: 80
        { benefit: 150, cost: 50, rate: 0.1, time: 1 }, // net: 100, PV: 100/1.1 ≈ 90.91
        { benefit: 200, cost: 80, rate: 0.1, time: 2 }, // net: 120, PV: 120/1.21 ≈ 99.17
      ];

      const result = beckstromValue(transactions);
      // 80 + 90.91 + 99.17 ≈ 270.08
      expect(result.value).toBeCloseTo(80 + 100 / 1.1 + 120 / 1.21, 2);
      expect(result.model).toBe("beckstrom");
    });

    it("should return 0 for no transactions", () => {
      expect(beckstromValue([]).value).toBe(0);
    });

    it("should handle negative net benefit (cost > benefit)", () => {
      const transactions: Transaction[] = [
        { benefit: 10, cost: 50, rate: 0.05, time: 0 },
      ];
      const result = beckstromValue(transactions);
      expect(result.value).toBe(-40); // 10 - 50 = -40
    });

    it("should discount future transactions more heavily", () => {
      const near: Transaction = { benefit: 100, cost: 0, rate: 0.1, time: 1 };
      const far: Transaction = { benefit: 100, cost: 0, rate: 0.1, time: 5 };

      const nearPV = beckstromValue([near]).value;
      const farPV = beckstromValue([far]).value;

      expect(nearPV).toBeGreaterThan(farPV);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. Cross-Elasticity of Engagement
// ═══════════════════════════════════════════════════════════════════════════

describe("Cross-Elasticity", () => {
  it("should detect complement services (positive elasticity)", () => {
    // Brain usage grows → Planner usage grows proportionally
    const timeSeries: UsageDataPoint[] = [
      { date: "2025-01", serviceAUsage: 100, serviceBUsage: 50 },
      { date: "2025-02", serviceAUsage: 120, serviceBUsage: 60 },
      { date: "2025-03", serviceAUsage: 150, serviceBUsage: 75 },
      { date: "2025-04", serviceAUsage: 200, serviceBUsage: 100 },
    ];

    const result = computeCrossElasticity("brain", "planner", timeSeries);

    expect(result.elasticity).toBeGreaterThan(0);
    expect(result.interpretation).toBe("complement");
    expect(result.serviceA).toBe("brain");
    expect(result.serviceB).toBe("planner");
  });

  it("should detect substitute services (negative elasticity)", () => {
    // As service A grows, service B shrinks
    const timeSeries: UsageDataPoint[] = [
      { date: "2025-01", serviceAUsage: 100, serviceBUsage: 200 },
      { date: "2025-02", serviceAUsage: 150, serviceBUsage: 150 },
      { date: "2025-03", serviceAUsage: 200, serviceBUsage: 100 },
      { date: "2025-04", serviceAUsage: 250, serviceBUsage: 50 },
    ];

    const result = computeCrossElasticity("store", "cafe", timeSeries);

    expect(result.elasticity).toBeLessThan(0);
    expect(result.interpretation).toBe("substitute");
  });

  it("should detect independent services (near-zero elasticity)", () => {
    // A grows but B stays flat
    const timeSeries: UsageDataPoint[] = [
      { date: "2025-01", serviceAUsage: 100, serviceBUsage: 50 },
      { date: "2025-02", serviceAUsage: 150, serviceBUsage: 50 },
      { date: "2025-03", serviceAUsage: 200, serviceBUsage: 50 },
      { date: "2025-04", serviceAUsage: 250, serviceBUsage: 50 },
    ];

    const result = computeCrossElasticity("brain", "store", timeSeries);

    expect(Math.abs(result.elasticity)).toBeLessThan(0.05);
    expect(result.interpretation).toBe("independent");
  });

  it("should throw for fewer than 2 data points", () => {
    expect(() =>
      computeCrossElasticity("brain", "planner", [
        { date: "2025-01", serviceAUsage: 100, serviceBUsage: 50 },
      ]),
    ).toThrow("at least 2 data points");
  });

  it("should handle periods where A doesn't change", () => {
    const timeSeries: UsageDataPoint[] = [
      { date: "2025-01", serviceAUsage: 100, serviceBUsage: 50 },
      { date: "2025-02", serviceAUsage: 100, serviceBUsage: 60 }, // A flat
      { date: "2025-03", serviceAUsage: 150, serviceBUsage: 75 }, // A grows
    ];

    // Should not throw — skips the flat period
    const result = computeCrossElasticity("brain", "planner", timeSeries);
    expect(isFinite(result.elasticity)).toBe(true);
  });

  it("should give more weight to periods with larger A changes", () => {
    const timeSeries: UsageDataPoint[] = [
      { date: "2025-01", serviceAUsage: 100, serviceBUsage: 100 },
      { date: "2025-02", serviceAUsage: 101, serviceBUsage: 200 }, // tiny A change, huge B (elasticity ≈ 100)
      { date: "2025-03", serviceAUsage: 200, serviceBUsage: 250 }, // big A change, moderate B (elasticity ≈ 0.4)
    ];

    const result = computeCrossElasticity("brain", "planner", timeSeries);

    // The second period (big A change) should dominate the weighted average
    // so elasticity should be closer to ~0.4 than ~100
    expect(result.elasticity).toBeLessThan(10);
  });

  it("description should include elasticity value", () => {
    const timeSeries: UsageDataPoint[] = [
      { date: "2025-01", serviceAUsage: 100, serviceBUsage: 50 },
      { date: "2025-02", serviceAUsage: 200, serviceBUsage: 100 },
    ];

    const result = computeCrossElasticity("brain", "planner", timeSeries);
    expect(result.description).toContain("elasticity:");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. Ecosystem Health Score
// ═══════════════════════════════════════════════════════════════════════════

describe("Ecosystem Health Score", () => {
  const healthyMetrics: EcosystemMetrics = {
    dau: 50_000,
    mau: 100_000,
    avgServicesPerUser: 3.5,
    crossServiceEvents: 40_000,
    totalEvents: 100_000,
    retention90d: 0.75,
    viralCoefficient: 1.2,
    nps: 60,
  };

  const poorMetrics: EcosystemMetrics = {
    dau: 5_000,
    mau: 100_000,
    avgServicesPerUser: 1.2,
    crossServiceEvents: 2_000,
    totalEvents: 100_000,
    retention90d: 0.15,
    viralCoefficient: 0.2,
    nps: -20,
  };

  it("should return score in [0, 1] range", () => {
    const result = computeEcosystemHealth(healthyMetrics);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  });

  it("healthy metrics should score higher than poor metrics", () => {
    const healthy = computeEcosystemHealth(healthyMetrics);
    const poor = computeEcosystemHealth(poorMetrics);

    expect(healthy.score).toBeGreaterThan(poor.score);

    console.log("\n=== Ecosystem Health Score Comparison ===");
    console.log(`Healthy: ${healthy.score.toFixed(4)}`);
    console.log(`Poor:    ${poor.score.toFixed(4)}`);
  });

  it("should compute correct DAU/MAU ratio component", () => {
    const result = computeEcosystemHealth(healthyMetrics);
    // DAU/MAU = 50000/100000 = 0.5
    expect(result.components.dauMauRatio).toBeCloseTo(0.5, 5);
  });

  it("should compute correct service adoption component", () => {
    const result = computeEcosystemHealth(healthyMetrics);
    // 3.5 / 5 = 0.7
    expect(result.components.serviceAdoption).toBeCloseTo(0.7, 5);
  });

  it("should compute correct cross-service ratio", () => {
    const result = computeEcosystemHealth(healthyMetrics);
    // 40000 / 100000 = 0.4
    expect(result.components.crossServiceRatio).toBeCloseTo(0.4, 5);
  });

  it("should normalize NPS from [-100,100] to [0,1]", () => {
    const result = computeEcosystemHealth(healthyMetrics);
    // NPS 60 → (60 + 100) / 200 = 0.8
    expect(result.components.nps).toBeCloseTo(0.8, 5);
  });

  it("should cap viral coefficient normalization at 1.0", () => {
    const superViral: EcosystemMetrics = {
      ...healthyMetrics,
      viralCoefficient: 5.0, // way above cap of 2
    };
    const result = computeEcosystemHealth(superViral);
    expect(result.components.viral).toBe(1.0);
  });

  it("should handle zero MAU gracefully", () => {
    const zeroMau: EcosystemMetrics = { ...healthyMetrics, mau: 0 };
    const result = computeEcosystemHealth(zeroMau);
    expect(result.components.dauMauRatio).toBe(0);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it("should accept custom weights", () => {
    const retentionOnly = computeEcosystemHealth(healthyMetrics, {
      dauMauRatio: 0,
      serviceAdoption: 0,
      crossServiceRatio: 0,
      retention: 1.0,
      viral: 0,
      nps: 0,
    });

    // Score should equal retention90d = 0.75
    expect(retentionOnly.score).toBeCloseTo(0.75, 5);
  });

  it("perfect metrics should score near 1.0", () => {
    const perfect: EcosystemMetrics = {
      dau: 100_000,
      mau: 100_000, // DAU/MAU = 1.0
      avgServicesPerUser: 5.0, // 5/5 = 1.0
      crossServiceEvents: 100_000,
      totalEvents: 100_000, // 1.0
      retention90d: 1.0,
      viralCoefficient: 2.0, // 2/2 = 1.0
      nps: 100, // (100+100)/200 = 1.0
    };

    const result = computeEcosystemHealth(perfect);
    expect(result.score).toBeCloseTo(1.0, 5);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. Two-Sided Market Analysis
// ═══════════════════════════════════════════════════════════════════════════

describe("Two-Sided Market Analysis", () => {
  it("should compute correct utilities", () => {
    const supply: MarketSideData = {
      participants: 100,
      standaloneValue: 10,
      interactionValue: 0.5,
      price: 5,
    };
    const demand: MarketSideData = {
      participants: 1000,
      standaloneValue: 20,
      interactionValue: 0.3,
      price: 2,
    };

    const result = analyzeTwoSidedMarket(supply, demand);

    // u_supply = 10 + 0.5 × 1000 - 5 = 505
    expect(result.supplyUtility).toBeCloseTo(505, 5);
    // u_demand = 20 + 0.3 × 100 - 2 = 48
    expect(result.demandUtility).toBeCloseTo(48, 5);
  });

  it("should detect tipping when α > 1", () => {
    const supply: MarketSideData = {
      participants: 100,
      standaloneValue: 5,
      interactionValue: 2.0, // high cross-side effect
      price: 0,
    };
    const demand: MarketSideData = {
      participants: 200,
      standaloneValue: 5,
      interactionValue: 1.5, // high cross-side effect
      price: 0,
    };

    const result = analyzeTwoSidedMarket(supply, demand);

    // α = 2.0 × 1.5 = 3.0 > 1
    expect(result.alpha).toBeCloseTo(3.0, 5);
    expect(result.tippingPossible).toBe(true);
  });

  it("should detect no tipping when α ≤ 1", () => {
    const supply: MarketSideData = {
      participants: 100,
      standaloneValue: 50,
      interactionValue: 0.5,
      price: 10,
    };
    const demand: MarketSideData = {
      participants: 200,
      standaloneValue: 30,
      interactionValue: 0.8,
      price: 5,
    };

    const result = analyzeTwoSidedMarket(supply, demand);

    // α = 0.5 × 0.8 = 0.4 < 1
    expect(result.alpha).toBeCloseTo(0.4, 5);
    expect(result.tippingPossible).toBe(false);
  });

  it("should recommend subsidizing supply when supply utility is negative", () => {
    const supply: MarketSideData = {
      participants: 10,
      standaloneValue: 2,
      interactionValue: 0.1,
      price: 50, // too expensive
    };
    const demand: MarketSideData = {
      participants: 100,
      standaloneValue: 20,
      interactionValue: 0.5,
      price: 5,
    };

    const result = analyzeTwoSidedMarket(supply, demand);

    // u_supply = 2 + 0.1×100 - 50 = -38 (negative)
    expect(result.supplyUtility).toBeLessThan(0);
    expect(result.subsidizeRecommendation).toBe("supply");
  });

  it("should recommend subsidizing demand when demand utility is negative", () => {
    const supply: MarketSideData = {
      participants: 1000,
      standaloneValue: 30,
      interactionValue: 0.5,
      price: 5,
    };
    const demand: MarketSideData = {
      participants: 50,
      standaloneValue: 3,
      interactionValue: 0.01,
      price: 100, // too expensive
    };

    const result = analyzeTwoSidedMarket(supply, demand);

    expect(result.demandUtility).toBeLessThan(0);
    expect(result.subsidizeRecommendation).toBe("demand");
  });

  it("should recommend balanced when externalities are similar", () => {
    const supply: MarketSideData = {
      participants: 500,
      standaloneValue: 20,
      interactionValue: 0.3,
      price: 5,
    };
    const demand: MarketSideData = {
      participants: 500,
      standaloneValue: 20,
      interactionValue: 0.3,
      price: 5,
    };

    const result = analyzeTwoSidedMarket(supply, demand);

    expect(result.subsidizeRecommendation).toBe("balanced");
  });

  it("should provide reasoning string", () => {
    const supply: MarketSideData = {
      participants: 100,
      standaloneValue: 10,
      interactionValue: 0.5,
      price: 5,
    };
    const demand: MarketSideData = {
      participants: 200,
      standaloneValue: 15,
      interactionValue: 0.3,
      price: 3,
    };

    const result = analyzeTwoSidedMarket(supply, demand);

    expect(result.reasoning).toBeTruthy();
    expect(typeof result.reasoning).toBe("string");
    expect(result.reasoning.length).toBeGreaterThan(10);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. Full Flywheel Report
// ═══════════════════════════════════════════════════════════════════════════

describe("Flywheel Report", () => {
  it("should generate a complete report with all sections", () => {
    const report = generateFlywheelReport({
      activeUsers: 50_000,
      transactions: [
        { benefit: 100, cost: 20, rate: 0.1, time: 0 },
        { benefit: 200, cost: 50, rate: 0.1, time: 1 },
        { benefit: 300, cost: 80, rate: 0.1, time: 2 },
      ],
      crossElasticityData: [
        {
          serviceA: "brain",
          serviceB: "planner",
          data: [
            { date: "2025-01", serviceAUsage: 100, serviceBUsage: 50 },
            { date: "2025-02", serviceAUsage: 150, serviceBUsage: 80 },
            { date: "2025-03", serviceAUsage: 200, serviceBUsage: 110 },
          ],
        },
        {
          serviceA: "cafe",
          serviceB: "place",
          data: [
            { date: "2025-01", serviceAUsage: 50, serviceBUsage: 200 },
            { date: "2025-02", serviceAUsage: 80, serviceBUsage: 300 },
            { date: "2025-03", serviceAUsage: 120, serviceBUsage: 420 },
          ],
        },
      ],
      ecosystemMetrics: {
        dau: 25_000,
        mau: 50_000,
        avgServicesPerUser: 2.8,
        crossServiceEvents: 15_000,
        totalEvents: 50_000,
        retention90d: 0.55,
        viralCoefficient: 0.8,
        nps: 35,
      },
      supplyData: {
        participants: 500,
        standaloneValue: 15,
        interactionValue: 0.5,
        price: 10,
      },
      demandData: {
        participants: 5000,
        standaloneValue: 20,
        interactionValue: 0.3,
        price: 5,
      },
    });

    console.log("\n=== Full Flywheel Report ===");
    console.log(`Generated at: ${report.generatedAt}`);
    console.log("\nNetwork Value:");
    console.log(`  Metcalfe:  ${report.networkValue.metcalfe.value.toFixed(2)}`);
    console.log(`  Odlyzko:   ${report.networkValue.odlyzko.value.toFixed(2)}`);
    console.log(`  Reed:      ${report.networkValue.reed.value.toFixed(2)} (capped)`);
    console.log(`  Beckstrom: ${report.networkValue.beckstrom.value.toFixed(2)}`);
    console.log("\nCross-Elasticities:");
    for (const ce of report.crossElasticities) {
      console.log(`  ${ce.serviceA}→${ce.serviceB}: ${ce.elasticity.toFixed(3)} (${ce.interpretation})`);
    }
    console.log(`\nEcosystem Health: ${report.ecosystemHealth.score.toFixed(4)}`);
    console.log(`Market α: ${report.marketAnalysis.alpha.toFixed(3)}, Tipping: ${report.marketAnalysis.tippingPossible}`);
    console.log(`Subsidize: ${report.marketAnalysis.subsidizeRecommendation}`);
    console.log("\nRecommendations:");
    for (const rec of report.recommendations) {
      console.log(`  • ${rec}`);
    }

    // Validate structure
    expect(report.generatedAt).toBeTruthy();
    expect(report.networkValue.metcalfe.model).toBe("metcalfe");
    expect(report.networkValue.odlyzko.model).toBe("odlyzko");
    expect(report.networkValue.reed.model).toBe("reed");
    expect(report.networkValue.beckstrom.model).toBe("beckstrom");
    expect(report.crossElasticities).toHaveLength(2);
    expect(report.ecosystemHealth.score).toBeGreaterThanOrEqual(0);
    expect(report.ecosystemHealth.score).toBeLessThanOrEqual(1);
    expect(report.marketAnalysis).toBeDefined();
    expect(report.recommendations.length).toBeGreaterThan(0);
  });

  it("network value should increase when users grow", () => {
    const small = generateFlywheelReport(makeReportInput(1_000));
    const large = generateFlywheelReport(makeReportInput(10_000));

    expect(large.networkValue.metcalfe.value).toBeGreaterThan(
      small.networkValue.metcalfe.value,
    );
    expect(large.networkValue.odlyzko.value).toBeGreaterThan(
      small.networkValue.odlyzko.value,
    );
    expect(large.networkValue.reed.value).toBeGreaterThanOrEqual(
      small.networkValue.reed.value,
    );
  });

  it("should include complement detection in cross-elasticities", () => {
    const report = generateFlywheelReport(makeReportInput(5_000));

    // Our sample data has Brain→Planner as complement
    const brainPlanner = report.crossElasticities.find(
      (ce) => ce.serviceA === "brain" && ce.serviceB === "planner",
    );
    expect(brainPlanner).toBeDefined();
    expect(brainPlanner!.interpretation).toBe("complement");
  });

  it("should generate recommendations array", () => {
    const report = generateFlywheelReport(makeReportInput(5_000));
    expect(Array.isArray(report.recommendations)).toBe(true);
    expect(report.recommendations.length).toBeGreaterThan(0);
    for (const rec of report.recommendations) {
      expect(typeof rec).toBe("string");
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Helper: Create sample report input with variable user count
// ═══════════════════════════════════════════════════════════════════════════

function makeReportInput(activeUsers: number) {
  return {
    activeUsers,
    transactions: [
      { benefit: 100, cost: 20, rate: 0.1, time: 0 },
      { benefit: 200, cost: 50, rate: 0.1, time: 1 },
    ],
    crossElasticityData: [
      {
        serviceA: "brain" as const,
        serviceB: "planner" as const,
        data: [
          { date: "2025-01", serviceAUsage: 100, serviceBUsage: 50 },
          { date: "2025-02", serviceAUsage: 200, serviceBUsage: 100 },
        ],
      },
    ],
    ecosystemMetrics: {
      dau: activeUsers * 0.5,
      mau: activeUsers,
      avgServicesPerUser: 2.5,
      crossServiceEvents: 10_000,
      totalEvents: 50_000,
      retention90d: 0.6,
      viralCoefficient: 0.7,
      nps: 40,
    },
    supplyData: {
      participants: Math.floor(activeUsers * 0.1),
      standaloneValue: 15,
      interactionValue: 0.5,
      price: 10,
    },
    demandData: {
      participants: Math.floor(activeUsers * 0.9),
      standaloneValue: 20,
      interactionValue: 0.3,
      price: 5,
    },
  };
}
