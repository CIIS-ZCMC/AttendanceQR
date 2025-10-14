<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Exception;
use Illuminate\Support\Facades\Log;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\OAuth;
use League\OAuth2\Client\Provider\Google;

class SendEmailJob implements ShouldQueue
{
    use Queueable;


    public  $payload;

    /**
     * The number of seconds the job can run before timing out.
     */
    public $timeout = 120;

    /**
     * Maximum number of attempts
     */
    public $tries = 3;


    /**
     * Create a new job instance.
     */

    private $client_id;
    private $client_secret;
    private $token;
    private $provider;
    private $sys_email;
    private $from_System;

    public function __construct(array $payload)
    {

        $this->payload = $payload;
        // choose queue name here or when dispatching
        $this->onQueue('emails');

        $this->client_id = env("GOOGLE_API_EMAIL_CLIENT_ID");
        $this->client_secret = env("GOOGLE_API_EMAIL_CLIENT_SECRET");
        $this->token = env("SYSTEM_EMAIL_TOKEN");
        $this->sys_email = "ciis.zcmc@gmail.com";
        $this->from_System = "ZCMC Portal";
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->SMTPDebug = SMTP::DEBUG_OFF;
            $mail->Host = 'smtp.gmail.com';
            $mail->Port = 465;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            // $mail->SMTPAutoTLS = false;
            $mail->SMTPAuth = true;
            $mail->AuthType = 'XOAUTH2';
            $mail->setOAuth(
                new OAuth([
                    'provider' => new Google([
                        'clientId' => $this->client_id,
                        'clientSecret' => $this->client_secret,
                    ]),
                    'clientId' => $this->client_id,
                    'clientSecret' => $this->client_secret,
                    'refreshToken' => $this->token,
                    'userName' => $this->sys_email,
                ])
            );
            $mail->setFrom($this->sys_email, $this->from_System);
            $mail->addAddress($this->payload['to'], $this->payload['name']);
            $mail->Subject = $this->payload['subject'];
            $mail->CharSet = PHPMailer::CHARSET_UTF8;
            $mail->isHTML(true);
            $mail->Body = $this->payload['body'];
            $mail->AltBody = 'This is a plain text message body';
            if ($mail->send()) {
                Log::channel('emailLog')->info('SendEmailJob success', [
                    'payload' => $this->payload,
                ]);
            } else {
                Log::channel('emailLog')->error('SendEmailJob failed', [
                    'error' => $mail->ErrorInfo,
                    'payload' => $this->payload,
                ]);
            }
        } catch (\Throwable $th) {
            Log::channel('emailLog')->error('SendEmailJob failed', [
                'exception' => $th->getMessage(),
                'mailer_error' => $mail->ErrorInfo,
                'payload' => $this->payload,
            ]);
        }
    }


    /**
     * What to do if the job fails permanently.
     */
    public function failed(Exception $exception)
    {
        // Notify admin, log, store into failed_emails table, etc.
        Log::error('SendEmailJob failed', [
            'exception' => $exception->getMessage(),
            'payload' => $this->payload,
        ]);
        // e.g. dispatch a notification to admin or update DB
    }
}
