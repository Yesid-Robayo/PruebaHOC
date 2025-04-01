import { Body, Controller, Delete, Get, Param, Put, Res, UseGuards } from "@nestjs/common"
import { CommandBus, QueryBus } from "@nestjs/cqrs"
import { UpdateUserCommand } from "../../application/commands/update-user.command"
import { DeleteUserCommand } from "../../application/commands/delete-user.command"
import { GetUserByIdQuery } from "../../application/queries/get-user-by-id.query"
import { UserDto } from "../../application/dtos/user.dto"
import { UpdateUserDto } from "../dtos/update-user.dto"
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "src/infrastructure/auth/guards/jwt-auth.guard"
import { response, Response } from "express"

@ApiTags("users")
@Controller("users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found', type: UserDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserById(@Param('id') userId: string, @Res() response: Response): Promise<Response> {

    const user = await this.queryBus.execute(new GetUserByIdQuery(userId));
    if (!user) {
      return response.status(404).json({ code: 404, message: "User not found" });
    }
    return response.json({ code: 200, user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }});
  }

  @Put(":id")
  @ApiOperation({ summary: "Update user" })
  @ApiResponse({ status: 200, description: "User updated successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async updateUser(@Param('id') userId: string, @Body() updateUserDto: UpdateUserDto, @Res() response: Response): Promise<Response> {
    await this.commandBus.execute(new UpdateUserCommand(userId, updateUserDto.name))

    const user = await this.queryBus.execute(new GetUserByIdQuery(userId));
    if (!user) {
      return response.status(404).json({ code: 404, message: "User not found" });
    }
    return response.json({ code: 200, user:{
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    } });

  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteUser(@Param('id') userId: string, @Res() response: Response): Promise<Response> {
    await this.commandBus.execute(
      new DeleteUserCommand(userId),
    );
    const user = await this.queryBus.execute(new GetUserByIdQuery(userId));
    if (!user) {
      return response.status(404).json({ code: 404, message: "User not found" });
    }
    return response.json({ code: 200, message: "User deleted successfully" });

  }
}

