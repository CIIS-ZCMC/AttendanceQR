<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;

// Automatically run every day at 6:00 AM (will only create on Mondays for Flag Ceremony and Fridays for Flag Retreat)
Schedule::command('attendance:create-flag --locations=1,3 --activate')
    ->dailyAt('06:00');


