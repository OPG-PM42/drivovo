import { adminPublicViewSchema } from '@drivovo/domain';

describe('AdminPublicView', () => {
  it('does not accept passwordHash or passwordSalt keys (strict shape)', () => {
    const shape = (adminPublicViewSchema as unknown as { shape: Record<string, unknown> }).shape;
    expect(Object.keys(shape)).not.toContain('passwordHash');
    expect(Object.keys(shape)).not.toContain('passwordSalt');
  });

  it('parses a valid admin payload without password fields', () => {
    const result = adminPublicViewSchema.safeParse({
      id: '00000000-0000-4000-8000-000000000001',
      email: 'admin@drivovo.test',
      name: 'Admin',
      role: 'admin',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });
});
