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
     * - clearSegments       Remove all segment and time alignment
     * - init                Initialize the MediaAlignedText
     * - timeSegmentClicked  Handles when user clicks on a particular time segment
     * - updateSegmentTime   Handles updating the text segment start and end parameters
     * - zoomTimeEditor      zoom the time editor in or out
     * - createSegments      creates new segments
     * - playCurrentSemgent  play the current segment via the player
     * - recordManualTime     called when user clicks button to record time
     * - startManualAlignment start the recording for manual alignment
     */
    var public_methods = {
            
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
         * @param string  break_on   The delimeter on which to split
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
        //initialize the MediaAlignedText playback
        'init' : function(options){
            
            //get default options 
            var options = $.extend({
                'json_alignment'            : {},                    //json alignment object
                'viewable_media_segments'   : 5, //average number of segments viewable on the viewer
                'color_toggle'              : ['#E69F00','#56B4E9', '#009E73', '#F0E442', '#0072B2', '#D55E00', '#CC79A7' ], //array of colors to toggle through
                'highlight_function'        : _textSegmentHighlight, //the function to use to highlight - requires object and text_segment_id as arguments
                'highlight_remove_function' : _textSegmentRemoveHighlight  //function to remove highligh - requires object and text_segment_id as arguments
                }, options);
            
            //save options to the objects namespaced data holder
            var $this = $(this);
            var data = $this.data('mediaAlignedTextEditor');
            
            //if data not yet initialized set here
            if(!data) {
                data = options;
                data.json_alignment_orig = options.json_alignment;
                $this.data('mediaAlignedTextEditor', options);
            }
            
            //initialize the order
            _initMediaAlignedTextPlayer($this);
            _initTimeEditor($this);
        },
        
        'recordManualTime': function() {
            var $this = $(this);
            var data = $this.data('mediaAlignedText');
            var previous_text_segment_id = data.text_segment_order[data.manual_text_segment_position];
            var text_segment_id = data.text_segment_order[data.manual_text_segment_position+1];
            var current_time = Math.round(parseFloat($this.data("jPlayer").status.currentTime)*100)/100;
            
            //set the end time for the previous segment
            data.json_alignment.text_segments[previous_text_segment_id].time_end = current_time;
            _textSegmentRemoveHighlight($this, previous_text_segment_id);
            
            //get the next text segment
            data.manual_text_segment_position = data.manual_text_segment_position + 1;

            //set the start time for the next text segment
            data.json_alignment.text_segments[text_segment_id].time_start = current_time;
            data.json_alignment.text_segments[text_segment_id].media_file_order = 0;
            
            //highlight the spot
            _textSegmentHighlight($this, text_segment_id);
            $this.data('mediaAlignedText', data);
        },
        
        'pauseManualAlignment' : function() {
            var $this = $(this);
            
            $this.jPlayer('pause');

            _initTimeEditor($this);
            $("#mat_output").html((JSON.stringify($this.data('mediaAlignedText').json_alignment)));
        },
        
        /**
         * Play the current selected segment
         */
        'playCurrentSegment' : function() {
            var $this = $(this);
            
            $this.mediaAlignedText('playTextSegment', $this.data('mediaAlignedText').current_text_segment_id);
        },
        
        'startManualAlignment': function() {
            var $this = $(this);
            var data = $this.data('mediaAlignedText');
            
            data.manual_text_segment_position = 0;
            var text_segment = data.json_alignment.text_segments[data.text_segment_order[0]];
            
            data.json_alignment.text_segments[text_segment.id].media_file_order = 0;
            data.json_alignment.text_segments[text_segment.id].time_start = 0;
            
            //position the highlight at the first word
            $this.mediaAlignedText('charGroupClicked', 'char_group_'+text_segment.text_order+'_'+text_segment.character_group_start);

            $this.data('mediaAlignedText', data);
            $this.jPlayer('play', 0);
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
        'updateSegmentTimeManual' : function(){
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
            + text_segment_id+'</div>';
    };
    
    var _initMediaAlignedTextPlayer = function($this) {
        var editor_data = $this.data('mediaAlignedTextEditor');
        
        //initialize the mediaAlignedTextPlayer
        $this.mediaAlignedText(editor_data);
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