import { Module } from "@nestjs/common"
import { ResendService } from "./resend.service"
import { EMAIL_SENDER } from "../../../users/domain/ports/email-sender.port"

@Module({
  providers: [
    ResendService,
    {
      provide: EMAIL_SENDER,
      useClass: ResendService,
    },
  ],
  exports: [ResendService, EMAIL_SENDER],
})
export class ResendModule {}

