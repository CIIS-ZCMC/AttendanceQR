<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BiometricRecord extends Model
{
    use SoftDeletes;
    protected $table = 'biometric_records';

    protected $fillable = [
        'user_id',
        'template',
    ];
}
