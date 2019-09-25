import i18n from 'i18next';
import * as Localization from 'expo-localization';

const en = require('./locales/en.json');
const my = require('./locales/my.json');

const languageDetector = {
	type: 'languageDetector',
	async: true,
	// detect: cb => cb(Localization.locale.split('-')[0]),
	detect: cb => cb('en'),
	init: () => {},
	cacheUserLanguage: () => {},
};

i18n.use(languageDetector).init({
	fallbackLng: 'en',
	resources: {
		en,
		my,
		ns: ['common'],
		defaultNS: 'common',
		interpolation: {
			escapeValue: false,
		},
	},
});

export { i18n };
