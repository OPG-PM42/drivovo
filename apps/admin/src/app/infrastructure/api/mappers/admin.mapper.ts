import { AdminPublicView as GeneratedAdminPublicView } from '../generated';
import { AdminPublicView } from '../../../domain/admin';

export function toAdminPublicView(dto: GeneratedAdminPublicView): AdminPublicView {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.name,
    role: dto.role,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}
