<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HotfixController;
use App\Http\Controllers\Api\MachineController;
use App\Http\Controllers\Api\SoftwareController;
use App\Http\Controllers\Api\VulnerabilityController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/analytics/hardware', [AnalyticsController::class, 'hardware']);
    Route::get('/analytics/security', [AnalyticsController::class, 'security']);
    Route::get('/analytics/overview', [AnalyticsController::class, 'overview']);

    Route::get('/assets', [MachineController::class, 'index']);
    Route::get('/assets/{pc_name}', [MachineController::class, 'show']);
    Route::get('/assets/{pc_name}/software', [SoftwareController::class, 'index']);
    Route::get('/assets/{pc_name}/hotfixes', [HotfixController::class, 'index']);
    Route::get('/assets/{pc_name}/vulnerabilities', [VulnerabilityController::class, 'index']);
});
