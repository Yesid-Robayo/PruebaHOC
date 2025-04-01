import { Injectable, type CanActivate, type ExecutionContext, UnauthorizedException } from "@nestjs/common";
import type { Observable } from "rxjs";
import { verify } from "jsonwebtoken";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException("No token provided");
    }

    try {
      const payload = verify(token, process.env.JWT_SECRET || "default_secret");
      request.user = payload; // Attach the user to the request object
      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid token");
    }
  }

  private extractToken(request: any): string | undefined {
    // Try to get the token from the Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(" ");
      if (type === "Bearer") {
        return token;
      }
    }
    if (request.headers.cookie) {
      const cookies = this.parseCookies(request.headers.cookie);
      return cookies["token"];
    }
    return undefined;

  }

  private parseCookies(cookieHeader: string): Record<string, string> {
    return cookieHeader.split(";").reduce((cookies, cookie) => {
      const [key, value] = cookie.split("=").map(part => part.trim());
      cookies[key] = decodeURIComponent(value);
      return cookies;
    }, {} as Record<string, string>);
  }
}
