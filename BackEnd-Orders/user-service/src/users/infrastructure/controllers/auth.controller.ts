import { Body, Controller, Post, Res, UnauthorizedException } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateUserCommand } from "../../application/commands/create-user.command";
import { GetUserByEmailQuery } from "../../application/queries/get-user-by-email.query";
import { RegisterUserDto } from "../dtos/register-user.dto";
import { LoginUserDto } from "../dtos/login-user.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "../../../infrastructure/auth/auth.service";
import { Response } from "express";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly authService: AuthService,
  ) { }

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User registered successfully" })
  async register(@Body() registerUserDto: RegisterUserDto, @Res() response: Response): Promise<Response> {
    const userId = await this.commandBus.execute(
      new CreateUserCommand(
        registerUserDto.email.toLowerCase(),
        registerUserDto.name,
        registerUserDto.password,
      ),
    );

    return response.json({ code: 201, userId });
  }

  @Post("login")
  @ApiOperation({ summary: "Login user" })
  @ApiResponse({ status: 200, description: "User logged in successfully" })
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res() response: Response, // Inject response object
  ): Promise<Response> {
    try {
      // Get user by email
      const user = await this.queryBus.execute(
        new GetUserByEmailQuery(loginUserDto.email.toLowerCase()),
      );

      // Validate password
      const isPasswordValid = await this.authService.comparePasswords(
        loginUserDto.password,
        user.passwordHash,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException("Invalid credentials");
      }

      // Generate JWT token
      const token = await this.authService.generateToken(user.id, user.email);

      // Set token as an HTTP-only cookie
      response.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });

      return response.json({ code: 200, userId: user.id });
    } catch (error) {
      throw new UnauthorizedException("Invalid credentials");
    }
  }
}
