<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Validation\ValidationException;

class ValidationHandler extends Exception
{
    protected $validator;
    public function __construct($validator)
    {
        $this->validator = $validator;
    }
    public function render()
    {
        throw new ValidationException($this->validator, response()->json([
            'message' => "Something went wrong.\n System validation failed",
            'errors' => $this->validator->errors(),
        ], 422));
    }
}
