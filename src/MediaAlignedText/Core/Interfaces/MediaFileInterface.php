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
 * The MediaFile Interface defines the methods necessary for any class representing 
 * the MediaFiles that will be aligned
 * 
 * @author J. Reuben Wetherbee
 */
interface MediaFileInterface
{
    /**
     * Get the file type (e.g. mp3, m4a)
     * @return string
     */
    public function getFileType();
    
    /**
     * Get the media type [AUDIO, VIDEO]
     * @return string
     */
    public function getMediaType();
    
    /**
     * Get the Title
     * @return string
     */
    public function getTitle();
    
    /**
     * Get the URL
     */
    public function getUrl();
    
    /**
     * Set the file type (e.g. mp3, m4a)
     * @param string $file_type
     */
    public function setFileType($file_type);
    
    /**
     * Set the media type [AUDIO, VIDEO]
     * @param unknown_type $media_type
     */
    public function setMediaType($media_type);
    
    /**
     * Set the Title
     * @param string $title
     */
    public function setTitle($title);
    
    /**
     * Set the Url
     * @param string $url
     */
    public function setUrl($url);
    
}