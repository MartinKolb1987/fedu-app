define([
    'jquery', 'underscore', 'backbone', '../models/posts', '../vendor/fedu/config'
], function($, _, Backbone, TheModel, TheConfig) {
    'use strict';

    var collection = Backbone.Collection.extend({
        model: TheModel,
        url: function() {
            return  TheConfig.nodeUrl + '/get/posts';
        },

        parse: function(response){ // manipulate response data

            return response;

        }

    });

    return collection;
});