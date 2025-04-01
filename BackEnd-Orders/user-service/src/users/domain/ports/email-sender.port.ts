export const EMAIL_SENDER = "EMAIL_SENDER"

export interface EmailSender {
  sendEmail(to: string, subject: string, content: string): Promise<void>
}

