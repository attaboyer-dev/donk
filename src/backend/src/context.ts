import { ServiceBundle } from "./services/bundle";

export interface AppContext {
  services: ServiceBundle;
  redis: any;
}
