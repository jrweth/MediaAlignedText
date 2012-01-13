<?php
/**
* This file is part of the MediaAlignedText package
* 
* (c) J. Reuben Wetherbe <jreubenwetherbee@gmail.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

namespace MediaAlignedText\Core;

/**
 * A TextSegment represents a collection of Character Groups that 
 */
class TextSegment implements Interfaces\TextSegmentInterface
{
    /**
     * The type of character group this is
     * @var String
     */
    protected $character_group_type;
    
    /**
     * The dependency Injection Container
     * @var Interfaces\DependencyInjectionContainerInterface
     */
    protected $di_container;
    
    /**
     * The id which uniquely identifies this text segment from other TextSegmenst
     * of the same MediaAlignedText
     * 
     * @var Array
     */
    protected $id;
    
    /**
     * Enter description here ...
     * @var Interfaces\MediaAlignedTextInterafce
     */
    protected $parent_media_alinged_text;
    
    /**
     * The text and character group orders identifying the character groups in this segment
     * @var Array
     */
    protected $text_character_group_orders;
   
    /**
     * Construct class and set the dependency injection container
     * @param Interfaces\DependencyInjectionContainerInterface $di_container  The DependencyInjectionContainer
     */
    public function __construct(Interfaces\DependencyInjectionContainerInterface $di_container)
    {
        $this->di_container = $di_container;
    }
    
    /**
     * Get the id which uniquely identifies this text segment from other TextSegmenst
     * of the same MediaAlignedText
     * @return Integer
     */
    function getId()
    {
        return $this->id;
    }
    
    /**
     * Function to return the CharacterGroups that Compose this TextSegment
     * @return Array
     * @todo implement
     */
    function getCharacterGroups()
    {
        
    }
    
    /**
     * Function to get parent MediaAlignedText
     * 
     * @return Interfaces\MediaAlignedTextInterface
     */
    function getParentMediaAlignedText()
    {
        return $this->parent_media_alinged_text;
    }
    
    /**
     * Function to retrieve an array of the composite character text and character group orders
     * 
     * e.g. if the TextSegment encompasses the 4th to 9th characater groups of the first text the 
     * array would be [0.3, 0.4, 0.5, 0.6, 0.7, 0.8]
     * @return Array
     */
    function getTextCharacterGroupOrders()
    {
        return $this->text_character_group_orders;
    }
    
    
    /**
     * Set the id which uniquely identifies this text segment from other TextSegmenst
     * of the same MediaAlignedText
     * 
     * @param Integer $id
     */
    function setId($id)
    {
        $this->id = $id;
    }
    
    
    /**
     * Function to set an array of the composite character text and character group orders for this segment
     * 
     * e.g. if the TextSegment encompasses the 4th to 12th characater groups of the first text the 
     * array would be [0_3, 0_4, 0_5, 0_6, 0_7, 0_8, 0_9, 0_10, 0_11]
     * @param array $text_character_group_orders
     */
    function setTextCharacterGroupOrders($text_character_group_orders)
    {
        $this->text_character_group_orders = $text_character_group_orders;
    }
    
    /**
     * Function to set the Parent MediaAlignedText
     * @param MediaAlignedTextInterface $media_aligned_text
     */
    function setParentMediaAlignedText(Interfaces\MediaAlignedTextInterface $media_aligned_text)
    {
        $this->parent_media_alinged_text = $media_aligned_text;
    }
}