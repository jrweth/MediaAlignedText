/**
 * jQuery.MediaAlignedText
 * Copyright (c) 2012 J. Reuben Wetherbee - jrweth(at)gmail(dot)com
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
                'jplayer_controls_generate' : true,                  //flag indicating if controls should be generated or not
                'highlight_function'        : _textSegmentHighlight, //the function to use to highlight - requires object and text_segment_id as arguments
                'highlight_remove_function' : _textSegmentHighlightRemove,  //function to remove highligh - requires object and text_segment_id as arguments
                'time_start_attribute'      : 'data-time_start',
                'time_end_attribute'        : 'data-time_end',
                'check_time_disabled'       : false
            }, options);
            
            //save options to the objects namespaced data holder
            var $this = $(this);
            var data = $this.data('mediaAlignedText');
            
            if(!data) {
                $this.data('mediaAlignedText', options);
            }
            
            //initialized jplayer controls
            if(options.jplayer_controls_generate) {
                if(options.media_files[0] != undefined && options.media_files[0].title != undefined) {
                    options.jplayer_control_options.title = options.media_files[0].title;
                }
                $('#'+options.jplayer_controls_id).html(_getJplayerContainerHtml(options.jplayer_control_options));
            }
            
            //initialize all the mappings and components
            _initTextSegments($this);
            _initJplayer($this);
            
            //bind the highlight event to the highlight function
            $(document).bind('mediaAlignedText.highlight', function(event, parameters) {
                options.highlight_function($this, parameters.text_segment_index);
            });
            //bind the remove_highlight event to the remove_highlight function
            $(document).bind('mediaAlignedText.highlight_remove', function(event, parameters) {
                options.highlight_remove_function($this, parameters.text_segment_index);
            });
        },
        
        //handles advancing to the aligned time of media when charGroup div clicked
        'textSegmentClicked' : function(text_segment_index) {
            
            var $this = $(this);
            var data = $this.data('mediaAlignedText');
            
            if( text_segment_index) {
                var text_segment = data.text_segments[text_segment_index];
                _setCurrentTextSegment($this, text_segment_index);
                
                if(text_segment.time_start >= 0) {
                    //go to the place in the media file 
                    if($this.data('jPlayer').status.paused) { //if player paused just advance
                        $this.jPlayer('pause', text_segment.time_start/1000);
                    }
                    else { // if player not paused then go to 
                        $this.jPlayer('play', text_segment.time_start/1000);
                    }
                }
            }
        },
        /**
         * play the media file for just the text segment 
         * @param integer  text_segment_index   Index of the text_segment to be played
         */
        'playTextSegment' : function(text_segment_index) {
            var $this = $(this);
            var text_segment = $this.data('mediaAlignedText').text_segments[text_segment_index];
            $this.jPlayer('play', text_segment.time_start / 1000);
            
            //stop the jPlayer when segment is done
            var t = setTimeout("$('#" + $this.attr('id') + "').jPlayer('pause')", text_segment.time_end - text_segment.time_start);
        },
        
        'refreshSegments' : function() {
            var $this = $(this);
            //initialize all the mappings and components
            _initTextSegments($this);
            
        }
    };
    
    var _checkTimeChange = function($this){
        var data = $this.data('mediaAlignedText');

        //if checking time has been turned off then disable
        if(data.check_time_disabled) return false;
        
        var current_time = Math.round(parseFloat($this.data("jPlayer").status.currentTime)*1000);
        var current_text_segment_invalid = false;
        
        //get current start and end times as a convenience
        if(data.current_text_segment_index == undefined) {
            var current_segment_start = -1;
            var current_segment_end = -1;
        }
        else {
            var segment = data.text_segments[data.current_text_segment_index];
            var current_segment_start = parseFloat(segment.time_start) -250; //-250 is hack since some browsers were setting time a bit off
            var current_segment_end = parseFloat(segment.time_end);
        }
        
        //check if we are still in the timeframe of the currently selected text segment
        if(current_time >= current_segment_start && 
                (current_time < current_segment_end || (data.current_text_segment_index == data.text_segments.length - 1 && current_segment_start >=0))
        ){
            return true;
        }
        else {    //unset the current text segment to remove highlight
            if(data.current_text_segment_index != undefined) {
                
                $(document).trigger('mediaAlignedText.highlight_remove', {'text_segment_index': data.current_text_segment_index});
                //unset the current_text_segment if necessary
                data.current_text_segment_index = undefined;
                current_text_segment_invalid = true;

            }

            //set up search for new text_segment starting from current segment and proceeding accordingly
            if(data.current_text_segment_index == undefined) {
                var start = 0;
                var step = 1;
                var end = data.text_segments.length;
            }
            else if (current_time > current_segment_end) {
                var start = data.current_text_segment_index;
                var step = 1;
                var end = data.text_segments.length;
            }
            else {
                var start = data.current_text_segment_index;
                var step = -1;
                var end = -1;
            }
            //loop through and search for the next matching segment
            for(i = start; i != end; i = i + step) {
            
                //set the text_segment var for convenience
                var text_segment = data.text_segments[i];
                if(text_segment.time_start < current_time && 
                    (text_segment.time_end > current_time || (i == data.text_segments.length - 1 && text_segment.time_start >= 0))) {
                    _setCurrentTextSegment($this, i);
                    //check for the next match
                    return(true);
                }
                //check to see if we are seeking forwards and we've passed it already
                else if(step == 1 && text_segment.time_start > current_time){
                    break;
                }
                //check to see if we are seeking backwards and we've passed it already
                else if(step == -1 && text_segment.time_end < current_time) {
                    break;
                }
            }
        }
        //no match - must not have found one - save here to make sure current is unset
        $this.data('mediaAlignedText', data);
    };
    
    //initialize the Jplayer
    var _initJplayer = function ($this) {
        
        var data = $this.data('mediaAlignedText');
        
        //get the media types supplied by looking at the first media file
        var types_supplied = '';
        
        //check to see if the media file is defined
        if(data.media_files == undefined) {
            types_supplied = 'mp3';
        }
        else {
            for(i in data.media_files[0].media) {
                types_supplied = types_supplied + i + ',';
            }
            
            if(data.jplayer_options.ready == undefined) {
                //load the media file
                data.jplayer_options.ready = function() {
                    $(this).jPlayer("setMedia", data.media_files[0].media);
                };
            }
            
            //knock off the last comma
            types_supplied = types_supplied.substring(0, types_supplied.length-1);
        }
        
        
        //initiate the jplayer
        data.jplayer_options = $.extend({
              swfPath: 'js',
              supplied: types_supplied,
              timeupdate: function() {_checkTimeChange($(this));}
        }, data.jplayer_options);
        
        $this.jPlayer(data.jplayer_options);
    };
    
    
    /**
     * initialize an ordered index of text segments
     * @todo it is assumed the text segments are listed in time order - should be checked
     */
    var _initTextSegments = function($this) {
        var data = $this.data('mediaAlignedText');
        var order = 0;
        var text_segments = new Array();
        
        $(data.text_viewer_css_selector + ' [' + data.time_start_attribute + ']').each(function(index) {
            var $this = $(this);
            $this.addClass('mat_text_segment');
            $this.attr('data-mat_segment', index);
            text_segments[index] = {'time_start': parseFloat($this.attr(data.time_start_attribute))};
            
            if($this.attr(data.time_end_attribute)) {
                text_segments[index].time_end = parseFloat($this.attr(data.time_end_attribute));
            }
            
            //add end time to previous segment if not yet defined
            if(index > 0 && text_segments[index-1].time_end == undefined) {
                text_segments[index-1].time_end = parseFloat($this.attr(data.time_start_attribute));
            }
        });
        
        //set the time end for the last segment
        if(text_segments.length && text_segments[text_segments.length - 1].time_end == undefined) {
            //if time_start is undefined or -1 set to -1
            if(text_segments[text_segments.length - 1].time_start >= 0 && data.media_files[0].duration > 0) {
                text_segments[text_segments.length - 1].time_end = data.media_files[0].duration;
            }
            else { //set to the start time
                text_segments[text_segments.length -1].time_end = text_segments[text_segments.length -1].time_start;
            }
        }
        
        $(data.text_viewer_css_selector).on(
            'click.mediaAlignedText',
            '[' + data.time_start_attribute +']',
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
        if (data.current_text_segment_index == parseInt(text_segment_index)) {
            return true;
        }
        //if current text segment already set unhighlight it
        if (data.current_text_segment_index != undefined) {
            
        }

        
        $(document).trigger('mediaAlignedText.highlight_remove', {'text_segment_index': data.current_text_segment_index});
        $(document).trigger('mediaAlignedText.highlight', {'text_segment_index': text_segment_index});

        //set new values for current and then highlight
        data.current_text_segment_index = parseInt(text_segment_index);
        $this.data('mediaAlignedText', data);
    };
    
    /**
     * Highlight a particular text segment
     * 
     * @param jQueryObject     $this    The obect on which the mediaAlignedText has been instantiated
     * @param text_segment_index  integer  The index of the textSegment to be highlighted
     */
    var _textSegmentHighlight = function($this, text_segment_index) {
        $('[data-mat_segment='+text_segment_index+']').addClass('mat_highlighted_text_segment');
        $($this.data('mediaAlignedText').text_viewer_css_selector).scrollTo('.mat_highlighted_text_segment', 250, {'axis': 'y', 'offset': -20});
    };
    
    /**
     * Remove the highlight on a particular text segment
     * 
     * @param jQueryObject     $this   The obect on which the mediaAlignedText has been instantiated
     * @param text_segment_index  integer  The id of the textSegment to have highlighting removed
     */
    var _textSegmentHighlightRemove = function($this, text_segment_index){
        $('[data-mat_segment='+text_segment_index+']').removeClass('mat_highlighted_text_segment');
    };
    
})( jQuery );
