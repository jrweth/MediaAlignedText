<?php 

use MediaAlignedText\Core\MediaAlignedText;

class MediaAlignedTextTest extends \PHPUnit_Framework_TestCase {

    /**
     * Media Aligned Text instantiated during setup
     * @var MediaAlignedText
     */
    private $media_aligned_text;
    
    public function setUp()
    {
        $this->media_alinged_text = new MediaAlignedText();
    }
    
    public function getTextTest()
    {
        $text = $this->media_aligned_text->getText();
        $this->assertInstanceOf('TextInterface', $text);
    }
}