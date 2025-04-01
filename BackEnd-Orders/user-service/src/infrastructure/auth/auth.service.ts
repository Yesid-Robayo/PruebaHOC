import { Injectable, Logger } from "@nestjs/common"
import  { JwtService } from "@nestjs/jwt"
import { compare, hash } from "bcrypt"

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(private readonly jwtService: JwtService) {}

  /**
   * Generates a JWT token for a user
   * @param userId The user ID
   * @param email The user email
   * @returns The JWT token
   */
  async generateToken(userId: string, email: string): Promise<string> {
    const payload = { sub: userId, email }
    return this.jwtService.sign(payload)
  }

  /**
   * Verifies a JWT token
   * @param token The JWT token
   * @returns The decoded token payload
   */
  async verifyToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token)
    } catch (error) {
      this.logger.error(`Failed to verify token: ${error.message}`)
      throw error
    }
  }

  /**
   * Hashes a password
   * @param password The password to hash
   * @returns The hashed password
   */
  async hashPassword(password: string): Promise<string> {
    return hash(password, 10)
  }

  /**
   * Compares a password with a hash
   * @param password The password to compare
   * @param hashedPassword The hashed password
   * @returns True if the password matches the hash, false otherwise
   */
  async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword)
  }
}

