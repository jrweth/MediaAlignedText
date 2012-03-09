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
    
    /**
     * base JQuery function to handle public method calls
     */
    $.fn.mediaAlignedText = function( method ) {
        
        //call specific method and pass along additional arguments
        if(public_methods[method]) {
            return public_methods[method].apply(this, Array.prototype.slice.call( arguments, 1));
        }
        //default to init method if no method specified
        if ( typeof method === 'object' || ! method ) {
            
            return public_methods.init.apply( this, arguments );
        }
        //method not recognized
        else {
            $.error( 'Method ' +  method + ' does not exist in jQuery.mediaAlignedText' );
        }
    };
    
    
    /**
     * Define the following public methods
     * - init              Initialize the MediaAlignedText 
     * - charGroupClicked  Handle clicking the CharGroup
     */
    var public_methods = {
        //initialize the MediaAlignedText playback
        init : function(options){
            
            //get default options 
            var options = $.extend({
                'jplayer_controls_id'       : 'mat_jplayer_controls',//id of the div where jplayer controls reside
                'media_files'               : {},                    //array of media files and types to initiate
                'text_viewer_css_selector'  : '#mat_text_viewer',    //id of the div where the text is displayed
                'jplayer_options'           : {},                    //additional jplayer options to initiate
                'jplayer_control_options'   : {},                    //options to send to the jplayer control generator
                'generate_jplayer_controls' : true,                  //flag indicating if controls should be generated or not
                'highlight_function'        : _textSegmentHighlight, //the function to use to highlight - requires object and text_segment_id as arguments
                'highlight_remove_function' : _textSegmentRemoveHighlight,  //function to remove highligh - requires object and text_segment_id as arguments
            }, options);
            
            //save options to the objects namespaced data holder
            var $this = $(this);
            var data = $this.data('mediaAlignedText');
            
            if(!data) {
                $(this).data('mediaAlignedText', options);
            }
            
            //initialized jplayer controls
            if(options.generate_jplayer_controls) {
                options.jplayer_control_options.title = options.media_files[0].title;
                $('#'+options.jplayer_controls_id).html(_getJplayerContainerHtml(options.jplayer_control_options));
            }
            
            //set the initial media file for the jplayer
            options.jplayer_options.ready = function() {
                $(this).jPlayer("setMedia", options.media_files[0].media);
            };
            
            //initialize all the mappings and components
            _initTextSegments($this);
            _initJplayer($this, options.jplayer_options);
            
        },
        
        //handles advancing to the aligned time of media when charGroup div clicked
        'textSegmentClicked' : function(text_segment_index) {
            
            var $this = $(this);
            var data = $this.data('mediaAlignedText');
            
            if( text_segment_index ) {
                var text_segment = data.text_segments[text_segment_index];
                //go to the place in the media file 
                if($this.data('jPlayer').status.paused) { //if player paused just advance
                    $this.jPlayer('pause', text_segment.time_start/1000);
                    _setCurrentTextSegment($this, text_segment_index);
                }
                else { // if player not paused then go to 
                    $this.jPlayer('play', text_segment.time_start/1000);
                }
            }
        },
        /**
         * play the media file for just the text segment 
         * @param integer  text_segment_index   Index of the text_segment to be played
         */
        'playTextSegment' : function(text_segment_indext) {
            var $this = $(this);
            var text_segment = $this.data('mediaAlignedText').text_segments[text_segment_id];
            $this.jPlayer('play', text_segment.time_start);
            
            //stop the jPlayer when segment is done
            var t = setTimeout("$('" + $this.attr('id') + "').jPlayer('pause')", 1000*(text_segment.time_end - text_segment.time_start));
        },
        
        'refreshSegments' : function() {
            var $this = $(this);
            //initialize all the mappings and components
            _initTextSegments($this);
            
        }
    };
    
    var _checkTimeChange = function($this){
        var data = $this.data('mediaAlignedText');
        var current_time = parseFloat($this.data("jPlayer").status.currentTime)*1000;
        var current_text_segment_invalid = false;
        
        var current_text_segment = data.current_text_segment;
        
        //get start/end times for the current_text_segment
        if(current_text_segment == undefined) {
            current_text_segment_invalid = true;
        }
        else {
            var current_segment_start = parseFloat(current_text_segment.time_start);
            var current_segment_end = parseFloat(current_text_segment.time_end);
            if(current_time < current_segment_start || current_time > current_segment_end) {
                
                //unset the current_text_segment if necessary
                data.current_text_segment = undefined;
                current_text_segment_invalid = true;
                
                //unset the current text segment to remove highlight
                if(data.current_text_segment_index) data.highlight_remove_function($this, data.current_text_segment_index);
            }
        }
        
        //try to find a new matching media segment
        if(current_text_segment_invalid) {
            //search for new text_segment
            //this needs to be optimized!!!!  shouldn't try to scan whole array each time
            for(var text_segment_index in data.text_segments) {
                
                //set the text_segment var for convenience
                var text_segment = data.text_segments[text_segment_index];
                if(text_segment.time_start < current_time && text_segment.time_end > current_time) {

                    data.current_text_segment = text_segment;
                    _setCurrentTextSegment($this, text_segment_index);
                }
                
            }
        }
        //reset the data 
        $this.data('mediaAlignedText', data);
    };
    
    //initialize the Jplayer
    var _initJplayer = function ($this, options) {
        
        //get the media types supplied by looking at the first media file
        var types_supplied = '';
        for(i in $this.data('mediaAlignedText').media_files[0].media) {
            types_supplied = types_supplied + i + ',';
        }
        //knock off the last comma
        types_supplied = types_supplied.substring(0, types_supplied.length-1);
        
        //initiate the jplayer
        var options = $.extend({
              swfPath: 'js',
              supplied: 'mp3',
              timeupdate: function() {_checkTimeChange($(this))}
        }, options);
        
        $this.jPlayer(options);
    };
    
    
    /**
     * initialize an ordered index of text segments
     * @todo it is assumed the text segments are listed in time order - should be checked
     */
    var _initTextSegments = function($this) {
        var data = $this.data('mediaAlignedText');
        var order = 0;
        var text_segments = new Array();
        
        $(data.text_viewer_css_selector + " [data-mat_start]").each(function(index) {
            var $this = $(this);
            $this.addClass('mat_text_segment');
            $this.attr('data-mat_segment', index);
            text_segments[index] = {'time_start': parseFloat($this.attr('data-mat_start'))};
            if(index > 0) text_segments[index-1].time_end = parseFloat($this.attr('data-mat_start'));
        });
        
        $(data.text_viewer_css_selector).on(
            'click.mediaAlignedText',
            '[data-mat_start]',
            {'parent' : $this},
            function(event) {
                event.data.parent.mediaAlignedText('textSegmentClicked', $(this).attr('data-mat_segment'));
        });
        data.text_segments = text_segments;
        
        //write back to the data object
        $this.data('mediaAlignedText', data);
    }
    
    /**
     * get the default html for the jplayer media player 
     * 
     * @param Object   options  The options that can be used to initialize the Jplayer Controller including the following
     * - jp_container_id:  The id of the container
     * - title:            The media file title to include in the player
     * - 
     */
    var _getJplayerContainerHtml = function (options) {
            
            var options = $.extend({
                'jp_container_id' : 'jp_container_1',  //the id for the container for the controls
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
    };
    
    /**
     * Set the current text segment to be the one supplied
     * 
     * @param jQueryObject     $this   The obect on which the mediaAlignedText has been instantiated
     * @param text_segment_index  integer  Theindex of the textSegment to be highlighted
     */
    var _setCurrentTextSegment = function($this, text_segment_index) {
        var data = $this.data('mediaAlignedText');
        
        //if it is already set than do nothing
        if (data.current_text_segment_index == text_segment_index) {
            return true;
        }
        //if current text segment not yet set then simply set it and highlight it
        else if (data.current_text_segment_index == undefined) {
            data.current_text_segment_index= text_segment_index;
            data.highlight_function($this, text_segment_index);
        }
        //must already be set, so unhiglight old one and set new one
        else {
            data.highlight_remove_function($this, data.current_text_segment_index);
            data.current_text_segment_index = text_segment_index;
            data.highlight_function($this, text_segment_index);
        }
    };
    
    /**
     * Highlight a particular text segment
     * 
     * @param jQueryObject     $this    The obect on which the mediaAlignedText has been instantiated
     * @param text_segment_index  integer  The index of the textSegment to be highlighted
     */
    var _textSegmentHighlight = function($this, text_segment_index) {
        $('[data-mat_segment='+text_segment_index+']').addClass('highlighted_text_segment');
        $($this.data('mediaAlignedText').text_viewer_css_selector).scrollTo('.highlighted_text_segment', 250, {'axis': 'y', 'offset': -20});
    };
    
    /**
     * Remove the highlight on a particular text segment
     * 
     * @param jQueryObject     $this   The obect on which the mediaAlignedText has been instantiated
     * @param text_segment_index  integer  The id of the textSegment to have highlighting removed
     */
    var _textSegmentRemoveHighlight = function($this, text_segment_index){
        $('[data-mat_segment='+text_segment_index+']').removeClass('highlighted_text_segment');
    };
    
})( jQuery );
