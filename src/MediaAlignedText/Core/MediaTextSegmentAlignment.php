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
 * A CharacterGroup represents a unit of text at the word or white-space delimeter level 
 */
class MediaTextSegmentAlignment implements Interfaces\MediaTextSegmentAlignmentInterface
{
   
    /**
     * The dependency Injection Container
     * @var Interfaces\DependencyInjectionContainerInterface
     */
    protected $di_container;

    /**
     * The Id uniquely identifying this Alignment record
     * @var Integer
     */
    protected $id;
    
    /**
     * The Id uniquely identifying the aligned MediaFileSegment
     * @var Integer
     */
    protected $media_file_segment_id;
    
    /**
     * The Parent MediaAlignedText
     * @var Interfaces\MediaAlignedText
     */
    protected $parent_media_alinged_text;
    
    /**
     * The id uniquely identifying the aligned TextSegment
     * @var Integer
     */
    protected $text_segment_id;
    
    /**
     * Construct class and set the dependency injection container
     * @param Interfaces\DependencyInjectionContainerInterface $di_container  The DependencyInjectionContainer
     */
    public function __construct(Interfaces\DependencyInjectionContainerInterface $di_container)
    {
        $this->di_container = $di_container;
    }
    
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.MediaTextSegmentAlignmentInterface::getId()
     */
    function getId()
    {
        return $this->id;
    }
    
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.MediaTextSegmentAlignmentInterface::getMediaFileSegment()
     * @todo implement
     */
    function getMediaFileSegment()
    {
        
    }
    
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.MediaTextSegmentAlignmentInterface::getMediaFileSegmentId()
     */
    function getMediaFileSegmentId()
    {
        return $this->media_file_segment_id;
    }
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.MediaTextSegmentAlignmentInterface::getParentMediaAlignedText()
     * @return MediaAlignedText
     */
    function getParentMediaAlignedText()
    {
        return $this->parent_media_alinged_text;
    }
    
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.MediaTextSegmentAlignmentInterface::getTextSegment()
     * @return TextSegment
     * @todo implement
     */
    function getTextSegment()
    {
        
    }
    
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.MediaTextSegmentAlignmentInterface::getTextSegmentId()
     * @return Integer
     */
    function getTextSegmentId()
    {
        return $this->text_segment_id;
    }
    
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.MediaTextSegmentAlignmentInterface::setId()
     */
    function setId($id)
    {
        $this->id = $id;
    }
    
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.MediaTextSegmentAlignmentInterface::setMediaFileSegmentId()
     */
    function setMediaFileSegmentId($media_file_segment_id)
    {
        $this->media_file_segment_id = $media_file_segment_id;
    }
    
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.MediaTextSegmentAlignmentInterface::setParentMediaAlignedText()
     */
    function setParentMediaAlignedText(Interfaces\MediaAlignedTextInterface $media_alinged_text)
    {
        $this->parent_media_alinged_text = $media_aligned_text;
    }
    
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.MediaTextSegmentAlignmentInterface::setTextSegmentId()
     */
    function setTextSegmentId($text_segment_id)
    {
        $this->text_segment_id = $text_segment_id;
    }
   
}