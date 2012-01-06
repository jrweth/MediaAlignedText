<?php
/**
* This file is part of the MediaAlignedText package
* 
* (c) J. Reuben Wetherbe <wetherbe@sas.upenn.edu>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

namespace MediaAlignedText;

/**
 * Autoloader for MediaAlignedText classes
 * @param unknown_type $class
 */
function autoload($class) {  
    // convert namespace to full file path  
    $filename = dirname(__DIR__).'/'.str_replace('\\', '/', $class) . '.php';
    
    if(file_exists($filename)) {
        require_once($filename);
    }
} 