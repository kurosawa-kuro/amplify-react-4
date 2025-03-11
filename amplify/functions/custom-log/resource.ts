import { defineFunction } from '@aws-amplify/backend';

export const customLog = defineFunction({
  name: 'customLog',
  entry: './handler.ts',
  
  // 環境変数の設定
  environment: {
    LOG_LEVEL: 'INFO',
    RETENTION_DAYS: '30',
  },
  
  // 関数の設定
  memoryMB: 256,
  timeoutSeconds: 30,
  
  // バンドル設定
  bundling: {
    minify: true,
  },
});