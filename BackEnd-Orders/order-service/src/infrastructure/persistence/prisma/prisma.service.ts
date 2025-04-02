import { Injectable, type OnModuleInit, type OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /**
   * Creates a new instance of PrismaService
   * Configures logging based on environment:
   * - Development: Logs queries, info, warnings, and errors
   * - Production: Logs only errors
   */
  constructor() {
    super({
      log: process.env.NODE_ENV === "development" 
        ? ["query", "info", "warn", "error"]  // Verbose logging in dev
        : ["error"],  // Minimal logging in production
    });
  }

  /**
   * Lifecycle hook: Connects to the database when the module initializes
   * @returns Promise that resolves when the connection is established
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Lifecycle hook: Disconnects from the database when the module is destroyed
   * @returns Promise that resolves when the connection is closed
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Executes operations within a database transaction
   * @template T The return type of the callback
   * @param callback Function containing operations to execute in transaction
   * @returns Promise resolving with the callback's return value
   * @example
   * await prismaService.executeInTransaction(async (prisma) => {
   *   // Your transactional operations here
   * });
   */
  async executeInTransaction<T>(callback: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    return this.$transaction((tx) => callback(tx as unknown as PrismaClient));
  }
}