<?php 
use MediaAlignedText\Core\CharacterGroup;
namespace MediaAlignedText\Core;

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
        
        $this->media_aligned_text = new MediaAlignedText($di_container);
        
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
    }
}