import { HardwareDeviceCommandEntity } from './hardware-device-command.entity';
import { HardwareDeviceEventEntity } from './hardware-device-event.entity';
import { HardwareDeviceLogEntity } from './hardware-device-log.entity';
import { HardwareDeviceEntity } from './hardware-device.entity';

export { HardwareDeviceCommandEntity } from './hardware-device-command.entity';
export { HardwareDeviceEventEntity } from './hardware-device-event.entity';
export { HardwareDeviceLogEntity } from './hardware-device-log.entity';
export { HardwareDeviceEntity } from './hardware-device.entity';
export type { HardwareDeviceStatus, HardwareDeviceType } from './hardware-device.entity';

export const HARDWARE_ENTITIES = [
  HardwareDeviceCommandEntity,
  HardwareDeviceEventEntity,
  HardwareDeviceLogEntity,
  HardwareDeviceEntity,
];
