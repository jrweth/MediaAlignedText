<?php 
namespace MediaAlignedText\Core;

require_once('CoreTest.php');

class CharacterGroupTest extends CoreTest {
    
    /**
     * Test to make sure that the class implements the interface
     */
    public function testInterface()
    {
        $this->assertInstanceOf('MediaAlignedText\\Core\\Interfaces\\TextInterface', $this->text);
    }
    
    public function testGetCharacters()
    {
        $this->assertEquals($this->character_group->getCharacters(), 'In');
    }
}