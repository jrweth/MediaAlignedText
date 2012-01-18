<?php
/**
* This file is part of the MediaAlignedText package
* 
* (c) J. Reuben Wetherbe <jreubenwetherbee@gmail.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/
namespace MediaAlignedText\Core\Test;
use MediaAlignedText\Core\DependencyInjectionContainer;

require_once('MediaAlignedText/Autoload.php');
/**
 * This base CoreTest is used to duplicate the setup for each individual test 
 * @author J. Reuben Wetherbee
 *
 */
class CoreTest extends \PHPUnit_Framework_TestCase {

    /**
     * Single Character Group Intance
     * @var CharacterGroup
     */
    protected $character_group;
    
    
    /**
     * MediaAlignedText object instantiated 
     * @var MediaAlignedText
     */
    protected $media_aligned_text;
    
    /**
     * Media File Segment for testing
     * @var MediaFileSegment
     */
    protected $media_file_segment;
    /**
     * Single Text Instance
     * @var Text
     */
    protected $text;
    
    /**
     * TextSegment Instance
     * @var TextSegment
     */
    protected $text_segment;
    public function setUp()
    {
        //register the MediaAlignedText Autoloader
        spl_autoload_extensions(".php"); 
        spl_autoload_register('MediaAlignedText\\autoload');
        
        //Setup the Defined Variables used for testing 
        $di_container = new DependencyInjectionContainer();
        
        $this->media_aligned_text = $di_container->getMediaAlignedText();
        
        //load up the media aligned text from the json query
        $js_fixture_filepath = dirname(__DIR__).'/json_alignment_fixture.js';
        $json = file_get_contents($js_fixture_filepath);
        $this->media_aligned_text->loadFromJson($json);
        
        //Setup the Defined Variables used for testing 
        $this->texts = $this->media_aligned_text->getTexts();
        $this->text = $this->texts[0];
        $this->character_groups = $this->text->getCharacterGroups();
        $this->character_group = $this->character_groups[0];
        $this->text_segments = $this->media_aligned_text->getTextSegments();
        $this->text_segment = $this->text_segments[0];
        $this->media_files = $this->media_aligned_text->getMediaFiles();
        $this->media_file = $this->media_files[0];
        $this->media_file_segments = $this->media_aligned_text->getMediaFileSegments();
        $this->media_file_segment = $this->media_file_segments[0];
    }
}