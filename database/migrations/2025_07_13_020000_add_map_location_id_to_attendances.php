<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->integer('map_location_id')->nullable()->after('attendance_key');
            $table->foreign('map_location_id')->references('id')->on('maplocation')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropForeign(['map_location_id']);
            $table->dropColumn('map_location_id');
        });
    }
};
