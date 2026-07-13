<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add new time columns
        Schema::table('maplocation', function (Blueprint $table) {
            $table->time('open_time')->nullable()->after('token');
            $table->time('closing_time')->nullable()->after('open_time');
        });

        // Migrate existing datetime data to time-only
        DB::statement("UPDATE maplocation SET open_time = TIME(open_at) WHERE open_at IS NOT NULL");
        DB::statement("UPDATE maplocation SET closing_time = TIME(closing_at) WHERE closing_at IS NOT NULL");

        // Drop old datetime columns
        Schema::table('maplocation', function (Blueprint $table) {
            $table->dropColumn(['open_at', 'closing_at']);
        });
    }

    public function down(): void
    {
        Schema::table('maplocation', function (Blueprint $table) {
            $table->datetime('open_at')->nullable()->after('token');
            $table->datetime('closing_at')->nullable()->after('open_at');
        });

        DB::statement("UPDATE maplocation SET open_at = open_time WHERE open_time IS NOT NULL");
        DB::statement("UPDATE maplocation SET closing_at = closing_time WHERE closing_time IS NOT NULL");

        Schema::table('maplocation', function (Blueprint $table) {
            $table->dropColumn(['open_time', 'closing_time']);
        });
    }
};
