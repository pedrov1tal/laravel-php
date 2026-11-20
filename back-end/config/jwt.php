<?php

return [
    // APP_KEY is always required by Laravel. It keeps login available when a
    // deployment has not defined a separate JWT_SECRET yet.
    'secret' => env('JWT_SECRET', env('APP_KEY')),
    'ttl' => 3600,
];
