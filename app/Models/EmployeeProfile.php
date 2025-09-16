<?php

namespace App\Models;

use App\Helpers\Helpers;
use App\Http\Resources\EmployeeHeadResource;
use App\Http\Resources\OfficialBusinessApplication;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Models\AssignedArea;

use App\Models\Schedule;

class EmployeeProfile extends Authenticatable
{
    use HasFactory;

    protected $table = 'employee_profiles';

    public $fillable = [
        'personal_information_id',
        'email_verified_at',
        'employee_id',
        'profile_url',
        'date_hired',
        'user_form_link',
        'password_encrypted',
        'password_created_at',
        'password_expiration_at',
        'authorization_pin',
        'pin_created_at',
        'biometric_id',
        'otp',
        'otp_expiration',
        'deactivated_at',
        'agency_employee_no',
        'allow_time_adjustment',
        'shifting',
        'is_2fa',
        'solo_parent',
        'renewal',
        'employee_type_id',
        'employment_type_id'
    ];


    public $timestamps = TRUE;

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password_encrypted',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function personalInformation()
    {
        return $this->belongsTo(PersonalInformation::class);
    }

  
    public function name()
    {
        $personal_information = $this->personalInformation;
        $fullName = $personal_information['first_name'] . ' ' . $personal_information['last_name'];

        return $fullName;
    }
    public function getNameAttribute()
    {
        return $this->personalInformation['first_name'] . ' ' . $this->personalInformation['last_name'];
    }

    public function lastNameTofirstName()
    {
        $personal_information = $this->personalInformation;
        $fullName = $personal_information['last_name'] . ', ' . $personal_information['first_name'];

        return $fullName;
    }

    public function GetPersonalInfo()
    {
        return $this->personalInformation;
    }

}
