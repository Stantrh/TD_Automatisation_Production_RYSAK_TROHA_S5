<?php

use PHPUnit\Framework\TestCase;
use PrivateBin\Data\Filesystem;
use PrivateBin\Persistence\ServerSalt;

class ServerSaltTest extends TestCase
{
    private $_path;

    private $_invalidPath;

    private $_otherPath;

    private $_invalidFile;

    public function setUp(): void
    {
        /* Setup Routine */
        $this->_path = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'privatebin_data';
        if (!is_dir($this->_path)) {
            mkdir($this->_path);
        }
        ServerSalt::setStore(
            new Filesystem(array('dir' => $this->_path))
        );

        $this->_otherPath = $this->_path . DIRECTORY_SEPARATOR . 'foo';

        $this->_invalidPath = $this->_path . DIRECTORY_SEPARATOR . 'bar';
        if (!is_dir($this->_invalidPath)) {
            mkdir($this->_invalidPath);
        }
        $this->_invalidFile = $this->_invalidPath . DIRECTORY_SEPARATOR . 'salt.php';
    }

    public function tearDown(): void
    {
        /* Tear Down Routine */
        chmod($this->_invalidPath, 0700);
        Helper::rmDir($this->_path);
    }


}
