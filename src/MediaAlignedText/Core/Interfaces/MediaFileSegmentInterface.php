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
     * Function to get parent MediaAlignedText
     * @return MediaAlignedTextInterface
     */
    function getParentMediaAlignedText();
}