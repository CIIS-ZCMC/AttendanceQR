<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserProfiles extends Model
{
    protected $table = 'user_profiles';
    protected $fillable = [
        'user_id',
        'full_name',
        'address',
        'street',
        'barangay',
        'district',
        'city',
        'state',
        'zip_code',
        'country',
        'profile_picture',
    ];

    public function UserInformations()
    {
        return $this->hasOne(UserInformations::class, 'user_profile_id');
    }

    public function User(){
        return $this->belongsTo(User::class, 'user_id');
    }
}
