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

class MediaAlignedText implements Interfaces\MediaAlignedTextInterface
{
    /**
     * The DependencyInjection Container
     * 
     * @var Interfaces\DependencyInjectionContainerInterface
     */
    protected $di_container;
    /**
     * Array of ordered Text Objects associated with this Object
     * @var Array
     */
    protected $texts;
    
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
        
    }
    
    /**
     * Retrieve a collection of MediaFileSegments
     * 
     * @return Array
     * @todo implement
     */
    function getMediaFileSegments(){
        
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
     * Gets an ordered array TextSegments that are aligned with with the media segments
     * 
     * @return Array
     * @todo implement
     */
    function getTextSegments() {
        
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
        foreach($data['texts'] as $text_order => $text) {
            
            //create the text object
            $text_object = $this->di_container->getText();
            
            //loop through and instantiate the character groups from the text  
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
    }
}