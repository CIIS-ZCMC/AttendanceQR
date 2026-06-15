<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MapLocation extends Model
{   

    protected $table = "maplocation";
    
    protected $fillable = [
        'location',
        'description',
        'lat',
        'lng',
        'is_active'
    ];
}
