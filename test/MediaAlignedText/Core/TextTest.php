<?php 
namespace MediaAlignedText\Core;

require_once('MediaAlignedText/Autoload.php');

class TextTest extends \PHPUnit_Framework_TestCase {

    /**
     * Text Instantiated During setup
     * @var Text
     */
    private $text;
    
    public function setUp()
    {
        //register the MediaAlignedText Autoloader
        spl_autoload_extensions(".php"); 
        spl_autoload_register('MediaAlignedText\\autoload');
        
        $js_fixture_filepath = dirname(__DIR__).'/json_alignment_fixture.js';
        $json = file_get_contents($js_fixture_filepath);
        $data = json_decode($json, true);
        
        //initialize this text 
        $this->text = new Text();
        $c_groups = array();
        foreach((array)$data['texts'][0]['character_groups'] as $chars) {
            $c_group = new CharacterGroup();
            $c_group->setCharacters($chars);
            $c_groups[] = $c_group;
        }
        $this->text->setCharacterGroups($c_groups);
    }
    
    /**
     * Test to make sure that the class implements the interface
     */
    public function testInterface()
    {
        $this->assertInstanceOf('MediaAlignedText\\Core\\Interfaces\\TextInterface', $this->text);
    }
    
    public function testGetFullText()
    {
        print $this->text->getFullText();
    }
}