// ---------------------------------------------------------------------------
// Kalman Filter — Dynamic Signal Fusion
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §3.6
//
// Treats user quality as a hidden state that is continuously updated with
// each new observation. The Kalman gain K_k automatically balances trust
// between the model prediction and each service's noisy measurement,
// making it ideal for continuously updating Dream Hub's composite profiles.
// ---------------------------------------------------------------------------

/** Configuration options for the Kalman filter */
export interface KalmanFilterOptions {
  /** Initial state estimate (x_0) */
  initialState: number;
  /** Initial estimation uncertainty / error covariance (P_0) */
  initialUncertainty: number;
  /** Process noise covariance (Q) — models how much the true state drifts per step */
  processNoise: number;
  /** Measurement noise covariance (R) — models sensor/observation noise */
  measurementNoise: number;
}

/** Options for batch filtering */
export interface BatchFilterOptions {
  /** Initial state estimate. Defaults to the first measurement. */
  initialState?: number;
  /** Initial estimation uncertainty. Default: 1.0 */
  initialUncertainty?: number;
  /** Process noise covariance. Default: 0.01 */
  processNoise?: number;
  /** Measurement noise covariance. Default: 0.1 */
  measurementNoise?: number;
}

/** A single step result from the Kalman filter */
export interface KalmanStep {
  /** The state estimate after this step */
  state: number;
  /** The estimation uncertainty after this step */
  uncertainty: number;
  /** The Kalman gain applied in this step (undefined for prediction-only steps) */
  kalmanGain?: number;
}

/**
 * 1D Kalman Filter for smoothing noisy trust/signal data.
 *
 * The filter maintains two quantities:
 * - `state` (x): the current best estimate of the hidden variable
 * - `uncertainty` (P): the current estimation error covariance
 *
 * Each cycle consists of a **predict** step (state propagation) followed
 * by an **update** step (measurement incorporation).
 *
 * @example
 * ```ts
 * const kf = new KalmanFilter({
 *   initialState: 0.5,
 *   initialUncertainty: 1.0,
 *   processNoise: 0.01,
 *   measurementNoise: 0.1,
 * });
 *
 * kf.predict();
 * kf.update(0.6);
 * console.log(kf.state); // smoothed estimate
 * ```
 */
export class KalmanFilter {
  /** Current state estimate (x_k) */
  private _state: number;
  /** Current estimation uncertainty (P_k) */
  private _uncertainty: number;
  /** Process noise covariance (Q) */
  private readonly _processNoise: number;
  /** Measurement noise covariance (R) */
  private readonly _measurementNoise: number;

  constructor(options: KalmanFilterOptions) {
    this._state = options.initialState;
    this._uncertainty = options.initialUncertainty;
    this._processNoise = options.processNoise;
    this._measurementNoise = options.measurementNoise;
  }

  /** Current state estimate */
  get state(): number {
    return this._state;
  }

  /** Current estimation uncertainty */
  get uncertainty(): number {
    return this._uncertainty;
  }

  /**
   * Predict step — propagate the state forward in time.
   *
   * For a 1D constant-velocity model with state transition F = 1:
   *   x_k|k-1 = x_k-1  (state does not change in prediction)
   *   P_k|k-1 = P_k-1 + Q  (uncertainty grows by process noise)
   *
   * @returns The predicted state and uncertainty
   */
  predict(): KalmanStep {
    // State prediction: x_k|k-1 = F * x_k-1 (F = 1 for 1D)
    // State remains unchanged; only uncertainty grows.
    this._uncertainty = this._uncertainty + this._processNoise;

    return {
      state: this._state,
      uncertainty: this._uncertainty,
    };
  }

  /**
   * Update step — incorporate a new measurement.
   *
   * Computes the Kalman gain and updates both the state estimate
   * and the estimation uncertainty:
   *   K_k = P_k|k-1 / (P_k|k-1 + R)
   *   x_k = x_k|k-1 + K_k * (z_k - x_k|k-1)
   *   P_k = (1 - K_k) * P_k|k-1
   *
   * @param measurement The observed value (z_k)
   * @returns The updated state, uncertainty, and Kalman gain
   */
  update(measurement: number): KalmanStep {
    // Kalman gain: K = P / (P + R)
    const kalmanGain = this._uncertainty / (this._uncertainty + this._measurementNoise);

    // State update: x = x + K * (z - x)
    this._state = this._state + kalmanGain * (measurement - this._state);

    // Uncertainty update: P = (1 - K) * P
    this._uncertainty = (1 - kalmanGain) * this._uncertainty;

    return {
      state: this._state,
      uncertainty: this._uncertainty,
      kalmanGain,
    };
  }

  /**
   * Run a full predict-update cycle for a single measurement.
   *
   * Convenience method that calls predict() then update(measurement).
   *
   * @param measurement The observed value
   * @returns The step result after incorporating the measurement
   */
  step(measurement: number): KalmanStep {
    this.predict();
    return this.update(measurement);
  }

  /**
   * Smooth a sequence of noisy measurements using a Kalman filter.
   *
   * Creates a fresh filter initialized from the first measurement and
   * runs it over the full array, returning the smoothed state at each step.
   *
   * @param measurements Array of noisy observations
   * @param options Optional filter tuning parameters
   * @returns Array of smoothed values (same length as input)
   */
  static smooth(
    measurements: number[],
    options?: BatchFilterOptions,
  ): number[] {
    if (measurements.length === 0) return [];

    const initialState = options?.initialState ?? measurements[0];
    const initialUncertainty = options?.initialUncertainty ?? 1.0;
    const processNoise = options?.processNoise ?? 0.01;
    const measurementNoise = options?.measurementNoise ?? 0.1;

    const filter = new KalmanFilter({
      initialState,
      initialUncertainty,
      processNoise,
      measurementNoise,
    });

    return measurements.map((z) => {
      const result = filter.step(z);
      return result.state;
    });
  }

  /**
   * Batch-process an array of measurements, returning full step details.
   *
   * Unlike {@link smooth} which returns only state values, this method
   * returns the complete {@link KalmanStep} for each measurement,
   * including uncertainty and Kalman gain — useful for diagnostics
   * and adaptive weighting in the multi-signal fusion pipeline.
   *
   * @param measurements Array of noisy observations
   * @param options Optional filter tuning parameters
   * @returns Array of full step results
   */
  static filterBatch(
    measurements: number[],
    options?: BatchFilterOptions,
  ): KalmanStep[] {
    if (measurements.length === 0) return [];

    const initialState = options?.initialState ?? measurements[0];
    const initialUncertainty = options?.initialUncertainty ?? 1.0;
    const processNoise = options?.processNoise ?? 0.01;
    const measurementNoise = options?.measurementNoise ?? 0.1;

    const filter = new KalmanFilter({
      initialState,
      initialUncertainty,
      processNoise,
      measurementNoise,
    });

    return measurements.map((z) => filter.step(z));
  }
}
