import { prisma } from '@/lib/db';
import { ForbiddenError } from '@/lib/errors';

export async function requireOrgAccess(userId: string, organizationId: string) {
  const membership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId } },
  });
  if (!membership) throw new ForbiddenError('Not a member of this organization');
  return membership;
}
