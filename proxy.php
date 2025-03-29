<?php
header("Content-Type: text/plain");

// Ton lien M3U complet
$url = "http://001122.org:2095/get.php?username=45645678644789&password=45645678644456&type=m3u_plus&output=ts";

// Envoi direct du contenu brut
echo file_get_contents($url);