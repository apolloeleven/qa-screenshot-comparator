/**
 * Created by zura on 4/5/18.
 */

let env;
try {
    env = require('./env');
} catch (ex) {
    env = {
        authParams: {
            HTTP_BASIC_AUTH: true,
            HTTP_BASIC_AUTH_USERNAME: 'bcuser',
            HTTP_BASIC_AUTH_PASSWORD: 'bc11user'
        }
    }
}

module.exports = {
    authParams: env.authParams,
    SCREEN_RESOLUTIONS: {
        desktop: {width: 1440, height: 10},
        laptop: {width: 1024, height: 10},
        tablet: {width: 768, height: 10},
        mobile: {width: 360, height: 10},
    },
};