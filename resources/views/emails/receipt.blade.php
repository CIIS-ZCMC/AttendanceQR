<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Attendance Receipt</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
        <tr>
            <td style="background-color: #196b38; color: white; padding: 20px 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 22px;">UMIS - Geofencing Attendance</h1>
                <p style="margin: 5px 0 0; font-size: 14px;">Official Attendance Record Receipt</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 30px;">
                <p style="font-size: 16px; color: #333; margin-top: 0;">Dear <strong>{{ $name ?? 'Employee' }}</strong>,</p>
                <p style="font-size: 15px; color: #555; line-height: 1.6;">
                    This is to acknowledge that your attendance has been successfully recorded.
                </p>

                <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse; margin-top: 20px; font-size: 14px; color: #444;">
                    <tr>
                        <td style="border-bottom: 1px solid #ddd;">🏢 <strong>Attendance ID:</strong></td>
                        <td style="border-bottom: 1px solid #ddd;">{{ $attendance_id?? 'No ID' }}</td>
                    </tr>
                    <tr>
                        <td style="border-bottom: 1px solid #ddd;">📅 <strong>Date Recorded:</strong></td>
                        <td style="border-bottom: 1px solid #ddd;">{{ $date ?? now()->format('F d, Y') }}</td>
                    </tr>
                    <tr>
                        <td style="border-bottom: 1px solid #ddd;">⏰ <strong>Time In:</strong></td>
                        <td style="border-bottom: 1px solid #ddd;">{{ $time_in ?? now()->format('h:i A') }}</td>
                    </tr>
                 

                    <tr>
                        <td style="border-bottom: 1px solid #ddd;">👤 <strong>Employee ID:</strong></td>
                        <td style="border-bottom: 1px solid #ddd;">{{ $employee_id ?? 'No ID' }}</td>
                    </tr>
                </table>

                <p style="margin-top: 25px; font-size: 14px; color: #666;">
                    If this record was not made by you, please contact the system administrator immediately.
                </p>

                <p style="margin-top: 35px; font-size: 13px; color: #999; text-align: center;">
                    This is an automated email. Please do not reply to this message.
                </p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 13px; color: #777;">
                © {{ date('Y') }} Zamboanga City Medical Center - IISU | UMIS - Geofencing Attendance
            </td>
        </tr>
    </table>
</body>
</html>
