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

require_once('CoreTest.php');

class CharacterGroupTest extends CoreTest {
    
    /**
     * Test to make sure that the class implements the interface
     */
    public function testInterface()
    {
        $this->assertInstanceOf('MediaAlignedText\\Core\\Interfaces\\CharacterGroupInterface', $this->character_group);
    }
    
    /**
     * test getting the characters
     */
    public function testGetCharacters()
    {
        $this->assertEquals($this->character_group->getCharacters(), 'In');
    }
    
    /**
     * test getting the character group type
     */
    public function testGetCharacterGroupType()
    {
        $this->assertEquals($this->character_group->getCharacterGroupType(), 'WORD');
    }
    
    /**
     * test getting the order
     */
    public function testGetOrder()
    {
        $this->assertEquals($this->character_group->getOrder(), 0);
    }
    
    /**
     * test getting the parent text 
     */
    public function testGetParentText()
    {
        $this->assertInstanceOf(
            'MediaAlignedText\\Core\\Interfaces\\TextInterface',
            $this->character_group->getParentText()
        );
        
        //test to see if the text of the character groups matches the parents child of the same order
        $parent_char_groups = $this->character_group->getParentText()->getCharacterGroups();
        
        $this->assertEquals(
            $this->character_group->getCharacters(),
            $parent_char_groups[$this->character_group->getOrder()]->getCharacters()
        );
    
    }
    
    /**
     * test setting the characters
     */
    public function testSetCharacters()
    {
        $this->character_group->setCharacters('Under');
        $this->assertEquals($this->character_group->getCharacters(), 'Under');
    }
    
    /**
     * test setting character group type
     */
    public function testSetCharacterGroupType()
    {
        $this->character_group->setCharacterGroupType('NON_WORD');
        $this->assertEquals($this->character_group->getCharacterGroupType(), 'NON_WORD');
    }
    
    /**
     * test setting an invalid group type and getting the exception
     */
    public function testSetInvalidGroupType() {
        try {
            $this->character_group->setCharacterGroupType('BAD_TYPE');
        }
        catch(\Exception $e) {
            return;
        }
        $this->fail('An invalid character group type was allowed to be set');
    }
    
    /**
     * test setting the parent text object
     */
    public function testSetParentText()
    {
        $this->character_group->setParentText($this->text);
    }
}