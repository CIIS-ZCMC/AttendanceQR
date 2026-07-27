<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('maplocation', 'schedule_id')) {
            Schema::table('maplocation', function (Blueprint $table) {
                $table->dropColumn('schedule_id');
            });
        }

        Schema::table('maplocation', function (Blueprint $table) {
            $table->unsignedBigInteger('schedule_id')->nullable()->after('w_map');
        });
    }

    public function down(): void
    {
        Schema::table('maplocation', function (Blueprint $table) {
            $table->dropColumn('schedule_id');
        });
    }
};
