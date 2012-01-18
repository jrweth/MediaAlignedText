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

class MediaFileSegmentTest extends CoreTest {

    /**
     * Test to make sure that the class implements the interface
     */
    public function testInterface()
    {
        $this->assertInstanceOf('MediaAlignedText\\Core\\Interfaces\\MediaFileSegmentInterface', $this->media_file_segment);
    }
    
     /**
     * Test Getting the duration in seconds of this MediaFileSegment
     */
    function testGetDuration()
    {
        $this->assertEquals($this->media_file_segment->getDuration(), '7.2');
    }
    
    /**
     * Test Getting the id which uniquely identifies this MediaFileSegment from other MediaFileSegments
     * of the same MediaAlignedText
     */
    function testGetId()
    {
        $this->assertEquals($this->media_file_segment->getId(), 0);
    }
    
    /**
     * Test getting the MediaFile object which this segment is a part of
     */
    function testGetMediaFile()
    {
        $this->assertEquals($this->media_file_segment->getMediaFile()->getTitle(), 'The Hobbit - Chapter 1a');
    }
    
    /**
     * Test getting the order of the MediaFile within in the MediaAlignedText which this MediaFileSegment is a part of
     */
    function testGetMediaFileOrder()
    {
        $this->assertEquals($this->media_file_segment->getMediaFileOrder(), 0);
    }
    
    /**
     * Test getting parent MediaAlignedText
     */
    function testGetParentMediaAlignedText()
    {
        $this->assertInstanceOf(
            'MediaAlignedText\\Core\\Interfaces\\MediaAlignedTextInterface',
            $this->media_file_segment->getParentMediaAlignedText()
        );
    }
    
    /**
     * Test getting the time within the MediaFile that this segment ends
     */
    function testGetTimeEnd()
    {
        $this->assertEquals($this->media_file_segment->getTimeEnd(), '7.2');
    }
    
    /**
     * Test getting the time within the MediaFile that this segment starts
     */
    function getTimeStart()
    {
        $this->assertEquals($this->media_file_segment->getTimeStart(), 0);
    }
    
    /**
     * Test setting the id which uniquely identifies this MediaFileSegment from other MediaFileSegments
     * of the same MediaAlignedText
     */
    function testSetId()
    {
        $this->media_file_segment->setId(1);
        $this->assertEquals($this->media_file_segment->getId(), 1);
    }
    
    /**
     * Test setting the order of the MediaFile within in the MediaAlignedText which this MediaFileSegment is a part of
     */
    function testSetMediaFileOrder()
    {
        $this->media_file_segment->setMediaFileOrder(1);
        $this->assertEquals($this->media_file_segment->getMediaFileOrder(), 1);
    }
    
    /**
     * Test setting parent MediaAlignedText
     */
    function testSetParentMediaAlignedText()
    {
        $this->media_file_segment->setParentMediaAlignedText($this->media_aligned_text);
    }
    
    /**
     * Test setting the time within the MediaFile that this segment end
     */
    function testSetTimeEnd()
    {
        $this->media_file_segment->setTimeEnd('8.1');
        $this->assertEquals($this->media_file_segment->getTimeEnd(), '8.1');
        return $this->media_file_segment;
    }
    
    /**
     * Test setting the time within the MediaFile that this segment starts
     * @depends testSetTimeEnd
     */
    function testSetTimeStart($media_file_segment)
    {
        $media_file_segment->setTimeStart('1.2');
        $this->assertEquals($media_file_segment->getTimeStart(), '1.2');
        
        //test duration after time changes                                                                          
        $this->assertEquals($media_file_segment->getDuration(), '6.9');
    }
}