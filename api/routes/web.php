<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'AssetIQ API',
        'status' => 'running',
    ]);
});
