// The windson theme. `astryx experimental theme editor` wrote this file once and never changes it again.
// The checked settings live in windson.settings.json and the generated windson.settings.ts;
// change them with `astryx experimental theme editor set windson ...`. Add your own changes below: they win over the settings.
import {defineTheme} from '@astryxdesign/core/theme';
import {windsonSettings} from './windson.settings';

export const windsonTheme = defineTheme({
  extends: windsonSettings,
  name: 'windson',
});
