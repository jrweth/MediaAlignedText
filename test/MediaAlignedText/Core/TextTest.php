<?php 
namespace MediaAlignedText\Core;

require_once('CoreTest.php');

class TextTest extends CoreTest {

    /**
     * Test to make sure that the class implements the interface
     */
    public function testInterface()
    {
        $this->assertInstanceOf('MediaAlignedText\\Core\\Interfaces\\TextInterface', $this->text);
    }
    
    public function testGetFullText()
    {
        
    }
}