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
            $.error( 'Method ' +  method + ' does not exist on jQuery.mediaAlignedText' );
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
                'jplayer_controls_id'       : 'jplayer_controls',  //id of the div where jplayer controls reside
                'text_viewer_id'            : 'text_viewer',       //id of the div where the text is displayed
                'json_alignment'            : {},                  //json alignment object
                'jplayer_options'           : {},                  //jplayer options to initiate
                'jplayer_control_options'   : {},                  //options to send to the jplayer control generator
                'generate_jplayer_controls' : true                 //flag indicating if controls should be generated or not
            }, options);
            
            //save options to the objects namespaced data holder
            var $this = $(this),
                data = $this.data('mediaAlignedText');
            
            if(!data) {
                $(this).data('mediaAlignedText', options);
            }
            
            /**
             * @todo check first to see if the html already exists before creating default
             */
            if(options.generate_jplayer_controls) {
                options.jplayer_control_options.title = options.json_alignment.media_files[0].title;
                $('#'+options.jplayer_controls_id).html(_getJplayerContainerHtml(options.jplayer_control_options));
            }
            
            //set the media file for the jplayer
            options.jplayer_options.ready = function() {
                $(this).jPlayer("setMedia", {
                    mp3: options.json_alignment.media_files[0].url
                  });
            };
            
            //initialize all the mappings and components
            _initTextCharGroupSegmentIdMap($this);
            _initTextMediaMaps($this);
            _initJplayer($this, options.jplayer_options);
            _initText($this, options.text_viewer_id, options.json_alignment);
            
        },
        
        //handles advancing to the aligned time of media when charGroup div clicked
        'charGroupClicked' : function(char_group_id) {
            var $this = $(this);
            var data = $this.data('mediaAlignedText');
            //strip the char_group_ off of the div to get the text and char group order
            var text_char_group_order = char_group_id.replace('char_group_','');
            
            //get the text_segment to which this charGroup belongs
            var text_segment_id = data.text_char_group_segment_id_map[text_char_group_order];
            
            if( text_segment_id ) {
                //set the text_segment as the current one
                _setCurrentTextSegmentId($this, text_segment_id);
                
                //get the corresponding media segment
                var media_segment_id = data.text_media_id_map[text_segment_id];
                if(media_segment_id) {
                    //set the current_media_file_segment
                    data.current_media_file_segment = data.json_alignment.media_file_segments[media_segment_id];
                    
                    //save the change of current_media_file_segment
                    $this.data('mediaAlignedText',data);
                    
                    //go to the place in the media_file_segment
                    if($this.data('jPlayer').status.paused) {
                        $this.jPlayer('pause', data.current_media_file_segment.time_start);
                    }
                    else {
                        $this.jPlayer('play', data.current_media_file_segment.time_start);
                    }
                }
            }
        }
    };
    
    var _checkTimeChange = function(object){
        var data = object.data('mediaAlignedText');
        var current_time = parseFloat(object.data("jPlayer").status.currentTime);
        var current_media_segment_invalid = false;
        
        var current_media_file_segment = data.current_media_file_segment;
        
        //get start/end times for the current_media_file_segment
        if(current_media_file_segment == undefined) {
            current_media_segment_invalid = true;
        }
        else {
            var current_segment_start = parseFloat(current_media_file_segment.time_start);
            var current_segment_end = parseFloat(current_media_file_segment.time_end);
            if(current_time < current_segment_start || current_time > current_segment_end) {
                
                //unset the current_media_file segment if necessary
                data.current_media_file_segment = undefined;
                current_media_segment_invalid = true;
                
                //unset the current text segment to remove highlight
                if(data.current_text_segment_id) _textSegmentRemoveHighlight(object, data.current_text_segment_id);
            }
        }
        
        //try to find a new matching media segment
        if(current_media_segment_invalid) {
            //search for new media_file_segment
            //this needs to be optimized!!!!  shouldn't try to scan whole array each time
            for(var media_segment_id in data.json_alignment.media_file_segments) {
                
                //set the media_file_segment var for convenience
                var media_file_segment = data.json_alignment.media_file_segments[media_segment_id];
                
                //
                if(media_file_segment.time_start < current_time && media_file_segment.time_end > current_time) {
                    
                    data.current_media_file_segment = media_file_segment;
                    var text_segment_id = data.media_text_id_map[media_segment_id];
                    
                    if(text_segment_id) {
                        _setCurrentTextSegmentId(object, text_segment_id);
                    }
                }
            }
        }
        //reset the data 
        object.data('mediaAlignedText', data);
    };
    
    //initialize the Jplayer
    var _initJplayer = function (object, options) {
        
        var options = $.extend({
              swfPath: 'js',
              supplied: 'mp3',
              timeupdate: function() {_checkTimeChange($(this))}
        }, options);
        
        object.jPlayer(options);
    };
    
    /**
     * Initialize the text in the text_viewer
     * 
     * @todo clean up the html generation - different char_group_types need some thought 
     * 
     * @param JqueryObject  object          The jquery object which the mediaAlignedText has been 
     * @param String        text_viewer_id  
     * @param Object        json_alignment  
     */
    var _initText = function (object, text_viewer_id, json_alignment) {
        var html = '';
        var char_group = null;
        var breakTag = '<br />';
        
        for(var text_order in json_alignment.texts) {
            //enter the text title
            html = html+'<div class="text_title">'+json_alignment.texts[text_order].title+'</div>';
            
            //loop through all the characater groups for this text and add to the html
            for(var char_group_order in json_alignment.texts[text_order].character_groups) {
                char_group = json_alignment.texts[text_order].character_groups[char_group_order];
                
                var text_char_group_order = text_order+'_'+char_group_order;
                var text_segment_id = object.data('mediaAlignedText').text_char_group_segment_id_map[text_char_group_order];
                var text_segment_class = (text_segment_id ? 'mat_text_segment_'+text_segment_id : '');
                
                //for word type characater groups wrap the character in a span tag
                if(char_group.type == 'WORD') {
                    
                    html = html+'<span id="char_group_' + text_order + '_'+ char_group_order + '"'
                        + 'class="mat_char_group_word '+text_segment_class+'">'
                        + char_group.chars + '</span>';
                }
                //for non-word characater_groups make sure to put in line breaks
                else if(char_group.type == 'NON_WORD') {
                    html = html+'<span class="'+text_segment_class+'">'+
                        (char_group.chars + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2')+
                        '</span>';
                }
                
                //for tag character groups, just ouptut the tag
                else if(char_group.type == 'TAG') {
                    html = html+char_group.chars;
                }
            }
        }
        //populate the text in the text viewer
        $('#'+text_viewer_id).html(html);
        
        //add the click function to the words
        $('span.mat_char_group_word').click(function() {
            object.mediaAlignedText('charGroupClicked', $(this).attr('id'));
        });
    };
    
    /**
     * initialize the mapping between char groups and text segments
     */
    var _initTextCharGroupSegmentIdMap = function(object){
        var data = object.data('mediaAlignedText');
        var text_segment = null;
        var text_char_group_segment_id_map = {};
        
        //loop through all text segments to look for matches on child char groups
        for(var text_segment_key in data.json_alignment.text_segments) {
            //set the text_segment
            text_segment = data.json_alignment.text_segments[text_segment_key];
            
            //loop through child char groups to find a match
            for (char_group_key in text_segment.text_character_group_orders) {
                text_char_group_segment_id_map[text_segment.text_character_group_orders[char_group_key]] = text_segment.id;
            }
        }
        
        //add the text_char_group map to data object
        data.text_char_group_segment_id_map = text_char_group_segment_id_map;
        
        //reset updated data object
        object.data('mediaAlignedText', data);
    };
    
    /**
     * Initilize the mappings between text segments and media segments
     */
    var _initTextMediaMaps = function(object){
        var data = object.data('mediaAlignedText');
        var alignments = data.json_alignment.media_text_segment_alignments;
        
        //initialize the mapping arrays
        var text_media_id_map = {};
        var media_text_id_map = {};
        
        //loop through all alignments to make map
        for(var alignment_key in alignments) {
            //set the text_segment
            text_media_id_map[alignments[alignment_key].text_segment_id] = alignments[alignment_key].media_file_segment_id;
            media_text_id_map[alignments[alignment_key].media_file_segment_id] = alignments[alignment_key].text_segment_id;
        }
        
        //add the text_char_group map to data object
        data.text_media_id_map = text_media_id_map;
        data.media_text_id_map = media_text_id_map;
        
        //reset updated data object
        object.data('mediaAlignedText', data);
    };
    
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
     * @param jQueryObject     object   The obect on which the mediaAlignedText has been instantiated
     * @param text_segment_id  integer  The id of the textSegment to be highlighted
     */
    var _setCurrentTextSegmentId = function(object, text_segment_id) {
        var data = object.data('mediaAlignedText');
        
        //if it is already set than do nothing
        if (data.current_text_segment_id == text_segment_id) {
            return true;
        }
        //if current text segment not yet set then simply set it and highlight it
        else if (data.current_text_segment_id == undefined) {
            data.current_text_segment_id = text_segment_id;
            _textSegmentHighlight(object, text_segment_id);
        }
        //must already be set, so unhiglight old one and set new one
        else {
            _textSegmentRemoveHighlight(object, data.current_text_segment_id);
            data.current_text_segment_id = text_segment_id;
            _textSegmentHighlight(object, text_segment_id);
        }
    };
    
    /**
     * Highlight a particular text segment
     * 
     * @param jQueryObject     object   The obect on which the mediaAlignedText has been instantiated
     * @param text_segment_id  integer  The id of the textSegment to be highlighted
     */
    var _textSegmentHighlight = function(object, text_segment_id) {
        $('.mat_text_segment_'+text_segment_id).addClass('highlighted_text_segment');
        $('#'+object.data('mediaAlignedText').text_viewer_id).scrollTo('.highlighted_text_segment', 250, {'axis': 'y', 'offset': -20});
    };
    
    /**
     * Remvoe the highlight on a particular text segment
     * 
     * @param jQueryObject     object   The obect on which the mediaAlignedText has been instantiated
     * @param text_segment_id  integer  The id of the textSegment to have highlighting removed
     */
    var _textSegmentRemoveHighlight = function(object, text_segment_id){
        $('.mat_text_segment_'+text_segment_id).removeClass('highlighted_text_segment');
    };
    
})( jQuery );