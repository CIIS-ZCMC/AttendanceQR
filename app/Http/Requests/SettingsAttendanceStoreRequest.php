<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class SettingsAttendanceStoreRequest extends FormRequest
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
            "name" => "required",
            "map_location_ids" => "required|array|min:1",
            "map_location_ids.*" => "exists:maplocation,id",
            "open_date" => "required|date",
            "closing_date" => "required|date|after_or_equal:open_date",
        ];
    }

    public function messages()
    {
        return [
            "name.required" => "Name is required",
            "map_location_ids.required" => "At least one map location is required",
            "map_location_ids.min" => "At least one map location is required",
            "map_location_ids.*.exists" => "Selected map location does not exist",
            "open_date.required" => "Open date is required",
            "closing_date.required" => "Closing date is required",
            "closing_date.after_or_equal" => "Closing date must be after or equal to open date",
        ];
    }
}
