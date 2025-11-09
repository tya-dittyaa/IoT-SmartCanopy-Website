/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_MQTT_BROKER_URL?: string;
  readonly VITE_MQTT_BROKER_USER?: string;
  readonly VITE_MQTT_BROKER_PASS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
