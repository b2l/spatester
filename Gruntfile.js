module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-testem');
    grunt.loadNpmTasks('grunt-bumpup');

    // Project configuration.
    grunt.initConfig({

        /* Check JS syntax*/
        'jshint': {
            all: ['Gruntfile.js', 'src/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
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
                files: ['test/qunit/*.js'],
                tasks: ['browserify']
            }
        },

        browserify: {
            options: {
                debug: true
            },
            'test/compiled.js': ['test/demoTest.js'],
            'test/qunit/compiled/scenario.js': ['test/qunit/scenario.js'],
            'test/qunit/compiled/asserter.js': ['test/qunit/asserter.js']
        },

        testem: {
            spa: {
                src: [ 'test/compiled.js' ],
                options: {
                    framework: 'custom',
                    'launch_in_ci': [
                        'chromium'
                    ]
                }
            },
            qunit: {
                src: [ 'test/qunit/compiled/*.js' ],
                options: {
                    framework: 'qunit',
                    'launch_in_ci': [
                        'chromium'
                    ]
                }
            }
        }
    });

    grunt.registerTask('build', ['jshint']);
    grunt.registerTask('dist', ['jshint', 'bumpup']);
    grunt.registerTask('dev', ['browserify', 'watch']);
    grunt.registerTask('test', ['browserify', 'testem:ci:spa', 'testem:ci:qunit']);
    grunt.registerTask('default', ['watch']);
};