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
 * A MediaFileSegment that divide the MediaFiles of a particular MediaAlignedText into segments
 */
class MediaFileSegment implements Interfaces\MediaFileSegmentInterface
{
    
    /**
     * The dependency Injection Container
     * @var Interfaces\DependencyInjectionContainerInterface
     */
    protected $di_container;
    
    /**
     * The id which uniquely identifies this MediaFileSegment from other MediaFileSegments
     * of the same MediaAlignedText
     * 
     * @var Array
     */
    protected $id;
    
    /**
     * The MediaFile which this MediaFileSegment segments
     * @var Interfaces\MediaFileSegmentInterface
     */
    protected $media_file;
    
    /**
     * The order in which the MediaFile which this MediaFileSegment segments in the Overall MediaAlignedText 
     * @var Integer
     */
    protected $media_file_order;
     
    /**
     * The parent MediaAlignedText which this MediaFileSegment is a part of
     * @var Interfaces\MediaAlignedTextInterface
     */
    
    /**
     * The Parent MediaAlignedText
     * @var Interfaces\MediaAlignedText
     */
    protected $parent_media_alinged_text;
    
    /**
     * The time in seconds at which this MediaFileSegments Ends
     * @var Float
     */
    protected $time_end;
    
    /**
     * The time in seconds at which this MediaFileSegment Begins
     * @var Float
     */
    protected $time_start;
    
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
     * @see MediaAlignedText\Core\Interfaces.MediaFileSegmentInterface::getDuration()
     */
    public function getDuration()
    {
        return $this->time_end - $this->time_start;
    }
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.MediaFileSegmentInterface::getId()
     */
    public function getId()
    {
        return $this->id;
    }
    
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.MediaFileSegmentInterface::getMediaFile()
     * @todo implement
     */
    public function getMediaFile()
    {
        
    }
    
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.MediaFileSegmentInterface::getMediaFileOrder()
     */
    public function getMediaFileOrder()
    {
        return $this->media_file_order;
    }
    
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.MediaFileSegmentInterface::getParentMediaAlignedText()
     */
    public function getParentMediaAlignedText()
    {
        return $this->parent_media_alinged_text;
    }
    
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.MediaFileSegmentInterface::getTimeEnd()
     */
    public function getTimeEnd()
    {
        return $this->time_end;
    }
    
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.MediaFileSegmentInterface::getTimeStart()
     */
    public function getTimeStart()
    {
        return $this->time_start;
    }
    
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.MediaFileSegmentInterface::setId()
     */
    public function setId($id)
    {
        $this->id = $id;
    }
    
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.MediaFileSegmentInterface::setMediaFileOrder()
     */
    public function setMediaFileOrder($order)
    {
        $this->media_file_order = $order;
    }
    
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.MediaFileSegmentInterface::setParentMediaAlignedText()
     */
    public function setParentMediaAlignedText(Interfaces\MediaAlignedTextInterface $media_aligned_text)
    {
        $this->parent_media_alinged_text = $media_aligned_text;
    }
    
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.MediaFileSegmentInterface::setTimeEnd()
     */
    public function setTimeEnd($time_end)
    {
        $this->time_end = $time_end;
    }
    
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.MediaFileSegmentInterface::setTimeStart()
     */
    public function setTimeStart($time_start)
    {
        $this->time_start = $time_start;
    }
}