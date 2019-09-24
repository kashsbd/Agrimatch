import I18n from 'i18n-js';
import * as Localization from 'expo-localization';

const en = require('./locales/en.json');
const my = require('./locales/my.json');

I18n.fallbacks = true;
I18n.translations = {
	en,
	my,
};

I18n.locale = Localization.locale;

export default I18n;
