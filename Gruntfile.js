module.exports = function (grunt) {
    grunt.initConfig({
        
        pkg: grunt.file.readJSON('package.json'),
        
        execute: {
            target: {
                src: ['app.js']
            }
        }

    });

    grunt.loadNpmTasks('grunt-execute');
    grunt.registerTask('default', ['execute']);
};
