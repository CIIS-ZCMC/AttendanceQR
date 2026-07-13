<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Create pivot table
        Schema::create('attendance_map_locations', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('attendance_id');
            $table->unsignedInteger('map_location_id');
            $table->timestamps();

            $table->foreign('attendance_id')->references('id')->on('attendances')->cascadeOnDelete();
            $table->foreign('map_location_id')->references('id')->on('maplocation')->cascadeOnDelete();
            $table->unique(['attendance_id', 'map_location_id']);
        });

        // Migrate existing map_location_id data to pivot table
        DB::statement("INSERT INTO attendance_map_locations (attendance_id, map_location_id, created_at, updated_at) SELECT id, map_location_id, NOW(), NOW() FROM attendances WHERE map_location_id IS NOT NULL");

        // Drop foreign key and column from attendances
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropForeign(['map_location_id']);
            $table->dropColumn('map_location_id');
        });
    }

    public function down(): void
    {
        // Re-add map_location_id column
        Schema::table('attendances', function (Blueprint $table) {
            $table->integer('map_location_id')->nullable()->after('attendance_key');
            $table->foreign('map_location_id')->references('id')->on('maplocation')->nullOnDelete();
        });

        // Migrate pivot data back
        DB::statement("UPDATE attendances a JOIN attendance_map_locations p ON a.id = p.attendance_id SET a.map_location_id = p.map_location_id");

        // Drop pivot table
        Schema::dropIfExists('attendance_map_locations');
    }
};
