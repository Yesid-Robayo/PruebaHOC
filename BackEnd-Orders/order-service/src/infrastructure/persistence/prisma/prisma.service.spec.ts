import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "./prisma.service";
import { PrismaClient } from "@prisma/client";

describe("PrismaService", () => {
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PrismaService],
        }).compile();

        prismaService = module.get<PrismaService>(PrismaService);
    });

    afterEach(async () => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(prismaService).toBeDefined();
    });

    describe("onModuleInit", () => {
        it("should call $connect", async () => {
            const connectSpy = jest.spyOn(prismaService, "$connect").mockResolvedValueOnce(undefined);
            await prismaService.onModuleInit();
            expect(connectSpy).toHaveBeenCalled();
        });
    });

    describe("onModuleDestroy", () => {
        it("should call $disconnect", async () => {
            const disconnectSpy = jest.spyOn(prismaService, "$disconnect").mockResolvedValueOnce(undefined);
            await prismaService.onModuleDestroy();
            expect(disconnectSpy).toHaveBeenCalled();
        });
    });

    describe("executeInTransaction", () => {
        it("should execute the callback within a transaction", async () => {
            const mockCallback = jest.fn().mockResolvedValueOnce("result");
            const transactionSpy = jest.spyOn(prismaService, "$transaction").mockImplementationOnce(async (cb) => cb({} as PrismaClient));

            const result = await prismaService.executeInTransaction(mockCallback);

            expect(transactionSpy).toHaveBeenCalled();
            expect(mockCallback).toHaveBeenCalledWith(expect.any(Object));
            expect(result).toBe("result");
        });
    });
});