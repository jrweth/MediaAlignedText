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
                'json_alignment'            : {},                    //json alignment object
                'jplayer_controls_id'       : 'mat_jplayer_controls',//id of the div where jplayer controls reside
                'text_viewer_css_selector'  : '#mat_text_viewer',     //id of the div where the text is displayed
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
                options.jplayer_control_options.title = options.json_alignment.media_files[0].title;
                $('#'+options.jplayer_controls_id).html(_getJplayerContainerHtml(options.jplayer_control_options));
            }
            
            //set the initial media file for the jplayer
            options.jplayer_options.ready = function() {
                $(this).jPlayer("setMedia", options.json_alignment.media_files[0].media);
            };
            
            //initialize all the mappings and components
            _initTextSegments($this);
            _initJplayer($this, options.jplayer_options);
            _initText($this, options.text_viewer_css_selector, options.json_alignment);
            
        },
        
        //handles advancing to the aligned time of media when charGroup div clicked
        'charGroupClicked' : function(char_group_div_id) {
            var $this = $(this);
            var data = $this.data('mediaAlignedText');
            
            //strip the char_group_ off of the div id to get the text and char group order
            var text_char_group_order = char_group_div_id.replace('char_group_','');
            
            //get the text_segment to which this charGroup belongs
            var text_segment_id = data.text_char_group_segment_id_map[text_char_group_order];
            
            if( text_segment_id ) {
                var text_segment = data.json_alignment.text_segments[text_segment_id];
                //go to the place in the media file 
                if($this.data('jPlayer').status.paused) { //if player paused just advance
                    $this.jPlayer('pause', text_segment.time_start);
                    _setCurrentTextSegmentId($this, text_segment_id);
                }
                else { // if player not paused then go to 
                    $this.jPlayer('play', text_segment.time_start);
                }
                

            }
        },
        /**
         * play the media file for just the text segment 
         * @param integer  text_segment_id   Id of the text_segment to be played
         */
        'playTextSegment' : function(text_segment_id) {
            var $this = $(this);
            var text_segment = $this.data('mediaAlignedText').json_alignment.text_segments[text_segment_id];
            $this.jPlayer('play', text_segment.time_start);
            
            var t = setTimeout("$('#jquery_jplayer_1').jPlayer('pause')", 1000*(text_segment.time_end - text_segment.time_start));
        },
        
        'refreshSegments' : function() {
            var $this = $(this);
            var data = $this.data('mediaAlignedText');
            //initialize all the mappings and components
            _initTextCharGroupSegmentIdMap($this);
            _initTextSegmentOrder($this);
            _initText($this, data.text_viewer_css_selector, data.json_alignment);
            
        }
    };
    
    var _checkTimeChange = function($this){
        var data = $this.data('mediaAlignedText');
        var current_time = parseFloat($this.data("jPlayer").status.currentTime);
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
                if(data.current_text_segment_id) data.highlight_remove_function($this, data.current_text_segment_id);
            }
        }
        
        //try to find a new matching media segment
        if(current_text_segment_invalid) {
            //search for new text_segment
            //this needs to be optimized!!!!  shouldn't try to scan whole array each time
            for(var text_segment_id in data.json_alignment.text_segments) {
                
                //set the text_segment var for convenience
                var text_segment = data.json_alignment.text_segments[text_segment_id];
                
                //
                if(text_segment.time_start < current_time && text_segment.time_end > current_time) {
                    
                    data.current_text_segment = text_segment;
                    _setCurrentTextSegmentId($this, text_segment_id);
                    
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
        for(i in $this.data('mediaAlignedText').json_alignment.media_files[0].media) {
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
     * Initialize the text in the text_viewer
     * 
     * @todo clean up the html generation - different char_group_types need some thought 
     * 
     * @param JqueryObject  $this          The jquery object which the mediaAlignedText has been 
     * @param String        text_viewer_css_selector  
     * @param Object        json_alignment  
     */
    var _initText = function ($this, text_viewr_css_selector, json_alignment) {
        var html = '';
        var char_group = null;
        var breakTag = '<br />';
        
        for(var text_order in json_alignment.texts) {
            //enter the text title
            html = html+'<div class="mat_text_title">'+json_alignment.texts[text_order].title+'</div>';
            
            //loop through all the characater groups for this text and add to the html
            for(var char_group_order in json_alignment.texts[text_order].character_groups) {
                char_group = json_alignment.texts[text_order].character_groups[char_group_order];
                
                var text_char_group_order = text_order+'_'+char_group_order;
                var text_segment_id = $this.data('mediaAlignedText').text_char_group_segment_id_map[text_char_group_order];
                var text_segment_class = (text_segment_id ? 'mat_text_segment_'+text_segment_id : '');
                var char_group_id = text_order + '_' + char_group_order;
                
                //for word type characater groups wrap the character in a span tag
                if(char_group.type == 'WORD') {
                    
                    html = html+'<a href="#" id="char_group_' + char_group_id + '"'
                        + ' class="mat_char_group_word '+text_segment_class+'">'
                        + char_group.chars + '</a>';
                }
                //for non-word characater_groups make sure to put in line breaks
                else if(char_group.type == 'NON_WORD') {
                    html = html+'<span class="mat_char_group_non_word '+text_segment_class+'" id="char_group_' + char_group_id + '">'
                        + (char_group.chars + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2')
                        + '</span>';
                }
                
                //for tag character groups, just ouptut the tag
                else if(char_group.type == 'TAG') {
                    html = html+char_group.chars;
                }
            }
        }
        //populate the text in the text viewer
        $(text_viewr_css_selector).html(html);
        
        //add the click function to the words
        $('a.mat_char_group_word').click(function() {
            $this.mediaAlignedText('charGroupClicked', $(this).attr('id'));
            return(false);
        });
    };
    
    
    /**
     * initialize an ordered index of text segments
     * @todo it is assumed the text segments are listed in time order - should be checked
     */
    var _initTextSegments = function($this) {
        var data = $this.data('mediaAlignedText');
        var order = 0;
        var text_segments = {};
        
        $(data.)
        {"id":1,"media_file_order":0,"time_start":0,"time_end":1.3,"text_order":"0","character_group_start":"0","character_group_end":"1","order":0}
        data.text_segment_order = new Array();
        
        
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
     * @param text_segment_id  integer  The id of the textSegment to be highlighted
     */
    var _setCurrentTextSegmentId = function($this, text_segment_id) {
        var data = $this.data('mediaAlignedText');
        
        //if it is already set than do nothing
        if (data.current_text_segment_id == text_segment_id) {
            return true;
        }
        //if current text segment not yet set then simply set it and highlight it
        else if (data.current_text_segment_id == undefined) {
            data.current_text_segment_id = text_segment_id;
            data.highlight_function($this, text_segment_id);
        }
        //must already be set, so unhiglight old one and set new one
        else {
            data.highlight_remove_function($this, data.current_text_segment_id);
            data.current_text_segment_id = text_segment_id;
            data.highlight_function($this, text_segment_id);
        }
    };
    
    /**
     * Highlight a particular text segment
     * 
     * @param jQueryObject     $this    The obect on which the mediaAlignedText has been instantiated
     * @param text_segment_id  integer  The id of the textSegment to be highlighted
     */
    var _textSegmentHighlight = function($this, text_segment_id) {
        $('.mat_text_segment_'+text_segment_id).addClass('highlighted_text_segment');
        $($this.data('mediaAlignedText').text_viewer_css_selector).scrollTo('.highlighted_text_segment', 250, {'axis': 'y', 'offset': -20});
    };
    
    /**
     * Remove the highlight on a particular text segment
     * 
     * @param jQueryObject     $this   The obect on which the mediaAlignedText has been instantiated
     * @param text_segment_id  integer  The id of the textSegment to have highlighting removed
     */
    var _textSegmentRemoveHighlight = function($this, text_segment_id){
        $('.mat_text_segment_'+text_segment_id).removeClass('highlighted_text_segment');
    };
    
})( jQuery );
