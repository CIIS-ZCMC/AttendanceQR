<?php

namespace App\Http\Requests\UserManagement;

use Illuminate\Foundation\Http\FormRequest;
use App\CustomHelper\Helper;
use Illuminate\Support\Facades\Hash;
use Illuminate\Contracts\Validation\Validator;
use App\Exceptions\ValidationHandler;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class UserRegistrationRequest extends FormRequest
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
    public function rules()
    {
        $id = $this->input('id'); // the users.id of the record being updated

        return [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone' => [
                'required',
                'string',
                'max:255',
                Rule::unique('users', 'phone')->ignore($id),
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($id),
            ],
            'middle_name' => 'required|string|max:255',
            'birth_date' => [
                'required',
                'date',
                function ($attribute, $value, $fail) {
                    $age = Carbon::parse($value)->diff(Carbon::now())->y;

                    if ($age < 18) {
                        $fail('The ' . $attribute . ' must be 18 years or above.');
                    }
                },
            ],
            'gender' => 'required|string|max:255',
            'blood_type' => 'required|string|max:255',
            'marital_status' => 'required|string|max:255',
            'nationality' => 'required|string|max:255',
            'religion' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'street' => 'required|string|max:255',
            'barangay' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'zip_code' => 'required|string|max:255',
            'country' => 'required|string|max:255',
        ];
    }
    public function messages(): array
    {
        return [
            'first_name.required' => 'First name is required',
            'last_name.required' => 'Last name is required',
            'phone.required' => 'Phone is required',
            'email.required' => 'Email is required',
            'middle_name.required' => 'Middle name is required',
            'birth_date.required' => 'Birth date is required',
            // 'suffix.required' => 'Suffix is required',
            'gender.required' => 'Gender is required',
            'blood_type.required' => 'Blood type is required',
            'marital_status.required' => 'Marital status is required',
            'nationality.required' => 'Nationality is required',
            'religion.required' => 'Religion is required',
            // 'philhealth.required' => 'Philhealth is required',
            // 'sss.required' => 'SSS is required',
            // 'tin.required' => 'TIN is required',
            // 'pagibig.required' => 'Pagibig is required',
            'address.required' => 'Address is required',
            'street.required' => 'Street is required',
            'barangay.required' => 'Barangay is required',
            'district.required' => 'District is required',
            'city.required' => 'City is required',
            'state.required' => 'State is required',
            'zip_code.required' => 'Zip code is required',
            'country.required' => 'Country is required',
        ];
    }

    public function fullName(): string
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function userRequest(): array
    {

        $generatedPassword = Helper::generatePassword(6);
        $hashedPassword = Hash::make($generatedPassword);
        return [
            'name' => $this->fullName(),
            'phone' => $this->phone,
            'email' => $this->email,
            'true_password' => $generatedPassword,
            'password' => $hashedPassword,
        ];
    }

    public function userInformation($user_profile_id): array
    {
        return array_merge(
            $this->only([
                'first_name',
                'last_name',
                'middle_name',
                'suffix',
                'birth_date',
                'gender',
                'blood_type',
                'marital_status',
                'nationality',
                'religion',
                'philhealth',
                'sss',
                'tin',
                'pagibig',
            ]),
            [
                'user_profile_id' => $user_profile_id,
            ]
        );
    }

    public function userProfiles($user_id): array
    {
        return array_merge(
            $this->only([
                'address',
                'street',
                'barangay',
                'district',
                'city',
                'state',
                'zip_code',
                'country',
                'profile_picture',
            ]),
            [
                'user_id' => $user_id,
                'full_name' => $this->fullName(),
            ]
        );
    }

    protected function failedValidation(Validator $validator)
    {
        throw new ValidationHandler($validator);
    }
}
