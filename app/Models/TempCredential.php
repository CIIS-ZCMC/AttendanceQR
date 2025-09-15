<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TempCredential extends Model
{
    protected $table = "temp_credentials";
    protected $fillable = [
        'user_id',
        'password',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
