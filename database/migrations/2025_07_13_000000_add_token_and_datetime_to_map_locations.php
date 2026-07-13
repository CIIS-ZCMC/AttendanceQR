<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('maplocation', function (Blueprint $table) {
            $table->uuid('token')->nullable()->unique()->after('is_active');
            $table->dateTime('open_at')->nullable()->after('token');
            $table->dateTime('closing_at')->nullable()->after('open_at');
        });
    }

    public function down(): void
    {
        Schema::table('maplocation', function (Blueprint $table) {
            $table->dropColumn(['token', 'open_at', 'closing_at']);
        });
    }
};
