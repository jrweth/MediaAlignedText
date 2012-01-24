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
        
        //handle advancing to the clicked on media file
        'charGroupClicked' : function(word_id) {
            var $this = $(this);
            var data = $this.data('mediaAlignedText');
            var text_char_group_order = word_id.replace('char_group_','');
            var text_segment_id = data.text_char_group_segment_id_map[text_char_group_order];
            
            if( text_segment_id ) {
                var media_segment_id = data.text_media_id_map[text_segment_id];
                if(media_segment_id) {
                    var media_segment = data.json_alignment.media_file_segments[media_segment_id];
                    //go tot the 
                    $this.jPlayer('play', media_segment.time_start);
                }
            }
        }
    };
    
    //initialize the Jplayer
    var _initJplayer = function (object, options) {
        
        var options = $.extend({
              swfPath: 'js',
              supplied: 'mp3'
              //timeupdate: function() {check_time(); }
        }, options);
        
        object.jPlayer(options);
    }
    
    //initialize the text
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
                
                //for word type characater groups wrap the character in a span tag
                if(char_group.type == 'WORD') {
                    html = html+'<span id="char_group_' + text_order + '_'+ char_group_order + '"'
                        + 'class="mat_char_group_word">'
                        + char_group.chars + '</span>';
                }
                //for non-word characater_groups make sure to put in line breaks
                else if(char_group.type == 'NON_WORD') {
                    html = html+(char_group.chars + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
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
    }
    
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
    }
    
    
    var _initTextMediaMaps = function(object){
        var data = object.data('mediaAlignedText');
        var alignments = data.json_alignment.media_text_segment_alignments;

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
    }
    
    /**
     * get the default html for the media player 
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
    }

    var _getTextSegmentIdFromTextCharGroupOrder = function(object, text_char_group_order) {
       
        return data.text_char_group_segment_id_map[text_char_group_order];
    }
    
})( jQuery );