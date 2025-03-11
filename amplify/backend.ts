import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { customLog } from './functions/custom-log/resource';

export const backend = defineBackend({
  auth,
  data,
  customLog
});
