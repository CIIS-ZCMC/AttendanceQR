<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserInformations extends Model
{
    protected $table = 'user_informations';
    protected $fillable = [
        'user_profile_id',
        'first_name',
        'last_name',
        'middle_name',
        'suffix',
        'gender',
        'birth_date',
        'blood_type',
        'marital_status',
        'nationality',
        'religion',
        'philhealth',
        'sss',
        'tin',
        'pagibig',
    ];
}
