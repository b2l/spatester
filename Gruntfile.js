module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-bumpup');

    // Project configuration.
    grunt.initConfig({
        jshint:{
            all: ['Gruntfile.js', 'src/*.js']
        },
        bumpup: ['package.json']
    });

    grunt.registerTask('dist', ['bumpup']);
};