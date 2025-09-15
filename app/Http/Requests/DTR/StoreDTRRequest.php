<?php

namespace App\Http\Requests\DTR;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use App\Exceptions\ValidationHandler;

class StoreDTRRequest extends FormRequest
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
            'time_in_am' => 'nullable|date_format:H:i',
            'time_out_am' => 'nullable|date_format:H:i',
            'time_in_pm' => 'nullable|date_format:H:i',
            'time_out_pm' => 'nullable|date_format:H:i',
            'status' => 'required',
            'remarks' => 'nullable',
            'is_time_adjustment' => 'nullable|boolean',
            'is_generated' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'User ID is required',
            'dtr_date.required' => 'DTR Date is required',
            'time_in_am.date_format' => 'Time In AM must be in HH:MM format',
            'time_out_am.date_format' => 'Time Out AM must be in HH:MM format',
            'time_in_pm.date_format' => 'Time In PM must be in HH:MM format',
            'time_out_pm.date_format' => 'Time Out PM must be in HH:MM format',
            'status.required' => 'Status is required',
        ];
    }

    public function validatedFormat(): array
    {

        //Add Validation here 
        // - on where to put the time_in and time_out
        // with schedules table
        // - check if the time_in and time_out is within the schedule

        return [
            'user_id' => $this->user_id,
            'dtr_date' => $this->dtr_date,
            'time_in_am' => $this->time_in_am,
            'time_out_am' => $this->time_out_am,
            'time_in_pm' => $this->time_in_pm,
            'time_out_pm' => $this->time_out_pm,
            'status' => $this->status,
            'remarks' => $this->remarks,
            'is_time_adjustment' => $this->is_time_adjustment,
            'is_generated' => $this->is_generated,
        ];
    }



    protected function failedValidation(Validator $validator)
    {
        throw new ValidationHandler($validator);
    }
}
