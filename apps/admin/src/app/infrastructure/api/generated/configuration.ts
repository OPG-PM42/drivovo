// equivalent of typescript-angular generator output — hand-authored fallback
export interface ConfigurationParameters {
  basePath?: string;
  withCredentials?: boolean;
}

export class Configuration {
  basePath?: string;
  withCredentials?: boolean;

  constructor(configurationParameters: ConfigurationParameters = {}) {
    this.basePath = configurationParameters.basePath;
    this.withCredentials = configurationParameters.withCredentials;
  }
}
