import { User } from "../../../../src/users/domain/entities/user.entity"
import { UserId } from "../../../../src/users/domain/value-objects/user-id.value-object"
import { Email } from "../../../../src/users/domain/value-objects/email.value-object"
import { v4 as uuidv4 } from "uuid"

describe("User Entity", () => {
  let userId: UserId
  let email: Email
  let name: string
  let passwordHash: string

  beforeEach(() => {
    userId = new UserId(uuidv4())
    email = new Email("test@example.com")
    name = "Test User"
    passwordHash = "hashed_password"
  })

  describe("create", () => {
    it("should create a new user", () => {
      // Act
      const user = User.create(userId, email, name, passwordHash)

      // Assert
      expect(user.id).toBe(userId)
      expect(user.email).toBe(email)
      expect(user.name).toBe(name)
      expect(user.passwordHash).toBe(passwordHash)
    })

    it("should apply UserCreatedEvent", () => {
      // Arrange
      const applySpy = jest.spyOn(User.prototype, "apply")

      // Act
      const user = User.create(userId, email, name, passwordHash)

      // Assert
      expect(applySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: userId.value,
          email: email.value,
          name: name,
        }),
      )
    })
  })

  describe("update", () => {
    it("should update the user name", () => {
      // Arrange
      const user = User.create(userId, email, name, passwordHash)
      const newName = "Updated Name"
      const applySpy = jest.spyOn(user, "apply")

      // Act
      user.update(newName)

      // Assert
      expect(user.name).toBe(newName)
      expect(applySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: userId.value,
          email: email.value,
          name: newName,
        }),
      )
    })
  })
})

