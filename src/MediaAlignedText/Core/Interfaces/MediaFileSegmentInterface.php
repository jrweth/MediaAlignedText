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
 * The MediaFileSegment Interface defines the methods necessary for any class representing 
 * the MediaFileSegment that divide the MediaFiles of a particular MediaAlignedText into segments
 * 
 * @author J. Reuben Wetherbee
 */
interface MediaFileSegmentInterface
{
    /**
     * Get the duration in seconds of this MediaFileSegment
     * @return Float
     */
    function getDuration();
    
    /**
     * Get the id which uniquely identifies this MediaFileSegment from other MediaFileSegments
     * of the same MediaAlignedText
     * @return Integer
     */
    function getId();
    
    /**
     * Get the MediaFile object which this segment is a part of
     * @return MediaFileInterface
     */
    function getMediaFile();
    
    /**
     * Get the order of the MediaFile within in the MediaAlignedText which this MediaFileSegment is a part of
     * @return Integer
     */
    function getMediaFileOrder();
    
    /**
     * Function to get parent MediaAlignedText
     * @return MediaAlignedTextInterface
     */
    function getParentMediaAlignedText();
    
    /**
     * Get the time within the MediaFile that this segment ends
     * @return Float
     */
    function getTimeEnd();
    
    /**
     * Get the time within the MediaFile that this segment starts
     * @return Float
     */
    function getTimeStart();
    
    /**
     * Set the id which uniquely identifies this MediaFileSegment from other MediaFileSegments
     * of the same MediaAlignedText
     * @param Integer $id  The Id of the MediaFileSegment
     */
    function setId($id);
    
    
    /**
     * Set the order of the MediaFile within in the MediaAlignedText which this MediaFileSegment is a part of
     * @param Integer $order  The order which the parent MediaFile comes within the MediaAlignedText
     */
    function setMediaFileOrder($order);
    
    /**
     * Function to set parent MediaAlignedText
     * @param Interfaces\MediaAlignedTextInterface $media_aligned_text  the parent MediaAlignedText
     */
    function setParentMediaAlignedText(MediaAlignedTextInterface $media_alinged_text);
    
    /**
     * Set the time within the MediaFile that this segment ends
     * @param Float $time_end  The time in seconds when the MediaFileSegment ends
     */
    function setTimeEnd($time_end);
    
    /**
     * Set the time within the MediaFile that this segment starts
     * @param Float $time_start  the time in seconds when the MediaFileSegment starts
     */
    function setTimeStart($time_start);
}