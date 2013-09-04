module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-bumpup');

    // Project configuration.
    grunt.initConfig({
        jshint:{
            all: ['Gruntfile.js', 'src/*.js']
        },
        bumpup: ['package.json']
    });

    grunt.registerTask('dist', ['jshint','bumpup']);
};