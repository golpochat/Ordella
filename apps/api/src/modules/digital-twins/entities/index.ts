import { DigitalTwinModelEntity } from './digital-twin-model.entity';
import { DigitalTwinVersionEntity } from './digital-twin-version.entity';
import { SimulationCacheEntity } from './simulation-cache.entity';
import { SimulationResultEntity } from './simulation-result.entity';
import { SimulationRunEntity } from './simulation-run.entity';
import { SimulationScenarioEntity } from './simulation-scenario.entity';

export { DigitalTwinModelEntity, type DigitalTwinType } from './digital-twin-model.entity';
export { DigitalTwinVersionEntity } from './digital-twin-version.entity';
export { SimulationCacheEntity } from './simulation-cache.entity';
export { SimulationResultEntity } from './simulation-result.entity';
export { SimulationRunEntity, type SimulationDomain, type SimulationRunStatus } from './simulation-run.entity';
export { SimulationScenarioEntity } from './simulation-scenario.entity';

export const DIGITAL_TWINS_ENTITIES = [
  DigitalTwinModelEntity,
  DigitalTwinVersionEntity,
  SimulationCacheEntity,
  SimulationResultEntity,
  SimulationRunEntity,
  SimulationScenarioEntity,
];
