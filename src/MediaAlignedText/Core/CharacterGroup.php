<?php
/**
* This file is part of the MediaAlignedText package
* 
* (c) J. Reuben Wetherbe <wetherbe@sas.upenn.edu>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

namespace MediaAlignedText\Core;

/**
 * A CharacterGroup represents a unit of text at the word or white-space delimeter level 
 */
class CharacterGroup implements Interfaces\CharacterGroupInterface
{
    /**
     * The type of character group this is
     * @var String
     */
    protected $character_group_type;
    
    /**
     * The character string
     * @var String
     */
    protected $characters;
    
    /**
     * The dependency Injection Container
     * @var Interfaces\DependencyInjectionContainerInterface
     */
    protected $di_container;
    
    /**
     * The Order this character occurs in the parent text
     * @var Integer
     */
    protected $order;
    
    /**
     * The parent text to which this character group belongs
     * @var Text
     */
    protected $parent_text;
    
    /**
     * The text type (WORD or NON_WORD)
     * @var String
     */
    protected $text_type;
    
    /**
     * Construct class and set the dependency injection container
     * @param Interfaces\DependencyInjectionContainerInterface $di_container  The DependencyInjectionContainer
     */
    public function __construct(Interfaces\DependencyInjectionContainerInterface $di_container)
    {
        $this->di_container = $di_container;
    }
    
    /**
     * Function to get the text type [WORD, NON_WORD]
     * @return String
     */
    public function getCharacterGroupType()
    {
        return $this->character_group_type;
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
    public function setParentText(Interfaces\TextInterface $parent_text){
        $this->parent_text = $parent_text;
    }
    
    /**
     * Function to set the text type [WORD, NON_WORD]
     * @param String $text_type
     * @todo make meaningful
     */
    public function setCharacterGroupType($word_group_type)
    {
        if(!in_array($word_group_type, array('WORD', 'NON_WORD'))) {
            throw new \Exception('Text type must be of type WORD or NON_WORD');
        };
        $this->character_group_type = $word_group_type;
    }
}