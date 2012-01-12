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

class DependencyInjectionContainer implements Interfaces\DependencyInjectionContainerInterface
{
    public function getCharacterGroup($params = null)
    {
        return new CharacterGroup($this);
    }
    
    public function getMediaAlignedText($params = null)
    {
        return new MediaAlignedText($this);
    }
    
    public function getText($params = null)
    {
        return new Text($this);
    }
}