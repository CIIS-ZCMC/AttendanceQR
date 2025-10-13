<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\EmployeeProfile;

class AttendanceStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'employeeId' => 'required',
        ];
    }

    public function userAttendanceInformation()
    {
        $userToken = session()->get('userToken')['id'] . $this->attendanceId;
        //session()->put('employeeID', $this->employeeId);
        $employee = EmployeeProfile::where('employee_id', $this->employeeId)->first();
        if (!$employee) {
            return [];
        }
        $areaDetails = $employee->assignedArea->findDetails()['details'];
        $sector = $employee->assignedArea->findDetails()['sector'] ?? null;
        return [
            'biometric_id' => $employee->biometric_id,
            'name' => $employee->name,
            'area' => $areaDetails->name,
            'areacode' => $areaDetails->code,
            'sector' => $sector,
            'first_entry' => date("Y-m-d H:i:s"),
            'last_entry' => null,
            'attendances_id' => $this->attendanceId,
            'userToken' => $userToken
        ];
    }
}
