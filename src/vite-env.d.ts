/// <reference types="vite/client" />

declare const process: {
  env: {
    API_BASE_URL?: string;
    WS_URL?: string;
    MAPBOX_TOKEN?: string;
    [key: string]: any;
  };
};

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_WS_URL?: string;
  readonly VITE_MAPBOX_TOKEN?: string;
  readonly [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
