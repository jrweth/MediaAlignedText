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
 * The TextSegments Interface defines the methods necessary for any class representing 
 * the TextSegments (made up of 1 or more character groups) that can be aligned 
 * 
 * @author J. Reuben Wetherbee
 */
interface TextSegmentInterface
{
    /**
     * Get the id which uniquely identifies this text segment from other TextSegmenst
     * of the same MediaAlignedText
     * @return Integer
     */
    function getId();
    
    /**
     * Function to return the CharacterGroups that Compose this TextSegment
     * @return Array
     */
    function getCharacterGroups();
    
    /**
     * Function to get parent MediaAlignedText
     * @return MediaAlignedTextInterface
     */
    function getParentMediaAlignedText();
    
    /**
     * Function to retrieve an array of the composite character text and character group orders
     * 
     * e.g. if the TextSegment encompasses the 4th to 9th characater groups of the first text the 
     * array would be [0.3, 0.4, 0.5, 0.6, 0.7, 0.8]
     * @return Array
     */
    function getTextCharacterGroupOrders();
    
    
    /**
     * Set the id which uniquely identifies this text segment from other TextSegmenst
     * of the same MediaAlignedText
     * @param Integer $id
     */
    function setId($id);
    
    
    /**
     * Function to set an array of the composite character text and character group orders for this segment
     * 
     * e.g. if the TextSegment encompasses the 4th to 12th characater groups of the first text the 
     * array would be [0_3, 0_4, 0_5, 0_6, 0_7, 0_8, 0_9, 0_10, 0_11]
     * @param array $text_character_group_orders
     */
    function setTextCharacterGroupOrders($text_character_group_orders);
    
    /**
     * Function to set the Parent MediaAlignedText
     * @param MediaAlignedTextInterface $media_aligned_text
     */
    function setParentMediaAlignedText(MediaAlignedTextInterface $media_aligned_text);
}