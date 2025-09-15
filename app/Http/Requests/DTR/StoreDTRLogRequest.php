<?php

namespace App\Http\Requests\DTR;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use App\Exceptions\ValidationHandler;

class StoreDTRLogRequest extends FormRequest
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
            'user_id' => 'required',
            'dtr_date' => 'required',
            'log' => 'required',
            'log_type' => 'required',
            'device_log' => 'required',
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'User ID is required',
            'dtr_date.required' => 'DTR Date is required',
            'log.required' => 'Log is required',
            'log_type.required' => 'Log Type is required',
            'device_log.required' => 'Device Log is required',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new ValidationHandler($validator);
    }
}
