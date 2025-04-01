import { Controller, Logger } from "@nestjs/common"
import { MessagePattern, Payload, Ctx, KafkaContext } from "@nestjs/microservices"
import { QueryBus } from "@nestjs/cqrs"
import { GetUserByIdQuery } from "../../../application/queries/get-user-by-id.query"

@Controller()
export class UserVerificationConsumer {
  private readonly logger = new Logger(UserVerificationConsumer.name)
  
  constructor(private readonly queryBus: QueryBus) { }
  
  @MessagePattern('user.verify')
  async verifyUser(
    @Payload() data: { userId: string },
    @Ctx() context: KafkaContext
  ): Promise<{ exists: boolean }> {
    this.logger.log(`Received user verification request for userId: ${data.userId}`);
    
    let result: { exists: boolean };
    
    try {
      // Try to get the user by ID
      const user = await this.queryBus.execute(new GetUserByIdQuery(data.userId));
      
      // If no exception is thrown, the user exists
      this.logger.log(`User with ID ${data.userId} exists`);
      result = { exists: true };
    } catch (error) {
      // If user is not found, return exists: false
      this.logger.log(`User with ID ${data.userId} does not exist: ${error.message}`);
      result = { exists: false };
    }
    
    // Log the response we're sending back
    this.logger.log(`Responding with: ${JSON.stringify(result)}`);
    
    return result;
  }
}