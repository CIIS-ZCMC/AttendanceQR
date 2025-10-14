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
            "closing_at" => [
                "required",
                "after:" . now()->addHour()->addMinutes(10)->format("Y-m-d h:i a"),
            ],
        ];
    }

    public function messages()
    {
        return [
            "name.required" => "Name is required",
            "closing_at.required" => "Closing at is required",
            "closing_at.after" => "Closing at must be after " . now()->addHour()->addMinutes(10)->format("Y-m-d h:i a"),
        ];
    }
}
