<?php

namespace App\Http\Resources\Employee;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [   
         'id' => $this->id,
         'name' => $this->full_name .' '. $this->UserInformations?->suffix ?? "",
         'email' => $this->User->email,
         'phone' => $this->User->phone,
         'gender'=>$this->UserInformations?->gender ?? "",
         'status'=>$this->User->email_verified_at ? 'Active' : 'Inactive',
         'data'=>parent::toArray($request),
        ];
    }
}
