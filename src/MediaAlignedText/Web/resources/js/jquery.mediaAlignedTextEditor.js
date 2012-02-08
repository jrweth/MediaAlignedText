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
     * - init                Initialize the MediaAlignedText
     * - timeSegmentClicked  Handles when user clicks on a particular time segment
     * - updateSegmentTime   Handles updating the text segment start and end parameters
     * - zoomTimeEditor      zoom the time editor in or out
     */
    var public_methods = {
        //initialize the MediaAlignedText playback
        'init' : function(options){
            
            //get default options 
            var options = $.extend({
                'json_alignment'            : {},                    //json alignment object
                'viewable_media_segments'   : 5,
                'color_toggle'              : ['#E69F00','#56B4E9', '#009E73', '#F0E442', '#0072B2', '#D55E00', '#CC79A7' ],
                'highlight_function'        : _textSegmentHighlight, //the function to use to highlight - requires object and text_segment_id as arguments
                'highlight_remove_function' : _textSegmentRemoveHighlight  //function to remove highligh - requires object and text_segment_id as arguments
                }, options);
            
            //save options to the objects namespaced data holder
            var $this = $(this);
            var data = $this.data('mediaAlignedTextEditor');
            
            //if data not yet initialized set here
            if(!data) {
                data = options;
                data.json_alignment_new = options.json_alignment;
                $this.data('mediaAlignedTextEditor', options);
            }
            
            //initialize the order
            _initMediaAlignedTextPlayer($this);
            _initTimeEditor($this);
        },
        
        'timeSegmentClicked' : function(time_segment_id) {
            var $this = $(this);
            var data = $this.data('mediaAlignedTextEditor');
            
            //strip the char_group_ off of the div id to get the text and char group order
            var text_segment_id = time_segment_id.replace('time_segment_','');
            var text_segment = data.json_alignment_new.text_segments[text_segment_id];
            
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
            var time_start = $('#mat_editor_start_time').val();
            var time_end = $('#mat_editor_end_time').val();
            
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
        var data = $this.data('mediaAlignedTextEditor');
        var text_segment = data.json_alignment_new.text_segments[text_segment_id];
        var width = Math.round((text_segment.time_end - text_segment.time_start) * data.time_editor_width_per_second);
        var left_offset = Math.round(text_segment.time_start * data.time_editor_width_per_second);

        return '<div id="time_segment_'+text_segment_id +'" '
            + 'class="mat_time_segment" '
            + 'style="background-color: ' + data.color_toggle[toggle_color_count % 5] + '; ' 
                + 'width: ' + width +'px; '
                + 'left: ' + left_offset + 'px;">'
            + text_segment_id+'</div>';
    };
    
    var _initMediaAlignedTextPlayer = function($this) {
        var data = $this.data('mediaAlignedTextEditor');
        
        //initialize the mediaAlignedTextPlayer
        $this.mediaAlignedText(data);
    }
    
    /**
     * Refresh the time editor starting with the first
     */
    var _initTimeEditor = function($this) {
        var data = $this.data('mediaAlignedTextEditor');
        var text_segment_order = $this.data('mediaAlignedText').text_segment_order;
        
      //@todo make total timespan based upon total media file times not last segment id times
        var last_segment = data.json_alignment_new.text_segments[text_segment_order[text_segment_order.length-1]];
        data.time_editor_total_timespan = last_segment.time_end;
        data.time_editor_viewable_timespan = data.viewable_media_segments * data.time_editor_total_timespan/text_segment_order.length;
        data.time_editor_width_per_second = $('#mat_time_editor').width() / data.time_editor_viewable_timespan; 

        //set the width of the entire timespan
        $('#mat_timeline').width(Math.round(data.time_editor_total_timespan*data.time_editor_width_per_second));
        

        var count = 0;
        var html = '';
        for(var i=0; i< text_segment_order.length; i++) {
            $('.mat_text_segment_' + text_segment_order[i]).css('background-color', data.color_toggle[count % 5]);
            html = html + _getTimeSegmentHtml($this, text_segment_order[i], count);
            count++;
        }
        $('#mat_timeline').html(html);
        
        //add the click function to the words
        $('.mat_time_segment').click(function() {
            $this.mediaAlignedTextEditor('timeSegmentClicked', $(this).attr('id'));
        });
    }
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
        var text_segment = $this.data('mediaAlignedTextEditor').json_alignment_new.text_segments[text_segment_id];
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
        var data = $this.data('mediaAlignedTextEditor');
        
        //update the time segments 
        //@todo data validation
        data.json_alignment_new.text_segments[text_segment_id].time_start = time_start;
        data.json_alignment_new.text_segments[text_segment_id].time_end = time_end;
        
        //update the time segments
        var width = Math.round((time_end - time_start) * data.time_editor_width_per_second);
        var left_offset = Math.round(time_start * data.time_editor_width_per_second);
        
        $('#time_segment_'+text_segment_id).css('width', width+'px');
        $('#time_segment_'+text_segment_id).css('left', left_offset+'px');
        
        $this.data('mediaAlignedTextEditor', data);
        
        //update player to reflect new time
        var player_data = $this.data('mediaAlignedText');
        player_data.json_alignment.text_segments[text_segment_id] = data.json_alignment_new.text_segments[text_segment_id];
        $this.data('mediaAlignedText', player_data);
    }
})( jQuery );