<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Jobs\SendEmailJob;

class MailController extends Controller
{

    public function sendEmail(Request $request)
    {
        SendEmailJob::dispatch([
            'to' => $request->input('email'),
            'name' => $request->input('name'),
            'subject' => $request->input('subject', 'No subject'),
            'body' => $request->input('body', 'Hello'),
        ]);
    }

    public static function SendReceipt(Request $request)
    {

        $userInformation = session()->get('userToken');
        SendEmailJob::dispatch([
            'to' => $userInformation['email'],
            'name' => $request->input('name'),
            'subject' => $request->input('subject', 'No subject'),
            'body' => view('emails.receipt', [
                'name' => $request->input('name'),
                'date' => $request->input('date'),
                'time_in' => $request->input('time_in'),
                'attendance_id' => $request->input('attendance_id'),
                'employee_id' => $request->input('employee_id'),
            ])->render()
        ]);
    }
}
