<?php 
namespace MediaAlignedText\Core;

require_once('CoreTest.php');

class MediaFileSegmentTest extends CoreTest {

    /**
     * Test to make sure that the class implements the interface
     * @todo make meaningful tests
     */
    public function testInterface()
    {
        $this->assertInstanceOf('MediaAlignedText\\Core\\Interfaces\\MediaFileSegmentInterface', $this->media_file_segment);
    }
}