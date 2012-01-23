/**
 * jQuery.MediaAlignedText
 * Copyright (c) 2012 J. Reuben Wetherbee - jreubenwetherbee(at)gmail(dot)com
 * Licensed under MIT
 *
 * @projectDescription Handles the playback of MediaFiles along with aligned text
 * 
 * @todo more documentation needed
 */

(function( $ ) {
    
    //handle public method calls
    $.fn.mediaAlignedText = function( method ) {
        //call specific method and pass along additional parameters
        if(public_methods[method]) {
            return public_methods[method].apply(this, Array.prototype.slice.call( arguments, 1));
        }
        //default to init method if no method specified
        if ( typeof method === 'object' || ! method ) {
            
            return public_methods.init.apply( this, arguments );
        }
        //method not recognized
        else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.mediaAlignedText' );
        }
    };
    
    
    //define public methods
    var public_methods = {
            //initialize the MediaAlignedText playback
            init : function(options){

                var options = $.extend({
                    'jplayer_controls_id' : 'jplayer_controls',  //id of the div where jplayer controls reside
                    'json_alignment' : {},      //json alignment object
                    'jplayer_options' : {},       //jplayer options to initiate
                    'jplayer_container_options' : {}  //
                }, options);
                
                /**
                 * @todo check first to see if the html already exists before creating default
                 */
                $('#'+options.jplayer_controls_id).html(_getJplayerContainerHtml({
                    'title' : options.json_alignment.media_files[0].title
                }));
                
                
                options.jplayer_options.ready = function() {
                    $(this).jPlayer("setMedia", {
                        mp3: options.json_alignment.media_files[0].url
                      });
                };
                _initJplayer(options.jplayer_options);
                
            }
        };
    
    //initialize the Jplayer
    var _initJplayer = function (options) {
        
        var options = $.extend({
              jplayer_id:  'jquery_jplayer_1',
              swfPath: 'js',
              supplied: 'mp3',
              timeupdate: function() {check_time(); }
        }, options);
        
        $('#'+options.jplayer_id).jPlayer(options);
    }
    
    /**
     * get the default html for the media player 
     */
    var _getJplayerContainerHtml = function (options) {
            
            var options = $.extend({
                'jp_container_id' : 'jp_container_1',  //the id for the container
                'title'           : '',  //the title of the media file
                'media_type'      : 'audio'  //the media type for the container
            }, options);
            
            return '<div id="'+options.jp_container_id+'" class="jp-'+options.media_type+'">\
            <div class="jp-type-single">\
            <div class="jp-gui jp-interface">\
              <ul class="jp-controls">\
                <li><a href="javascript:;" class="jp-play" tabindex="1">play</a></li>\
                <li><a href="javascript:;" class="jp-pause" tabindex="1">pause</a></li>\
                <li><a href="javascript:;" class="jp-stop" tabindex="1">stop</a></li>\
                <li><a href="javascript:;" class="jp-mute" tabindex="1" title="mute">mute</a></li>\
                <li><a href="javascript:;" class="jp-unmute" tabindex="1" title="unmute">unmute</a></li>\
                <li><a href="javascript:;" class="jp-volume-max" tabindex="1" title="max volume">max volume</a></li>\
              </ul>\
              <div class="jp-progress">\
                <div class="jp-seek-bar">\
                  <div class="jp-play-bar"></div>\
                </div>\
              </div>\
              <div class="jp-volume-bar">\
                <div class="jp-volume-bar-value"></div>\
              </div>\
              <div class="jp-time-holder">\
                <div id="jp-current-time" class="jp-current-time"></div>\
                <div class="jp-duration"></div>\
                <ul class="jp-toggles">\
                  <li><a href="javascript:;" class="jp-repeat" tabindex="1" title="repeat">repeat</a></li>\
                  <li><a href="javascript:;" class="jp-repeat-off" tabindex="1" title="repeat off">repeat off</a></li>\
                </ul>\
              </div>\
            </div>\
            <div class="jp-title">\
              <ul>\
                <li>'+options.title+'</li>\
              </ul>\
            </div>\
            <div class="jp-no-solution">\
              <span>Update Required</span>\
              To play the media you will need to either update your browser to a recent version or update your <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash plugin</a>.\
            </div>\
          </div>\
        </div>';
    }

    
})( jQuery );