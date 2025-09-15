<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'phone',
        'email',
        'password',
        'is_default_schedule'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function tempCredential()
    {
        return $this->hasOne(TempCredential::class);
    }

    public function userProfiles()
    {
        return $this->hasOne(UserProfiles::class);
    }

    public function userInformations()
    {
        return $this->hasOne(UserInformations::class);
    }

    public function userSchedules()
    {
        return $this->hasOne(UserSchedule::class);
    }

    public function getMonthDTR($month, $year)
    {
        return $this->hasMany(DailyTimeRecord::class)->whereMonth('dtr_date', $month)->whereYear('dtr_date', $year);
    }

    public function getDailyDTR($date)
    {
        return $this->hasOne(DailyTimeRecord::class)->where('dtr_date', $date);
    }
}
