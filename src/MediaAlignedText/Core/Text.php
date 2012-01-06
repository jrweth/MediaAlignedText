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

class Text implements Interfaces\TextInterface
{
    /**
     * Get the Character Groups that make up this Text
     * 
     * @todo implement
     * @return Array
     */
    function getCharacterGroups()
    {
        
    }
    
    /**
     * Function to return the full version of the text without any markup
     * 
     * @return String
     */
    function getFullText(){
        $full_text = '';
        foreach($this->getCharacterGroups() as $char_group) {
            $full_text .= $char_group->getCharacters();
        }
        
        return $full_text;
    }
}