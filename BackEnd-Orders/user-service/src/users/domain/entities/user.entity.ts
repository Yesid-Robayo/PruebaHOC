import { AggregateRoot } from "@nestjs/cqrs"
import type { UserId } from "../value-objects/user-id.value-object"
import type { Email } from "../value-objects/email.value-object"
import { UserCreatedEvent } from "../events/user-created.event"
import { UserUpdatedEvent } from "../events/user-updated.event"

export interface UserProps {
  id: UserId
  email: Email
  name: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

export class User extends AggregateRoot {
  private _id: UserId
  private _email: Email
  private _name: string
  private _passwordHash: string
  private _createdAt: Date
  private _updatedAt: Date

  constructor(props: UserProps) {
    super()
    this._id = props.id
    this._email = props.email
    this._name = props.name
    this._passwordHash = props.passwordHash
    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  // Factory method to create a new user
  static create(id: UserId, email: Email, name: string, passwordHash: string): User {
    const now = new Date()

    const user = new User({
      id,
      email,
      name,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    })

    // Apply the created event
    user.apply(new UserCreatedEvent(user.id.value, user.email.value, user.name, user.createdAt))

    return user
  }

  // Update user information
  update(name: string): void {
    this._name = name
    this._updatedAt = new Date()

    // Apply the updated event
    this.apply(new UserUpdatedEvent(this.id.value, this.email.value, this.name, this._updatedAt))
  }

  // Getters
  get id(): UserId {
    return this._id
  }

  get email(): Email {
    return this._email
  }

  get name(): string {
    return this._name
  }

  get passwordHash(): string {
    return this._passwordHash
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }
}

