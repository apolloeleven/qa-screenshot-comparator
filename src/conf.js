/**
 * Created by zura on 4/5/18.
 */
const path = require('path');

const ROOT_PATH = path.dirname(require.main.filename);

module.exports = {
    PROJECT_ROOT: ROOT_PATH,
    RUNTIME: ROOT_PATH + '/runtime'
};