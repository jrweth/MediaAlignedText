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

/**
 * The MediaTextSegmentAlignmentInterface defines the methods necessary for any class representing 
 * the alignment between MediaFileSegments and TextSegments
 * 
 * @author wetherbe
 */
interface MediaTextSegmentAlignmentInterface
{
    /**
     * Get the id uniquely identifying this alignment from other alignments from the same MediaAlignedText
     * @return Integer
     */
    function getId();
    
    /**
     * Get the MediaFileSegment that this alignment is aligning
     * @return MediaFileSegment
     */
    function getMediaFileSegment();
    
    /**
     * Get the ID uniquely identifying the MediaFileSegment which this alignment aligns
     */
    function getMediaFileSegmentId();
    
    /**
     * Function to get parent MediaAlignedText
     * @return MediaAlignedText
     */
    function getParentMediaAlignedText();
    
    /**
     * Get the aligned text segment
     * @return TextSegment
     */
    function getTextSegment();
    
    /**
     * Get the id of the aligned TextSegment
     * @return Integer
     */
    function getTextSegmentId();
    
    /**
     * Set the id for this alignment
     * @param Integer $id  The integer identifying this alignment
     */
    function setId($id);
    
    /**
     * Function to set the id of the aligned MediaFileSegment
     * @param Integer $media_file_segment_id  The integer identifying the aligned MediaFileSegment
     */
    function setMediaFileSegmentId($media_file_segment_id);
    
    /**
     * Function to set parent MediaAlignedText
     * @param MediaAlignedTextInterface $media_aligned_text  the parent MediaAlignedText
     */
    function setParentMediaAlignedText(MediaAlignedTextInterface $media_alinged_text);
    
    /**
     * Function to set the id of the aligned TextSegment
     * @param Integer $text_segment_id 
     */
    function setTextSegmentId($text_segment_id);
}