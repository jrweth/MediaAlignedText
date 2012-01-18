<?php /**
* This file is part of the MediaAlignedText package
* 
* (c) J. Reuben Wetherbe <jreubenwetherbee@gmail.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/
namespace MediaAlignedText\Core\Test;

require_once('CoreTest.php');

class TextTest extends CoreTest {

    /**
     * Test to make sure that the class implements the interface
     * @todo make meaningful tests
     */
    public function testInterface()
    {
        $this->assertInstanceOf('MediaAlignedText\\Core\\Interfaces\\TextInterface', $this->text);
    }
    
    public function testGetFullText()
    {
        
    }
}