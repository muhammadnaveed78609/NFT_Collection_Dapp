//SPDX-License-Identifier: MIT
pragma solidity >0.5.0 <=0.9.0;

interface IWhitelist {
    function whitelistaddresses(address) external view returns (bool);
}
