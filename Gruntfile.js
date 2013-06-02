module.exports = function(grunt) {
	grunt.initConfig({
		sass: {
			clean: {
				options: {
					unixNewlines: true,
					style: "nested",
					cacheLocation: ".sass-cache",
					noCache: false
				},
				files: {
					"css/jquery.styleCheckbox.css": "css/src/jquery.styleCheckbox.scss"
				}
			},
			minified: {
				options: {
					unixNewlines: true,
					style: "compressed",
					cacheLocation: ".sass-cache",
					noCache: false
				},
				files: {
					"css/jquery.styleCheckbox.min.css": "css/src/jquery.styleCheckbox.scss"
				}
			}
		},
		jshint: {
			options: {
				jshintrc: ".jshintrc"
			},
			all: [ "js/jquery.styleCheckbox.js" ]
		},
		uglify: {
			all: {
				src: [ "js/jquery.styleCheckbox.js" ],
				dest: "js/jquery.styleCheckbox.min.js"
			}
		},
		watch: {
			css: {
				files: [ "<% sass.clean.files %>" ],
				tasks: [ "sass" ]
			},
			js: {
				files: [ "<%= uglify.src.all %>" ],
				tasks: [ "jshint", "uglify" ]
			}
		}
	});

	grunt.loadNpmTasks( "grunt-contrib-sass" );
	grunt.loadNpmTasks( "grunt-contrib-jshint" );
	grunt.loadNpmTasks( "grunt-contrib-uglify" );
	grunt.loadNpmTasks( "grunt-contrib-watch" );

	grunt.registerTask( "default", "watch" );

	grunt.registerTask( "build", [ "sass", "jshint", "uglify" ] );
};
