const local = "http://192.168.1.26:3000";

const emulator_local = "http://10.0.2.2:3000";

const server = "http://104.197.224.155:3000";

const baseUrl = server;

const loginUrl = baseUrl + "/users/login";

const signupUrl = baseUrl + "/users/signup";

const userUrl = baseUrl + "/users";

const cropUrl = baseUrl + "/crops";

const locationUrl = baseUrl + "/locations";

const ratingUrl = baseUrl + "/ratings";

const chatUrl = baseUrl + "/chats";

const chatRoomUrl = baseUrl + "/chatrooms";

export {
    baseUrl,
    loginUrl,
    signupUrl,
    userUrl,
    cropUrl,
    locationUrl,
    ratingUrl,
    chatUrl,
    chatRoomUrl
};
