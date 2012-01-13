<?php 
namespace MediaAlignedText\Core;

require_once('CoreTest.php');

class TextSegmentTest extends CoreTest {

    /**
     * Test to make sure that the class implements the interface
     */
    public function testInterface()
    {
        $this->assertInstanceOf('MediaAlignedText\\Core\\Interfaces\\TextSegmentInterface', $this->text_segment);
    }
    
    function getId()
    {
        $this->assertEquals($this->text_segment->getId(), 0);
    }
    
    /**
     * Test to see if the correct character groups are returned by testGetCharacterGroups
     */
    function testGetCharacterGroups()
    {
        $char_groups = $this->text_segment->getCharacterGroups();
        
        $this->assertInstanceOf('MediaAlignedText\\Core\\Interfaces\\CharacterGroupInterface', $char_groups[0]);
        $this->assertEquals($char_groups[0]->getCharacters(), 'In');
        $this->assertEquals(count($char_groups), 20);
    }
    
    /**
     * Function to test getting the parent media aligned text
     */
    function testGetParentMediaAlignedText()
    {
        $this->assertInstanceOf('MediaAlignedText\\Core\\Interfaces\\MediaAlignedTextInterface', $this->text_segment->getParentMediaAlignedText());
    }
    
    /**
     * 
     * array would be [0.3, 0.4, 0.5, 0.6, 0.7, 0.8]
     * @return Array
     */
    function testGetTextCharacterGroupOrders()
    {
        $orders = $this->text_segment->getTextCharacterGroupOrders();
        
        $this->assertEquals($orders[1], '0_1');
        $this->assertEquals(count($orders), 20);
    }
    
    
    /**
     * Test setting the id
     */
    function testSetId()
    {
        $this->text_segment->setId(999);
        $this->assertEquals($this->text_segment->getId(), 999);
    }
    
    
    /**
     * Function to set an array of the composite character text and character group orders for this segment
     * 
     * e.g. if the TextSegment encompasses the 4th to 12th characater groups of the first text the 
     * array would be [0_3, 0_4, 0_5, 0_6, 0_7, 0_8, 0_9, 0_10, 0_11]
     * @param array $text_character_group_orders
     */
    function testSetTextCharacterGroupOrders()
    {
        $this->text_segment->setTextCharacterGroupOrders(
            array('0_3', '0_4', '0_5', '0_6', '0_7', '0_8', '0_9', '0_10', '0_11')
        );
        $orders = $this->text_segment->getTextCharacterGroupOrders();
        $this->assertEquals($orders[0],'0_3');
    }
    
    /**
     * Function to set the Parent MediaAlignedText
     * @param MediaAlignedTextInterface $media_aligned_text
     */
    function testSetParentMediaAlignedText()
    {
        $this->text_segment->setParentMediaAlignedText($this->media_aligned_text);
    }

}