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
 * the full text to be aligned with the media
 * 
 * @author wetherbe
 */
interface TextInterface
{
    /**
     * Get the Character Groups that make up this Text
     * 
     * @return Iterator
     */
    function getCharacterGroups();
    
    /**
     * Function to return the full version of the text contained in the character groups
     * 
     * @return String
     */
    function getFullText();
}