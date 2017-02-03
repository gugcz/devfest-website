module.exports = function(grunt) {

    grunt.initConfig({
        compass: {
            dist: {
                options: {
                    config: '_sass/config.rb',
                    basePath: '_sass'
                }
            }
        },
        cssmin: {
            combine: {
                files: {
                    'css/main.min.css': ['css/main.css']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('default', ['compass', 'cssmin']);

};