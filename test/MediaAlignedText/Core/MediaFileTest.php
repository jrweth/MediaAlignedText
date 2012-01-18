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

class MediaFileTest extends CoreTest {
    
    /**
     * Test to make sure that the class implements the interface
     * @todo make meaningful tests
     */
    public function testInterface()
    {
        $this->assertInstanceOf('MediaAlignedText\\Core\\Interfaces\\MediaFileInterface', $this->media_file);
    }
    
    /**
     * Test Geting the file type (e.g. mp3, m4a)
     */
    public function testGetFileType()
    {
        $this->assertEquals($this->media_file->getFileType(), 'mp3');
    }
    
    /**
     * Test Getting the media type [AUDIO, VIDEO]
     * @return string
     */
    public function testTetMediaType()
    {
        $this->assertEquals($this->media_file->getMediaType(),'AUDIO');
    }
    
    /**
     * Test Getting the Title
     */
    public function testGetTitle()
    {
        $this->assertEquals($this->media_file->getTitle(), 'The Hobbit - Chapter 1a');
    }
    
    /**
     * test getting the URL
     */
    public function testGetUrl()
    {
        $this->assertEquals($this->media_file->getUrl(),'https://url_to_soundfile'); 
    }
    
    /**
     * Test Setting the file type (e.g. mp3, m4a)
     */
    public function testSetFileType()
    {
        $this->media_file->setFileType('m4a');
        $this->assertEquals($this->media_file->getFileType(), 'm4a');
    }
    
    /**
     * Test Setting the media type [AUDIO, VIDEO]
     */
    public function testSetMediaType()
    {
        $this->media_file->setMediaType('VIDEO');
        $this->assertEquals($this->media_file->getMediaType(), 'VIDEO');
    }
    
    /**
     * Test Setting the Title
     */
    public function testSetTitle()
    {
        $this->media_file->setTitle('The Hobbit - Chapter 1b');
        $this->assertEquals($this->media_file->getTitle(), 'The Hobbit - Chapter 1b');
    }
    
    /**
     * Testing Setting the Url
     */
    public function testSetUrl()
    {
        $this->media_file->setUrl('https://urltoanothersoundfile');
        $this->assertEquals($this->media_file->getUrl(), 'https://urltoanothersoundfile');
    }
}