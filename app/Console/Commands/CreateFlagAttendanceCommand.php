<?php

namespace App\Console\Commands;

use App\Models\Attendance;
use App\Models\MapLocation;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CreateFlagAttendanceCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attendance:create-flag 
                            {--type=auto : Type of event: ceremony, retreat, or auto} 
                            {--date= : Target date in YYYY-MM-DD format (default: today)} 
                            {--locations=1,3 : Comma-separated map location IDs to attach}
                            {--activate : Whether to activate this attendance as current active}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically create attendance for Flag Ceremonies (Mondays) or Flag Retreats (Fridays)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dateInput = $this->option('date');
        $date = $dateInput ? Carbon::parse($dateInput) : Carbon::today();
        $typeOption = strtolower($this->option('type') ?? 'auto');

        if ($typeOption === 'auto') {
            if ($date->isMonday()) {
                $eventType = 'Flag Ceremony';
            } elseif ($date->isFriday()) {
                $eventType = 'Flag Retreat';
            } else {
                $dayName = $date->format('l');
                $message = "Skipped: {$date->toDateString()} is {$dayName}. Flag attendance is only created on Mondays (Flag Ceremony) and Fridays (Flag Retreat).";
                $this->info("[" . now()->toDateTimeString() . "] " . $message);
                Log::info("[attendance:create-flag] " . $message);
                return self::SUCCESS;
            }
        } elseif ($typeOption === 'ceremony') {
            $eventType = 'Flag Ceremony';
        } elseif ($typeOption === 'retreat') {
            $eventType = 'Flag Retreat';
        } else {
            $this->error("Invalid type '{$typeOption}'. Allowed values: ceremony, retreat, auto.");
            Log::error("[attendance:create-flag] Invalid type '{$typeOption}'.");
            return self::FAILURE;
        }

        $formattedDate = $date->format('F j Y');
        $baseName = "{$eventType} {$formattedDate}";
        $concattedTitle = $baseName . '-' . $date->format('Y_m_d') . '_' . time();

        $existing = Attendance::where('open_date', $date->toDateString())
            ->where('title', 'like', "%{$eventType}%")
            ->first();

        if ($existing) {
            $warnMsg = "Attendance already exists for {$eventType} on {$date->toDateString()}: [ID {$existing->id}] {$existing->title}";
            $this->warn("[" . now()->toDateTimeString() . "] " . $warnMsg);
            Log::warning("[attendance:create-flag] " . $warnMsg);
            return self::SUCCESS;
        }

        $activate = $this->option('activate') || true;

        if ($activate) {
            Attendance::where('is_active', true)->update(['is_active' => false]);
        }

        $attendance = Attendance::create([
            'title' => $concattedTitle,
            'is_active' => $activate,
            'open_date' => $date->toDateString(),
            'closing_date' => $date->toDateString(),
            'no_location' => false,
        ]);

        $locationOption = (string) $this->option('locations');
        $locationIds = array_filter(array_map('trim', explode(',', $locationOption)));
        $validLocationIds = MapLocation::whereIn('id', $locationIds)->pluck('id')->toArray();

        if (!empty($validLocationIds)) {
            $attendance->mapLocations()->sync($validLocationIds);
        }

        // Assign schedules to locations depending on event type:
        // Flag Ceremony:
        //   - Both Admin Lobby (1) and Bucas Center (3) => Schedule ID 1 ("Flag Ceremony - 8:15 - 9am")
        // Flag Retreat:
        //   - Bucas Center (3) => Schedule ID 3 ("Flag Retreat - 3:30 - 5pm")
        //   - Admin Lobby (1)  => Schedule ID 2 ("Flag Retreat - 4:45-05pm")
        foreach ($validLocationIds as $locId) {
            $loc = MapLocation::find($locId);
            if (!$loc) {
                continue;
            }

            if ($eventType === 'Flag Ceremony') {
                $schedId = 1;
            } else { // Flag Retreat
                if ($locId == 3) {
                    $schedId = 3;
                } elseif ($locId == 1) {
                    $schedId = 2;
                } else {
                    $schedId = null;
                }
            }

            $loc->update([
                'schedule_id'  => $schedId,
                'open_time'    => $schedId ? null : $loc->open_time,
                'closing_time' => $schedId ? null : $loc->closing_time,
            ]);

            $this->info("Assigned location {$loc->location} (ID: {$loc->id}) -> schedule_id: " . ($schedId ?? 'none'));
        }

        $this->info("Successfully created attendance: {$attendance->title} (ID: {$attendance->id})");
        $this->info("Attached map locations: " . implode(', ', $validLocationIds));
        $this->info("Active status: " . ($attendance->is_active ? 'Yes' : 'No'));

        Log::info("[attendance:create-flag] Created: {$attendance->title} (ID: {$attendance->id}) with locations: " . implode(', ', $validLocationIds));

        return self::SUCCESS;
    }
}
