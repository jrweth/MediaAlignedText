<?php
/**
* This file is part of the MediaAlignedText package
* 
* (c) J. Reuuben Wetherbe <wetherbe@sas.upenn.edu>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/


namespace MediaAlignedText\Core\Interfaces;

interface MediaAlignedTextInterface
{
    /**
     * Gets the Text Associated with the media aligned text
     * 
     * @return TextInterface
     */
    function getText();
}