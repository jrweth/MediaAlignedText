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
     * - outputAlignment      Output the current alignment
     * - pauseManualAlignment Pause the manual alignment that is currently being recorded
     * - playCurrentSemgent   Play the currentlu selected segment via the player
     * - recordManualTime     called when user clicks button to record time
     * - reinitMediaFile      Reinitialize the media file
     * - saveManualAlignment  save the manual alignment that has been recorded
     * - startManualAlignment start the recording for manual alignment
     * - timeSegmentClicked   Handles when user clicks on a particular time segment
     * - updateMedia          Handles changing the Media file referenced
     * - updateSegmentTime    Handles updating the text segment start and end parameters
     * - updateText           Create new text encoded json_alignment based upon passed in text
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
                for (var char_group_order = 0; char_group_order <  char_groups.length; char_group_order++) {
                    var char_group = char_groups[char_group_order];
                    var pre_char_group = char_groups[parseInt(char_group_order) - 1];
                    if(char_group_order == 0
                       || (break_on == 'WORD' && char_group.type == 'WORD')
                       || (break_on == 'LINE' && pre_char_group.chars.indexOf("\n")> -1)
                       || (break_on == 'SENTENCE' && pre_char_group.chars.match(/(\.|\?|!)/))
                       || (break_on == 'PUNCTUATION' && pre_char_group.chars.match(/(\.|\?|!|,|:|-|;)/))
                    ) {
                        segment_count++;
                        //create a new text segment for each element
                        text_segments[segment_count] = {
                                "id": segment_count,
                                "media_file_order":null,
                                "time_start": null,
                                "time_end": null,
                                "text_order": text_order,
                                "character_group_start" : parseInt(char_group_order),
                                "character_group_end" : parseInt(char_group_order)
                            };
                    }
                    else {
                        text_segments[segment_count].character_group_end = parseInt(char_group_order);
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
                'color_toggle'              : ['rgb(198, 230 ,247)', 'rgb(240, 236,180)', 'rgb(181, 247, 229)', 'rgb(255, 212, 179)'], //array of colors to toggle through
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
         * output the json alignment to a div
         */
        'outputAlignment' : function(output_div_id) {
            var $this = $(this);
            //set default output div id
            if(output_div_id == undefined) output_div_id = 'mat_output';
            
            $("#"+output_div_id).html(JSON.stringify($this.data('mediaAlignedText').json_alignment));
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
            _textSegmentRemoveHighlight($this, $this.data('mediaAlignedText').current_text_segment_id);
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
            
            //loop throuh the recorded alingment data and update text_segment data
            for(var text_segment_position in editor_data.manual_text_segment_alignment) {
                var text_segment_position = parseInt(text_segment_position);
                var text_segment_id = data.text_segment_order[text_segment_position];
                var text_segment = data.json_alignment.text_segments[text_segment_id];
                if(text_segment != undefined) {
                    var manual_alignment = editor_data.manual_text_segment_alignment[text_segment_position];
                    var next_manual_alignment = editor_data.manual_text_segment_alignment[text_segment_position+1];
                    var adjusted_time = Math.round((manual_alignment.time_start + 0.05)*100)/100;
                    
                    //add the recorded values
                    text_segment.media_file_order = manual_alignment.media_file_order;
                    text_segment.time_start = manual_alignment.time_start;
                    
                    //if start_time and end_time the same, adjust slightly
                    if (manual_alignment.time_end <= manual_alignment.time_start) {
                        //shift end time later
                        manual_alignment.time_end = adjusted_time;
                        
                        //shift next start time later
                        if(editor_data.manual_text_segment_alignment[text_segment_position+1] != undefined) {
                            editor_data.manual_text_segment_alignment[text_segment_position+1].time_start = adjusted_time;
                        }
                    }
                    
                    //if end time is greater than next start time, adjust next start time to this end time
                    if(next_manual_alignment != undefined) {
                        if(manual_alignment.time_end > next_manual_alignment.time_start) {
                            editor_data.manual_text_segment_alignment[text_segment_position+1].time_start = adjusted_time;
                        }
                    }
                    
                    text_segment.time_end = manual_alignment.time_end;
                    
                    //save back to the data object
                    data.json_alignment.text_segments[text_segment_id] = text_segment;
                }
            }
            
            //save data object for persistence
            $this.data('mediaAlignedText', data);
            
            _initTimeEditor($this);
            
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
            _textSegmentRemoveHighlight($this, $this.data('mediaAlignedText').text_segment_order[editor_data.manual_text_segment_position]-1);
            _textSegmentHighlight($this, text_segment.id);

            $this.data('mediaAlignedTextEditor', editor_data);
            $this.jPlayer('play', time_start);
        },
        
        /**
         * Handles the click of a time segment
         * @param time_segment_div_id
         */
        'timeSegmentClicked' : function(time_segment_div_id) {
            var $this = $(this);
            var data = $this.data('mediaAlignedText');
            var editor_data = $this.data('mediaAlignedTextEditor');
            
            //strip the time_segment_ off of the div id to get the text_segment_id
            var text_segment_id = time_segment_div_id.replace('time_segment_','');
            var text_segment = data.json_alignment.text_segments[text_segment_id];
            
            //spoof clicking the char group
            $this.mediaAlignedText('charGroupClicked', 'char_group_' + text_segment.text_order + '_' + text_segment.character_group_start);
            
            _setTimeSlider($this, text_segment_id);
        },
        
        'updateMedia' : function(media_def, media_order) {
            var $this = $(this);
            var data = $this.data('mediaAlignedText');
            
            //load the media file into the player and load to get the duration
            $this.jPlayer("setMedia", {mp3: media_def.url});
            $this.jPlayer('play', 0);
            $this.jPlayer('pause');
            media_def.duration = $this.data('jPlayer').status.duration;
            
            if(media_order == undefined) media_order = 0;
            
            data.json_alignment.media_files[media_order].media[media_def.file_type] = media_def.url;
            
            $this.data('mediaAlignedText', data);
        },
        
        /**
         * 
         * @param Integer text_segment_id
         * @param Float   time_start
         * @param Float   time_end
         */
        'updateSegmentTime' : function(){
            var $this = $(this);
            var data = $this.data('mediaAlignedText');
            var text_segment = data.json_alignment.text_segments[data.current_text_segment_id];
            var time_start = parseFloat($('#mat_editor_start_time').val());
            var time_end = parseFloat($('#mat_editor_end_time').val());
            var pre_segment = null;
            var post_segment = null;
            
            
            //check to make sure start is after end
            if(time_start >= time_end) {
                alert('The start time must be before the end time for this segment.');
                _setTimeSlider($this, text_segment.id);
                return $this;
            }
            
            //get the preceding segment
            if(text_segment.order > 0) {
                pre_segment = data.json_alignment.text_segments[data.text_segment_order[text_segment.order -1]];
                
                //check to make sure overlap doesn't occur
                if(time_start <= pre_segment.time_start) {
                    alert ('You may not set the start time of the segment before the start time of the preceding segment');
                    return $this;;
                }
            }
            
            //get the following segment
            if(text_segment.order < data.text_segment_order.length - 1) {
                post_segment = data.json_alignment.text_segments[data.text_segment_order[text_segment.order + 1]];
                
                //check to make sure overlap doesn't occur
                if(time_end >= post_segment.time_end) {
                    alert ('You may not set the end time of the segment after the end time of the following segment');
                    return $this;
                }
            }
            
            //update this time segment
            _updateSegmentTime($this, text_segment.id, time_start, time_end);
            
            //update preceding time segment;
            if(pre_segment !== null) {
                _updateSegmentTime($this, pre_segment.id, pre_segment.time_start, time_start);
            }
            
            //update following time segment;
            if(post_segment !== null) {
                _updateSegmentTime($this, post_segment.id, time_end, post_segment.time_end);
            }
         },
         

         /**
          * Create New Text Objects and clear all other groupings
          * 
          * @param title         The Title of the Text
          * @param text_string   The string of the text to be parsed
          * @param text_order    The order that this text comes in the flow of text
          */
         'updateText' : function(title, text_string, text_order) {
             var $this = $(this);
             var data = $this.data('mediaAlignedText');
             
             //set default text order
             if (text_order == undefined) text_order = 0;
             
             var text  = {'title': title, 'character_groups': []};
             
             //split the string on either non word characters or html tags
             //@todo make this a little more sophisticated - check for nonclosed tags etc.
             var text_array = text_string.split(/([^\w'<>]+|<[^<>]+>)/);
             
             //loop through text array and add to text object
             for(var i=0; i < text_array.length; i++) {
                 //search for a tag group
                 if(text_array[i].indexOf('<') > -1) {
                     text.character_groups[i] = {"chars": text_array[i],"type":"TAG"};
                 }
                 //search for words
                 else if (text_array[i].match(/\w/)) {
                     text.character_groups[i] = {"chars": text_array[i],"type":"WORD"};
                 }
                 //must be a non word
                 else {
                     text.character_groups[i] = {"chars": text_array[i],"type":"NON_WORD"};
                 }
             }
             
             data.json_alignment.texts[text_order] = text;
             
             //clear the previous segments
             $this.mediaAlignedTextEditor('clearSegments');
             
             //save the new text back to the object
             $this.data('mediaAlignedText', data);
             
             //refresh display 
             $this.mediaAlignedText('refreshSegments');

             _initTimeEditor($this);
             
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
     * Get the raw text 
     * 
     * @param jQueryObject the self-referential Jquery object to retrive the text from
     * @param text_order   the order of the text to retrieve
     */
    var _getRawText= function($this, text_order) {
        var texts = $this.data('mediaAlignedText').json_alignment.texts;
        if(text_order == undefined) text_order = 0;
        var raw_text = '';
        
        for(i = 0; i < texts[text_order].character_groups.length; i++) {
            raw_text = raw_text + texts[text_order].character_groups[i].chars;
        }
       
        return raw_text;
    }
    
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
        
        if(text_segment.time_start == undefined || text_segment.time_start == null) {
            return '';
        }
        else {
            var width = Math.round((parseFloat(text_segment.time_end) - parseFloat(text_segment.time_start)) * editor_data.time_editor_width_per_second);
            var left_offset = Math.round(parseFloat(text_segment.time_start) * editor_data.time_editor_width_per_second);
    
            return '<div id="time_segment_'+text_segment_id +'" '
                + 'class="mat_time_segment" '
                + 'style="background-color: ' + data.color_toggle[toggle_color_count % 4] + '; ' 
                    + 'width: ' + width +'px; '
                    + 'left: ' + left_offset + 'px; top: 20px;">'
                + data.json_alignment.texts[text_segment.text_order].character_groups[text_segment.character_group_start].chars+'</div>';
        }
    };
    
    /**
     * Iniitalize the form to update the Media File and Text to Align
     */
    var _initFileAndTextLoader = function($this) {
        var data = $this.data('mediaAlignedText');
        
        $('#mat_media_url').val(data.json_alignment.media_files[0].media.mp3);
        $('#mat_media_title').val(data.json_alignment.media_files[0].title);
        $('#mat_media_type').val(data.json_alignment.media_files[0].media_type);
        $('#mat_media_file_type').val(data.json_alignment.media_files[0].media_file_type);
        $('#mat_text_title').val(data.json_alignment.texts[0].title);
        $('#mat_text').val(_getRawText($this,0));
        
    };
    
    /**
     * Initialize the Player
     */
    var _initMediaAlignedTextPlayer = function($this, options) {
        var editor_data = $this.data('mediaAlignedTextEditor');
        
        //initialize the mediaAlignedTextPlayer
        $this.mediaAlignedText(options);
    };
    
    /**
     * Refresh the time editor starting with the first
     */
    var _initTimeEditor = function($this) {
        var editor_data = $this.data('mediaAlignedTextEditor');
        var data = $this.data('mediaAlignedText');
        var text_segment_order = $this.data('mediaAlignedText').text_segment_order;
        
      //@todo make total timespan based upon total media file times not just first one
        editor_data.time_editor_total_duration = data.json_alignment.media_files[0].duration;
        editor_data.time_editor_viewable_timespan = editor_data.viewable_media_segments * editor_data.time_editor_total_duration/text_segment_order.length;
        editor_data.time_editor_width_per_second = $('#mat_time_editor').width() / editor_data.time_editor_viewable_timespan; 

        //set the width of the entire timespan
        $('#mat_timeline').width(Math.round(editor_data.time_editor_total_duration*editor_data.time_editor_width_per_second));
        

        var count = 0;
        var html = '<div id="mat_time_slider"></div>';
        
        for(var i=0; i< text_segment_order.length; i++) {
            
            $('.mat_text_segment_' + text_segment_order[i]).css('background-color', editor_data.color_toggle[count % 4]);
            html = html + _getTimeSegmentHtml($this, text_segment_order[i], count);
            count++;
        }
        $('#mat_timeline').html(html);
        
        //add the click function to the time segments
        $('.mat_time_segment').click(function() {
            $this.mediaAlignedTextEditor('timeSegmentClicked', $(this).attr('id'));
        });
        
        //add the time slider
        $('#mat_time_slider').slider({
            range: true,
            min: 0,
            max: 1,
            values: [0, 1],
            step: 0.01,
            slide: function(event, ui) {
                if(ui.values[0] < ui.values[1]) {
                    $('#mat_editor_start_time').val(ui.values[0]);
                    $('#mat_editor_end_time').val(ui.values[1]);
                    $this.mediaAlignedTextEditor('updateSegmentTime');
                }
            }
        });
        
        $('#mat_time_slider').hide();
        
        _initFileAndTextLoader($this);
    };
    /**
     * set up the time slider to reference the passed in text_segment_id
     */
    var _setTimeSlider = function($this, text_segment_id) {
        var editor_data = $this.data('mediaAlignedTextEditor');
        var data = $this.data('mediaAlignedText');
        
        var text_segment = data.json_alignment.text_segments[text_segment_id];
        
        $('.ui-slider-range').css('background', editor_data.color_toggle[text_segment.order % 4]);
        //get starting time
        if(text_segment.order == 0) {
            var time_start = text_segment.time_start;
        }
        else {
            //set start time to previous time segment + .05
            var time_start = data.json_alignment.text_segments[data.text_segment_order[text_segment.order -1]].time_start + .05;
        }
        
        //get ending time
        if(text_segment.order == data.text_segment_order.length - 1) {
            var time_end = text_segment.time_end;
        }
        else {
            //set start time to previous time segment + .05
            var time_end = data.json_alignment.text_segments[data.text_segment_order[text_segment.order + 1]].time_end - .05;
        }
        
        
        //update the time segments
        var width = Math.round((time_end - time_start) * editor_data.time_editor_width_per_second);
        var left_offset = Math.round(time_start * editor_data.time_editor_width_per_second);
        
        $('#mat_time_slider').css('width', width+'px');
        $('#mat_time_slider').css('left', left_offset+'px');
        $('#mat_time_slider').slider('option',{
                'min': time_start,
                'max': time_end,
                'values': [text_segment.time_start, text_segment.time_end]
        });

        $('#mat_time_slider').show();
    }
    /**
     * Highlight a particular time segment
     * 
     * @param jQueryObject     $this    The obect on which the mediaAlignedText has been instantiated
     * @param time_segment_id  integer  The id of the textSegment to be highlighted
     */
    var _textSegmentHighlight = function($this, text_segment_id) {
        //remove previous highlights
        $('.highlighted_time_segment').removeClass('highlighted_time_segment');
        $('.highlighted_text_segment').removeClass('highlighted_text_segment');
        
        //add the highlight classes 
        $('#time_segment_'+text_segment_id).addClass('highlighted_time_segment');
        $('.mat_text_segment_'+text_segment_id).addClass('highlighted_text_segment');
        
        //scroll to the appropriate spot of the text
        if($('.highlighted_text_segment').length > 0) {
            $('#'+$this.data('mediaAlignedText').text_viewer_id).scrollTo('.highlighted_text_segment', 250, {'axis': 'y', 'offset': -20});
        }
        
        //scroll to the appropriate spot of the time line
        if($('.highlighted_time_segment').length > 0) {
            $('#mat_time_editor').scrollTo('.highlighted_time_segment', 100, {'axis': 'x', 'offset': -200});
        }
        
        //populate the fields for manual entry
        var text_segment = $this.data('mediaAlignedText').json_alignment.text_segments[text_segment_id];
        $('#mat_editor_start_time').val(text_segment.time_start);
        $('#mat_editor_end_time').val(text_segment.time_end);
        
        _setTimeSlider($this, text_segment_id);
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