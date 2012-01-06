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
        spl_autoload_extensions(".php"); 
        spl_autoload_register('MediaAlignedText\\autoload');
        $this->text = new Text();
    }
    
    /**
     * Test to make sure that the class implements the interface
     */
    public function testInterface()
    {
        $this->assertInstanceOf('MediaAlignedText\\Core\\Interfaces\\TextInterface', $this->text);
    }
}