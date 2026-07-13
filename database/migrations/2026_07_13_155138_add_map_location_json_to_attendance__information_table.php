<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('attendance__information', function (Blueprint $table) {
            $table->dropColumn('map_location_id');
            $table->json('map_location')->nullable()->after('attendances_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendance__information', function (Blueprint $table) {
            $table->dropColumn('map_location');
            $table->unsignedInteger('map_location_id')->nullable()->after('attendances_id');
        });
    }
};
