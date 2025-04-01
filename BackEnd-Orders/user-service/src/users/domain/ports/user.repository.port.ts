import type { User } from "../entities/user.entity"
import type { UserId } from "../value-objects/user-id.value-object"
import type { Email } from "../value-objects/email.value-object"

export const USER_REPOSITORY = "USER_REPOSITORY"

export interface UserRepository {
  save(user: User): Promise<User>
  findById(id: UserId): Promise<User | null>
  findByEmail(email: Email): Promise<User | null>
  delete(id: UserId): Promise<void>
}

