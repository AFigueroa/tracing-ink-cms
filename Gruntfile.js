module.exports = function (grunt) {
    grunt.initConfig({
        
        pkg: grunt.file.readJSON('package.json'),
        
        execute: {
            target: {
                src: ['app.js']
            }
        },
        
        connect: {
            server: {
                options: {
                    port: 8080,
                    base: '',
                    hostname: 'localhost',
                    livereload: 9000
                }
            }
        },

        watch: {
            options: {
                livereload: {port: 9000}
            },
            css:{
                files: 'css/**/*.css'
            },
            html:{
                files: '**/*.html'
            },
            js: {
                files: 'js/**/*.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-execute');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    
    grunt.registerTask('default', ['execute', 'connect', 'watch']);
};
