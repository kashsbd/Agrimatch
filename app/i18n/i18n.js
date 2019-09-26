import i18n from 'i18next';
import { AsyncStorage } from 'react-native';
import * as Localization from 'expo-localization';
import LoggedUserCredentials from '../models/LoggedUserCredentials';

const en = require('./locales/en.json');
const my = require('./locales/my.json');

const languageDetector = {
	type: 'languageDetector',
	async: true,
	detect: async cb => {
		try {
			const lng = await AsyncStorage.getItem('lng');

			if (lng) {
				LoggedUserCredentials.setLanguage(lng);
				return cb(lng);
			}

			return cb(Localization.locale.split('-')[0]);
		} catch (error) {
			return cb(Localization.locale.split('-')[0]);
		}
	},
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
