import { Injectable, type CanActivate, type ExecutionContext, UnauthorizedException } from "@nestjs/common";
import type { Observable } from "rxjs";
import { verify } from "jsonwebtoken";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  /**
   * Main guard method that determines if a request should be allowed to proceed
   * @param context Execution context providing access to request/response
   * @returns Boolean indicating if request is authorized
   * @throws UnauthorizedException if token is missing or invalid
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException("No token provided");
    }

    try {
      // Verify token using JWT secret from environment or fallback
      const payload = verify(token, process.env.JWT_SECRET || "default_secret");
      request.user = payload; // Attach decoded user payload to request
      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid token");
    }
  }

  /**
   * Extracts JWT token from request headers or cookies
   * @param request HTTP request object
   * @returns Token string if found, undefined otherwise
   */
  private extractToken(request: any): string | undefined {
    // Check Authorization header first
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(" ");
      if (type === "Bearer") {
        return token;
      }
    }
    
    // Fallback to cookie if no Authorization header
    if (request.headers.cookie) {
      const cookies = this.parseCookies(request.headers.cookie);
      return cookies["token"]; // Looks for 'token' cookie
    }
    
    return undefined;
  }

  /**
   * Parses cookie header string into key-value object
   * @param cookieHeader Raw cookie header string
   * @returns Object containing cookie key-value pairs
   */
  private parseCookies(cookieHeader: string): Record<string, string> {
    return cookieHeader.split(";").reduce((cookies, cookie) => {
      const [key, value] = cookie.split("=").map(part => part.trim());
      cookies[key] = decodeURIComponent(value);
      return cookies;
    }, {} as Record<string, string>);
  }
}