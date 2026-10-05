<?php

namespace App\Helpers;

use App\Models\Contact;

class AdminHelper
{
    /**
     * Get the list of admin employee IDs from Admin_Accounts.json
     *
     * @return array
     */
    public static function getAdminEmployeeIds(): array
    {
        $paths = [
            base_path('Admin_Accounts.json'),
            base_path('Admin_account.json'),
            base_path('admin_accounts.json'),
            base_path('admin_account.json'),
        ];

        foreach ($paths as $path) {
            if (file_exists($path)) {
                $content = json_decode(file_get_contents($path), true);
                if (is_array($content)) {
                    if (isset($content['admin_accounts']) && is_array($content['admin_accounts'])) {
                        return array_map('strval', $content['admin_accounts']);
                    }
                    if (isset($content['admin_account']) && is_array($content['admin_account'])) {
                        return array_map('strval', $content['admin_account']);
                    }
                    return array_map('strval', $content);
                }
            }
        }

        return [];
    }

    /**
     * Check if a specific employee ID is an admin
     *
     * @param string|int|null $employeeId
     * @return bool
     */
    public static function isEmployeeIdAdmin($employeeId): bool
    {
        if (empty($employeeId)) {
            return false;
        }

        $adminList = self::getAdminEmployeeIds();
        return in_array(strval($employeeId), $adminList, true);
    }

    /**
     * Get the employee ID associated with the currently logged account
     *
     * @return string|null
     */
    public static function getLoggedEmployeeId(): ?string
    {
        // 1. Check userToken in session (from Google OAuth)
        if (session()->has('userToken')) {
            $userToken = session()->get('userToken');

            if (!empty($userToken['employee_id'])) {
                return strval($userToken['employee_id']);
            }

            if (!empty($userToken['email'])) {
                $email = strtolower(trim($userToken['email']));
                
                // Retrieve contacts matching this email address
                $contacts = Contact::whereRaw('LOWER(TRIM(email_address)) = ?', [$email])
                    ->with('personalInformation.employeeProfile')
                    ->get();

                foreach ($contacts as $contact) {
                    $employeeId = $contact->personalInformation?->employeeProfile?->employee_id;
                    if (!empty($employeeId)) {
                        // Cache employee_id into userToken in session
                        $userToken['employee_id'] = strval($employeeId);
                        session()->put('userToken', $userToken);
                        return strval($employeeId);
                    }
                }
            }
        }

        // 2. Check direct employee ID stored in session
        if (session()->has('employeeID') && !empty(session('employeeID'))) {
            return strval(session('employeeID'));
        }

        if (session()->has('employee_id') && !empty(session('employee_id'))) {
            return strval(session('employee_id'));
        }

        if (session()->has('logged_employee_id') && !empty(session('logged_employee_id'))) {
            return strval(session('logged_employee_id'));
        }

        return null;
    }

    /**
     * Check if the currently logged account is an admin
     *
     * @return bool
     */
    public static function isLoggedAdmin(): bool
    {
        $employeeId = self::getLoggedEmployeeId();

        if ($employeeId && self::isEmployeeIdAdmin($employeeId)) {
            if (!session()->has('admin_user')) {
                session()->put('admin_user', true);
            }
            return true;
        }

        // If userToken is present but does NOT match admin employee IDs,
        // clear admin_user to prevent stale admin session
        if (session()->has('userToken')) {
            session()->forget('admin_user');
            return false;
        }

        // Fallback for manually entered employeeId via LogAdmin
        return (bool) session()->get('admin_user', false);
    }

    /**
     * Synchronize admin status in session
     */
    public static function checkAndSyncAdminSession(): void
    {
        if (self::isLoggedAdmin()) {
            session()->put('admin_user', true);
        } else {
            if (session()->has('userToken')) {
                session()->forget('admin_user');
            }
        }
    }
}
