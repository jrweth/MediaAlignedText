<?php
/**
* This file is part of the MediaAlignedText package
* 
* (c) J. Reuben Wetherbe <wetherbe@sas.upenn.edu>
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
     * Get the order which this character group occurs within it's parent text
     * @return Integer
     */
    function getOrder();
    
    /**
     * Function to return the text characters contained in the character groups
     * @return String
     */
    function getCharacters();
    
    /**
     * Function to retrieve the parent text to which this character text belongs
     * @return TextInterface
     */
    function getParentText();
    
    /**
     * Function to get the text type [WORD, NON_WORD]
     * @return String
     */
    function getTextType();
}