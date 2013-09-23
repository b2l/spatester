module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-testem');
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
            'src': {
                files: ['src/**/*.js'],
                tasks: ['browserify']
            },
            'testem': {
                files: ['test/demoTest.js'],
                tasks: ['browserify']
            },
            'qunit': {
                files: ['test/qunit/test.js'],
                tasks: ['browserify']
            }
        },

        browserify: {
            'test/compiled.js': ['test/demoTest.js'],
            'test/qunit/compiled.js': ['test/qunit/test.js']
        },

        testem: {
            spa : {
                src: [ 'test/compiled.js' ],
                options: {
                    framework: 'custom',
                    'launch_in_ci' : [
                        'chromium'
                    ]
                }
            },
            qunit : {
                src: [ 'test/qunit/compiled.js' ],
                options: {
                    framework: 'qunit',
                    'launch_in_ci' : [
                        'chromium'
                    ]
                }
            }
        }
    });

    grunt.registerTask('dist', ['jshint','bumpup']);
    grunt.registerTask('dev', ['browserify', 'watch']);
    grunt.registerTask('test', ['browserify', 'testem:ci:spa','testem:ci:qunit']);
    grunt.registerTask('default', ['watch']);
};