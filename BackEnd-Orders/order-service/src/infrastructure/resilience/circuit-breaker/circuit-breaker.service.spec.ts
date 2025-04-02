import { Test, TestingModule } from "@nestjs/testing";
import { CircuitBreakerService } from "./circuit-breaker.service";
import { ConfigService } from "@nestjs/config";
import CircuitBreaker from "opossum";

describe("CircuitBreakerService", () => {
    let service: CircuitBreakerService;
    let configService: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CircuitBreakerService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string, defaultValue: any) => defaultValue),
                    },
                },
            ],
        }).compile();

        service = module.get<CircuitBreakerService>(CircuitBreakerService);
        configService = module.get<ConfigService>(ConfigService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("getCircuitBreaker", () => {
        it("should create and return a new circuit breaker if not already created", () => {
            const serviceName = "testService";
            const circuitBreaker = service.getCircuitBreaker(serviceName);

            expect(circuitBreaker).toBeDefined();
            expect(circuitBreaker).toBeInstanceOf(CircuitBreaker);
        });

        it("should return an existing circuit breaker if already created", () => {
            const serviceName = "testService";
            const circuitBreaker1 = service.getCircuitBreaker(serviceName);
            const circuitBreaker2 = service.getCircuitBreaker(serviceName);

            expect(circuitBreaker1).toBe(circuitBreaker2);
        });
    });

    describe("execute", () => {
        it("should execute the function successfully when the circuit is closed", async () => {
            const serviceName = "testService";
            const mockFn = jest.fn().mockResolvedValue("success");

            const result = await service.execute(serviceName, mockFn);

            expect(mockFn).toHaveBeenCalled();
            expect(result).toBe("success");
        });

        it("should execute the fallback function when the circuit is open", async () => {
            const serviceName = "testService";
            const mockFn = jest.fn().mockRejectedValue(new Error("failure"));
            const fallbackFn = jest.fn().mockReturnValue("fallback");
        
            // Get the circuit breaker and force it to open state first
            const circuitBreaker = service.getCircuitBreaker(serviceName);
            
            // Force the circuit to open by making it fail enough times
            for (let i = 0; i < 10; i++) {
                try {
                    await circuitBreaker.fire(() => mockFn());
                } catch (e) {
                    // Ignore errors - we're forcing the circuit to open
                }
            }
        
            // Now test the fallback
            const result = await service.execute(serviceName, mockFn, fallbackFn);
        
            expect(fallbackFn).toHaveBeenCalled();
            expect(result).toBe("fallback");
        });
    });
});