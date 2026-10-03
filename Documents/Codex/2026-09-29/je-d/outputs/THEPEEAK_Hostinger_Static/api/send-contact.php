<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['message' => 'Méthode non autorisée.']);
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'https://thepeeak.com',
    'https://www.thepeeak.com',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
];
if ($origin !== '' && !in_array($origin, $allowedOrigins, true)) {
    respond(403, ['message' => 'Origine de la demande non autorisée.']);
}

if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 30000) {
    respond(413, ['message' => 'Votre message est trop volumineux.']);
}

$raw = file_get_contents('php://input');
$input = json_decode($raw ?: '', true);
if (!is_array($input)) {
    respond(400, ['message' => 'Le formulaire contient des données invalides.']);
}
if (trim((string)($input['website'] ?? '')) !== '') {
    respond(200, ['ok' => true]);
}

$clean = static function (mixed $value, int $max): string {
    $value = trim(strip_tags((string)$value));
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value) ?? '';
    return substr($value, 0, $max);
};

$name = $clean($input['nom'] ?? '', 255);
$email = $clean($input['email'] ?? '', 255);
$phone = $clean($input['telephone'] ?? '', 80);
$service = $clean($input['service_interesse'] ?? '', 180);
$subject = $clean($input['sujet'] ?? '', 255);
$budget = $clean($input['budget_estime'] ?? '', 100);
$message = $clean($input['message'] ?? '', 10000);

if ($name === '' || $subject === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, ['message' => 'Indiquez votre nom, votre adresse e-mail, un objet et votre message.']);
}
if (trim((string)($input['consent'] ?? '')) !== 'yes') {
    respond(422, ['message' => 'Veuillez accepter la politique de confidentialité pour envoyer votre demande.']);
}

$rateFile = sys_get_temp_dir() . '/thepeeak-contact-' . hash('sha256', (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown')) . '.json';
$rate = @fopen($rateFile, 'c+');
if ($rate === false || !flock($rate, LOCK_EX)) {
    if (is_resource($rate)) fclose($rate);
    respond(503, ['message' => 'Le formulaire est temporairement indisponible. Réessayez dans un instant.']);
}
$now = time();
$contents = stream_get_contents($rate);
$timestamps = json_decode($contents ?: '[]', true);
$timestamps = is_array($timestamps) ? array_values(array_filter($timestamps, static fn($time): bool => is_int($time) && $time > $now - 600)) : [];
if (count($timestamps) >= 5) {
    flock($rate, LOCK_UN);
    fclose($rate);
    respond(429, ['message' => 'Trop de demandes envoyées depuis cet appareil. Réessayez un peu plus tard.']);
}
$timestamps[] = $now;
rewind($rate);
ftruncate($rate, 0);
fwrite($rate, json_encode($timestamps));
fflush($rate);
flock($rate, LOCK_UN);
fclose($rate);

$apiKey = getenv('RESEND_API_KEY') ?: ($_SERVER['RESEND_API_KEY'] ?? '');
if (!$apiKey) {
    $privateConfig = __DIR__ . '/.env';
    if (is_file($privateConfig) && is_readable($privateConfig)) {
        foreach (file($privateConfig, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
            if (str_starts_with(trim($line), 'RESEND_API_KEY=')) {
                $apiKey = trim(substr(trim($line), strlen('RESEND_API_KEY=')), " \t\n\r\0\x0B\"'");
                break;
            }
        }
    }
}
if (!$apiKey) {
    respond(503, ['message' => 'L’envoi e-mail n’est pas encore activé sur le serveur. Choisissez WhatsApp ou réessayez plus tard.']);
}
if (!function_exists('curl_init')) {
    respond(503, ['message' => 'Le service e-mail est temporairement indisponible. Choisissez WhatsApp ou réessayez plus tard.']);
}

$escape = static fn(string $value): string => htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$rows = [
    'Nom' => $name,
    'E-mail' => $email,
    'Téléphone / WhatsApp' => $phone ?: 'Non renseigné',
    'Expertise' => $service ?: 'À définir',
    'Objet' => $subject,
    'Budget indicatif' => $budget ?: 'À discuter',
];
$htmlRows = '';
$textRows = [];
foreach ($rows as $label => $value) {
    $htmlRows .= '<tr><th align="left" style="padding:8px 12px;border-bottom:1px solid #e5e9ed;color:#60707b">' . $escape($label) . '</th><td style="padding:8px 12px;border-bottom:1px solid #e5e9ed">' . $escape($value) . '</td></tr>';
    $textRows[] = $label . ': ' . $value;
}
$safeSubject = preg_replace('/[\r\n]+/', ' ', $subject) ?: 'Nouvelle demande';
$payload = [
    'from' => 'THEPEEAK <contact@thepeeak.com>',
    'to' => ['contact@thepeeak.com'],
    'reply_to' => $email,
    'subject' => '[Demande THEPEEAK] ' . $safeSubject,
    'html' => '<div style="font-family:Arial,sans-serif;color:#102838;max-width:680px;margin:auto"><div style="background:#071c28;padding:22px 26px;color:#fff"><strong style="letter-spacing:.16em">THEPEEAK</strong><div style="margin-top:8px;color:#ff8a3d">Nouvelle demande depuis le site</div></div><div style="padding:24px 8px"><table style="width:100%;border-collapse:collapse">' . $htmlRows . '</table><h2 style="margin:28px 0 8px;font-size:17px">Votre projet</h2><p style="white-space:pre-wrap;line-height:1.7">' . $escape($message) . '</p></div></div>',
    'text' => "Nouvelle demande depuis le site THEPEEAK\n\n" . implode("\n", $textRows) . "\n\nVotre projet :\n" . $message,
];

$curl = curl_init('https://api.resend.com/emails');
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
        'Accept: application/json',
    ],
    CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    CURLOPT_CONNECTTIMEOUT => 8,
    CURLOPT_TIMEOUT => 20,
]);
$responseBody = curl_exec($curl);
$httpStatus = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
$curlError = curl_errno($curl);
curl_close($curl);

if ($responseBody === false || $curlError !== 0 || $httpStatus < 200 || $httpStatus >= 300) {
    respond(502, ['message' => 'Resend n’a pas pu transmettre l’e-mail. Réessayez ou choisissez WhatsApp.']);
}

respond(200, ['ok' => true]);
