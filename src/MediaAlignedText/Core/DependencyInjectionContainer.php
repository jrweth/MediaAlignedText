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
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.DependencyInjectionContainerInterface::getCharacterGroup()
     * @return CharacterGroup
     */
    public function getCharacterGroup($params = null)
    {
        return new CharacterGroup($this);
    }
    
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.DependencyInjectionContainerInterface::getMediaAlignedText()
     * @return MediaAlignedText
     */
    public function getMediaAlignedText($params = null)
    {
        return new MediaAlignedText($this);
    }
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.DependencyInjectionContainerInterface::getMediaFile()
     * @return MediaFile
     */
    public function getMediaFile($params = null)
    {
        return new MediaFile($this);
    }
    
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.DependencyInjectionContainerInterface::getMediaFileSegment()
     * @return MediaFileSegment
     */
    public function getMediaFileSegment($params = null)
    {
        return new MediaFileSegment($this);
    }
    
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.DependencyInjectionContainerInterface::getText()
     * @return Text
     */
    public function getText($params = null)
    {
        return new Text($this);
    }
    
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.DependencyInjectionContainerInterface::getTextSegment()
     * @return TextSegment
     */
    public function getTextSegment($params = null)
    {
        return new TextSegment($this);
    }
}