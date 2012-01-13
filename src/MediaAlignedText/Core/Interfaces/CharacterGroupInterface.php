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
 * The Text Interface defines the methods necessary for any class representing 
 * the character groups that make up a Text
 * 
 * @author wetherbe
 */
interface CharacterGroupInterface
{
    /**
     * Function to get the text type [WORD, NON_WORD]
     * @return String
     */
    function getCharacterGroupType();
    
    /**
     * Function to return the text characters contained in the character groups
     * @return String
     */
    function getCharacters();
    
    /**
     * Get the order which this character group occurs within it's parent text
     * @return Integer
     */
    function getOrder();
    
    /**
     * Function to retrieve the parent text to which this character text belongs
     * @return TextInterface
     */
    function getParentText();
    
    
    /**
     * Function to set the text type [WORD, NON_WORD]
     * @param String $char_group_type
     */
    function setCharacterGroupType($char_group_type);
    
    /**
     * Function to set the text characters contained in the character groups
     * @param String $characters
     */
    function setCharacters($characters);
    
    /**
     * Set the order which this character group occurs within it's parent text
     * @param Integer $order
     */
    function setOrder($order);
    
    /**
     * Function to set the parent text to which this character text belongs
     * @param TextInterface $text  
     */
    function setParentText(TextInterface $text);
    
}