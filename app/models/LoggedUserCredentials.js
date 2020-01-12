export default class LoggedUserCredentials {
	accessToken = '';
	userName = '';
	userId = '';
	userType = '';
	location = null;
	lng = '';
	hasChatNoti = false;
	hasNoti = false;

	static setLoggedUserData(accessToken, userName, userId, userType) {
		this.accessToken = accessToken;
		this.userName = userName;
		this.userId = userId;
		this.userType = userType;
	}

	static getAccessToken() {
		return this.accessToken;
	}

	static getUserName() {
		return this.userName;
	}

	static getUserId() {
		return this.userId;
	}

	static getUserType() {
		return this.userType;
	}

	static setLocation(location) {
		this.location = location;
	}

	static getLocation() {
		return this.location;
	}

	static setLanguage(lng) {
		this.lng = lng;
	}

	static getLanguage() {
		return this.lng;
	}

	static setChatNoti(chatNoti) {
		this.hasChatNoti = chatNoti;
	}

	static getChatNoti() {
		return this.hasChatNoti;
	}

	static setNoti(noti) {
		this.hasNoti = noti;
	}

	static getNoti() {
		return this.hasNoti;
	}
}
