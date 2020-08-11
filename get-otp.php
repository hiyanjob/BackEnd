<?php

$username="AALAP"; //use your sms api username
$pass    = "Kap@user!123";  //enter your password

$dest_mobileno   =     "918667432856";//reciever 10 digit number (use comma (,) for multiple users. eg: 9999999999,8888888888,7777777777)
$sms         =     "Test Message from HTTP API";//sms content
$senderid    =     "AALAP";//use your sms api sender id
$sms_url = sprintf("http://193.105.74.159/api/v3/sendsms/plain?user=".$username."&password=".$pass."&sender=".$senderid."&SMSText=".$sms."&GSM=".$dest_mobileno."", $username, $pass , $senderid, $dest_mobileno, urlencode($sms) );
openurl($sms_url);

function openurl($url) {

$ch=curl_init();
curl_setopt($ch,CURLOPT_URL,$url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch,CURLOPT_POSTFIELDS,$postvars);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
curl_setopt($ch,CURLOPT_TIMEOUT, '3'); 
$content = trim(curl_exec($ch));
print json_encode($content);
curl_close($ch); 
// echo $url;
  }


?>