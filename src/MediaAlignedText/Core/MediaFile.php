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
 * A MediaFile represents a file that can be played
 */
class MediaFile implements Interfaces\MediaFileInterface
{
    /**
     * The dependency Injection Container
     * @var Interfaces\DependencyInjectionContainerInterface
     */
    protected $di_container;
    
    /**
     * The file_type (e.g. mp3, m4a)
     * @var string
     */
    protected $file_type;
    
    /**
     * The media type [AUDIO, VIDEO]
     * @var string
     */
    protected $media_type;
    
    /**
     * The title
     * @var string
     */
    protected $title;
    
    /**
     * The url 
     * @var string
     */
    protected $url;
    
    /**
     * Construct class and set the dependency injection container
     * @param Interfaces\DependencyInjectionContainerInterface $di_container  The DependencyInjectionContainer
     */
    public function __construct(Interfaces\DependencyInjectionContainerInterface $di_container)
    {
        $this->di_container = $di_container;
    }
        /**
     * Get the file type (e.g. mp3, m4a)
     * @return string
     */
    public function getFileType()
    {
        return $this->file_type;
    }
    
    /**
     * Get the media type [AUDIO, VIDEO]
     * @return string
     */
    public function getMediaType()
    {
        return $this->media_type;
    }
    
    /**
     * Get the Title
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }
    
    /**
     * Get the URL
     */
    public function getUrl()
    {
        return $this->url;
    }
    
    /**
     * Set the file type (e.g. mp3, m4a)
     * @param string $file_type
     */
    public function setFileType($file_type)
    {
        $this->file_type = $file_type;
    }
    
    /**
     * Set the media type [AUDIO, VIDEO]
     * @param unknown_type $media_type
     */
    public function setMediaType($media_type)
    {
        $this->media_type = $media_type;
    }
    
    /**
     * Set the Title
     * @param string $title
     */
    public function setTitle($title)
    {
        $this->title = $title;
    }
    
    /**
     * Set the Url
     * @param string $url
     */
    public function setUrl($url)
    {
        $this->url = $url;
    }
}