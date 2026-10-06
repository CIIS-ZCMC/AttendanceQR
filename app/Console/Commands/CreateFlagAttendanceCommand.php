<?php

namespace App\Console\Commands;

use App\Models\Attendance;
use App\Models\MapLocation;
use Carbon\Carbon;
use Illuminate\Console\Command;

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
                $this->info("Skipped: {$date->toDateString()} is {$dayName}. Flag attendance is only created on Mondays (Flag Ceremony) and Fridays (Flag Retreat).");
                return self::SUCCESS;
            }
        } elseif ($typeOption === 'ceremony') {
            $eventType = 'Flag Ceremony';
        } elseif ($typeOption === 'retreat') {
            $eventType = 'Flag Retreat';
        } else {
            $this->error("Invalid type '{$typeOption}'. Allowed values: ceremony, retreat, auto.");
            return self::FAILURE;
        }

        $formattedDate = $date->format('F j Y');
        $baseName = "{$eventType} {$formattedDate}";
        $concattedTitle = $baseName . '-' . $date->format('Y_m_d') . '_' . time();

        $existing = Attendance::where('open_date', $date->toDateString())
            ->where('title', 'like', "%{$eventType}%")
            ->first();

        if ($existing) {
            $this->warn("Attendance already exists for {$eventType} on {$date->toDateString()}: [ID {$existing->id}] {$existing->title}");
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

        $this->info("Successfully created attendance: {$attendance->title} (ID: {$attendance->id})");
        $this->info("Attached map locations: " . implode(', ', $validLocationIds));
        $this->info("Active status: " . ($attendance->is_active ? 'Yes' : 'No'));

        return self::SUCCESS;
    }
}
