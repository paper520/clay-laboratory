'use strict';

module.exports = function (grunt) {
    /*配置插件*/
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            server: {
                options: {
                    keepalive: true,
                    port: 20000,
                    base: '.'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('server', ['connect:server']);
};
