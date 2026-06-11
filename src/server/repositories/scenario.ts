import { prisma } from '@/lib/db';
import type { ScenarioType } from '@prisma/client';

export async function getScenarios(organizationId: string) {
  return prisma.scenario.findMany({
    where: { organizationId },
    include: { recommendation: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getScenarioById(id: string) {
  return prisma.scenario.findUnique({
    where: { id },
    include: { recommendation: true },
  });
}

export async function createScenario(data: {
  restaurantId: string;
  organizationId: string;
  name: string;
  type: string;
  parametersJson: object;
}) {
  return prisma.scenario.create({
    data: { ...data, type: data.type as ScenarioType },
  });
}

export async function updateScenario(
  id: string,
  data: { scenarioRunId?: string; baselineRunId?: string },
) {
  return prisma.scenario.update({ where: { id }, data });
}
