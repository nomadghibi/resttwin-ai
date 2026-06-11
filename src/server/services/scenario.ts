import { prisma } from '@/lib/db';
import { requireOrgAccess } from './auth';
import { getRestaurantByOrg } from '@/server/repositories/restaurant';
import * as repo from '@/server/repositories/scenario';
import { buildSnapshot } from '@/simulation/snapshot';
import { runSimulation } from '@/simulation/engine';
import { applyScenarioTransform } from '@/simulation/scenarios';
import { compareSimulations } from '@/simulation/comparison';
import { runDecisionPipeline } from '@/agents/orchestrator';
import { ForbiddenError, NotFoundError } from '@/lib/errors';
import type { SimulationResult } from '@/simulation/types';
import type { DecisionType, ConfidenceLevel } from '@prisma/client';

export async function getScenarios(userId: string, organizationId: string) {
  await requireOrgAccess(userId, organizationId);
  return repo.getScenarios(organizationId);
}

export async function getScenario(userId: string, organizationId: string, id: string) {
  await requireOrgAccess(userId, organizationId);
  const scenario = await repo.getScenarioById(id);
  if (!scenario || scenario.organizationId !== organizationId) throw new ForbiddenError();
  return scenario;
}

export async function createScenario(
  userId: string,
  organizationId: string,
  name: string,
  type: string,
  parametersJson: object,
) {
  await requireOrgAccess(userId, organizationId);
  const restaurant = await getRestaurantByOrg(organizationId);
  if (!restaurant) throw new NotFoundError('Complete restaurant setup first.');
  return repo.createScenario({ restaurantId: restaurant.id, organizationId, name, type, parametersJson });
}

export async function runScenario(userId: string, organizationId: string, scenarioId: string) {
  await requireOrgAccess(userId, organizationId);

  const scenario = await repo.getScenarioById(scenarioId);
  if (!scenario || scenario.organizationId !== organizationId) throw new ForbiddenError();

  // Get latest baseline run
  const restaurant = await getRestaurantByOrg(organizationId);
  if (!restaurant) throw new NotFoundError('Restaurant not found');

  const baselineRun = await prisma.simulationRun.findFirst({
    where: { restaurantId: restaurant.id, type: 'BASELINE', status: 'COMPLETED' },
    orderBy: { createdAt: 'desc' },
  });
  if (!baselineRun?.resultJson) throw new Error('Run a baseline simulation first.');

  const [menuItems, shifts, hours, staffRoles, staffShifts] = await Promise.all([
    prisma.menuItem.findMany({ where: { restaurantId: restaurant.id, isActive: true } }),
    prisma.staffShift.findMany({ where: { restaurantId: restaurant.id }, include: { staffRole: true } }),
    prisma.operatingHour.findMany({ where: { restaurantId: restaurant.id } }),
    prisma.staffRole.findMany({ where: { restaurantId: restaurant.id } }),
    prisma.staffShift.findMany({ where: { restaurantId: restaurant.id } }),
  ]);

  const baseSnapshot = buildSnapshot({ restaurant, menuItems, shifts, hours });
  const scenarioSnapshot = applyScenarioTransform(
    baseSnapshot,
    scenario.type,
    scenario.parametersJson,
  );
  const scenarioResult = runSimulation(scenarioSnapshot);
  const baselineResult = baselineRun.resultJson as unknown as SimulationResult;
  const delta = compareSimulations(baselineResult, scenarioResult);

  const { recommendation, agentActivities, dataQualityScore } = await runDecisionPipeline({
    restaurant,
    menuItems,
    staffRoles,
    staffShifts,
    hours,
    baseline: baselineResult,
    scenario: scenarioResult,
    delta,
    scenarioName: scenario.name,
    scenarioType: scenario.type,
  });

  // Save scenario simulation run
  const scenarioRun = await prisma.simulationRun.create({
    data: {
      restaurantId: restaurant.id,
      organizationId,
      type: 'SCENARIO',
      status: 'COMPLETED',
      inputSnapshotJson: scenarioSnapshot as object,
      resultJson: scenarioResult as object,
    },
  });

  // Upsert recommendation
  await prisma.recommendation.upsert({
    where: { scenarioId },
    update: {
      decision: recommendation.decision as DecisionType,
      confidence: recommendation.confidence as ConfidenceLevel,
      summary: recommendation.summary,
      expectedImpactJson: recommendation.expectedImpact as object,
      evidenceJson: recommendation.evidence as object,
      assumptionsJson: recommendation.assumptions as object,
      risksJson: recommendation.risks as object,
      nextAction: recommendation.nextAction,
    },
    create: {
      scenarioId,
      organizationId,
      decision: recommendation.decision as DecisionType,
      confidence: recommendation.confidence as ConfidenceLevel,
      summary: recommendation.summary,
      expectedImpactJson: recommendation.expectedImpact as object,
      evidenceJson: recommendation.evidence as object,
      assumptionsJson: recommendation.assumptions as object,
      risksJson: recommendation.risks as object,
      nextAction: recommendation.nextAction,
    },
  });

  await repo.updateScenario(scenarioId, {
    scenarioRunId: scenarioRun.id,
    baselineRunId: baselineRun.id,
  });

  return { baselineResult, scenarioResult, delta, recommendation, agentActivities, dataQualityScore };
}
