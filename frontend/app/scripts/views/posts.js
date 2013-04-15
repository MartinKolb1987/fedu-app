define([
	'jquery',
	'underscore',
	'backbone',
	'../collections/posts',
	'../models/posts',
	'../vendor/fedu/config',
	'text!../templates/posts/video.html',
	'text!../templates/posts/grid_video_items.html',
	'text!../templates/posts/info_video_items.html',
	'text!../templates/posts/player_video_items.html',
	'text!../templates/posts/detail_video_view.html',
	'text!../templates/posts/detail_video_content.html'
], function( $, _, Backbone, TheCollection, TheModel, TheConfig, VideoTemplate, GridVideoItemsTemplate, InfoVideoItemsTemplate, PlayerVideoItemsTemplate, DetailVideoViewTemplate, DetailVideoContentTemplate) {
	'use strict';

	var PostsView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#app-wrapper',
		collection: {},
		viewType: 'info',
		currentCollectionLength: 0,

		// delegated events
		events: {
			'click .type' : 'setViewType',
			'click .video_container' : 'addVideoIframe',
			'keyup form#search' : 'handleSearchEvents',
			'submit form#search' : 'handleSearchEvents',
			'click form#flag_post .flag_submit': 'flagPost'
		},

		initialize: function() {
			// render default template (form)
			this.collection = new TheCollection();

			// listen to scroll event
			var that = this;
		    $(window).scroll(function(){
				that.scrolling();
		    });

		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function(target, value) {
			$(target).html(value);
		},

		listDefault: function(){
			this.collection.paginator_core.url = TheConfig.nodeUrl + '/post';
			this.render(this.el, VideoTemplate);
			$('.type[data-type=' + this.viewType + ']').addClass('active'); // set type button active-state
			// set page start to 0
			this.collection.goTo(0);
			this.getPosts();
		},

		listPosts: function(){

			var templateItems = '';
			var that = this;
			_.each(this.collection.models, function(value){
				if(that.viewType === 'grid'){
					templateItems += _.template(GridVideoItemsTemplate, {attributes: value.attributes});
				} else if(that.viewType === 'player'){
					templateItems += _.template(PlayerVideoItemsTemplate, {attributes: value.attributes});
				} else if(that.viewType === 'info'){
					templateItems += _.template(InfoVideoItemsTemplate, {attributes: value.attributes});
				}
			});

			this.render('#all_videos', templateItems);
		},

		detailDefault: function(id){
			this.render(this.el, DetailVideoViewTemplate);
			this.getPost(id);
		},

		listPost: function(results){
			var templateDetailView = '';
			templateDetailView = _.template(DetailVideoContentTemplate, {attributes: results[0]});

			this.render('.detail_view', templateDetailView);

		},

		search: function(result){

			if(!$('#all_videos').length){
				this.render(this.el, VideoTemplate);
				var searchForm = $('form#search .search-query');
				searchForm.val(result);
			}

			var query = this.searchQuery(result);

			this.collection.paginator_core.url = TheConfig.nodeUrl + '/search';
			this.collection.server_api.query = query.query;
			this.collection.server_api.tag = query.tag;
			this.collection.server_api.duration = query.duration;

			this.collection.goTo(0);
			this.getPosts();
		},

		flagPost: function(e){
			e.preventDefault();
			var locateFlagForm = $('form#flag_post');
			var array = locateFlagForm.serializeArray();
			var flagDescription = array[0].value;
			var flagId = array[1].value;
			var flagTitle = array[2].value;

			$.ajax({
				url: 'http://localhost:3100/flagPost',
				data: {
					id: flagId,
					title: flagTitle,
					description: flagDescription
				}
			}).done(function() {
				locateFlagForm.find('.flag_submit').val('post was flagged, thank you!').addClass('disabled');
			});
		},

		// helper functions
		////////////////////////////////////////

		getPosts: function(){
			var that = this;

			this.collection.fetch({
			    success: function(collection) {
					that.collection = collection;
					that.listPosts();
					that.autoLoad();
			    },
			    error: function(){
			        console.log('error - no data was fetched');
			    }
			});
		},

		setViewType: function(e) {
			$('.type').removeClass('active');
			$(e.currentTarget).addClass('active');
			this.viewType = $(e.currentTarget).attr('data-type');
			this.listPosts();

			// check if more videos needed at this view type
			this.autoLoad();
		},

		getPost: function(id){
			var model = new TheModel({_id: id});
			var that = this;
			model.fetch({
				success: function(model, response){
					that.listPost(response);
				}
			});
		},

		addVideoIframe: function(e){
			var videoUrl = $(e.currentTarget).attr('data-video');
			$(e.currentTarget).removeClass('no_player').append('<iframe src="' + videoUrl + '?portrait=0&byline=0&title=0&autoplay=1&color=00adef&showinfo=0&theme=light&autohide=0&fs=1" frameborder="0" allowfullscreen></iframe>');
			$(e.currentTarget).find('iframe').fadeIn();
		},

		infiniteLoad: function(){
			var that = this;

			// send request only if new data exists
			if(this.collection.length !== this.currentCollectionLength){
				this.collection.nextPage({
					update: true, // add to collection
					remove: false,
					success: function(){
						that.listPosts();
						that.autoLoad();
						that.currentCollectionLength = that.collection.length;
					}
				});

			}

		},

		autoLoad: function(){
			// load until scrollbar exists
			if($(document).height() === $(window).height()){
				this.infiniteLoad();
			}
		},

		scrolling: function(){
			var scrollPosition = $(window).scrollTop() + $(window).height();
			var documentHeight = $(document).height();
			if(scrollPosition === documentHeight){
				this.infiniteLoad();
			}

		},

		handleSearchEvents: function(e){
			var doNotTriggerKeys = [
				37, 38, 39, 40, //arrowkeys
				46 // delete
			];

			var results = $('form#search').serializeArray();
			var result = results[0].value;

			if(e.type === 'submit'){
				e.preventDefault();
				this.searchPrepare(result, true);
			} else if(doNotTriggerKeys.indexOf(e.keyCode) === -1){
				this.searchPrepare(result, false);
			}
		},

		searchPrepare: function(result, submit){
			if(result.length === 0){
				Backbone.history.navigate('/', true);
				$('.search-query').focus();
			} else if(result.length >= 3){
				Backbone.history.navigate('/search/' + encodeURI(result), false);
				this.search(result);
			} else if(submit){
				Backbone.history.navigate('/search/' + encodeURI(result), false);
				this.search(result);
			}
		},

		searchQuery: function(query){
			var tag = '';
			var duration = '';
			var queryString = '';
			query.toLowerCase();
			var queryArray = query.split(' ');

			var tagRegexString = '(\\[)' + '((?:[\u0000-\u00FF]*))' + '(\\])';
			var durationRegexString = '((d:))'+ '((\\d+))';
			var unicodeAreaRegexString = '((?:[\u0000-\u00FF]*))';

			var tagRegex = new RegExp(tagRegexString, ['i']);
			var durationRegex = new RegExp(durationRegexString, ['i']);
			var unicodeAreaRegex = new RegExp(unicodeAreaRegexString, ['i']);

			for (var i = 0; i < queryArray.length; i++) {
				if(tagRegex.test(queryArray[i])){
					var tagRegexResult = tagRegex.exec(query);
					tag = tagRegexResult[2];
				} else if(durationRegex.test(queryArray[i])){
					var durationRegexResult = durationRegex.exec(query);
					duration = durationRegexResult[4] * 60;
				} else if(unicodeAreaRegex.test(queryArray[i])){
					queryString += queryArray[i] + ' ';
				}
			}

			return {query: queryString, tag: tag, duration: duration};
		}

	});

	return PostsView;
});