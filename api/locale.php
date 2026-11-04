<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: private, max-age=1800');
header('Vary: Cookie');

// Hostinger GeoIP sets GEOIP_COUNTRY_CODE after GeoIPEnable On in .htaccess.
$raw = $_SERVER['GEOIP_COUNTRY_CODE'] ?? $_SERVER['REDIRECT_GEOIP_COUNTRY_CODE'] ?? '';
$country = preg_match('/^[A-Z]{2}$/', strtoupper((string) $raw)) ? strtoupper((string) $raw) : null;
echo json_encode(['country' => $country], JSON_UNESCAPED_SLASHES);
