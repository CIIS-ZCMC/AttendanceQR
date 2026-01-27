<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\EmployeeProfile;
use App\Models\Contact;
use App\Models\Attendance;

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
        return [];
    }

    public function FindEmployeeID()
    {
        if (isset($this->is_finder)) {
            $userInformation = session()->get('userToken');
            $contact = Contact::where("email_address", $userInformation['email'])->first();
            if ($contact) {
                $personalInformation = $contact->personalInformation;
                $employeeProfile = $personalInformation->employeeProfile;
                $employeeID = $employeeProfile->employee_id;
                session()->put("isRecorded", true);
                return $employeeID;
            }
        }
        return $this->employeeId;
    }


    public function ActiveAttendance()
    {
        $active = Attendance::where("is_active", true)->first();
    }

    public function userAttendanceInformation()
    {
        //dd($this->all());
        if (isset($this->is_no_employee_id) && $this->is_no_employee_id) {
            return $this->UserNoEmployeeID($this->name, $this->area);
        }

        $attendanceID = $this->attendanceId ?? session()->get("activeAttendanceID");
        $userToken = session()->get('userToken')['id'] . $attendanceID;
        //session()->put('employeeID', $this->employeeId);
        $employee = EmployeeProfile::where('employee_id', $this->FindEmployeeID())->first();
        if (!$employee) {
            return [];
        }

        $email = $employee->GetPersonalInfo()->contact->email_address;
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
            'attendances_id' => $attendanceID,
            'userToken' => $userToken,
            'email' => $email,
            'employee_id' => $employee->employee_id,
            'profile_id' => $employee->id,
        ];
    }

    public function UserNoEmployeeID($name, $area)
    {
        $attendanceID = $this->attendanceId ?? session()->get("activeAttendanceID");
        $userToken = session()->get('userToken')['id'] . $attendanceID;

        return [
            'biometric_id' => null,
            'name' => $name,
            'area' => $area,
            'areacode' => null,
            'sector' => null,
            'first_entry' => date("Y-m-d H:i:s"),
            'last_entry' => null,
            'attendances_id' => $attendanceID,
            'userToken' => $userToken,
            'email' => session()->get('userToken')['email'],
            'employee_id' => null,
            'profile_id' => null,
        ];
    }
}
