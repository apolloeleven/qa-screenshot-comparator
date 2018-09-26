/**
 * Created by zura on 4/5/18.
 */

let env;
try {
    env = require('../env');
} catch (ex) {
    env = {
        httpBasicAuth: false,
        httpBasicAuthUsername: '',
        httpBasicAuthPassword: ''
    }
}

module.exports = {
    HTTP_BASIC_AUTH: env.httpBasicAuth,
    HTTP_BASIC_AUTH_USERNAME: env.httpBasicAuthUsername,
    HTTP_BASIC_AUTH_PASSWORD: env.httpBasicAuthPassword,
    SCREEN_RESOLUTIONS: {
        desktop: {width: 1440, height: 10},
        laptop: {width: 1024, height: 10},
        tablet: {width: 768, height: 10},
        mobile: {width: 360, height: 10},
    },
};