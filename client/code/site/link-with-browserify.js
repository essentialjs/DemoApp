if (window.require) {

    require.define('jquery',function (require, module, exports, __dirname, __filename) {
        module.exports = window.angular;
    });
    require.define('angular',function (require, module, exports, __dirname, __filename) {
        module.exports = window.angular;
    });

}
