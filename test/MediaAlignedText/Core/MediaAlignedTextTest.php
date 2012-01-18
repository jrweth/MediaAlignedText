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

class MediaAlignedTextTest extends CoreTest {
    
    public function testGetText()
    {
        $this->assertInstanceOf('MediaAlignedText\\Core\\Interfaces\\MediaAlignedTextInterface', $this->media_aligned_text);
    }
}