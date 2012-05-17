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
     * - clearAlignment       Remove all segment and time alignment
     * - init                 Initialize the MediaAlignedText
     * - outputAlignment      Output the current alignment
     * - pauseManualAlignment Pause the manual alignment that is currently being recorded
     * - playCurrentSegment   Play the currentlu selected segment via the player
     * - recordManualTime     called when user clicks button to record time
     * - saveManualAlignment  save the manual alignment that has been recorded
     * - startManualAlignment start the recording for manual alignment
     * - timeSegmentClicked   Handles when user clicks on a particular time segment
     * - updateSegmentTime    Handles updating the text segment start and end parameters
     * - zoomTimeEditor       zoom the time editor in or out
     */
    var public_methods = {
         'cancelManualAlignment' : function() {
             var $this = $(this);
             var data = $this.data('mediaAlignedText');
             var editor_data = $this.data('mediaAlignedTextEditor');
             
             //reset buttons
             //remove start button
             $(editor_data.editor_css_selector + ' .mat_start_alignment').show();
             $(editor_data.editor_css_selector + ' .mat_pause_alignment').hide();
             $(editor_data.editor_css_selector + ' .mat_resume_alignment').hide();
             $(editor_data.editor_css_selector + ' .mat_record_time').hide();
             $(editor_data.editor_css_selector + ' .mat_save_alignment').hide();
             $(editor_data.editor_css_selector + ' .mat_cancel_alignment').hide();
             

             //move out of editor mode
             data.check_time_disabled = false;
             editor_data.manual_text_segment_alignment = new Array();
             
             //persist data
             $this.data('mediaAlignedText', data);
             $this.data('mediaAlignedTextEditor', editor_data);
         }, 
         /**
          * clears the timing for segments by setting the start_time and end time to -1
          * 
          * @param Integer text_segment_index_start   The index at which to start clearing the alignment (default 0)
          * @param Integer text_segment_index_end     The index at which to stop clearing the alignment (default last index)
          */
        'clearAlignment' : function(text_segment_index_start, text_segment_index_end) {
            //get handles to jQuery object and data
            var $this = $(this);
            var data = $this.data('mediaAlignedText');
            
            //set defaults
            if(text_segment_index_start == undefined) {
                text_segment_index_start = 0;
            }
            
            if(text_segment_index_end == undefined) {
                text_segment_index_end = data.text_segments.length - 1;
            }
            
            for(i = text_segment_index_start; i <= text_segment_index_end; i++) {
                _updateSegmentTime($this, i, -1, -1)
            }
            
            //save data back to the object
            $this.data('mediaAlignedText', data);
            
            //refresh Timeline Editor
            _initTimeEditor($this);
            
            //refresh output
            $this.mediaAlignedTextEditor('outputAlignment');
        }, 
        
        /**
         * Initialize the editor
         * @param options
         */
        'init' : function(options){
            //get $this variable for convenience
            var $this = $(this);
            
            //merge supplied options with default options
            var options = $.extend({
                'media_file_type'           : 'mp3',  //type of media file
                'text_init_type'            : 'WORD', //what to break on (can be WORD, LINE, SENTENCE, STANZA, TAGGED(already tagged)
                'eclosing_tag'              : 'span', // the tag to enclose the text segments in
                'url'                       : '', //url of the media file
                'text'                      : '', //the text to align
                'editor_css_selector'       : '#mat_editor', //css selector for editor
                'generate_editor_html'      : true,  //flag indicating if editor html should be generated or not
                'viewable_media_segments'   : 5, //average number of segments viewable on the viewer
                'color_toggle_classes'      : ['mat_toggle_bg_color_0', 'mat_toggle_bg_color_1', 'mat_toggle_bg_color_2', 'mat_toggle_bg_color_3'], //array of classes to toggle through
                'media_aligned_text_options': {} //options to pass to the mediaAlignedText init function
            }, options);
            
            //merge supplied mediaAlignedText options with default options 
            options.media_aligned_text_options = $.extend({
                'text_viewer_css_selector'  : '#mat_text_viewer',    //id of the div where the text is displayed
                'time_start_attribute'      : 'data-time_start',     //time_start attribute in aligned text
                'time_end_attribute'        : 'data-time_end'       //time_end attribute in aligned text
            }, options.media_aligned_text_options);
            
            //initialize html editor
            if(options.generate_editor_html) {
                $(options.editor_css_selector).html(_getEditorHtml($this, options));
            }
            
            //create the html and enter into the mat_text_viewer 
            if(options.text_init_type == 'TAGGED') {
                var html = options.text;
            }
            else {
                
                switch(options.text_init_type)
                {
                case 'WORD':
                    var pattern = new RegExp(/(\s+)/);
                    break;
                case 'LINE':
                    var pattern = new RegExp(/(\n+)/);
                    break;
                case 'SENTENCE':
                    var pattern = new RegExp(/(\.|\?|!)/);
                    break;
                case 'STANZA':
                    var pattern = new RegExp(/(\n\n+)/);
                    break;
                default:
                    var pattern = new RegExp('(' + options.text_init_type + ')');
                }
                
                //split text on the pattern determined above
                var segments = options.text.split(pattern);
                
                //loop through divided text segments and add enclosing tags and attributes
                var html = '';
                for(i = 0; i < segments.length; i++) {
                    if(i % 2 == 0 && segments[i].match(/\w/)) {
                        html = html + '<' + options.eclosing_tag  + ' ' + options.media_aligned_text_options.time_start_attribute + '="-1">' 
                                + segments[i] 
                                + '</' + options.eclosing_tag + '>~~~END_TAG~~~';
                    }
                    else {
                        html = html + segments[i];
                    }
                }
                
                //change line breaks to br tags
                html = html.replace(/\n/g, "<br />\n");
                html = html.replace(/~~~END_TAG~~~/g, "\n");
                
                //add line endings in for each segment
            }

            //set mat_text_viewer html
            $(options.media_aligned_text_options.text_viewer_css_selector).html(html);
            $(options.editor_css_selector + ' .mat_output').val(html);
            
            //initialize the media file options for the MediaAlignedText player
            var media_files = new Array({'media_type': 'AUDIO', 'media': {}});
            media_files[0].media[options.media_file_type] = options.url;
            options.media_aligned_text_options.media_files = media_files;
            
            //set the on ready and progress event function -- this is to automatically load audio so duration can be found
            options.media_aligned_text_options.jplayer_options = {
                'ready': function() {
                    var $this = $(this);
                    var data = $this.data('mediaAlignedText');
                    $this.jPlayer("setMedia", data.media_files[0].media);
                    $this.jPlayer('play');
                    $this.jPlayer('pause');
                },
                'progress' : function(event) {
                    if(event.jPlayer.status.seekPercent === 100) {
                        _afterLoadInit($this);
                    }
                }
            };
            
            //start the media aligned text stuff
            $this.mediaAlignedText(options.media_aligned_text_options);
            
            //bind the highlight functions to time editor functions\
            $(document).bind('mediaAlignedText.highlight', function(event, parameters) {
                _timeSegmentHighlight($this, parameters.text_segment_index);
            });
            
            //bind the remove_highlight event to the remove_highlight function
            $(document).bind('mediaAlignedText.highlight_remove', function(event, parameters) {
                _timeSegmentHighlightRemove($this, parameters.text_segment_index);
            });
            
            
            //initialize the editor
            $this.data('mediaAlignedTextEditor', options);
            
            _initTimeEditor($this);
            
        },
        
        
        'outputAlignment' : function() {
            var $this = $(this);
            var data = $this.data('mediaAlignedText');
            var editor_data = $this.data('mediaAlignedTextEditor');
            var html = $(data.text_viewer_css_selector).html();
            
            //get rid of mat_segment data 
            html = html.replace(/ data-mat_segment="[0-9]+"/ig,'');
            
            //get rid of mat_text_segment class
            html = html.replace(/mat_text_segment/ig,'');

            //get rid of highlighted segment
            html = html.replace(/mat_highlighted_text_segment/ig,'');
            
            //loop through color toggles and remove
            for(i in editor_data.color_toggle_classes) {
                var re = new RegExp(editor_data.color_toggle_classes[i],"g");
                html = html.replace(re,'');
            }
            
            //remove empty class declarations
            html = html.replace(/ class="\s*"/gi,'');
            
            //make sure br are properly encoded
            html = html.replace(/<br>/g, "<br />");
            
            $(editor_data.editor_css_selector + ' .mat_output').val(html);

        },
        
        /**
         * Pause the manual alignment that is currently being recorded
         */
        'pauseManualAlignment' : function() {
            var $this = $(this);
            var editor_data = $this.data('mediaAlignedTextEditor');
            var current_time = Math.round(parseFloat($this.data("jPlayer").status.currentTime)*100)/100;

            $(editor_data.editor_css_selector + ' .mat_resume_alignment').show();
            $(editor_data.editor_css_selector + ' .mat_save_alignment').show();
            $(editor_data.editor_css_selector + ' .mat_cancel_alignment').show();
            $(editor_data.editor_css_selector + ' .mat_pause_alignment').hide();
            $(editor_data.editor_css_selector + ' .mat_record_time').hide();
            
            //save the end position for the previous segment
            editor_data.manual_text_segment_alignment[editor_data.manual_text_segment_position] = current_time;
            
            
            $this.data('mediaAlignedTextEditor', editor_data);
            
            $this.jPlayer('pause');

            $this.mediaAlignedText('textSegmentClicked', editor_data.manual_text_segment_position);
        },
        
        /**
         * Play the current selected segment
         */
        'playCurrentSegment' : function() {
            var $this = $(this);
            
            $this.mediaAlignedText('playTextSegment', $this.data('mediaAlignedText').current_text_segment_index);
        },
        
        /**
         * Record the manual time for the current text segment and advance to the next one
         */
        'recordManualTime': function() {
            var $this = $(this);
            var editor_data = $this.data('mediaAlignedTextEditor');
            var current_time = Math.round(parseFloat($this.data("jPlayer").status.currentTime*1000));

            //save the end position for the previous segment
            editor_data.manual_text_segment_alignment[editor_data.manual_text_segment_position] = current_time;
            
            //advance position and save the start time
            editor_data.manual_text_segment_position = editor_data.manual_text_segment_position + 1;

            //unhighlight and highlight the selected word
            var previous_text_segment_index = editor_data.manual_text_segment_position - 1;
            $(document).trigger('mediaAlignedText.highlight_remove', {'text_segment_index': previous_text_segment_index});
            $(document).trigger('mediaAlignedText.highlight', {'text_segment_index': editor_data.manual_text_segment_position});
            $this.data('mediaAlignedTextEditor', editor_data);
            
        },
        
        /**
         * Resume recording manual alignment 
         * 
         * @param text_segment_index_start  text_segment on which to start the alignment
         * @param text_segment_index_start  text_segment on which to end the alignment
         * @param time_start
         * @param media_file_order_start
         */
        'resumeManualAlignment':  function() {
            var $this = $(this);
            var editor_data = $this.data('mediaAlignedTextEditor');
            var last_time = editor_data.manual_text_segment_alignment[editor_data.manual_text_segment_alignment.length - 1];
            
            _startRecording($this, editor_data.manual_text_segment_position + 1, last_time);
        },
        
        /**
         * Save the manual alignment that has been entered
         */
        'saveManualAlignment' : function() {
            var $this = $(this);
            var data = $this.data('mediaAlignedText');
            var editor_data = $this.data('mediaAlignedTextEditor');
            
            
            //remove start button
            $(editor_data.editor_css_selector + ' .mat_start_alignment').show();
            $(editor_data.editor_css_selector + ' .mat_pause_alignment').hide();
            $(editor_data.editor_css_selector + ' .mat_resume_alignment').hide();
            $(editor_data.editor_css_selector + ' .mat_record_time').hide();
            $(editor_data.editor_css_selector + ' .mat_save_alignment').hide();
            $(editor_data.editor_css_selector + ' .mat_cancel_alignment').hide();
            
            //get the previous time ending
            var previous_time_end = editor_data.manual_alignment_time_start;
            
            //loop throuh the recorded alignment data and update text_segment data
            for(var text_segment_index in editor_data.manual_text_segment_alignment) {
                var text_segment = data.text_segments[text_segment_index];
                if(text_segment != undefined) {
                    
                    var time_end = editor_data.manual_text_segment_alignment[text_segment_index];
                    if(previous_time_end >= time_end) {
                        time_end = previous_time_end + 100;
                    }
                    
                    //add the recorded values
                    text_segment = {
                        'media_file_order' : 0,
                        'time_start' : previous_time_end,
                        'time_end' : time_end
                    }
                    
                    //save back to the data object
                    data.text_segments[text_segment_index] = text_segment;
                    
                    //update html
                    $(data.text_viewer_css_selector + ' [data-mat_segment=' + text_segment_index + ']')
                        .attr(data.time_start_attribute, text_segment.time_start)
                        .attr(data.time_end_attribute, text_segment.time_end);
                }
                previous_time_end = time_end;
            }
            
            data.check_time_disabled = false;
            //save data object for persistence
            $this.data('mediaAlignedText', data);
            
            _initTimeEditor($this);
            
            $this.mediaAlignedTextEditor('outputAlignment');
        },
        
        /**
         * Start recording manual alignment 
         * 
         * @param text_segment_index_start  text_segment on which to start the alignment
         * @param time_start
         * @param text_segment_index_end  text_segment on which to end the alignment
         * @param media_file_order_start  media file order which alignment should begin in
         */
        'startManualAlignment':  function(text_segment_index_start, time_start, text_segment_index_end, media_file_order_start) {
            var $this = $(this);
            var data = $this.data('mediaAlignedText');
            var editor_data = $this.data('mediaAlignedTextEditor');
            
            //pause the jPlayer if it is playing
            $this.jPlayer('pause');
            
            //set time start default
            if(time_start == undefined) {
                time_start = $this.data('jPlayer').status.currentTime;
            }
            
            //set text segment start default
            if(text_segment_index_start == undefined) {
                if (data.current_text_segment_index == undefined) {
                    text_segment_index_start = 0;
                }
                else {
                    text_segment_index_start = data.current_text_segment_index;
                }
            }
            
            //clear previous alignment
            editor_data.manual_text_segment_alignment = new Array();
            editor_data.manual_alignment_time_start = time_start * 1000;
            
            //persist data
            $this.data('medaiAlignedTextEditor', editor_data);
            
            _startRecording($this, text_segment_index_start, time_start, text_segment_index_end, media_file_order_start);
        },
        
        /**
         * Handles the click of a time segment
         * @param time_segment_div_id
         */
        'timeSegmentClicked' : function(time_segment_div_id) {
            var $this = $(this);
            var data = $this.data('mediaAlignedText');
            var editor_data = $this.data('mediaAlignedTextEditor');
            
            //strip the time_segment_ off of the div id to get the text_segment_index
            var text_segment_index = time_segment_div_id.replace('time_segment_','');
            var text_segment = data.text_segments[text_segment_index];
            
            //spoof clicking the char group
            $this.mediaAlignedText('textSegmentClicked', text_segment_index);
            
        },
        
        /**
         * 
         * @param Integer text_segment_index
         * @param Float   time_start
         * @param Float   time_end
         */
        'updateSegmentTime' : function(){
            var $this = $(this);
            var data = $this.data('mediaAlignedText');
            var text_segment_index = parseFloat(data.current_text_segment_index);
            var text_segment = data.text_segments[data.current_text_segment_index];
            var time_start = parseFloat($('#mat_editor_start_time').val()*1000);
            var time_end = parseFloat($('#mat_editor_end_time').val()*1000);
            var pre_segment = null;
            var post_segment = null;
            
            
            //check to make sure start is after end
            if(time_start >= time_end) {
                alert('The start time must be before the end time for this segment.');
                _setTimeSlider($this, text_segment_index);
                return $this;
            }
            
            //get the preceding segment
            if(text_segment_index > 0) {
                pre_segment = data.text_segments[text_segment_index -1];
                
                //check to make sure overlap doesn't occur
                if(time_start <= pre_segment.time_start) {
                    alert ('You may not set the start time of the segment before the start time of the preceding segment');
                    return $this;;
                }
            }
            
            //get the following segment
            if(text_segment_index < data.text_segments.length - 1) {
                post_segment = data.text_segments[text_segment_index + 1];
                
                //check to make sure overlap doesn't occur
                if(time_end >= post_segment.time_end) {
                    alert ('You may not set the end time of the segment after the end time of the following segment');
                    return $this;
                }
            }
            
            //update this time segment
            _updateSegmentTime($this, text_segment_index, time_start, time_end);
            
            //update preceding time segment;
            if(pre_segment !== null) {
                _updateSegmentTime($this, text_segment_index -1 , pre_segment.time_start, time_start);
            }
            
            //update following time segment;
            if(post_segment !== null) {
                _updateSegmentTime($this, text_segment_index  + 1, time_end, post_segment.time_end);
            }
         },
         

        
         
        /**
         * zoom into or out of the time editor
         * 
         * @param zoom_factor number indicating the amount of zoom in or out (>0 for zoom in <0 for zoom in)
         */
        'zoomTimeEditor' : function(zoom_factor) {
            var $this = $(this);
            var editor_data = $this.data('mediaAlignedTextEditor');
            var data = $this.data('mediaAlignedText');
            
            editor_data.viewable_media_segments = Math.ceil(Math.pow(2, zoom_factor)*editor_data.viewable_media_segments);
            
            //check to make sure haven't zoomed out too far
            if(editor_data.viewable_media_segments > data.text_segments.length) {
                editor_data.viewable_media_segments = data.text_segments.length;
            }
            $this.data('mediaAlingedTextEditor', editor_data);
            
            _initTimeEditor($this);
        }
    };
    
    var _afterLoadInit = function($this) {

        var data = $this.data('mediaAlignedText');
        data.media_files[0].duration = $this.data('jPlayer').status.duration;
        $this.data('mediaAlignedText', data);
        _initTimeEditor($this);

    };
    
    var _getEditorHtml = function($this, options) {
    
        return '<button class="mat_start_alignment" onclick="$(\'#jquery_jplayer_1\').mediaAlignedTextEditor(\'startManualAlignment\')">start recording alignment</button>\
        <button class="mat_resume_alignment" style="display: none" onclick="$(\'#jquery_jplayer_1\').mediaAlignedTextEditor(\'resumeManualAlignment\')">resume recording alignment</button>\
        <button class="mat_record_time" style="display: none" onclick="$(\'#jquery_jplayer_1\').mediaAlignedTextEditor(\'recordManualTime\')">record manual time</button>\
        <button class="mat_pause_alignment" style="display: none" onclick="$(\'#jquery_jplayer_1\').mediaAlignedTextEditor(\'pauseManualAlignment\')">pause recording alignment</button>\
        <button class="mat_save_alignment" style="display: none" onclick="$(\'#jquery_jplayer_1\').mediaAlignedTextEditor(\'saveManualAlignment\')">save new alignment</button>\
        <button class="mat_cancel_alignment" style="display: none" onclick="$(\'#jquery_jplayer_1\').mediaAlignedTextEditor(\'cancelManualAlignment\')">cancel changes to alignment</button>\
        \
        <div id="mat_text_viewer"></div>\
        \
        <h3>Timeline</h3>\
        <div>\
            <a href="#" onclick="$(\'#jquery_jplayer_1\').mediaAlignedTextEditor(\'zoomTimeEditor\', -1)">zoom in</a>&nbsp;&nbsp;\
            <a href="#" onclick="$(\'#jquery_jplayer_1\').mediaAlignedTextEditor(\'zoomTimeEditor\', 1)">zoom out</a>\
        </div>\
        <div id="mat_time_editor" style="overflow: auto">\
            <div id="mat_timeline">\
                <div id="mat_time_slider"></div>\
            </div>\
        </div>\
        \
        <div id="mat_manual_editor">\
            start time: <input type="text" id="mat_editor_start_time" size="5"/>\
            end time: <input type="text" id="mat_editor_end_time" size="5"/>\
            <button onclick="$(\'#jquery_jplayer_1\').mediaAlignedTextEditor(\'updateSegmentTime\');">update time</button>\
            <button onclick="$(\'#jquery_jplayer_1\').mediaAlignedTextEditor(\'playCurrentSegment\');">play segment</button>\
        </div>\
        \
        <h3>HTML Alignment</h3>\
        \
        <button onclick="$(\'#jquery_jplayer_1\').mediaAlignedTextEditor(\'clearAlignment\')">clear all timing</button>&nbsp;&nbsp;\
        <a href="#" onclick="\
            $(\'#jquery_jplayer_1\').mediaAlignedTextEditor(\'outputAlignment\');\
            window.prompt (\'Copy to clipboard: Press Ctrl+C then Enter/Return\', $(\'.mat_output\').val());\
            return false;\
            "\
        >copy</a>\
        <br /><textarea disabled="disabled" class="mat_output" rows="10" cols="50"></textarea>';

    };
    
    /**
     * get the html for an individual time segment
     * 
     * @param JqueryObject  $this               the JqueryObject to manipulate
     * @param Integer       text_segment_index     the id of the associated text segment
     * @param Integer       toggle_color_count  the count to toggle the background color by
     */
    var _getTimeSegmentHtml= function($this, text_segment_index, toggle_color_count) {
        var data = $this.data('mediaAlignedText');
        var editor_data = $this.data('mediaAlignedTextEditor');
        var text_segment = data.text_segments[text_segment_index];
        
        if(text_segment.time_start == undefined || text_segment.time_start == null) {
            return '';
        }
        else {
            var width = Math.round((parseFloat(text_segment.time_end) - parseFloat(text_segment.time_start)) * editor_data.time_editor_width_per_milisecond);
            var left_offset = Math.round(parseFloat(text_segment.time_start) * editor_data.time_editor_width_per_milisecond);
    
            return '<div id="time_segment_'+text_segment_index +'" '
                + 'class="mat_time_segment ' + editor_data.color_toggle_classes[toggle_color_count % 4] + '" '
                + 'style = "width: ' + width +'px; left: ' + left_offset + 'px; top: 20px;">'
                + $(data.text_viewer_css_selector + ' [data-mat_segment='+text_segment_index+']').html() + '</div>';
        }
    };
    
    /**
     * Refresh the time editor starting with the first
     */
    var _initTimeEditor = function($this) {

        var editor_data = $this.data('mediaAlignedTextEditor');
        var data = $this.data('mediaAlignedText');
        var text_segments = $this.data('mediaAlignedText').text_segments;

        if(data.media_files[0] == undefined) return false;
        
      //@todo make total timespan based upon total media file times not just first one
        editor_data.time_editor_total_duration = data.media_files[0].duration * 1000;
        editor_data.time_editor_viewable_timespan = editor_data.viewable_media_segments * editor_data.time_editor_total_duration/text_segments.length;
        editor_data.time_editor_width_per_milisecond = $('#mat_time_editor').width() / editor_data.time_editor_viewable_timespan; 

        //set the width of the entire timespan
        $('#mat_timeline').width(Math.round(editor_data.time_editor_total_duration*editor_data.time_editor_width_per_milisecond));
        

        var count = 0;
        var html = '<div id="mat_time_slider"></div>';
        
        for(var i in text_segments) {
            
            $('[data-mat_segment=' + i +']').addClass(editor_data.color_toggle_classes[count % 4]);
            html = html + _getTimeSegmentHtml($this, i, count);
            count++;
        }
       
        $('#mat_timeline').html(html);
        
        //add the click function to the time segments
        $('#mat_timeline').on(
            'click.mediaAlignedTextEditor',
            '.mat_time_segment',
            {'parent' : $this},
            function(event) {
                event.data.parent.mediaAlignedTextEditor('timeSegmentClicked', $(this).attr('id'));
        });
        
        //add the time slider
        $('#mat_time_slider').slider({
            range: true,
            min: 0,
            max: 1,
            values: [0, 1],
            step: .01,
            slide: function(event, ui) {
                if(ui.values[0] < ui.values[1]) {
                    $('#mat_editor_start_time').val(ui.values[0]);
                    $('#mat_editor_end_time').val(ui.values[1]);
                    $this.mediaAlignedTextEditor('updateSegmentTime');
                }
            }
        });
        
        $('#mat_time_slider').hide();
        
        
    };
    /**
     * set up the time slider to reference the passed in text_segment_index
     */
    var _setTimeSlider = function($this, text_segment_index) {
        var editor_data = $this.data('mediaAlignedTextEditor');
        var data = $this.data('mediaAlignedText');
        
        var text_segment = data.text_segments[text_segment_index];
        
        if(text_segment == undefined) return false;
       
        //get starting time
        if(text_segment_index == 0) {
            var time_start = text_segment.time_start/1000;
        }
        else {
            //set start time to previous time segment + 50
            var time_start = data.text_segments[text_segment_index - 1].time_start/1000 + .05;
        }
        
        //get ending time
        if(text_segment_index == data.text_segments.length - 1) {
            var time_end = text_segment.time_end/1000;
        }
        else {
            //set start time to previous time segment - 50
            var time_end = data.text_segments[text_segment_index + 1].time_end/1000 - .05;
        }
        
        
        //update the time segments
        var width = Math.round((time_end - time_start) * editor_data.time_editor_width_per_milisecond * 1000);
        var left_offset = Math.round(time_start * editor_data.time_editor_width_per_milisecond * 1000);
        
        $('#mat_time_slider').css('width', width+'px');
        $('#mat_time_slider').css('left', left_offset+'px');
        $('#mat_time_slider').slider('option',{
                'min': time_start,
                'max': time_end,
                'values': [text_segment.time_start/1000, text_segment.time_end/1000]
        });

        $('#mat_time_slider').show();
    }
    
    /**
     * Function to set up the recording
     * 
     * @param jQueryObject  $this                      The jQuery object which the MediaAlignedTextEditor is configured on
     * @param Integer       text_segment_index_start   The index to start recording the time
     * @param Float         time_start                 The time in seconds where the recording should start
     * @param Integer       text_segment_index_end     The index when recording should automatically stop - defaults to last text_segment
     * @param Integer       media_file_order_start     The order of the media file to begin (usually 0 unless using playlist)
     */
    var _startRecording = function($this, text_segment_index_start, time_start, text_segment_index_end, media_file_order_start) {
        //initialize data object
        var data = $this.data('mediaAlignedText');
        var editor_data = $this.data('mediaAlignedTextEditor');
        
        //set defaults
        if(text_segment_index_end == undefined) text_segment_index_end = data.text_segments.length - 1;
        if(media_file_order_start == undefined) media_file_order_start = 0;
        
        //show and hide the correct buttons
        $(editor_data.editor_css_selector + ' .mat_record_time').show();
        $(editor_data.editor_css_selector + ' .mat_pause_alignment').show();
        $(editor_data.editor_css_selector + ' .mat_start_alignment').hide();
        $(editor_data.editor_css_selector + ' .mat_resume_alignment').hide();
        $(editor_data.editor_css_selector + ' .mat_save_alignment').hide();
        $(editor_data.editor_css_selector + ' .mat_cancel_alignment').hide();
        
        //set the editor position
        editor_data.manual_text_segment_position = parseInt(text_segment_index_start);
        editor_data.manual_text_segment_index_end = parseInt(text_segment_index_end);
        
        //set up manual alignment array if necessary
        if(editor_data.manual_text_segment_alignment == undefined) {
            editor_data.manual_text_segment_alignment = new Array();
        }
        
        //position the highlight at the first word
        $(document).trigger('mediaAlignedText.highlight', {'text_segment_index' : text_segment_index_start}); 
        
        //save data objects
        $this.data('mediaAlignedTextEditor', editor_data);
        data.check_time_disabled = true;
        $this.data('mediaAlignedText', data);
        
        //begin playing and recording
        alert('After clicking OK, the audio will begin in 1 second. To track the text along with the audio simply click the "record manual time" button.');
        var t = setTimeout(function () {$this.jPlayer('play', time_start);}, 1000);
        
        //set focus on recording
        $(editor_data.editor_css_selector + ' .mat_record_time').focus();
    };
    
    /**
     * Highlight a particular time segment
     * 
     * @param jQueryObject     $this    The obect on which the mediaAlignedText has been instantiated
     * @param time_segment_id  integer  The id of the textSegment to be highlighted
     */
    var _timeSegmentHighlight = function($this, text_segment_index) {
        
        
        //add the highlight classes 
        $('#time_segment_'+text_segment_index).addClass('mat_highlighted_time_segment');
        
        //scroll to the appropriate spot of the time line
        if($('.mat_highlighted_time_segment').length > 0) {
            $('#mat_time_editor').scrollTo('.mat_highlighted_time_segment', 100, {'axis': 'x', 'offset': -200});
        }
        
        //populate the fields for manual entry
        var text_segment = $this.data('mediaAlignedText').text_segments[text_segment_index];
        
        ///could be recording
        if(text_segment != undefined) {
            $('#mat_editor_start_time').val(text_segment.time_start/1000);
            $('#mat_editor_end_time').val(text_segment.time_end/1000);
            _setTimeSlider($this, parseFloat(text_segment_index));
        }
    
        
    };
    
    /**
     * Remove the highlight on a particular text segment
     * 
     * @param jQueryObject     $this   The obect on which the mediaAlignedText has been instantiated
     * @param text_segment_index  integer  The id of the textSegment to have highlighting removed
     */
    var _timeSegmentHighlightRemove = function($this, text_segment_index){
        $('#time_segment_'+text_segment_index).removeClass('mat_highlighted_time_segment');
    };
    
    /**
     * time_start integer   time in miliseconds that the text segment should start
     * time_end   integer   time in miliseconds that the text segment should stop
     */
    var _updateSegmentTime = function($this, text_segment_index, time_start, time_end) {
        var editor_data = $this.data('mediaAlignedTextEditor');
        var data = $this.data('mediaAlignedText');
        
        //update the time segments 
        //@todo data validation
        data.text_segments[text_segment_index].time_start = parseFloat(time_start);
        data.text_segments[text_segment_index].time_end = parseFloat(time_end);
        
        //update the html
        $('[data-mat_segment="' + text_segment_index + '"]').attr(data.time_start_attribute, time_start);
        $('[data-mat_segment="' + text_segment_index + '"]').attr(data.time_end_attribute, time_end);
        
        //update the time segments
        var width = Math.round((time_end - time_start) * editor_data.time_editor_width_per_milisecond);
        var left_offset = Math.round(time_start * editor_data.time_editor_width_per_milisecond);
        
        $('#time_segment_'+text_segment_index).css('width', width+'px');
        $('#time_segment_'+text_segment_index).css('left', left_offset+'px');
        
        $this.data('mediaAlignedText', data);
        
    };
})( jQuery );
