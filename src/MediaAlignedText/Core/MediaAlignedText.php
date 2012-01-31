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

class MediaAlignedText implements Interfaces\MediaAlignedTextInterface
{
    /**
     * The DependencyInjection Container
     * 
     * @var DependencyInjectionContainer
     */
    protected $di_container;
    
    /**
     * The array of MediaFiles used for this alignment
     * @var Array
     */
    protected $media_files;
    
    /**
     * The array of MediaFileSegmenst used for this alignment
     * @var Array
     */
    protected $media_file_segments;
    
    /**
     * Array of ordered Text Objects associated with this Object
     * @var Array
     */
    protected $texts;
    
    /**
     * Array of MediaTextSegmentAlignments that define the alignment between the MediaFileSegments and TextSegments
     * @var Array
     */
    protected $media_text_segment_alignments;
    
    /**
     * Array of TextSegments that split the Texts into alignable segments
     * @var Array
     */
    protected $text_segments;
    
    /**
     * Construct class and set the dependency injection container
     * @param Interfaces\DependencyInjectionContainerInterface $di_container  The DependencyInjectionContainer
     */
    public function __construct(Interfaces\DependencyInjectionContainerInterface $di_container)
    {
        $this->di_container = $di_container;
    }
    
   /**
     * Get the MediaFileSegment Aligned with the supplied TextSegment
     * 
     * @param TextSegmentInterface $text_seg
     * @return MediaFileSegmentInterface
     * @todo implement
     */
    function getAlignedMediaSegFromTextSeg(Interfaces\TextSegmentInterface $text_seg)
    {
        
    }
 
    /**
     * Get the TextSegment Aligned with the supplied MediaFileSegment
     * 
     * @param TextSegmentInterface $text_seg
     * @return TextSegmentInterface
     * @todo implement
     */
    function getAlignedTextSegFromMediaSeg(Interfaces\MediaFileSegmentInteface $media_file_seg)
    {
        
    }
    
    /**
     * Retrieves the combined full texts of all associated texts
     * @return String
     * @todo implement
     */
    function getCombinedFullText()
    {
        
    }
    
    /**
     * Retrieve an collection media files associated with the text
     * @return 
     * @todo implement
     */
    function getMediaFiles() {
        return $this->media_files;
    }
    
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.MediaAlignedTextInterface::getMediaFileSegmentById()
     * @return MediaFileSegment
     */
    function getMediaFileSegmentById($media_file_segment_id)
    {
        //check if the associative array key exists first
        if(array_key_exists($media_file_segment_id, $this->media_file_segments)
            && $this->media_file_segments[$media_file_segment_id]->getId() == $media_file_segment_id)
        {
            return $this->media_file_segments[$media_file_segment_id];
        }
        //otherwise loop through each one and look for it
        foreach((array)$this->media_file_segments as $segment) {
            if($segment->getId() == $media_file_segment_id) return $segment;
        }
        
    }
    
    /**
     * Retrieve a collection of MediaFileSegments
     * 
     * @return Array
     */
    function getMediaFileSegments(){
        return $this->media_file_segments;
    }
    
    function getMediaTextSegmentAlignments()
    {
        return $this->media_text_segment_alignments;
    }
    
    /**
     * Function to return the Text object which is being aligned
     * 
     * @return TextInterface
     * @todo implement
     */
    function getTexts(){
        return $this->texts;
    }
    
    /**
     * (non-PHPdoc)
     * @see MediaAlignedText\Core\Interfaces.MediaAlignedTextInterface::getTextSegmentById()
     * @return TextSegment
     */
    public function getTextSegmentById($text_segment_id)
    {
        //check if the associative array key exists first
        if(array_key_exists($text_segment_id, $this->text_segments)
            && $this->text_segments[$text_segment_id]->getId() == $text_segment_id)
        {
            return $this->text_segments[$text_segment_id];
        }
        //otherwise loop through each one and look for it
        foreach((array)$this->text_segments as $segment) {
            if($segment->getId() == $text_segment_id) return $segment;
        }
        
    }
    
    /**
     * Gets an array of TextSegments that can be aligned with the media segments
     * 
     * @return Array
     */
    function getTextSegments() {
        return $this->text_segments;
    }
    
    /**
     * Function to load the Media Aligned Text from the specified JSON String
     * @param String $json_string
     */
    public function loadFromJson($json_string)
    {
        $this->texts = array();
        
        $data = json_decode($json_string, true);
        
        //Loop through each text
        foreach((array)$data['texts'] as $text_order => $text) {
            
            //create the text object
            $text_object = $this->di_container->getText();
            
            //loop through and instantiate the character groups from the json
            $c_groups = array();
            foreach((array)$text['character_groups'] as $order => $chargroup_def) {
                $c_group = $this->di_container->getCharacterGroup();
                $c_group->setCharacters($chargroup_def['chars']);
                $c_group->setCharacterGroupType($chargroup_def['type']);
                $c_group->setParentText($text_object);
                $c_group->setOrder($order);
                $c_groups[] = $c_group;
            }
            
            //add the character_groups to the text object
            $text_object->setCharacterGroups($c_groups);
            
            $this->texts[] = $text_object;
        }
        
            //loop through and instantiate the MediaFiles
        $this->media_files = array();
        foreach((array)$data['media_files'] as $media_file_order => $media_file_def) {
            $media_file = $this->di_container->getMediaFile();
            $media_file->setTitle($media_file_def['title']);
            $media_file->setUrl($media_file_def['url']);
            $media_file->setFileType($media_file_def['file_type']);
            $media_file->setMediaType($media_file_def['media_type']);
            $this->media_files[] = $media_file;
        }
        
        //loop through and instantiate the TextSegments
        $this->text_segments = array();
        $this->media_file_segments = array();
        $this->media_text_segment_alignments = array();
        $count = 0;
        foreach((array)$data['text_segments'] as $text_segment_id => $segment_def) {
            //set the text segment
            $segment = $this->di_container->getTextSegment();
            $segment->setId($text_segment_id);
            $segment->setParentMediaAlignedText($this);
            
            //loop through to get char_group_orders
            $text_characater_group_orders = array();
            for($i = $segment_def['character_group_start']; $i <= $segment_def['character_group_end']; $i++) {
                $text_characater_group_orders[] = $segment_def['text_order'].'_'.$i;
            }
            $segment->setTextCharacterGroupOrders($text_characater_group_orders);
            $this->text_segments[$segment_def['id']] = $segment;
            
            //add to the media file segments
            $media_file_segment = $this->di_container->getMediaFileSegment();
            $media_file_segment->setId($text_segment_id);
            $media_file_segment->setTimeStart($segment_def['time_start']);
            $media_file_segment->setTimeEnd($segment_def['time_end']);
            $media_file_segment->setMediaFileOrder($count++);
            $media_file_segment->setParentMediaAlignedText($this);
            $this->media_file_segments[$text_segment_id] = $media_file_segment;
            
            //instantiate the MediaTextSegmentAlignments
            $alignment = $this->di_container->getMediaTextSegmentAlignment();
            $alignment->setParentMediaAlignedText($this);
            $alignment->setId($text_segment_id);
            $alignment->setMediaFileSegmentId($text_segment_id);
            $alignment->setTextSegmentId($text_segment_id);
            $this->media_text_segment_alignments[$text_segment_id] = $alignment;
        }
        
    }
}