import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtAuthGuard } from 'src/infrastructure/auth/guards/jwt-auth.guard';

jest.mock('jsonwebtoken');

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access with valid token in Authorization header', () => {
      // Arrange
      const mockPayload = { sub: 'user-123', username: 'testuser' };
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
        user: undefined, 
      };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      // Mock jwt.verify to return a valid payload
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(
        'valid-token',
        expect.any(String)
      );
      expect(mockRequest.user).toEqual(mockPayload);
      expect(result).toBe(true);
    });

    it('should allow access with valid token in cookie', () => {
      // Arrange
      const mockPayload = { sub: 'user-123', username: 'testuser' };
      const mockRequest = {
        headers: {
          cookie: 'token=valid-cookie-token; other=value',
        },
        user: undefined,
      };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      // Mock jwt.verify to return a valid payload
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(
        'valid-cookie-token',
        expect.any(String)
      );
      expect(mockRequest.user).toEqual(mockPayload);
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when no token is provided', () => {
      // Arrange
      const mockRequest = {
        headers: {},
      };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      // Act & Assert
      expect(() => {
        guard.canActivate(mockContext);
      }).toThrow(UnauthorizedException);
      expect(() => {
        guard.canActivate(mockContext);
      }).toThrow('No token provided');
    });

    it('should throw UnauthorizedException when token is invalid', () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      // Mock jwt.verify to throw an error
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      expect(() => {
        guard.canActivate(mockContext);
      }).toThrow(UnauthorizedException);
      expect(() => {
        guard.canActivate(mockContext);
      }).toThrow('Invalid token');
    });

    it('should correctly parse cookies from header', () => {
      // Create a spy on the parseCookies method
      const parseCookiesSpy = jest.spyOn(JwtAuthGuard.prototype as any, 'parseCookies');
      
      // Create a cookie header with multiple cookies
      const cookieHeader = 'token=abc123; sessionId=xyz789; theme=dark';
      
      // Create request with cookie header
      const mockRequest = {
        headers: {
          cookie: cookieHeader,
        },
      };
      
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;
      
      // Mock jwt.verify to return a valid payload
      (jwt.verify as jest.Mock).mockReturnValue({ user: 'test' });
      
      // Call the method
      guard.canActivate(mockContext);
      
      // Assert parseCookies was called with the cookie header
      expect(parseCookiesSpy).toHaveBeenCalledWith(cookieHeader);
      
      // Get the result of parseCookies
      const result = parseCookiesSpy.mock.results[0].value;
      
      // Check the parsed cookies
      expect(result).toEqual({
        token: 'abc123',
        sessionId: 'xyz789',
        theme: 'dark',
      });
    });
  });
});