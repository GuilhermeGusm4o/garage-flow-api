export type UserRole = 'ADMIN' | 'MECHANIC' | 'SERVICE_ADVISOR' | 'STOCK_CLERK';

export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public passwordHash: string,
    public role: UserRole,
    public readonly createdAt?: Date,
    public updatedAt?: Date,
    public deletedAt?: Date | null,
  ) {}

  isDeleted(): boolean {
    return this.deletedAt !== null && this.deletedAt !== undefined;
  }

  softDelete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  toJSON() {
    const { passwordHash: _passwordHash, ...rest } = this;

    return rest;
  }
}
