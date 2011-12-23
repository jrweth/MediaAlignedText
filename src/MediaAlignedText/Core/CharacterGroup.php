<?php
/**
* This file is part of the MediaAlignedText package
* 
* (c) J. Reuuben Wetherbe <wetherbe@sas.upenn.edu>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

namespace MediaAlignedText\Core;

/**
 * A CharacterGroup represents a unit of text at the word or white-space delimeter level 
 */
class CharacterGroup implements Interfaces\CharacterGroup
{
    /**
     * The character string
     */
    protected $characters;
    
    /**
     * The Order this character occurs in the parent text
     */
    protected $order;
    
    /**
     * The parent text to which this character group belongs
     */
    protected $parent_text;
    
    /**
     * Function to get the text type [WORD, NON_WORD]
     * @return String
     * @todo make meaningful
     */
    public function getCharcterGroupType()
    {
        return 'WORD';
    }
    
    /**
     * Function to return the text characters contained in the character groups
     * @return String
     */
    public function getCharacters()
    {
        return $this->characters;
    }
    
     /**
     * Get the order which this character group occurs within it's parent text
     * @return Integer
     */
    
    public function getOrder() {
        return $this->order;
    }
    
    /**
     * Function to retrieve the parent text to which this character text belongs
     * @return TextInterface
     */
    public function getParentText(){
        return $this->parent_text;
    }
    
    /**
     * Set the order
     * 
     * @param Integer $order  The order this character groups occurs within the parent text
     */
    public function setOrder($order) {
        $this->order = intval($order);
    }
    
    /**
     * Function to set the text characters contained in the character group
     * 
     * @param String $characters  The Characters that make up this character string
     */
    public function setCharacters($characters)
    {
        $this->characters = $characters;
    }
    
    /**
     * Function to retrieve the parent text to which this character text belongs
     * @return TextInterface
     */
    public function setParentText(){
        return $this->parent_text;
    }
    
    /**
     * Function to get the text type [WORD, NON_WORD]
     * @return String
     * @todo make meaningful
     */
    public function setCharacterGroupType()
    {
        return 'WORD';
    }
}