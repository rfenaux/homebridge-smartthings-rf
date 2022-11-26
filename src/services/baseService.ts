import { PlatformAccessory, Logger, Service, WithUUID } from 'homebridge';
import { MultiServiceAccessory } from '../multiServiceAccessory';
//import { BasePlatformAccessory } from '../basePlatformAccessory';
import { IKHomeBridgeHomebridgePlatform } from '../platform';

export class BaseService {
  protected accessory: PlatformAccessory;
  protected log: Logger;
  protected platform: IKHomeBridgeHomebridgePlatform;
  protected name = '';
  protected deviceStatus;
  protected multiServiceAccessory: MultiServiceAccessory;
  protected service: Service;
  protected componentId: string;

  constructor(
    platform: IKHomeBridgeHomebridgePlatform,
    accessory: PlatformAccessory,
    multiServiceAccessory: MultiServiceAccessory,
    name: string,
    componentId: string,
    deviceStatus) {

    this.accessory = accessory;
    // this.service = this.accessory.getService(platform.Service.MotionSensor) || this.accessory.addService(platform.Service.MotionSensor);
    this.platform = platform;
    this.log = platform.log;
    this.multiServiceAccessory = multiServiceAccessory;
    this.name = name;
    this.componentId = componentId;
    this.deviceStatus = deviceStatus;
    this.service = new platform.Service.Switch;  // Placeholder
  }

  protected findCapability(capabilityToFind: string): boolean {
    //let component;

    (this.accessory.context.device.components as Array<any>).forEach(component => {
      //component = this.accessory.context.device.components.find(c => c.id === 'main');
      // if (component === undefined) {
      //   component = this.accessory.context.device.components[0];
      // }
      if ((component.capabilities as Array<any>).find(c => c.id === capabilityToFind)) {
        return true;
      }
    });

    return false;

    //return component.capabilities.find(c => c.id === capabilityToFind);
  }

  protected setServiceType(serviceType: WithUUID<typeof Service>) {
    if (this.componentId !== 'main') { // TODO: Handle secondary component
      this.service = this.accessory.getService(this.name + '-' + this.componentId) ||
        this.accessory.addService(serviceType, this.name + '-' + this.componentId, serviceType + '-' + this.componentId);
    }
    this.service = this.accessory.getService(serviceType) ||
      this.accessory.addService(serviceType);

    this.service.setCharacteristic(this.platform.Characteristic.Name, this.accessory.context.device.label);
  }

  //protected async getStatus(): Promise<boolean> {
  protected async getStatus(): Promise<any> {
    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    // this.log.debug('Received getMotion() event for ' + this.name);

    return new Promise((resolve) => {
      if (!this.multiServiceAccessory.isOnline()) {
        this.log.info(`${this.name} is offline`);
        resolve(false);
      }
      this.multiServiceAccessory.refreshStatus()
        .then(success => {
          if (!success) {
            resolve(false);
          } else {
            try {
              resolve((this.deviceStatus.components as Array<any>).find(component => component.id === this.componentId).status);
            } catch (error) {
              this.log.error(`Status returned unexpected: ${this.name} - ${this.componentId}`);
              resolve(false);
            }
            //resolve(true);
          }
        });
    });
  }
}