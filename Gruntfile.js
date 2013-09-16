module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-testem');
    grunt.loadNpmTasks('grunt-bumpup');

    // Project configuration.
    grunt.initConfig({

        /* Check JS syntax*/
        'jshint':{
            all: ['Gruntfile.js', 'src/*.js']
        },

        /* Update version */
        'bumpup': ['package.json'],

        /* DEV MODE - auto compile & test */
        'watch': {
            'spatester': {
                files: ['src/**/*.js', 'test/demoTest.js'],
                tasks: ['browserify']
            }
        },

        browserify: {
            'test/compiled.js': ['test/demoTest.js']
        },

        testem: {
            options: {
                launch_in_ci : [
                    'chromium'
                ]
            },
            main : {
                framework: 'custom',
                src: [ 'test/compiled.js' ],
                dest: 'test-result/testem-ci.tap'
            }
        }
    });

    grunt.registerTask('dist', ['jshint','bumpup']);
    grunt.registerTask('dev', ['watch']);
    grunt.registerTask('test', ['browserify', 'testem']);
};