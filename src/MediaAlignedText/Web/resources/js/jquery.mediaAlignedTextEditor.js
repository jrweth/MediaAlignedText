/**
 * jQuery.MediaAlignedTextEditor
 * Copyright (c) 2012 J. Reuben Wetherbee - jreubenwetherbee(at)gmail(dot)com
 * Licensed under MIT
 *
 * @projectDescription Handles the editing of the alignment of MediaFiles along with aligned text
 * 
 * @todo more documentation needed
 */

(function( $ ) {
    
    /**
     * base JQuery function to handle public method calls
     */
    $.fn.mediaAlignedTextEditor = function( method ) {
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
            $.error( 'Method ' +  method + ' does not exist in jQuery.mediaAlignedTextEditor' );
        }
    };
    
    
    /**
     * Define the following public methods
     * - clearSegments        Remove all segment and time alignment
     * - createSegments       Remove all current segments and create new ones based on a given text delimiter
     * - init                 Initialize the MediaAlignedText
     * - pauseManualAlignment Pause the manual alignment that is currently being recorded
     * - playCurrentSemgent   Play the currentlu selected segment via the player
     * - recordManualTime     called when user clicks button to record time
     * - saveManualAlignment  save the manual alignment that has been recorded
     * - startManualAlignment start the recording for manual alignment
     * - timeSegmentClicked   Handles when user clicks on a particular time segment
     * - updateSegmentTime    Handles updating the text segment start and end parameters
     * - zoomTimeEditor       zoom the time editor in or out
     */
    var public_methods = {
        /**
         * Clears the current text segments
         */
        'clearSegments' : function() {
            var $this = $(this);
            var data = $this.data('mediaAlignedText');
            
            data.json_alignment.text_segments = {};
            data.text_char_group_segment_id_map = new Array();
            data.text_segment_order = new Array();
            $this.data('mediaAlignedText', data);
            
            $this.mediaAlignedText('refreshSegments');
            _initTimeEditor($this);
            
        },
        /**
         * split up the text into segments based upon the type of break desired
         * 
         * @param string  break_on   The delimeter on which to split allowed values [WORD]
         */
        'createSegments' : function(break_on) {
            var $this = $(this);
            var data = $this.data('mediaAlignedText');
            $this.mediaAlignedTextEditor('clearSegments');
            var text_segments = {};
            var segment_count = 0;
            
            //loop through the texts 
            for(var text_order in data.json_alignment.texts) {
                var char_groups = data.json_alignment.texts[text_order].character_groups;
                for (var char_group_order in char_groups) {
                    var char_group = char_groups[char_group_order];
 
                    if(char_group.type == 'WORD' || char_group_order == 0) {
                        segment_count++;
                        //create a new text segment for each element
                        text_segments[segment_count] = {
                                "id": segment_count,
                                "media_file_order":null,
                                "time_start": null,
                                "time_end": null,
                                "text_order": text_order,
                                "character_group_start" : char_group_order,
                                "character_group_end" : char_group_order
                            };
                    }
                    else {
                        text_segments[segment_count].character_group_end = char_group_order;
                    }
                }
            }
            
            data.json_alignment.text_segments = text_segments;
            $this.data('mediaAlignedText', data);
            $this.mediaAlignedText('refreshSegments');
            _initTimeEditor($this);
        },
        /**
         * Initialize the editor
         * @param options
         */
        'init' : function(options){
            
            //get default options 
            var options = $.extend({
                'json_alignment'            : {},                    //json alignment object
                'viewable_media_segments'   : 5, //average number of segments viewable on the viewer
                'color_toggle'              : ['rgba(230, 159,0, 0.4)','rgba(86, 180 ,233, 0.4)', 'rgba(0, 158,115, 0.4)', 'rgba(240, 228,66, 0.4)', 'rgba(0, 114,178, 0.4)', '#D55E00', '#CC79A7' ], //array of colors to toggle through
                'highlight_function'        : _textSegmentHighlight, //the function to use to highlight - requires object and text_segment_id as arguments
                'highlight_remove_function' : _textSegmentRemoveHighlight  //function to remove highligh - requires object and text_segment_id as arguments
                }, options);
            
            //save options to the objects namespaced data holder
            var $this = $(this);
            var data = $this.data('mediaAlignedTextEditor');
            
            //if data not yet initialized set here
            if(!data) {
                data = {
                    'viewable_media_segments' : options.viewable_media_segments,
                    'color_toggle' : options.color_toggle,
                    'highlight_function': options.highlight_function,
                    'highlight_remove_function': options.highlight_remove_function
                };
                $this.data('mediaAlignedTextEditor', data);
            }
            
            //initialize the order
            _initMediaAlignedTextPlayer($this, options);
            _initTimeEditor($this);
        },
        /**
         * Pause the manual alignment that is currently being recorded
         */
        'pauseManualAlignment' : function() {
            var $this = $(this);
            var editor_data = $this.data('mediaAlignedTextEditor');
            var current_time = Math.round(parseFloat($this.data("jPlayer").status.currentTime)*100)/100;

            //save the end position for the previous segment
            editor_data.manual_text_segment_alignment[editor_data.manual_text_segment_position].time_end = current_time;
            
            $this.jPlayer('pause');
        },
        
        /**
         * Play the current selected segment
         */
        'playCurrentSegment' : function() {
            var $this = $(this);
            
            $this.mediaAlignedText('playTextSegment', $this.data('mediaAlignedText').current_text_segment_id);
        },
        
        /**
         * Record the manual time for the current text segment and advance to the next one
         */
        'recordManualTime': function() {
            var $this = $(this);
            var editor_data = $this.data('mediaAlignedTextEditor');
            var current_time = Math.round(parseFloat($this.data("jPlayer").status.currentTime)*100)/100;

            //save the end position for the previous segment
            editor_data.manual_text_segment_alignment[editor_data.manual_text_segment_position].time_end = current_time;
            
            //advance position and save the start time
            editor_data.manual_text_segment_position = editor_data.manual_text_segment_position + 1;
            editor_data.manual_text_segment_alignment[editor_data.manual_text_segment_position] = {
                'media_file_order': 0,
                'time_start': current_time
            };

            //unhighlight and highlight the selected word
            _textSegmentRemoveHighlight($this, $this.data('mediaAlignedText').text_segment_order[editor_data.manual_text_segment_position]-1);
            _textSegmentHighlight($this, $this.data('mediaAlignedText').text_segment_order[editor_data.manual_text_segment_position]);
            $this.data('mediaAlignedTextEditor', editor_data);
            
            console.log(current_time+': '+editor_data.manual_text_segment_position);
        },
        
        
        /**
         * Save the manual alignment that has been entered
         */
        'saveManualAlignment' : function() {
            var $this = $(this);
            var data = $this.data('mediaAlignedText');
            var editor_data = $this.data('mediaAlignedTextEditor');
            
            alert(JSON.stringify(editor_data));
            
            //loop throuh the recorded alingment data and update text_segment data
            for(var text_segment_position in editor_data.manual_text_segment_alignment) {
                var text_segment_id = data.text_segment_order[text_segment_position];
                var text_segment = data.json_alignment.text_segments[text_segment_id];
                var manual_alignment = editor_data.manual_text_segment_alignment[text_segment_position];
                //add the recorded values
                text_segment.media_file_order = manual_alignment.media_file_order;
                text_segment.time_start = manual_alignment.time_start;
                
                //if time and end ran into each other adjust by just a bit
                if (manual_alignment.time_end <= manual_alignment.time_start) {
                    //shift end time later
                    manual_alignment.time_end = manual_alignment.time_start + parseFloat('0.05');
                    
                    //shirt next start time later
                    if(editor_data.manual_text_segment_alignment[text_segment_position+1] != undefined) {
                        editor_data.manual_text_segment_alignment[text_segment_position+1].time_start = manual_alignment.time_start + parseFloat('0.05');;
                    }
                }
                text_segment.time_end = manual_alignment.time_end;
                
                //save back to the data object
                data.json_alignment.text_segments[text_segment_id] = text_segment;
            }
            
            //save data object for persistence
            $this.data('mediaAlignedText', data);
            
            _initTimeEditor($this);
            //$("#mat_output").html((JSON.stringify($this.data('mediaAlignedText').json_alignment)));
            $("#mat_output").html((JSON.stringify(editor_data.manual_text_segment_alignment)));
            
        },
        
        /**
         * Start recording manual alignment 
         * 
         * @param text_segment_order_start
         * @param time_start
         * @param media_file_order_start
         */
        'startManualAlignment':  function(text_segment_order_start, time_start, media_file_order_start) {
            var $this = $(this);
            var data = $this.data('mediaAlignedText');
            var editor_data = $this.data('mediaAlignedTextEditor');
            
            //add defaults if not set
            if(time_start == undefined) time_start = 0;
            if(text_segment_order_start == undefined) text_segment_order_start = 0;
            if(media_file_order_start == undefined) media_file_order_start = 0;
            
            //get the first text segment
            var text_segment = data.json_alignment.text_segments[data.text_segment_order[text_segment_order_start]];
            
            //set the editor position
            editor_data.manual_text_segment_position = text_segment_order_start;
            
            editor_data.manual_text_segment_alignment = {};
            editor_data.manual_text_segment_alignment[text_segment_order_start] = {'media_file_order': 0, 'time_start': time_start};
            
            //position the highlight at the first word
            $this.mediaAlignedText('charGroupClicked', 'char_group_'+text_segment.text_order+'_'+text_segment.character_group_start);

            $this.data('mediaAlignedTextEditor', editor_data);
            $this.jPlayer('play', time_start);
        },
        
        /**
         * Handles the click of a time segment
         * @param time_segment_id
         */
        'timeSegmentClicked' : function(time_segment_id) {
            var $this = $(this);
            var data = $this.data('mediaAlignedText');
            
            //strip the char_group_ off of the div id to get the text and char group order
            var text_segment_id = time_segment_id.replace('time_segment_','');
            var text_segment = data.json_alignment.text_segments[text_segment_id];
            
            //spoof clicking the char group
            $this.mediaAlignedText('charGroupClicked', 'char_group_' + text_segment.text_order + '_' + text_segment.character_group_start);
        },
        
        /**
         * 
         * @param Integer text_segment_id
         * @param Float   time_start
         * @param Float   time_end
         */
        'updateSegmentTime' : function(){
            var $this = $(this);
            var text_segment_id = $this.data('mediaAlignedText').current_text_segment_id;
            var time_start = parseFloat($('#mat_editor_start_time').val());
            var time_end = parseFloat($('#mat_editor_end_time').val());
            
            _updateSegmentTime($this, text_segment_id, time_start, time_end);
            
         },
        /**
         * zoom into or out of the time editor
         * 
         * @param zoom_factor number indicating the amount of zoom in or out (>0 for zoom in <0 for zoom in)
         */
        'zoomTimeEditor' : function(zoom_factor) {
            var $this = $(this);
            var data = $this.data('mediaAlignedTextEditor');
            var text_segment_order = $this.data('mediaAlignedText').text_segment_order;
            
            data.viewable_media_segments = Math.ceil(Math.pow(2, zoom_factor)*data.viewable_media_segments);

            //check to make sure haven't zoomed out too far
            if(data.viewable_media_segments > text_segment_order.length) {
                data.viewable_media_segments = text_segment_order.length;
            }
            
            _initTimeEditor($this);
        }
    };
    
    /**
     * get the html for an individual time segment
     * 
     * @param JqueryObject  $this               the JqueryObject to manipulate
     * @param Integer       text_segment_id     the id of the associated text segment
     * @param Integer       toggle_color_count  the count to toggle the background color by
     */
    var _getTimeSegmentHtml= function($this, text_segment_id, toggle_color_count) {
        var data = $this.data('mediaAlignedText');
        var editor_data = $this.data('mediaAlignedTextEditor');
        
        var text_segment = data.json_alignment.text_segments[text_segment_id];
        var width = Math.round((text_segment.time_end - text_segment.time_start) * editor_data.time_editor_width_per_second);
        var left_offset = Math.round(text_segment.time_start * editor_data.time_editor_width_per_second);

        return '<div id="time_segment_'+text_segment_id +'" '
            + 'class="mat_time_segment" '
            + 'style="background-color: ' + data.color_toggle[toggle_color_count % 5] + '; ' 
                + 'width: ' + width +'px; '
                + 'left: ' + left_offset + 'px;">'
            + data.json_alignment.texts[text_segment.text_order].character_groups[text_segment.character_group_start].chars+'</div>';
    };
    
    var _initMediaAlignedTextPlayer = function($this, options) {
        var editor_data = $this.data('mediaAlignedTextEditor');
        
        //initialize the mediaAlignedTextPlayer
        $this.mediaAlignedText(options);
    }
    
    /**
     * Refresh the time editor starting with the first
     */
    var _initTimeEditor = function($this) {
        var editor_data = $this.data('mediaAlignedTextEditor');
        var data = $this.data('mediaAlignedText');
        var text_segment_order = $this.data('mediaAlignedText').text_segment_order;
        
      //@todo make total timespan based upon total media file times not just first one
        editor_data.time_editor_total_timespan = data.json_alignment.media_files[0].length;
        editor_data.time_editor_viewable_timespan = editor_data.viewable_media_segments * editor_data.time_editor_total_timespan/text_segment_order.length;
        editor_data.time_editor_width_per_second = $('#mat_time_editor').width() / editor_data.time_editor_viewable_timespan; 

        //set the width of the entire timespan
        $('#mat_timeline').width(Math.round(editor_data.time_editor_total_timespan*editor_data.time_editor_width_per_second));
        

        var count = 0;
        var html = '';
        
        for(var i=0; i< text_segment_order.length; i++) {
            
            $('.mat_text_segment_' + text_segment_order[i]).css('background-color', editor_data.color_toggle[count % 5]);
            html = html + _getTimeSegmentHtml($this, text_segment_order[i], count);
            count++;
        }
        $('#mat_timeline').html(html);
        
        //add the click function to the words
        $('.mat_time_segment').click(function() {
            $this.mediaAlignedTextEditor('timeSegmentClicked', $(this).attr('id'));
        });
    };
    /**
     * Highlight a particular time segment
     * 
     * @param jQueryObject     $this    The obect on which the mediaAlignedText has been instantiated
     * @param time_segment_id  integer  The id of the textSegment to be highlighted
     */
    var _textSegmentHighlight = function($this, text_segment_id) {
        $('#time_segment_'+text_segment_id).addClass('highlighted_time_segment');
        $('.mat_text_segment_'+text_segment_id).addClass('highlighted_text_segment');
        $('#'+$this.data('mediaAlignedText').text_viewer_id).scrollTo('.highlighted_text_segment', 250, {'axis': 'y', 'offset': -20});
        var text_segment = $this.data('mediaAlignedText').json_alignment.text_segments[text_segment_id];
        $('#mat_editor_start_time').val(text_segment.time_start);
        $('#mat_editor_end_time').val(text_segment.time_end);
    };
    
    /**
     * Remove the highlight on a particular text segment
     * 
     * @param jQueryObject     $this   The obect on which the mediaAlignedText has been instantiated
     * @param time_segment_id  integer  The id of the textSegment to have highlighting removed
     */
    var _textSegmentRemoveHighlight = function($this, text_segment_id){
        $('#time_segment_'+text_segment_id).removeClass('highlighted_time_segment');
        $('.mat_text_segment_'+text_segment_id).removeClass('highlighted_text_segment');
        $('#mat_editor_start_time').val('');
        $('#mat_editor_end_time').val('');
    };
    
    var _updateSegmentTime = function($this, text_segment_id, time_start, time_end) {
        var editor_data = $this.data('mediaAlignedTextEditor');
        var data = $this.data('mediaAlignedText');
        
        //update the time segments 
        //@todo data validation
        data.json_alignment.text_segments[text_segment_id].time_start = time_start;
        data.json_alignment.text_segments[text_segment_id].time_end = time_end;
        
        //update the time segments
        var width = Math.round((time_end - time_start) * editor_data.time_editor_width_per_second);
        var left_offset = Math.round(time_start * editor_data.time_editor_width_per_second);
        
        $('#time_segment_'+text_segment_id).css('width', width+'px');
        $('#time_segment_'+text_segment_id).css('left', left_offset+'px');
        
        $this.data('mediaAlignedText', data);
        
    };
})( jQuery );