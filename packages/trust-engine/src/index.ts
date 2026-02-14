export { wilsonScoreLowerBound } from "./wilson";

export { bayesianAverage, type BayesianAverageInput } from "./bayesian";

export {
  applyTimeDecay,
  applyServiceTimeDecay,
  SERVICE_HALF_LIFE,
  type DecayService,
} from "./decay";

export {
  computeCrossServiceTrust,
  toTrustVector,
  type ServiceTrustSignal,
  type CrossServiceTrustOptions,
} from "./cross-service";
