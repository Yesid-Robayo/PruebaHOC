import { Injectable, Logger } from "@nestjs/common"
import  { EmailSender } from "../../../users/domain/ports/email-sender.port"
import { Resend } from "resend"
import  { ConfigService } from "@nestjs/config"

@Injectable()
export class ResendService implements EmailSender {
  private readonly logger = new Logger(ResendService.name)
  private readonly resend: Resend
  private readonly emailFrom: string

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>("RESEND_API_KEY"))
    this.emailFrom = this.configService.get<string>("EMAIL_FROM", "onboarding@resend.dev")
  }

  async sendEmail(to: string, subject: string, content: string): Promise<void> {
    try {
      this.logger.log(`Sending email to ${to} with subject: ${subject}`)

      const { data, error } = await this.resend.emails.send({
        from: this.emailFrom,
        to,
        subject,
        html: content,
      })

      if (error) {
        this.logger.error(`Failed to send email: ${error.message}`)
        throw new Error(`Failed to send email: ${error.message}`)
      }

      this.logger.log(`Email sent successfully: ${data?.id}`)
    } catch (error) {
      this.logger.error(`Error sending email: ${error.message}`)
      throw error
    }
  }
}

