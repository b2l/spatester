module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-bumpup');

    // Project configuration.
    grunt.initConfig({
        jshint:{
            all: ['Gruntfile.js', 'src/*.js']
        },
        bumpup: {
            options: {
                version: function (old, type) {
                    return old.replace(/([\d])+$/, grunt.option('wc-version'));
                }
            },
            file: 'package.json'
        }
    });

    grunt.registerTask('build',['jshint']);
    grunt.registerTask('dist', ['jshint','bumpup']);
};