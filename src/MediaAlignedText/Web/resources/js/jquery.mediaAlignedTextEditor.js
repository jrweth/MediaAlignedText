/**
 * jQuery.MediaAlignedText
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
     * - init              Initialize the MediaAlignedText 
     * - charGroupClicked  Handle clicking the CharGroup
     */
    var public_methods = {
        //initialize the MediaAlignedText playback
        'init' : function(options){
            
            //get default options 
            var options = $.extend({
                'json_alignment'            : {},                    //json alignment object
                'viewable_media_segments'   : 5,
                'color_toggle'              : ['#E69F00','#56B4E9', '#009E73', '#F0E442', '#0072B2', '#D55E00', '#CC79A7' ]
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
        
        /**
         * zoom into or out of the time editor
         * 
         * @param zoom_factor number indicating the amount of zoom in or out (>0 for zoom in <0 for zoom in)
         */
        'zoom_time_editor' : function(zoom_factor) {
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
        
        var width = 0;
        var left_offset = 0;
        var text_segment;
        var html = '';
        var count = 0;
        
        for(var i=0; i< text_segment_order.length; i++) {
            text_segment = data.json_alignment_new.text_segments[text_segment_order[i]];
            $('.mat_text_segment_' + text_segment.id).css('background-color', data.color_toggle[count]);
            
            width = Math.round((text_segment.time_end - text_segment.time_start) * data.time_editor_width_per_second);
            left_offset = Math.round(text_segment.time_start * data.time_editor_width_per_second);
            html = html + '<div id="text_segment_'+text_segment_order[i]+'" '
                + 'class="mat_media_file_segment" '
                + 'style="background-color: ' + data.color_toggle[count] + '; ' 
                    + 'width: ' + width +'px; '
                    + 'left: ' + left_offset + 'px;">'
                + text_segment_order[i]+'</div>';
            
            count++;
        }
        $('#mat_timeline').html(html);
    }
    
    
})( jQuery );