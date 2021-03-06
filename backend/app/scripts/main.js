// Require.js allows us to configure shortcut alias
require.config({
	// The shim config allows us to configure dependencies for
	// scripts that do not call define() to register a module
	shim: {
		backbone: {
			deps: [
				'underscore',
				'jquery'
			],
			exports: 'Backbone'
		},
		underscore: {
			exports: '_'
		},
		bootstrapAlert: {
			deps: [
				'jquery'
			]
		},
		bootstrapTransition: {
			deps: [
				'jquery'
			]
		},
		bootstrapModal: {
			deps: [
				'jquery'
			]
		},
		bootstrapTypeahead: {
			deps: [
				'jquery'
			]
		},
		bootstrapDropdown: {
			deps: [
				'jquery'
			]
		},
		backbonePaginator: {
			deps: [
				'backbone'
			]
		},
		jqueryCookie: {
			deps: [
				'jquery'
			],
			exports: 'jQuery.cookie'
		}
	},
	paths: {
		jquery: '../components/jquery/jquery',
		underscore: '../components/underscore/underscore',
		backbone: '../components/backbone/backbone',
		text: '../components/requirejs-text/text',
		json: '../components/requirejs-plugins/src/json',
		bootstrapAlert: '../components/sass-bootstrap/js/bootstrap-alert',
		bootstrapTransition: '../components/sass-bootstrap/js/bootstrap-transition',
		bootstrapModal: '../components/sass-bootstrap/js/bootstrap-modal',
		bootstrapTypeahead: '../components/typeahead.js/dist/typeahead',
		moment: '../components/moment/moment',
		socketIo: '../components/socket.io-client/dist/socket.io',
		bootstrapDropdown: '../components/sass-bootstrap/js/bootstrap-dropdown',
		backbonePaginator: '../components/backbone.paginator/lib/backbone.paginator',
		jqueryCookie: '../components/jquery.cookie/jquery.cookie',
		jsHashes: '../components/jshashes/hashes'
	}
});

require([
	'routers/router',
	'bootstrapAlert',
	'bootstrapTransition',
	'bootstrapTypeahead',
	'bootstrapModal',
	'bootstrapDropdown'
], function(Router, BootstrapAlert, BootstrapTransition, BootstrapModal, BootstrapTypeahead, BootstrapDropdown) {
	'use strict';
	// initialize routing and start Backbone.history()
	new Router();
	Backbone.history.start();

});