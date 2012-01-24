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

require_once('CoreTest.php');

class MediaTextSegmentAlignmentTest extends CoreTest {

    /**
     * Test to make sure that the class implements the interface
     */
    public function testInterface()
    {
        $this->assertInstanceOf('MediaAlignedText\\Core\\Interfaces\\MediaTextSegmentAlignmentInterface', $this->alignment);
    }

    /**
     * Test getting the id uniquely identifying this alignment from other alignments from the same MediaAlignedText
     */
    public function testGetId()
    {
        $this->assertEquals(2, $this->alignment->getId());
    }
    /**
     * Test gettig the MediaFileSegment that this alignment is aligning
     */
    public function testGetMediaFileSegment()
    {
        $this->assertEquals('3.0', $this->alignment->getMediaFileSegment()->getTimeStart());
    }

    /**
     * Test getting the ID uniquely identifying the MediaFileSegment which this alignment aligns
     */
    public function testGetMediaFileSegmentId()
    {
        $this->assertEquals(2, $this->alignment->getMediaFileSegmentId());
    }
    
    /**
     * Test getting parent MediaAlignedText
     */
    public function testGetParentMediaAlignedText()
    {
        $this->assertInstanceOf('MediaAlignedText\\Core\\Interfaces\\MediaAlignedTextInterface', $this->alignment->getParentMediaAlignedText());
    }
    
    /**
     * Testing getting the aligned text segment
     */
    public function testGetTextSegment()
    {
        $this->assertEquals($this->alignment->getTextSegmentId(), $this->alignment->getTextSegment()->getId());
    }
    
    /**
     * Test Getting the id of the aligned TextSegment
     */
    public function testGetTextSegmentId()
    {
        $this->assertEquals(2, $this->alignment->getTextSegmentId());
    }
    
    /**
     * Test setting the id for this alignment
     */
    public function testSetId()
    {
        $this->alignment->setId(25);
        $this->assertEquals(25, $this->alignment->getId());
    }
    
    /**
     * Test setting the id of the aligned MediaFileSegment
     */
    public function testSetMediaFileSegmentId()
    {
        $this->alignment->setMediaFileSegmentId(25);
        $this->assertEquals(25, $this->alignment->getMediaFileSegmentId());
    }
    
    /**
     * Function to set parent MediaAlignedText
     */
    public function testSetParentMediaAlignedText()
    {
        $this->alignment->setParentMediaAlignedText($this->media_aligned_text);
    }
    
    /**
     * Function to set the id of the aligned TextSegment
     */
    public function testSetTextSegmentId()
    {
        $this->alignment->setTextSegmentId(25);
        $this->assertEquals(25, $this->alignment->getTextSegmentId());
    }
}