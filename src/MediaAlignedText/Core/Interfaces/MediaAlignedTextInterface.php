<?php
/**
* This file is part of the MediaAlignedText package
* 
* (c) J. Reuben Wetherbe <jreubenwetherbee@gmail.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

namespace MediaAlignedText\Core\Interfaces;


/*
 * Inteface for the MediaAlignedText class which is the container
 * that holds the media file, text, and alignment between them
 */
interface MediaAlignedTextInterface
{
    /**
     * Get the MediaFileSegment Aligned with the supplied TextSegment
     * 
     * @param TextSegmentInterface $text_seg
     * @return MediaFileSegmentInterface
     */
    function getAlignedMediaSegFromTextSeg(TextSegmentInterface $text_seg);
 
    /**
     * Get the TextSegment Aligned with the supplied MediaFileSegment
     * 
     * @param TextSegmentInterface $text_seg
     * @return TextSegmentInterface
     */
    function getAlignedTextSegFromMediaSeg(MediaFileSegmentInteface $media_file_seg);
    
    /**
     * Retrieves the combined full texts of all associated texts
     * @return String
     */
    function getCombinedFullText();
    
    /**
     * Retrieve an collection media files associated with the text
     * @return Array
     */
    function getMediaFiles();
    
    /**
     * Retrieve an associated MediaFileSegment by providing the id
     * @param Integer $media_file_segment_id  The id of the MediaFileSegment
     * @return MediaFileSegmentInterface
     */
    function getMediaFileSegmentById($media_file_segment_id);
    
    /**
     * Retrieve a collection of MediaFileSegments
     * 
     * @return Array 
     */
    function getMediaFileSegments();
    
    /**
     * Function to retrieve the alignments between the MediaFileSegments and TextSegments
     * @return Array
     */
    function getMediaTextSegmentAlignments();
    /**
     * Function to return the Text object which is being aligned
     * 
     * @return TextInterface
     */
    function getTexts();
    
    /**
     * Retrieve an associated TextSegment by providing the id
     * @param Integer $text_segment_id  The id of the TextSegment
     * @return TextSegmentInterface
     */
    function getTextSegmentById($text_segment_id);
    
    /**
     * Gets an ordered array TextSegments that are aligned with with the media segments
     * 
     * @return Array
     */
    function getTextSegments();

}