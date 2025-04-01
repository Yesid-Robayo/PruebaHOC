import { Injectable, Logger } from "@nestjs/common"
import CircuitBreaker from "opossum"
import  { ConfigService } from "@nestjs/config"

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name)
  private readonly circuitBreakers = new Map<string, CircuitBreaker>()
  private readonly defaultOptions: Partial<CircuitBreaker.Options>

  constructor(private readonly configService: ConfigService) {
    this.defaultOptions = {
      errorThresholdPercentage: this.configService.get<number>("CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE", 50),
      resetTimeout: this.configService.get<number>("CIRCUIT_BREAKER_RESET_TIMEOUT", 10000),
      rollingCountTimeout: 10000,
      rollingCountBuckets: 10,
    }
  }

  /**
   * Creates a circuit breaker for a specific service
   * @param serviceName The name of the service
   * @param options Circuit breaker options
   * @returns The circuit breaker instance
   */
  getCircuitBreaker(serviceName: string, options?: Partial<CircuitBreaker.Options>): CircuitBreaker {
    if (!this.circuitBreakers.has(serviceName)) {
      const circuitBreakerOptions = {
        ...this.defaultOptions,
        ...options,
      }

      const circuitBreaker = new CircuitBreaker(async (...args: any[]) => {
        return await args[0](...args.slice(1))
      }, circuitBreakerOptions)

      // Configure timeout in the options if defined
      const timeout = this.configService.get<number>("CIRCUIT_BREAKER_TIMEOUT", 3000)
      circuitBreakerOptions.timeout = timeout

      // Add event listeners
      circuitBreaker.on("open", () => this.logger.warn(`Circuit breaker for ${serviceName} is now OPEN`))
      circuitBreaker.on("close", () => this.logger.log(`Circuit breaker for ${serviceName} is now CLOSED`))
      circuitBreaker.on("halfOpen", () => this.logger.log(`Circuit breaker for ${serviceName} is now HALF-OPEN`))
      circuitBreaker.on("fallback", (result) => this.logger.warn(`Fallback for ${serviceName} executed with result: ${JSON.stringify(result)}`))

      this.circuitBreakers.set(serviceName, circuitBreaker)
    }

    return this.circuitBreakers.get(serviceName)!
  }

  /**
   * Executes a function with circuit breaker protection
   * @param serviceName The name of the service
   * @param fn The function to execute
   * @param fallback Optional fallback function to execute if the circuit is open
   * @param args Arguments to pass to the function
   * @returns The result of the function or fallback
   */
  async execute<T>(serviceName: string, fn: (...args: any[]) => Promise<T>, fallback?: (...args: any[]) => T, ...args: any[]): Promise<T> {
    const circuitBreaker = this.getCircuitBreaker(serviceName)

    if (fallback) {
      circuitBreaker.fallback(() => fallback(...args))
    }

    return circuitBreaker.fire(fn, ...args) as Promise<T>
  }
}
